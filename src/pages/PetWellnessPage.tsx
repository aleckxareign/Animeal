import { useState } from 'react'
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
import PetOnboardingModal from '../components/meal-tracker/PetOnboardingModal'

import type { Species } from '../types'

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

  // If no pets registered, render friendly onboarding empty state
  if (!activePet || pets.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-16 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <div className="w-16 h-16 rounded-3xl bg-brand-sage/10 text-brand-accent flex items-center justify-center mx-auto shadow-xs">
            <PawPrint className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground font-extrabold tracking-tight">
            Pet Wellness & Shared Care
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Track daily hydration, monitor weight changes over time, coordinate care schedules, and keep your entire household in sync so your pet is always thriving.
          </p>
        </div>

        {/* Empty State Card */}
        <div className="bg-card rounded-3xl p-8 sm:p-12 border border-border/80 shadow-md text-center max-w-xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              No pets found yet!
            </h2>
            <p className="text-sm text-muted-foreground">
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
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-muted hover:bg-accent text-foreground font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              🐶 Add Luna (Dog)
            </button>
            <button
              type="button"
              onClick={() => handleAddSamplePet('cat')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-muted hover:bg-accent text-foreground font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              🐱 Add Milo (Cat)
            </button>
          </div>
        </div>

        {/* Modal for Adding Custom Pet */}
        <PetOnboardingModal isOpen={isAddPetModalOpen} onClose={() => setIsAddPetModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12 py-10 lg:py-14 space-y-10 animate-fade-in">
      {/* Top Bar: Active Pet Selector & Pet Summary Banner */}
      <div className="bg-card rounded-3xl p-5 sm:p-7 border border-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          {/* Pet Switcher Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
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
                      ? 'bg-brand-dark text-white border-foreground shadow-xs ring-2 ring-brand-sage/30'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-dashed border-border transition-colors shrink-0"
              title="Add another pet"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pet
            </button>
          </div>

          {/* Quick Pet Stage Badge */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-full bg-muted capitalize">
              {activePet.species} • {activePet.lifeStage}
            </span>
            {activePet.neutered && (
              <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold">
                Kapon (Neutered)
              </span>
            )}
          </div>
        </div>

        {/* Pet Profile Details Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-background border border-border/80 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
              {activePet.avatarEmoji || (activePet.species === 'cat' ? '🐱' : '🐕')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  {activePet.name}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {activePet.breed || (activePet.species === 'dog' ? 'Aspin' : 'Puspin')} •{' '}
                {activePet.age} {activePet.age === 1 ? 'yr' : 'yrs'} old
              </p>
            </div>
          </div>

          {/* Key Targets Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-background border border-border/60 p-3 rounded-xl">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Current Weight
              </span>
              <span className="text-base sm:text-lg font-bold text-foreground">
                {activePet.weight.toFixed(1)} kg
              </span>
            </div>

            <div className="bg-background border border-border/60 p-3 rounded-xl">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Water Target
              </span>
              <span className="text-base sm:text-lg font-bold text-cyan-800 dark:text-cyan-300">
                {activePet.waterGoal || Math.round(activePet.weight * 50)} ml
              </span>
            </div>

            <div className="bg-background border border-border/60 p-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Daily Calories
              </span>
              <span className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300">
                {activePet.dailyCalorieTarget} kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Top Navigation Tabs */}
      <div className="border-b border-border">
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
                    ? 'border-brand-sage text-foreground bg-card/70 rounded-t-xl shadow-2xs'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-accent' : 'text-muted-foreground group-hover:text-muted-foreground'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-sage/15 text-brand-accent'
                      : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-muted-foreground'
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
      <PetOnboardingModal isOpen={isAddPetModalOpen} onClose={() => setIsAddPetModalOpen(false)} />
    </div>
  )
}
