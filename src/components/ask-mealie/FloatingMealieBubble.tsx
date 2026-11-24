import { Link, useLocation } from 'react-router-dom'
import { Sparkles, MessageCircle } from 'lucide-react'

export default function FloatingMealieBubble() {
  const { pathname } = useLocation()

  // Don't display the floating button when the user is already on the Ask Mealie page
  if (pathname === '/ask-mealie') {
    return null
  }

  return (
    <aside
      aria-label="Ask Mealie AI Assistant"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 animate-fade-in"
    >
      <Link
        to="/ask-mealie"
        className="group relative flex items-center gap-2.5 rounded-full border border-brand-sage/30 bg-card/95 dark:bg-card/95 pl-2 pr-4 py-2 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-sage hover:bg-card active:scale-95"
        title="Chat with Mealie AI - Pet Care & Nutrition Assistant"
      >
        {/* Glowing pulse ring */}
        <span className="absolute -inset-0.5 rounded-full bg-linear-to-r from-brand-sage to-emerald-400 opacity-20 blur-xs transition-opacity group-hover:opacity-40" />

        {/* Avatar Container */}
        <div className="relative flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-brand-cream ring-2 ring-brand-sage/30 shadow-xs">
          <img
            src="/images/logo-only.svg"
            alt="Mealie AI"
            className="size-7 sm:size-8 object-contain transition-transform group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const parent = e.currentTarget.parentElement
              if (parent) {
                parent.innerHTML = '<span class="text-xl">🐾</span>'
              }
            }}
          />
          {/* Live Online Green Pulse Indicator */}
          <span className="absolute bottom-0 right-0 flex size-3 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full border border-white bg-emerald-500" />
          </span>
        </div>

        {/* Text Label & Badge */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-foreground dark:text-white group-hover:text-brand-accent transition-colors">
              Ask Mealie
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-brand-sage/10 dark:bg-brand-sage/20 px-1.5 py-0.2 text-[10px] font-bold text-brand-accent dark:text-emerald-300">
              <Sparkles className="size-2.5" /> AI
            </span>
          </div>
          <span className="text-[11px] font-medium text-foreground/60 dark:text-muted-foreground hidden sm:block">
            Pet Nutrition Assistant
          </span>
        </div>

        {/* Icon cue */}
        <div className="ml-1 hidden sm:flex size-6 items-center justify-center rounded-full bg-brand-sage/10 text-brand-accent transition-transform group-hover:translate-x-0.5">
          <MessageCircle className="size-3.5" />
        </div>
      </Link>
    </aside>
  )
}
