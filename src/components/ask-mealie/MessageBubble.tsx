import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Siren,
  PhoneCall,
  User,
} from 'lucide-react'
import type { ChatMessage, ChatAction } from '../../types'
import { formatTime } from '../../utils/formatters'

export type ExtendedChatMessage = ChatMessage & {
  severity?: 'info' | 'caution' | 'emergency'
}

type MessageBubbleProps = {
  message: ExtendedChatMessage
  onActionClick?: (action: ChatAction) => void
}

/**
 * Lightweight markdown-like text parser for bold text, bullet points, and paragraphs.
 */
function FormattedContent({
  content,
  isUser,
}: {
  content: string
  isUser: boolean
}) {
  const paragraphs = content.split(/\n\n+/)

  return (
    <div className={`space-y-2.5 leading-relaxed text-sm ${isUser ? 'text-white' : 'text-brand-dark dark:text-slate-100'}`}>
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n')

        // Check if paragraph is a bullet list
        const isList = lines.every((l) => /^(\s*[-•*]|\s*\d+\.)\s+/.test(l.trim()))

        if (isList && lines.length > 0) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-1.5">
              {lines.map((line, lIdx) => {
                const cleaned = line.replace(/^(\s*[-•*]|\s*\d+\.)\s+/, '')
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isUser ? 'bg-white/80' : 'bg-brand-sage'
                      }`}
                    />
                    <span className="flex-1">{renderInlineText(cleaned, isUser)}</span>
                  </li>
                )
              })}
            </ul>
          )
        }

        // Check if it's a separator line
        if (p.trim().startsWith('━━━') || p.trim() === '---') {
          return (
            <hr
              key={pIdx}
              className={`my-2 border-t ${
                isUser ? 'border-white/20' : 'border-brand-dark/15'
              }`}
            />
          )
        }

        return (
          <p key={pIdx} className="whitespace-pre-line">
            {renderInlineText(p, isUser)}
          </p>
        )
      })}
    </div>
  )
}

/**
 * Parses bold markdown: **bold text**
 */
function renderInlineText(text: string, isUser: boolean) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2)
      return (
        <strong
          key={index}
          className={`font-semibold ${isUser ? 'text-white underline decoration-white/30' : 'text-brand-dark dark:text-white font-bold'}`}
        >
          {inner}
        </strong>
      )
    }
    return part
  })
}

export default function MessageBubble({
  message,
  onActionClick,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const severity = message.severity || 'info'
  const isEmergency = severity === 'emergency'
  const isCaution = severity === 'caution'

  const formattedTime = message.timestamp
    ? formatTime(message.timestamp)
    : formatTime(new Date())

  if (isUser) {
    return (
      <div id={`msg-${message.id}`} className="flex justify-end gap-2.5 animate-slide-up pl-10 sm:pl-16">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-xs bg-brand-sage px-4 py-3 text-white shadow-sm ring-1 ring-black/5">
            <FormattedContent content={message.content} isUser={true} />
          </div>
          <span className="mt-1 text-[11px] text-brand-dark/50 px-1 font-mono">
            {formattedTime}
          </span>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-sage/15 text-brand-sage shadow-xs mt-1">
          <User size={15} />
        </div>
      </div>
    )
  }

  // Mealie response styling according to severity
  const containerClasses = isEmergency
    ? 'border-2 border-red-500 bg-red-50/80 shadow-md ring-1 ring-red-400/30'
    : isCaution
      ? 'border border-amber-300 bg-amber-50/60 shadow-xs'
      : 'border border-border/70 bg-white dark:bg-slate-800/90 shadow-xs'

  return (
    <div id={`msg-${message.id}`} className="flex justify-start gap-2.5 animate-slide-up pr-6 sm:pr-14">
      {/* Mealie Avatar */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-cream ring-1 ring-brand-sage/30 shadow-xs mt-1">
        <img
          src="/images/mealie.svg"
          alt="Mealie"
          className="h-6 w-6 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.innerHTML = '<span class="text-sm">🐾</span>'
            }
          }}
        />
        {isEmergency && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-alert text-white">
            <Siren size={9} className="animate-pulse" />
          </span>
        )}
      </div>

      <div className="flex flex-col items-start max-w-[92%] sm:max-w-[82%]">
        {/* Main Message Bubble */}
        <div
          className={`rounded-2xl rounded-tl-xs px-4 sm:px-5 py-3.5 transition-all ${containerClasses}`}
        >
          {/* Emergency Banner Header */}
          {isEmergency && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-white shadow-xs">
              <Siren size={18} className="shrink-0 animate-bounce" />
              <div className="text-xs font-bold uppercase tracking-wide">
                Urgent Veterinary Warning: Potential Emergency
              </div>
            </div>
          )}

          {/* Caution Banner Header */}
          {isCaution && (
            <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-900">
              <AlertTriangle size={15} className="shrink-0 text-amber-700" />
              <span>Pet Care Advisory • Monitor Carefully</span>
            </div>
          )}

          {/* Body Content */}
          <FormattedContent content={message.content} isUser={false} />

          {/* Emergency Urgent Action Box */}
          {isEmergency && (
            <div className="mt-3.5 rounded-xl border border-red-300 bg-white/90 p-3">
              <div className="flex items-start gap-2 text-xs text-red-900">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <span className="font-semibold">Do not wait if severe symptoms persist:</span>{' '}
                  Toxic ingestion, breathing difficulty, or trauma require prompt clinical diagnosis.
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Link
                  to="/#nearby-vets"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 focus:ring-2 focus:ring-red-400"
                >
                  <PhoneCall size={13} />
                  <span>Find Emergency Vet Clinic Now</span>
                </Link>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2 border-t border-brand-dark/10 pt-3">
              {message.actions.map((action, idx) => {
                const isEmergencyAction =
                  action.label.includes('Emergency') ||
                  action.label.includes('🚨')

                if (action.type === 'link') {
                  return (
                    <Link
                      key={idx}
                      to={action.value}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shadow-xs ${
                        isEmergencyAction
                          ? 'bg-brand-alert text-white hover:bg-brand-alert/90'
                          : 'border border-brand-dark/15 bg-white text-brand-dark hover:border-brand-sage hover:bg-brand-sage/5 hover:text-brand-sage'
                      }`}
                    >
                      <span>{action.label}</span>
                      <ExternalLink size={12} className="opacity-70" />
                    </Link>
                  )
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onActionClick?.(action)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-sage/30 bg-brand-sage/10 px-3 py-1.5 text-xs font-semibold text-brand-sage transition-all hover:bg-brand-sage hover:text-white shadow-xs"
                  >
                    <Sparkles size={12} />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="mt-1 text-[11px] text-brand-dark/50 px-1">
          Mealie • {formattedTime}
        </span>
      </div>
    </div>
  )
}
