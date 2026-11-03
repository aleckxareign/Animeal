import { useState } from 'react'
import { Plus, Info, Edit3, Dog, Cat } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Pet } from '../../types'

type PetSwitcherProps = {
  onAddPet: () => void
  onEditPet: (pet: Pet) => void
}

export default function PetSwitcher({ onAddPet, onEditPet }: PetSwitcherProps) {
  const { pets, activePet, setActivePet } = useApp()
  const [showTooltip, setShowTooltip] = useState(false)

  if (pets.length === 0) return null

  const formatPetAge = (age: number) => {
    if (age < 1) {
      const months = Math.max(1, Math.round(age * 12))
      return `${months} ${months === 1 ? 'month' : 'months'}`
    }
    return `${age} ${age === 1 ? 'yr' : 'yrs'}`
  }

  return (
    <div className="space-y-4">
      {/* Scrollable Pet Chips */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 custom-scrollbar">
        {pets.map((pet) => {
          const isActive = activePet?.id === pet.id
          return (
            <button
              key={pet.id}
              onClick={() => setActivePet(pet.id)}
              className={`group flex items-center gap-2.5 shrink-0 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-dark text-white shadow-md ring-2 ring-brand-dark/20 scale-[1.02]'
                  : 'bg-white text-brand-dark/80 hover:bg-brand-cream border border-brand-dark/10 hover:border-brand-dark/25'
              }`}
            >
              <span className="text-xl leading-none">{pet.avatarEmoji || (pet.species === 'dog' ? '🐶' : '🐱')}</span>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight">{pet.name}</span>
                  {pet.species === 'dog' ? (
                    <Dog className={`h-3 w-3 ${isActive ? 'text-brand-cream/80' : 'text-brand-sage'}`} />
                  ) : (
                    <Cat className={`h-3 w-3 ${isActive ? 'text-brand-cream/80' : 'text-brand-sage'}`} />
                  )}
                </div>
                <div className={`text-[11px] ${isActive ? 'text-brand-cream/70' : 'text-brand-dark/50'}`}>
                  {pet.weight} kg • {pet.breed || pet.species}
                </div>
              </div>
            </button>
          )
        })}

        {/* Add Pet Pill */}
        <button
          onClick={onAddPet}
          className="flex items-center gap-2 shrink-0 rounded-2xl border-2 border-dashed border-brand-dark/20 px-4 py-2.5 text-sm font-semibold text-brand-dark/70 hover:border-brand-sage hover:bg-brand-sage/5 hover:text-brand-sage transition"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark/5 group-hover:bg-brand-sage/10">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span>Add Pet</span>
        </button>
      </div>

      {/* Active Pet Quick Stats Card */}
      {activePet && (
        <div className="rounded-2xl bg-white border border-brand-dark/10 shadow-xs p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-2xl shadow-xs">
              {activePet.avatarEmoji || (activePet.species === 'dog' ? '🐶' : '🐱')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-brand-dark">
                  {activePet.name}
                </h3>
                <span className="rounded-full bg-brand-sage/10 px-2.5 py-0.5 text-xs font-semibold text-brand-sage capitalize">
                  {activePet.lifeStage} {activePet.species}
                </span>
                <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[11px] font-medium text-brand-dark/70">
                  {activePet.neutered ? 'Kapon / Neutered' : 'Intact'}
                </span>
              </div>
              <p className="text-xs text-brand-dark/60 mt-0.5">
                {activePet.breed} • {formatPetAge(activePet.age)} old • {activePet.weight} kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Target Calorie Capsule with Tooltip */}
            <div className="relative">
              <div
                className="flex items-center gap-1.5 rounded-xl bg-brand-sage/10 px-3 py-1.5 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip((prev) => !prev)}
              >
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-sage">
                    Target
                  </span>
                  <span className="text-sm font-extrabold text-brand-dark">
                    {activePet.dailyCalorieTarget} kcal/day
                  </span>
                </div>
                <Info className="h-4 w-4 text-brand-sage opacity-70" />
              </div>

              {/* RER Tooltip */}
              {showTooltip && (
                <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl bg-brand-dark p-3.5 text-xs text-brand-cream shadow-xl animate-fade-in">
                  <p className="font-bold text-white mb-1">Veterinary RER Formula</p>
                  <p className="text-[11px] leading-relaxed text-brand-cream/80">
                    Resting Energy Requirement (RER) = 70 × ({activePet.weight} kg)<sup>0.75</sup> multiplied by life-stage factor ({activePet.lifeStage}, {activePet.neutered ? 'neutered' : 'intact'}).
                  </p>
                  <p className="mt-1.5 text-[10px] text-brand-cream/60 italic">
                    Disclaimer: This is an estimated guideline. Consult your veterinarian for clinical diet prescriptions.
                  </p>
                </div>
              )}
            </div>

            {/* Edit Pet Button */}
            <button
              onClick={() => onEditPet(activePet)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-dark/15 px-3 py-2 text-xs font-semibold text-brand-dark hover:bg-brand-cream transition"
            >
              <Edit3 className="h-3.5 w-3.5 text-brand-dark/60" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
