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

      try {
        // Try calling backend API
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
        // Fallback to local rule engine
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
    [isThinking, activePet],
  )

  // Handle action click (chip triggers follow-up question)
  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'chip' && action.value) {
      handleSendMessage(action.value)
    }
  }

  // Handle voice mockup click
  const handleVoiceClick = () => {
    addToast('🎙️ Voice input is coming soon! Feel free to type in English or Taglish.', 'info')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-cream/40 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-4 sm:px-8">
        {/* Main Chat Container */}
        <div className="flex h-[84vh] min-h-[600px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-xl ring-1 ring-black/5">
          {/* 1. Header with Active Pet Switcher & Clear Chat */}
          <ChatHeader
            activePet={activePet}
            pets={pets}
            onSelectPet={handleSelectPet}
            onClearChat={handleClearChat}
          />

          {/* 2. Prominent Veterinary Disclaimer Banner */}
          <VeterinaryDisclaimerBanner />

          {/* 3. Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4 bg-gradient-to-b from-brand-cream/20 via-white to-brand-cream/10">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
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
    </div>
  )
}
