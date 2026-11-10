import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import ChatHeader from '../components/ask-mealie/ChatHeader'
import VeterinaryDisclaimerBanner from '../components/ask-mealie/VeterinaryDisclaimerBanner'
import MessageBubble from '../components/ask-mealie/MessageBubble'
import type { ExtendedChatMessage } from '../components/ask-mealie/MessageBubble'
import TypingIndicator from '../components/ask-mealie/TypingIndicator'
import QuickChips from '../components/ask-mealie/QuickChips'
import ChatInput from '../components/ask-mealie/ChatInput'
import { generateMealieAnswer } from '../components/ask-mealie/mealie-assistant'
import { askMealie } from '../services/gemini'
import { api } from '../services/api'
import type { ChatAction, Pet } from '../types'
import { generateId, loadFromStorage, saveToStorage } from '../utils/storage'

const STORAGE_KEY = 'animeal_ask_mealie_chat_v1'

function getInitialGreeting(pet: Pet | null): ExtendedChatMessage {
  if (pet) {
    return {
      id: 'welcome-message',
      role: 'mealie',
      content: `Hello! I'm **Mealie**, your AI Pet Nutrition & Care Assistant! 🐾\n\nI'm ready to assist with advice personalized for **${pet.name}** (${pet.avatarEmoji || (pet.species === 'cat' ? '🐱' : '🐕')} ${pet.breed || pet.species}, ${pet.weight} kg, ${pet.lifeStage})!\n\nYou can ask me in **English or Taglish** about:\n• Toxic vs. safe foods (e.g., "Pwede ba ang bawang o sibuyas?")\n• Daily portion & calorie calculations\n• Common symptoms (vomiting, diarrhea, lethargy)\n• Affordable pet diet recommendations\n\nHow can I help you and ${pet.name} today?`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      actions: [
        { label: '🍫 Is chocolate safe for dogs?', type: 'chip', value: 'Is chocolate safe for dogs?' },
        { label: '🍲 How much should I feed?', type: 'chip', value: 'How much food should I feed my pet?' },
        { label: '💧 Daily water goal?', type: 'chip', value: 'How much water does my pet need?' },
        { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      ],
    }
  }

  return {
    id: 'welcome-message',
    role: 'mealie',
    content: `Hello! I'm **Mealie**, your AI Pet Nutrition & Care Assistant! 🐾\n\nI'm here to answer your questions in **English & Taglish** about pet diets, ingredients, portions, and everyday wellness.\n\nTry clicking one of the suggested questions below, or ask me anything!`,
    timestamp: new Date().toISOString(),
    severity: 'info',
    actions: [
      { label: '🍫 Is chocolate safe for dogs?', type: 'chip', value: 'Is chocolate safe for dogs?' },
      { label: '🍗 Can dogs eat human food?', type: 'chip', value: 'Can dogs eat human food?' },
      { label: '🏥 When to see a vet?', type: 'chip', value: 'Kailan dapat dalhin sa vet?' },
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
    ],
  }
}

export default function AskMealiePage() {
  const { pets, activePet, setActivePet } = useApp()
  const { addToast } = useToast()

  const [messages, setMessages] = useState<ExtendedChatMessage[]>(() => {
    const saved = loadFromStorage<ExtendedChatMessage[] | null>(STORAGE_KEY, null)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved
    }
    return [getInitialGreeting(activePet)]
  })

  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Persist messages
  useEffect(() => {
    saveToStorage(STORAGE_KEY, messages)
  }, [messages])

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, isThinking, scrollToBottom])

  // Handle switching pet: update context and show friendly toast
  const handleSelectPet = (petId: string) => {
    setActivePet(petId)
    const pet = pets.find((p) => p.id === petId)
    if (pet) {
      addToast(`Switched active advising context to ${pet.name} 🐾`, 'info')
    }
  }

  // Handle clearing chat
  const handleClearChat = () => {
    const freshGreeting = getInitialGreeting(activePet)
    setMessages([freshGreeting])
    addToast('Chat conversation cleared', 'info')
  }

  // Handle sending a user message
  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isThinking) return

      const userMsg: ExtendedChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsThinking(true)

      const chatHistory = messages.map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        text: m.content,
        timestamp: Date.now(),
      }))

      // 1. Try server-side Gemini AI proxy first (keeps API key secure on server)
      try {
        const proxyRes = await api.chatGeminiProxy(
          trimmed,
          chatHistory,
          activePet || undefined
        )

        if (proxyRes?.reply) {
          const isEmergency =
            proxyRes.reply.toLowerCase().includes('emergency') ||
            proxyRes.reply.toLowerCase().includes('poison') ||
            proxyRes.reply.toLowerCase().includes('paws')

          const mealieMsg: ExtendedChatMessage = {
            id: generateId(),
            role: 'mealie',
            content: proxyRes.reply,
            timestamp: proxyRes.timestamp || new Date().toISOString(),
            severity: isEmergency ? 'emergency' : 'info',
            actions: isEmergency
              ? [
                  { label: '🚨 Find 24/7 Vet Clinic', type: 'link', value: '/#nearby-vets' },
                  { label: '📞 Call PAWS Hotline: (02) 8475-1688', type: 'link', value: 'tel:0284751688' },
                ]
              : [
                  { label: '🍲 Meal Tracker', type: 'link', value: '/meal-tracker' },
                  { label: '📖 Food Library', type: 'link', value: '/food-library' },
                ],
          }
          setMessages((prev) => [...prev, mealieMsg])
          setIsThinking(false)
          return
        }
      } catch {
        // Fallback to client-side direct or local engine
      }

      // 2. Try client-side direct Gemini API if key is configured in browser env
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          const petProfile = activePet
            ? {
                name: activePet.name,
                species: activePet.species,
                breed: activePet.breed || 'Pet',
                ageMonths: (activePet.age || 1) * 12,
                weightKg: activePet.weight || 10,
              }
            : undefined

          const geminiText = await askMealie(chatHistory, trimmed, petProfile)
          const isEmergency =
            geminiText.toLowerCase().includes('emergency') ||
            geminiText.toLowerCase().includes('poison') ||
            geminiText.toLowerCase().includes('paws')

          const mealieMsg: ExtendedChatMessage = {
            id: generateId(),
            role: 'mealie',
            content: geminiText,
            timestamp: new Date().toISOString(),
            severity: isEmergency ? 'emergency' : 'info',
            actions: isEmergency
              ? [
                  { label: '🚨 Find 24/7 Vet Clinic', type: 'link', value: '/#nearby-vets' },
                  { label: '📞 Call PAWS Hotline: (02) 8475-1688', type: 'link', value: 'tel:0284751688' },
                ]
              : [
                  { label: '🍲 Meal Tracker', type: 'link', value: '/meal-tracker' },
                  { label: '📖 Food Library', type: 'link', value: '/food-library' },
                ],
          }
          setMessages((prev) => [...prev, mealieMsg])
          setIsThinking(false)
          return
        } catch (geminiErr) {
          console.warn('Gemini direct API call error, falling back to backend/rule engine', geminiErr)
        }
      }

      // 3. Try calling backend rule-based API
      try {
        const res = await api.chatMealie(trimmed, activePet || undefined)
        const mealieMsg: ExtendedChatMessage = {
          id: generateId(),
          role: 'mealie',
          content: res.content,
          timestamp: res.timestamp || new Date().toISOString(),
          severity: res.severity,
          actions: res.actions,
        }
        setMessages((prev) => [...prev, mealieMsg])
      } catch {
        // 4. Fallback to local rule engine
        const response = generateMealieAnswer(trimmed, activePet)
        const mealieMsg: ExtendedChatMessage = {
          id: generateId(),
          role: 'mealie',
          content: response.content,
          timestamp: new Date().toISOString(),
          severity: response.severity,
          actions: response.actions,
        }
        setMessages((prev) => [...prev, mealieMsg])
      } finally {
        setIsThinking(false)
      }
    },
    [isThinking, activePet, messages],
  )

  // Handle action click (chip triggers follow-up question)
  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'chip' && action.value) {
      handleSendMessage(action.value)
    }
  }

  // Handle voice mockup click
  const handleVoiceClick = () => {
    addToast('Voice input: Speak now (Speech Recognition active)', 'info')
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-brand-cream/30">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col px-4 sm:px-8 lg:px-12 py-3 sm:py-5">
        {/* 1. Header with Pet Context Switcher */}
        <ChatHeader
          pets={pets}
          activePet={activePet}
          onSelectPet={handleSelectPet}
          onClearChat={handleClearChat}
        />

        {/* 2. Top Banner: Veterinary Advice Disclaimer */}
        <div className="mt-3">
          <VeterinaryDisclaimerBanner />
        </div>

        {/* 3. Messages Scroll Area */}
        <div className="mt-4 flex-1 overflow-y-auto rounded-3xl border border-border/70 bg-white/80 p-4 shadow-sm backdrop-blur-xs sm:p-6 space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onActionClick={handleActionClick}
            />
          ))}

          {/* 4. Typing Indicator */}
          {isThinking && <TypingIndicator />}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* 5. Quick-Question Suggestion Chips */}
        <QuickChips
          onSelectChip={handleSendMessage}
          disabled={isThinking}
        />

        {/* 6. Chat Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isThinking}
          onVoiceClick={handleVoiceClick}
        />
      </div>
    </div>
  )
}
