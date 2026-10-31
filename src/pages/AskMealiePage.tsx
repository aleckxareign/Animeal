import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, PawPrint, Bot } from 'lucide-react'
import { askMealie } from '../services/gemini'
import type { ChatMessage, PetProfile } from '../types'

// ─── Default demo pet profile ──────────────────────────────────
const DEFAULT_PET: PetProfile = {
  name: 'Bantay',
  species: 'dog',
  breed: 'Aspin',
  ageMonths: 24,
  weightKg: 12,
}

const SUGGESTIONS = [
  "What's a good diet for my dog?",
  'Pwede ba bigyan ng grapes yung aso ko?',
  'Gaano kadalas ko dapat pakainin yung puppy ko?',
  'Anong magandang food for senior cats?',
]

export default function AskMealiePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pet] = useState<PetProfile>(DEFAULT_PET)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSend(text?: string) {
    const userText = (text ?? input).trim()
    if (!userText || isLoading) return

    setInput('')
    setError(null)

    const userMsg: ChatMessage = {
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const reply = await askMealie([...messages], userText, pet)
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'May error sa Mealie. Try mo ulit!')
    } finally {
      setIsLoading(false)
    }
  }

  function handleClear() {
    setMessages([])
    setError(null)
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-3xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark">
            <img
              src="/images/mealie.svg"
              alt="Mealie"
              className="h-6 w-6"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-dark">Ask Mealie</h1>
            <p className="text-xs text-gray-500">
              AI Pet Nutrition Assistant • Taglish 🇵🇭
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active pet badge */}
          <div className="flex items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-dark">
            <PawPrint size={14} />
            {pet.name} ({pet.species})
          </div>

          <button
            onClick={handleClear}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-brand-alert"
            title="Clear chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <img
              src="/images/mealie.svg"
              alt="Mealie"
              className="mb-4 h-16 w-16 opacity-60"
            />
            <p className="mb-1 text-lg font-semibold text-brand-dark">
              Kumusta! I'm Mealie 🐾
            </p>
            <p className="mb-6 max-w-sm text-sm text-gray-500">
              Ask me anything about pet nutrition, food safety, o feeding tips
              para sa fur baby mo!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-gray-200 bg-brand-cream px-4 py-2 text-sm text-brand-dark transition hover:border-brand-dark"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-dark text-white'
                  : 'bg-brand-cream text-brand-dark'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark">
              <Bot size={16} className="text-white" />
            </div>
            <div className="rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-dark">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          disabled={isLoading}
          className="flex-1 bg-transparent py-1 outline-none placeholder:text-gray-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
