import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Droplets,
  Scale,
  Calendar,
  Home,
  Plus,
  PawPrint,
  Heart,
  ChevronDown,
  Sparkles,
  Info,
  Check,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import WaterTracker from '../components/pet-wellness/WaterTracker'
import WeightTracker from '../components/pet-wellness/WeightTracker'
import CareSchedule from '../components/pet-wellness/CareSchedule'
import SharedHousehold from '../components/pet-wellness/SharedHousehold'
import { dogBreeds, catBreeds } from '../data/breeds'
import { suggestLifeStage } from '../utils/calories'
import type { Species, LifeStage } from '../types'

type WellnessTab = 'water' | 'weight' | 'schedule' | 'household'

export default function PetWellnessPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { pets, activePet, setActivePet, addPet } = useApp()
  const { addToast } = useToast()

  // Tab management via URL search params (sync with tab query)
  const tabParam = searchParams.get('tab') as WellnessTab | null
  const currentTab: WellnessTab =
    tabParam && ['water', 'weight', 'schedule', 'household'].includes(tabParam)
      ? tabParam
      : 'water'

  const handleTabChange = (newTab: WellnessTab) => {
    setSearchParams({ tab: newTab })
  }

  // Pet creation modal state
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false)
  const [petFormName, setPetFormName] = useState('')
  const [petFormSpecies, setPetFormSpecies] = useState<Species>('dog')
  const [petFormBreed, setPetFormBreed] = useState('')
  const [petFormWeight, setPetFormWeight] = useState('')
  const [petFormAgeYears, setPetFormAgeYears] = useState('2')
  const [petFormNeutered, setPetFormNeutered] = useState(true)
  const [petFormEmoji, setPetFormEmoji] = useState('🐕')

  // Auto-switch emoji based on species
  useEffect(() => {
    if (petFormSpecies === 'dog' && petFormEmoji === '🐱') {
      setPetFormEmoji('🐕')
    } else if (petFormSpecies === 'cat' && petFormEmoji === '🐕') {
      setPetFormEmoji('🐱')
    }
  }, [petFormSpecies, petFormEmoji])

  // Helper to add sample pet if app has no pets
  const handleAddSamplePet = (species: Species) => {
    if (species === 'dog') {
      const newPet = addPet({
        name: 'Luna',
        species: 'dog',
        breed: 'Golden Retriever',
        weight: 26.5,
        age: 2,
        neutered: true,
        lifeStage: 'adult',
        avatarEmoji: '🐕',
      })
      setActivePet(newPet.id)
      addToast('Added Luna (Golden Retriever) to your pets!', 'success')
    } else {
      const newPet = addPet({
        name: 'Milo',
        species: 'cat',
        breed: 'Puspin / Domestic Shorthair',
        weight: 4.2,
        age: 3,
        neutered: true,
        lifeStage: 'adult',
        avatarEmoji: '🐱',
      })
      setActivePet(newPet.id)
      addToast('Added Milo (Puspin) to your pets!', 'success')
    }
  }

  const handleCustomPetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const weightNum = parseFloat(petFormWeight)
    const ageYears = parseFloat(petFormAgeYears) || 1

    if (!petFormName.trim()) {
      addToast('Please enter your pet name.', 'error')
      return
    }
    if (isNaN(weightNum) || weightNum <= 0) {
      addToast('Please enter a valid weight in kg.', 'error')
      return
    }

    const lifeStage: LifeStage = suggestLifeStage(petFormSpecies, Math.round(ageYears * 12))

    const newPet = addPet({
      name: petFormName.trim(),
      species: petFormSpecies,
      breed: petFormBreed.trim() || (petFormSpecies === 'dog' ? 'Aspin' : 'Puspin'),
      weight: weightNum,
      age: Math.round(ageYears),
      neutered: petFormNeutered,
      lifeStage,
      avatarEmoji: petFormEmoji,
    })

    setActivePet(newPet.id)
    addToast(`${newPet.name} added to your pet family!`, 'success')
    setIsAddPetModalOpen(false)

    // Reset form
    setPetFormName('')
    setPetFormWeight('')
    setPetFormBreed('')
  }

  // If no pets registered, render friendly onboarding empty state
  if (!activePet || pets.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-16 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <div className="w-16 h-16 rounded-3xl bg-brand-sage/10 text-brand-sage flex items-center justify-center mx-auto shadow-xs">
            <PawPrint className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-dark font-extrabold tracking-tight">
            Pet Wellness & Shared Care
          </h1>
          <p className="text-base text-stone-600 leading-relaxed">
            Track daily hydration, monitor weight changes over time, coordinate care schedules, and keep your entire household in sync so your pet is always thriving.
          </p>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-md text-center max-w-xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-brand-dark">
              No pets found yet!
            </h2>
            <p className="text-sm text-stone-500">
              Get started by adding your furry companion, or try a sample profile to explore the tracker.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddPetModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-dark hover:bg-brand-sage text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Add My Pet
            </button>
            <button
              type="button"
              onClick={() => handleAddSamplePet('dog')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              🐶 Add Luna (Dog)
            </button>
            <button
              type="button"
              onClick={() => handleAddSamplePet('cat')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              🐱 Add Milo (Cat)
            </button>
          </div>
        </div>

        {/* Modal for Adding Custom Pet */}
        {isAddPetModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddPetModalOpen(false)
            }}
          >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-brand-cream/60">
                <h3 className="font-bold text-brand-dark flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-brand-sage" />
                  Add New Pet Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddPetModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCustomPetSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    value={petFormName}
                    onChange={(e) => setPetFormName(e.target.value)}
                    placeholder="e.g., Milo, Luna, Browny"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Species *
                    </label>
                    <select
                      value={petFormSpecies}
                      onChange={(e) => setPetFormSpecies(e.target.value as Species)}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage font-medium"
                    >
                      <option value="dog">Dog (Aso)</option>
                      <option value="cat">Cat (Pusa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="150"
                      value={petFormWeight}
                      onChange={(e) => setPetFormWeight(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Breed
                    </label>
                    <input
                      type="text"
                      list="breed-options"
                      value={petFormBreed}
                      onChange={(e) => setPetFormBreed(e.target.value)}
                      placeholder={petFormSpecies === 'dog' ? 'Aspin / Shih Tzu' : 'Puspin / Persian'}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                    />
                    <datalist id="breed-options">
                      {(petFormSpecies === 'dog' ? dogBreeds : catBreeds).map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={petFormAgeYears}
                      onChange={(e) => setPetFormAgeYears(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="pet-neutered"
                    type="checkbox"
                    checked={petFormNeutered}
                    onChange={(e) => setPetFormNeutered(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-sage focus:ring-brand-sage"
                  />
                  <label htmlFor="pet-neutered" className="text-stone-700 font-medium">
                    Neutered / Spayed (Kapon)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddPetModalOpen(false)}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-dark hover:bg-brand-sage text-white rounded-xl font-semibold shadow-xs"
                  >
                    Save Pet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12 py-10 lg:py-14 space-y-10 animate-fade-in">
      {/* Top Bar: Active Pet Selector & Pet Summary Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          {/* Pet Switcher Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
              Active Pet:
            </span>
            {pets.map((p) => {
              const isActive = p.id === activePet.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePet(p.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                    isActive
                      ? 'bg-brand-dark text-white border-brand-dark shadow-xs ring-2 ring-brand-sage/30'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base">{p.avatarEmoji || (p.species === 'cat' ? '🐱' : '🐕')}</span>
                  <span>{p.name}</span>
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setIsAddPetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-stone-600 hover:text-brand-dark hover:bg-stone-100 border border-dashed border-stone-300 transition-colors shrink-0"
              title="Add another pet"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pet
            </button>
          </div>

          {/* Quick Pet Stage Badge */}
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-full bg-stone-100 capitalize">
              {activePet.species} • {activePet.lifeStage}
            </span>
            {activePet.neutered && (
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold">
                Kapon (Neutered)
              </span>
            )}
          </div>
        </div>

        {/* Pet Profile Details Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-cream border border-stone-200/80 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
              {activePet.avatarEmoji || (activePet.species === 'cat' ? '🐱' : '🐕')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark">
                  {activePet.name}
                </h1>
              </div>
              <p className="text-sm text-stone-500 font-medium">
                {activePet.breed || (activePet.species === 'dog' ? 'Aspin' : 'Puspin')} •{' '}
                {activePet.age} {activePet.age === 1 ? 'yr' : 'yrs'} old
              </p>
            </div>
          </div>

          {/* Key Targets Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Current Weight
              </span>
              <span className="text-base sm:text-lg font-bold text-brand-dark">
                {activePet.weight.toFixed(1)} kg
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Water Target
              </span>
              <span className="text-base sm:text-lg font-bold text-cyan-800">
                {activePet.waterGoal || Math.round(activePet.weight * 50)} ml
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Daily Calories
              </span>
              <span className="text-base sm:text-lg font-bold text-amber-800">
                {activePet.dailyCalorieTarget} kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Top Navigation Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {[
            {
              id: 'water' as WellnessTab,
              label: 'Water Tracker',
              icon: Droplets,
              badge: `${activePet.waterGoal || Math.round(activePet.weight * 50)} ml/day`,
            },
            {
              id: 'weight' as WellnessTab,
              label: 'Weight Tracker',
              icon: Scale,
              badge: `${activePet.weight.toFixed(1)} kg`,
            },
            {
              id: 'schedule' as WellnessTab,
              label: 'Care Schedule & Reminders',
              icon: Calendar,
              badge: 'Care Tasks',
            },
            {
              id: 'household' as WellnessTab,
              label: 'Shared Household',
              icon: Home,
              badge: 'Family Sync',
            },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`group py-3.5 px-4 inline-flex items-center gap-2.5 font-bold text-xs sm:text-sm border-b-3 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-brand-sage text-brand-dark bg-white/70 rounded-t-xl shadow-2xs'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-sage' : 'text-stone-400 group-hover:text-stone-600'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-sage/15 text-brand-sage'
                      : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200 group-hover:text-stone-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="tab-content transition-opacity duration-200">
        {currentTab === 'water' && <WaterTracker pet={activePet} />}
        {currentTab === 'weight' && <WeightTracker pet={activePet} />}
        {currentTab === 'schedule' && <CareSchedule pet={activePet} />}
        {currentTab === 'household' && <SharedHousehold pet={activePet} />}
      </div>

      {/* Add Pet Modal for Top Navigation Button */}
      {isAddPetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddPetModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-brand-cream/60">
              <h3 className="font-bold text-brand-dark flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-brand-sage" />
                Add New Pet Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPetModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomPetSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={petFormName}
                  onChange={(e) => setPetFormName(e.target.value)}
                  placeholder="e.g., Milo, Luna, Browny"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Species *
                  </label>
                  <select
                    value={petFormSpecies}
                    onChange={(e) => setPetFormSpecies(e.target.value as Species)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage font-medium"
                  >
                    <option value="dog">Dog (Aso)</option>
                    <option value="cat">Cat (Pusa)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="150"
                    value={petFormWeight}
                    onChange={(e) => setPetFormWeight(e.target.value)}
                    placeholder="e.g. 5.5"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    list="breed-options-top"
                    value={petFormBreed}
                    onChange={(e) => setPetFormBreed(e.target.value)}
                    placeholder={petFormSpecies === 'dog' ? 'Aspin / Shih Tzu' : 'Puspin / Persian'}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                  />
                  <datalist id="breed-options-top">
                    {(petFormSpecies === 'dog' ? dogBreeds : catBreeds).map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={petFormAgeYears}
                    onChange={(e) => setPetFormAgeYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="pet-neutered-top"
                  type="checkbox"
                  checked={petFormNeutered}
                  onChange={(e) => setPetFormNeutered(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-sage focus:ring-brand-sage"
                />
                <label htmlFor="pet-neutered-top" className="text-stone-700 font-medium">
                  Neutered / Spayed (Kapon)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddPetModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-dark hover:bg-brand-sage text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
