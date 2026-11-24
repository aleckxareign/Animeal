import { useState } from 'react'
import { X, Save, Trash2, AlertTriangle, Dog, Cat } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { getBreeds } from '../../data/breeds'
import { suggestLifeStage } from '../../utils/calories'
import type { Pet, Species, LifeStage, DietaryPreference } from '../../types'

type EditPetModalProps = {
  isOpen: boolean
  pet: Pet
  onClose: () => void
}

const AVATAR_OPTIONS = ['🐶', '🐱', '🐕', '🐩', '🐈', '🐾', '🦁', '🦊', '🐻', '🤎', '✨']

export default function EditPetModal({ isOpen, pet, onClose }: EditPetModalProps) {
  const { updatePet, removePet } = useApp()
  const { addToast } = useToast()

  const [name, setName] = useState(pet.name)
  const [species, setSpecies] = useState<Species>(pet.species)
  const [breed, setBreed] = useState(pet.breed)
  const [weight, setWeight] = useState(pet.weight.toString())
  const [ageValue, setAgeValue] = useState(
    pet.age < 1 ? Math.round(pet.age * 12).toString() : pet.age.toString(),
  )
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>(
    pet.age < 1 ? 'months' : 'years',
  )
  const [neutered, setNeutered] = useState<boolean>(pet.neutered)
  const [sex, setSex] = useState<NonNullable<Pet['sex']>>(pet.sex || 'unknown')
  const [avatarEmoji, setAvatarEmoji] = useState(pet.avatarEmoji)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(pet.dietaryPreference || 'any')
  const [preferredFoodsText, setPreferredFoodsText] = useState((pet.preferredFoods || []).join(', '))
  const [avoidedFoodsText, setAvoidedFoodsText] = useState((pet.avoidedFoods || []).join(', '))

  if (!isOpen) return null

  const breeds = getBreeds(species)

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies)
    setBreed('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const parsedAge = parseFloat(ageValue) || 1
    const ageInMonths = ageUnit === 'years' ? parsedAge * 12 : parsedAge
    const finalAge = ageUnit === 'years' ? parsedAge : Number((parsedAge / 12).toFixed(1))
    const lifeStage: LifeStage = suggestLifeStage(species, ageInMonths)
    const parsedWeight = parseFloat(weight) || 1

    updatePet(pet.id, {
      name: name.trim(),
      species,
      breed: breed.trim() || pet.breed,
      weight: Math.max(0.1, parsedWeight),
      age: Math.max(0.1, finalAge),
      neutered,
      sex,
      lifeStage,
      avatarEmoji,
      dietaryPreference,
      preferredFoods: preferredFoodsText.split(',').map(s => s.trim()).filter(Boolean),
      avoidedFoods: avoidedFoodsText.split(',').map(s => s.trim()).filter(Boolean),
    })

    addToast(`Updated ${name.trim()}'s profile!`, 'success')
    onClose()
  }

  const handleDelete = () => {
    removePet(pet.id)
    addToast(`${pet.name} was removed.`, 'info')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-foreground/10 my-0 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 bg-background/40">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Edit Pet Profile
            </h3>
            <p className="text-xs text-foreground/70">
              Update {pet.name}'s details, weight, and targets
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-foreground/60 hover:bg-brand-dark/10 hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="block text-sm font-semibold text-foreground">
            Sex (Gender)
            <select value={sex} onChange={(event) => setSex(event.target.value as typeof sex)} className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground">
              <option value="unknown">Unknown / Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-foreground/20 bg-background/30 px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                Species
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSpeciesChange('dog')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                    species === 'dog'
                      ? 'border-brand-sage bg-brand-sage/15 text-brand-accent'
                      : 'border-foreground/15 text-foreground/70'
                  }`}
                >
                  <Dog className="h-4 w-4" /> Dog
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeciesChange('cat')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                    species === 'cat'
                      ? 'border-brand-sage bg-brand-sage/15 text-brand-accent'
                      : 'border-foreground/15 text-foreground/70'
                  }`}
                >
                  <Cat className="h-4 w-4" /> Cat
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                Avatar Emoji
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {AVATAR_OPTIONS.slice(0, 5).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`h-9 w-9 shrink-0 text-base rounded-lg border flex items-center justify-center transition ${
                      avatarEmoji === emoji
                        ? 'border-brand-sage bg-brand-sage/20 ring-1 ring-brand-sage'
                        : 'border-foreground/15 bg-card hover:bg-background'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Breed
            </label>
            <select aria-label="Breed" value={breed} onChange={(event) => setBreed(event.target.value)} className="w-full">
                  <option value="">Select a breed</option>
                  {breed && !breeds.includes(breed) && <option value={breed}>{breed}</option>}
                  {breeds.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                Age
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={ageValue}
                  onChange={(e) => setAgeValue(e.target.value)}
                  className="w-full rounded-xl border border-foreground/20 bg-background/30 px-3 py-2 text-sm font-semibold text-foreground focus:border-brand-sage focus:outline-none"
                />
                <select
                  aria-label="Age unit"
                  value={ageUnit}
                  onChange={(e) => setAgeUnit(e.target.value as 'years' | 'months')}
                  className="rounded-xl border border-foreground/20 bg-background/30 px-2 py-2 text-xs font-semibold text-foreground"
                >
                  <option value="years">Yrs</option>
                  <option value="months">Mo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-xl border border-foreground/20 bg-background/30 px-3 py-2 text-sm font-semibold text-foreground focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Neutered / Spayed (Kapon)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNeutered(true)}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  neutered
                    ? 'border-brand-sage bg-brand-sage/15 text-brand-accent'
                    : 'border-foreground/15 text-foreground/70'
                }`}
              >
                Yes (Neutered)
              </button>
              <button
                type="button"
                onClick={() => setNeutered(false)}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  !neutered
                    ? 'border-brand-sage bg-brand-sage/15 text-brand-accent'
                    : 'border-foreground/15 text-foreground/70'
                }`}
              >
                No (Intact)
              </button>
            </div>
          </div>

          {/* Dietary Preferences (Optional) */}
          <div className="space-y-2.5 rounded-xl border border-foreground/10 bg-background/20 p-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
              Diet Preference <span className="font-normal normal-case text-foreground/50">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {([
                { value: 'any', label: '🍽️ Any' },
                { value: 'dry_only', label: '🥣 Dry Only' },
                { value: 'wet_only', label: '🥫 Wet Only' },
                { value: 'home_cooked', label: '🍳 Home Cooked' },
                { value: 'picky', label: '😾 Picky Eater' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDietaryPreference(opt.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                    dietaryPreference === opt.value
                      ? 'border-brand-sage bg-brand-sage/15 text-brand-accent ring-1 ring-brand-sage/30'
                      : 'border-foreground/15 bg-card text-foreground/70 hover:border-foreground/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1">
                  Preferred / Favorite Foods
                </label>
                <input
                  type="text"
                  placeholder="e.g. chicken, rice, salmon"
                  value={preferredFoodsText}
                  onChange={(e) => setPreferredFoodsText(e.target.value)}
                  className="w-full rounded-lg border border-foreground/15 bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-brand-sage focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 mb-1">
                  Foods to Avoid
                </label>
                <input
                  type="text"
                  placeholder="e.g. beef, dairy, pork"
                  value={avoidedFoodsText}
                  onChange={(e) => setAvoidedFoodsText(e.target.value)}
                  className="w-full rounded-lg border border-foreground/15 bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-brand-sage focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-foreground/50">
              Comma-separated. Mealie AI will personalize food recommendations based on these.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-foreground/10 pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove Pet
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-foreground/20 px-4 py-2 text-xs font-semibold text-foreground hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-sage px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-sage/90"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-card/95 p-6 flex flex-col justify-center items-center text-center animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-brand-alert/10 flex items-center justify-center text-destructive mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="font-display text-lg font-bold text-foreground">
              Remove {pet.name}?
            </h4>
            <p className="mt-1 text-xs text-foreground/70 max-w-xs">
              This will remove {pet.name} and their logged meals, weight logs, and tasks. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-foreground/20 px-4 py-2 text-xs font-semibold text-foreground hover:bg-background"
              >
                Keep Pet
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-brand-alert px-4 py-2 text-xs font-bold text-white hover:bg-brand-alert/90 shadow-xs"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
