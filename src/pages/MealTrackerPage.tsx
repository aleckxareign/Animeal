import { useState } from 'react'
import {
  Plus,
  Sparkles,
  Heart,
  Utensils,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getGreeting } from '../utils/formatters'
import type { Pet } from '../types'

import PetSwitcher from '../components/meal-tracker/PetSwitcher'
import CalorieDashboard from '../components/meal-tracker/CalorieDashboard'
import PlateVisualization from '../components/meal-tracker/PlateVisualization'
import FeedModal from '../components/meal-tracker/FeedModal'
import FeedingHistory from '../components/meal-tracker/FeedingHistory'
import EditPetModal from '../components/meal-tracker/EditPetModal'
import PetOnboardingModal from '../components/meal-tracker/PetOnboardingModal'
import QuickReminders from '../components/meal-tracker/QuickReminders'

export default function MealTrackerPage() {
  const { pets, activePet, getTodayFeedings } = useApp()

  const [isAddPetOpen, setIsAddPetOpen] = useState(false)
  const [isEditPetOpen, setIsEditPetOpen] = useState(false)
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false)
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null)

  const greeting = getGreeting()

  const handleEditPet = (pet: Pet) => {
    setPetToEdit(pet)
    setIsEditPetOpen(true)
  }

  // ────────────────────────────
  // EMPTY STATE / ONBOARDING VIEW
  // ────────────────────────────
  if (pets.length === 0) {
    return (
      <div className="min-h-[85vh] bg-brand-cream/40 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-sage/10 text-4xl shadow-xs">
            🐾
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-sage/15 px-3 py-1 text-xs font-bold text-brand-sage uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome to AniMeal
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark">
              Let's set up your pet's meal tracker
            </h1>
            <p className="text-sm sm:text-base text-brand-dark/70 max-w-lg mx-auto">
              Track daily calories, ensure balanced nutrition plates, coordinate household feeding, and keep your pets healthy and happy.
            </p>
          </div>

          {/* Call to Action card */}
          <div className="rounded-3xl bg-white border border-brand-dark/10 shadow-lg p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl bg-brand-cream/50 p-4 border border-brand-dark/5">
                <div className="text-2xl mb-1">🎯</div>
                <h4 className="font-bold text-sm text-brand-dark">RER Calorie Math</h4>
                <p className="text-xs text-brand-dark/60 mt-1">
                  Automatic daily energy requirements based on weight & life-stage.
                </p>
              </div>
              <div className="rounded-2xl bg-brand-cream/50 p-4 border border-brand-dark/5">
                <div className="text-2xl mb-1">🥣</div>
                <h4 className="font-bold text-sm text-brand-dark">Plate Ratios</h4>
                <p className="text-xs text-brand-dark/60 mt-1">
                  Visual protein, fat, and fiber breakdown with every meal logged.
                </p>
              </div>
              <div className="rounded-2xl bg-brand-cream/50 p-4 border border-brand-dark/5">
                <div className="text-2xl mb-1">👨‍👩‍👧‍👦</div>
                <h4 className="font-bold text-sm text-brand-dark">Sino Nagpakain?</h4>
                <p className="text-xs text-brand-dark/60 mt-1">
                  Prevent accidental double-feeding across the household.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddPetOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-sage px-8 py-4 text-base font-bold text-white shadow-md hover:bg-brand-sage/90 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Heart className="h-5 w-5 fill-white" />
              <span>Add Your First Pet (Simulan Dito)</span>
            </button>
          </div>
        </div>

        {/* Modal Wizard for first pet */}
        <PetOnboardingModal
          isOpen={isAddPetOpen}
          isInitial={true}
          onClose={() => setIsAddPetOpen(false)}
        />
      </div>
    )
  }

  // ────────────────────────────
  // ACTIVE DASHBOARD VIEW
  // ────────────────────────────
  const currentPet = activePet || pets[0]
  const todayFeedings = getTodayFeedings(currentPet.id)

  return (
    <div className="min-h-screen bg-brand-cream/30 py-10 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px] space-y-10">
        {/* Top greeting & Pet Switcher */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-brand-sage">
                {greeting}, Ka-AniMeal! 👋
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                Meal Tracker & Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFeedModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-brand-sage px-6 py-3 text-base font-bold text-white shadow-md hover:bg-brand-sage/90 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="size-5" />
                <span>+ Napakain ako</span>
              </button>
            </div>
          </div>

          {/* Pet Switcher Bar */}
          <PetSwitcher
            onAddPet={() => setIsAddPetOpen(true)}
            onEditPet={handleEditPet}
          />
        </div>

        {/* SECTION 1: Calorie & Nutrition Overview (Top Big Card) */}
        <CalorieDashboard
          pet={currentPet}
          onEditPet={handleEditPet}
          onOpenFeedModal={() => setIsFeedModalOpen(true)}
        />

        {/* SECTION 2: Plate Visualization + Quick Care Reminders (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <PlateVisualization
              feedings={todayFeedings}
              petName={currentPet.name}
              onOpenFeedModal={() => setIsFeedModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-5">
            <QuickReminders pet={currentPet} />
          </div>
        </div>

        {/* SECTION 3: Feeding History & Household Log */}
        <div>
          <FeedingHistory
            pet={currentPet}
            onOpenFeedModal={() => setIsFeedModalOpen(true)}
          />
        </div>
      </div>

      {/* Floating Action Button for mobile quick feeding */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <button
          onClick={() => setIsFeedModalOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-sage text-white shadow-xl hover:bg-brand-sage/90 active:scale-95 transition"
          aria-label="Feed pet"
        >
          <Utensils className="h-6 w-6" />
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Add Pet Modal */}
      <PetOnboardingModal
        isOpen={isAddPetOpen}
        onClose={() => setIsAddPetOpen(false)}
      />

      {/* 2. Edit Pet Modal */}
      {petToEdit && (
        <EditPetModal
          isOpen={isEditPetOpen}
          pet={petToEdit}
          onClose={() => {
            setIsEditPetOpen(false)
            setPetToEdit(null)
          }}
        />
      )}

      {/* 3. Feed Modal */}
      <FeedModal
        isOpen={isFeedModalOpen}
        pet={currentPet}
        onClose={() => setIsFeedModalOpen(false)}
      />
    </div>
  )
}
