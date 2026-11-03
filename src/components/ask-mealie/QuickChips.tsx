import { useRef } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_CHIPS = [
  'Is chocolate safe for dogs?',
  'How much food should I feed my pet?',
  'My dog is vomiting — what to do?',
  'Best affordable food for cats?',
  'Can dogs eat human food?',
  'How much water does my pet need?',
  'Signs of heatstroke in pets',
  'Kailan dapat dalhin sa vet?',
]

type QuickChipsProps = {
  chips?: string[]
  onSelectChip: (question: string) => void
  disabled?: boolean
}

export default function QuickChips({
  chips = DEFAULT_CHIPS,
  onSelectChip,
  disabled = false,
}: QuickChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative border-t border-brand-dark/5 bg-brand-cream/30 px-3 py-2 sm:px-6">
      <div className="flex items-center gap-1.5">
        {/* Left scroll button for desktop */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark/70 hover:bg-white hover:text-brand-dark shadow-xs"
          aria-label="Scroll left"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Scrollable chips container */}
        <div
          ref={scrollRef}
          className="flex flex-1 items-center gap-2 overflow-x-auto py-1 scrollbar-none custom-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-brand-dark/50 mr-1">
            <Sparkles size={12} className="text-brand-sage" />
            <span>Try:</span>
          </div>

          {chips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectChip(chip)}
              className="shrink-0 rounded-full border border-brand-dark/15 bg-white px-3 py-1.5 text-xs font-medium text-brand-dark transition-all hover:border-brand-sage hover:bg-brand-sage/10 hover:text-brand-sage active:scale-95 disabled:pointer-events-none disabled:opacity-40 shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Right scroll button for desktop */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark/70 hover:bg-white hover:text-brand-dark shadow-xs"
          aria-label="Scroll right"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
