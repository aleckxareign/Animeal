import { useState, useRef, useEffect } from 'react'
import { Sparkles, ChevronDown, RotateCcw, Check, HeartHandshake } from 'lucide-react'
import type { Pet } from '../../types'

type ChatHeaderProps = {
  activePet: Pet | null
  pets: Pet[]
  onSelectPet: (petId: string) => void
  onClearChat: () => void
  onOpenVetModal?: () => void
}

export default function ChatHeader({
  activePet,
  pets,
  onSelectPet,
  onClearChat,
}: ChatHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="border-b border-brand-dark/10 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Mealie Avatar & Titles */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-cream ring-2 ring-brand-sage/20 shadow-xs">
            <img
              src="/images/mealie.svg"
              alt="Mealie Avatar"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                // fallback to emoji icon if svg fails
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = '<span class="text-2xl">🐱</span>'
                }
              }}
            />
            {/* Green Online status badge */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold text-brand-dark sm:text-xl">
                Ask Mealie
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage/10 px-2 py-0.5 text-[11px] font-semibold text-brand-sage">
                <Sparkles size={11} /> AI Online
              </span>
            </div>
            <p className="text-xs text-brand-dark/70 sm:text-xs">
              AI Pet Care & Nutrition Assistant (English & Taglish)
            </p>
          </div>
        </div>

        {/* Right: Active Pet Context Pill & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {/* Active Pet Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {pets.length > 0 ? (
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-xl border border-brand-dark/15 bg-brand-cream/60 px-3 py-1.5 text-xs font-medium text-brand-dark transition-all hover:bg-brand-cream hover:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/30 shadow-xs"
                title="Switch active pet advice"
              >
                <span className="text-xs opacity-70">Advising for:</span>
                <span className="flex items-center gap-1 font-semibold text-brand-dark">
                  <span>{activePet?.avatarEmoji || (activePet?.species === 'cat' ? '🐱' : '🐕')}</span>
                  <span>{activePet?.name || 'All Pets'}</span>
                  {activePet && (
                    <span className="hidden text-[11px] font-normal text-brand-dark/60 md:inline">
                      ({activePet.weight} kg, {activePet.lifeStage})
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-brand-dark/60 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-brand-dark/10 bg-brand-cream/40 px-3 py-1.5 text-xs text-brand-dark/70">
                <HeartHandshake size={13} className="text-brand-sage" />
                <span>General Pet Mode</span>
              </div>
            )}

            {/* Dropdown Menu */}
            {dropdownOpen && pets.length > 0 && (
              <div className="animate-scale-in absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-brand-dark/10 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-dark/50">
                  Select Pet to Advise
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
                  {pets.map((p) => {
                    const isSelected = activePet?.id === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectPet(p.id)
                          setDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-brand-sage/10 text-brand-sage font-semibold'
                            : 'text-brand-dark hover:bg-brand-cream/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {p.avatarEmoji || (p.species === 'cat' ? '🐱' : '🐕')}
                          </span>
                          <div>
                            <div className="font-medium text-brand-dark">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-brand-dark/60">
                              {p.breed || (p.species === 'cat' ? 'Cat' : 'Dog')} • {p.weight} kg • {p.lifeStage}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-brand-sage" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={onClearChat}
            className="flex items-center gap-1.5 rounded-xl border border-brand-dark/10 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-dark/70 transition-colors hover:bg-brand-alert/10 hover:border-brand-alert/30 hover:text-brand-alert focus:outline-none focus:ring-2 focus:ring-brand-alert/20"
            title="Reset Chat"
          >
            <RotateCcw size={13} />
            <span className="hidden xs:inline sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}
