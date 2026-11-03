import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent, ChangeEvent } from 'react'
import { Send, Mic, CornerDownLeft } from 'lucide-react'

type ChatInputProps = {
  onSendMessage: (content: string) => void
  disabled?: boolean
  onVoiceClick?: () => void
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  onVoiceClick,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 140)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [text])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSendMessage(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <div className="border-t border-brand-dark/10 bg-white p-3 sm:p-4">
      <div className="relative flex items-end gap-2 rounded-2xl border border-brand-dark/20 bg-brand-cream/30 p-2 shadow-xs transition-colors focus-within:border-brand-sage focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-sage/20">
        {/* Voice/Mic button mockup */}
        <button
          type="button"
          onClick={onVoiceClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand-dark/50 transition-colors hover:bg-brand-sage/10 hover:text-brand-sage active:scale-95"
          title="Voice input (Mockup)"
          aria-label="Voice input"
        >
          <Mic size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask Mealie anything... (e.g., 'Pwede ba ang sibuyas sa aso?')"
          className="max-h-36 min-h-[38px] flex-1 resize-none bg-transparent py-2 px-1 text-sm text-brand-dark placeholder:text-brand-dark/45 focus:outline-none disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
            canSend
              ? 'bg-brand-sage text-white shadow-sm hover:bg-brand-sage/90 active:scale-95'
              : 'bg-brand-dark/10 text-brand-dark/30 cursor-not-allowed'
          }`}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-brand-dark/50">
        <span className="flex items-center gap-1">
          <CornerDownLeft size={11} className="opacity-70" /> Press Enter to send, Shift+Enter for new line
        </span>
        <span className="hidden sm:inline">English & Taglish supported 🇵🇭</span>
      </div>
    </div>
  )
}
