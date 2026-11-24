import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { supabaseDb } from '../services/supabase-db'
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

const STORAGE_KEY_PREFIX = 'animeal_ask_mealie_chat_v2_'

function getChatStorageKey(petId: string | null | undefined): string {
  return `${STORAGE_KEY_PREFIX}${petId || 'no-pet'}`
}

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
  const { user } = useAuth()
  const { addToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [messages, setMessages] = useState<ExtendedChatMessage[]>(() => {
    const key = getChatStorageKey(activePet?.id)
    const saved = loadFromStorage<ExtendedChatMessage[] | null>(key, null)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved
    }
    return [getInitialGreeting(activePet)]
  })

  const [isThinking, setIsThinking] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const latestMessageIdRef = useRef<string | null>(null)
  const isInitialLoadRef = useRef(true)
  const prevPetIdRef = useRef<string | null | undefined>(activePet?.id ?? (pets.length === 0 ? 'no-pet' : null))

  // Switch chat history when active pet changes
  useEffect(() => {
    const threadKey = activePet?.id ?? (pets.length === 0 ? 'no-pet' : null)
    if (threadKey === null) return
    if (prevPetIdRef.current === threadKey) return

    prevPetIdRef.current = threadKey
    const key = getChatStorageKey(threadKey === 'no-pet' ? null : threadKey)
    const saved = loadFromStorage<ExtendedChatMessage[] | null>(key, null)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setMessages(saved)
    } else {
      setMessages([getInitialGreeting(activePet)])
    }
    isInitialLoadRef.current = true
  }, [activePet, pets.length])

  // Initial load from Supabase if available
  useEffect(() => {
    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.getChatConversation(user.id, activePet?.id).then((cloudMessages) => {
        if (cloudMessages && cloudMessages.length > 0) {
          setMessages(cloudMessages as ExtendedChatMessage[])
        }
      }).catch(() => {})
    }
  }, [user?.id, activePet?.id])

  // Persist messages to LocalStorage & Supabase Cloud per active pet
  useEffect(() => {
    const threadKey = activePet?.id || 'no-pet'
    const storageKey = getChatStorageKey(threadKey === 'no-pet' ? null : threadKey)
    saveToStorage(storageKey, messages)
    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id' && messages.length > 1) {
      supabaseDb.saveChatConversation(user.id, messages, activePet?.id).catch(() => {})
    }
  }, [messages, user?.id, activePet?.id])

  // Smart container-only scroll management (prevents window jumping and ensures response is visible)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    // Initial load: instant scroll to bottom
    if (isInitialLoadRef.current) {
      container.scrollTop = container.scrollHeight
      isInitialLoadRef.current = false
      return
    }

    // While thinking (user sent a prompt): scroll to bottom to show typing indicator
    if (isThinking) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
      return
    }

    // When an AI response arrives: scroll smoothly to the start of the new response so user doesn't scroll up!
    if (latestMessageIdRef.current) {
      const el = document.getElementById(`msg-${latestMessageIdRef.current}`)
      if (el) {
        const targetTop = el.offsetTop - container.offsetTop - 16
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        })
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      }
      latestMessageIdRef.current = null
    }
  }, [messages, isThinking])

  // Handle switching pet: update context and show friendly toast
  const handleSelectPet = (petId: string) => {
    setActivePet(petId)
    const pet = pets.find((p) => p.id === petId)
    if (pet) {
      addToast(`Switched active advising context to ${pet.name} 🐾`, 'info')
    }
  }

  // Handle clearing chat (only for current pet thread)
  const handleClearChat = () => {
    const freshGreeting = getInitialGreeting(activePet)
    setMessages([freshGreeting])
    const threadKey = activePet?.id || 'no-pet'
    const storageKey = getChatStorageKey(threadKey === 'no-pet' ? null : threadKey)
    saveToStorage(storageKey, [freshGreeting])
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

      // Build chat history for Gemini, excluding the initial welcome message so the first turn is always a user message
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome-message')
        .map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          text: m.content,
          timestamp: Date.now(),
        }))

      const appendMealieMessage = (msg: ExtendedChatMessage) => {
        latestMessageIdRef.current = msg.id
        setMessages((prev) => [...prev, msg])
      }

      // 1. Try server-side Gemini AI proxy first (keeps API key secure on server) with a 4-second timeout
      try {
        const proxyRes = await Promise.race([
          api.chatGeminiProxy(
            trimmed,
            chatHistory,
            activePet || undefined
          ),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Backend chat proxy timeout')), 4000)
          ),
        ])

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
          appendMealieMessage(mealieMsg)
          setIsThinking(false)
          return
        }
      } catch {
        // Fallback to client-side direct or local engine
      }

      // 2. Try client-side direct Gemini API fallback
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          const petProfile = activePet
            ? {
                name: activePet.name,
                species: activePet.species,
                breed: activePet.breed || 'Pet',
                ageMonths: (activePet.age || 1) * 12,
                weightKg: activePet.weight || 10,
                lifeStage: activePet.lifeStage,
                neutered: activePet.neutered,
                dailyCalorieTarget: activePet.dailyCalorieTarget,
                dietaryPreference: activePet.dietaryPreference,
                preferredFoods: activePet.preferredFoods,
                avoidedFoods: activePet.avoidedFoods,
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
          appendMealieMessage(mealieMsg)
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
        appendMealieMessage(mealieMsg)
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
        appendMealieMessage(mealieMsg)
      } finally {
        setIsThinking(false)
      }
    },
    [isThinking, activePet, messages],
  )

  // Auto-send query parameter if navigated with /ask-mealie?q=... (e.g. from homepage quick suggestions)
  const queryHandledRef = useRef(false)
  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam && !queryHandledRef.current) {
      queryHandledRef.current = true
      handleSendMessage(qParam)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, handleSendMessage, setSearchParams])

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
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col bg-background dark:bg-card overflow-x-hidden overflow-y-auto">
      <div className="mx-auto flex h-full min-h-[32rem] w-full max-w-4xl shrink-0 flex-col px-3 sm:px-6 py-2 sm:py-3">
        {/* 1. Header with Pet Context Switcher */}
        <div className="shrink-0 rounded-2xl border border-border/80 dark:border-border bg-card dark:bg-card shadow-xs overflow-hidden">
          <ChatHeader
            pets={pets}
            activePet={activePet}
            onSelectPet={handleSelectPet}
            onClearChat={handleClearChat}
          />
        </div>

        {/* 2. Top Banner: Veterinary Advice Disclaimer */}
        <div className="mt-2 shrink-0 rounded-xl overflow-hidden border border-amber-300/60 dark:border-amber-400/30 shadow-2xs">
          <VeterinaryDisclaimerBanner />
        </div>

        {/* 3. Messages Scroll Area */}
        <div
          ref={messagesContainerRef}
          className="my-3 min-h-24 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-2xl border border-border/80 dark:border-border bg-card dark:bg-card/90 p-4 sm:p-6 space-y-4 shadow-sm"
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onActionClick={handleActionClick}
            />
          ))}

          {/* 4. Typing Indicator */}
          {isThinking && <TypingIndicator />}
        </div>

        {/* 5. Bottom Interactive Deck (Quick Chips + Chat Input) */}
        <div className="shrink-0 space-y-2 pb-1">
          {/* Quick-Question Suggestion Chips */}
          <div className="rounded-xl border border-border/70 dark:border-border bg-card/80 dark:bg-card/80 shadow-2xs overflow-hidden">
            <QuickChips
              onSelectChip={handleSendMessage}
              disabled={isThinking}
            />
          </div>

          {/* Chat Input Area */}
          <div className="rounded-2xl border border-border/80 dark:border-border bg-card dark:bg-card shadow-sm overflow-hidden">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isThinking}
              onVoiceClick={handleVoiceClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
