import { Sparkles, RotateCcw, HeartHandshake } from 'lucide-react'
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
  return (
    <div className="border-b border-foreground/10 bg-card/95 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center sm:justify-between">
        {/* Left: Mealie Avatar & Titles */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream ring-2 ring-brand-sage/20 shadow-xs">
            <img
              src="/images/logo-only.svg"
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg font-bold text-foreground sm:text-xl">
                Ask Mealie
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage/10 px-2 py-0.5 text-[11px] font-semibold text-brand-accent">
                <Sparkles size={11} /> AI Online
              </span>
            </div>
            <p className="text-xs text-foreground/70 sm:text-xs">
              AI Pet Care & Nutrition Assistant (English & Taglish)
            </p>
          </div>
        </div>

        {/* Right: Active Pet Context Pill & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {/* Active Pet Selector */}
          {pets.length > 0 ? (
            <label className="flex min-w-0 max-w-full flex-wrap items-center gap-2 text-xs text-muted-foreground">
              Advising for:
              <select aria-label="Select pet to advise" value={activePet?.id || ''} onChange={(event) => onSelectPet(event.target.value)} className="w-full sm:w-auto sm:max-w-64">
                <option value="" disabled>Select a pet</option>
                {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} - {pet.weight} kg</option>)}
              </select>
            </label>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HeartHandshake size={16} /> General Pet Mode
            </div>
          )}

          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={onClearChat}
            className="flex items-center gap-1.5 rounded-xl border border-foreground/10 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-brand-alert/10 hover:border-brand-alert/30 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-brand-alert/20"
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
