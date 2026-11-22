import { useState, useId } from 'react'
import { X, Sparkles, Dog, Cat, Check, Heart, ChevronRight, ChevronLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { getBreeds } from '../../data/breeds'
import { suggestLifeStage, calculateDailyCalories } from '../../utils/calories'
import type { Species, LifeStage } from '../../types'

type PetOnboardingModalProps = {
  isOpen: boolean
  onClose?: () => void
  isInitial?: boolean
}

const AVATAR_OPTIONS = ['🐶', '🐱', '🐕', '🐩', '🐈', '🐾', '🦁', '🦊', '🐻', '🤎', '✨']

export default function PetOnboardingModal({
  isOpen,
  onClose,
  isInitial = false,
}: PetOnboardingModalProps) {
  const { addPet } = useApp()
  const { addToast } = useToast()
  const breedListId = useId()

  const [step, setStep] = useState<number>(1)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>('dog')
  const [breed, setBreed] = useState('')
  const [ageValue, setAgeValue] = useState<string>('1')
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>('years')
  const [weight, setWeight] = useState<string>('5')
  const [neutered, setNeutered] = useState<boolean>(true)
  const [avatarEmoji, setAvatarEmoji] = useState('🐶')

  if (!isOpen) return null

  // Calculate life stage & calorie target preview
  const parsedAge = parseFloat(ageValue) || 1
  const ageInMonths = ageUnit === 'years' ? parsedAge * 12 : parsedAge
  const lifeStage: LifeStage = suggestLifeStage(species, ageInMonths)
  const parsedWeight = parseFloat(weight) || 1
  const estimatedCalories = calculateDailyCalories(
    parsedWeight,
    species,
    lifeStage,
    neutered,
  )

  const breeds = getBreeds(species)

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies)
    setBreed('')
    setAvatarEmoji(newSpecies === 'dog' ? '🐶' : '🐱')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const finalAge = ageUnit === 'years' ? parsedAge : Number((parsedAge / 12).toFixed(1))

    addPet({
      name: name.trim(),
      species,
      breed: breed.trim() || (species === 'dog' ? 'Aspin' : 'Puspin'),
      weight: Math.max(0.1, parsedWeight),
      age: Math.max(0.1, finalAge),
      neutered,
      lifeStage,
      avatarEmoji,
    })

    addToast(`Welcome ${name.trim()} to Animeal! 🐾`, 'success')
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-brand-dark/10 my-8 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-sage to-brand-dark p-6 text-white relative">
          {!isInitial && onClose && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cream/80 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>{isInitial ? 'Get Started' : 'Add New Pet'}</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {isInitial ? 'Welcome! Tell us about your pet' : 'Add another furry friend'}
          </h2>
          <p className="mt-1 text-sm text-brand-cream/90">
            We will calculate customized daily calorie and nutrition targets.
          </p>

          {/* Stepper dots */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-brand-cream'
                    : s < step
                      ? 'w-4 bg-brand-cream/60'
                      : 'w-4 bg-white/20'
                }`}
              />
            ))}
            <span className="ml-2 text-xs font-medium text-brand-cream/80">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP 1: Name, Species & Avatar */}
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                  Pet's Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Browny, Luna, Milo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-4 py-3 text-base font-medium text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                  Species
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSpeciesChange('dog')}
                    className={`flex items-center justify-center gap-3 rounded-xl border p-4 text-base font-semibold transition ${
                      species === 'dog'
                        ? 'border-brand-sage bg-brand-sage/10 text-brand-sage ring-2 ring-brand-sage/30'
                        : 'border-brand-dark/15 bg-white text-brand-dark/70 hover:border-brand-dark/30'
                    }`}
                  >
                    <Dog className="h-5 w-5" />
                    <span>Dog (Aso)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSpeciesChange('cat')}
                    className={`flex items-center justify-center gap-3 rounded-xl border p-4 text-base font-semibold transition ${
                      species === 'cat'
                        ? 'border-brand-sage bg-brand-sage/10 text-brand-sage ring-2 ring-brand-sage/30'
                        : 'border-brand-dark/15 bg-white text-brand-dark/70 hover:border-brand-dark/30'
                    }`}
                  >
                    <Cat className="h-5 w-5" />
                    <span>Cat (Pusa)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                  Choose Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className={`h-11 w-11 text-xl rounded-xl border flex items-center justify-center transition ${
                        avatarEmoji === emoji
                          ? 'border-brand-sage bg-brand-sage/20 ring-2 ring-brand-sage shadow-sm scale-105'
                          : 'border-brand-dark/15 bg-brand-cream/30 hover:bg-brand-cream'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Breed, Age & Weight */}
          {step === 2 && (
            <div className="space-y-5 animate-slide-up">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  list={breedListId}
                  placeholder={`Search or type ${species === 'dog' ? 'Aspin' : 'Puspin'}, etc.`}
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-4 py-3 text-base text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                />
                <datalist id={breedListId}>
                  {breeds.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-brand-dark/60">
                  Select common breed or type a custom cross-breed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                    Age
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={ageValue}
                      onChange={(e) => setAgeValue(e.target.value)}
                      className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-3 py-3 text-base font-semibold text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                    />
                    <select
                      value={ageUnit}
                      onChange={(e) => setAgeUnit(e.target.value as 'years' | 'months')}
                      className="rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-3 py-3 text-sm font-semibold text-brand-dark focus:border-brand-sage focus:outline-none"
                    >
                      <option value="years">Years</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                  <div className="mt-1 text-xs font-medium text-brand-sage capitalize">
                    Detected: {lifeStage} stage
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-4 py-3 text-base font-semibold text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-brand-dark/50">
                      KG
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-dark/60">Current weight</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Neutered status & Summary */}
          {step === 3 && (
            <div className="space-y-5 animate-slide-up">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                  Is {name || 'your pet'} Neutered / Spayed (Kapon)?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNeutered(true)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition ${
                      neutered
                        ? 'border-brand-sage bg-brand-sage/10 text-brand-sage ring-2 ring-brand-sage/30'
                        : 'border-brand-dark/15 bg-white text-brand-dark/70 hover:border-brand-dark/30'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    <span>Yes, Neutered / Kapon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeutered(false)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition ${
                      !neutered
                        ? 'border-brand-sage bg-brand-sage/10 text-brand-sage ring-2 ring-brand-sage/30'
                        : 'border-brand-dark/15 bg-white text-brand-dark/70 hover:border-brand-dark/30'
                    }`}
                  >
                    <span>No, Intact</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-brand-dark/60">
                  Neutered pets require ~15-20% fewer calories to maintain healthy weight.
                </p>
              </div>

              {/* Live Preview Summary Card */}
              <div className="rounded-2xl border border-brand-sage/30 bg-brand-cream/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs text-3xl">
                    {avatarEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-brand-dark truncate">
                        {name || 'Your Pet'}
                      </h4>
                      <span className="rounded-full bg-brand-sage/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-sage">
                        {species}
                      </span>
                    </div>
                    <p className="text-xs text-brand-dark/70">
                      {breed || 'Mixed'} • {ageValue} {ageUnit} • {parsedWeight} kg •{' '}
                      {neutered ? 'Neutered' : 'Intact'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-dark/10 pt-3">
                  <div>
                    <span className="text-[11px] font-semibold text-brand-dark/60 uppercase">
                      Daily Calorie Target
                    </span>
                    <p className="text-lg font-bold text-brand-sage">
                      ~{estimatedCalories} <span className="text-xs font-normal text-brand-dark/70">kcal/day</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-brand-dark/60 uppercase">
                      Daily Water Goal
                    </span>
                    <p className="text-lg font-bold text-brand-dark">
                      ~{Math.round(parsedWeight * 50)} <span className="text-xs font-normal text-brand-dark/70">ml/day</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between border-t border-brand-dark/10 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-dark/20 px-4 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-cream"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && !name.trim()}
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-sage px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-sage/90 disabled:opacity-40"
              >
                <Heart className="h-4 w-4 fill-white" />
                Save & Complete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
