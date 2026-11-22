import { useState, useEffect } from 'react'
import {
  X,
  Utensils,
  Flame,
  AlertCircle,
} from 'lucide-react'
import type { FoodItem } from '../../types'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

interface QuickLogModalProps {
  food: FoodItem | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickLogModal({
  food,
  isOpen,
  onClose,
}: QuickLogModalProps) {
  const { pets, activePet, logFeeding, getTodayCalories } = useApp()
  const { addToast } = useToast()

  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [portionGrams, setPortionGrams] = useState<number>(100)
  const [fedBy, setFedBy] = useState<string>('Me')

  // Initialize selected pet and serving size
  useEffect(() => {
    if (activePet) {
      setSelectedPetId(activePet.id)
    } else if (pets.length > 0) {
      setSelectedPetId(pets[0].id)
    }
  }, [activePet, pets])

  useEffect(() => {
    if (food) {
      setPortionGrams(food.servingSize || 100)
    }
  }, [food])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !food) return null

  const targetPet = pets.find((p) => p.id === selectedPetId) ?? activePet ?? null
  const todayCalories = targetPet ? getTodayCalories(targetPet.id) : 0
  const dailyTarget = targetPet?.dailyCalorieTarget || 0

  const calculatedCalories = Math.round(
    (food.caloriesPer100g * (portionGrams || 0)) / 100,
  )
  const calculatedProtein = Math.round(
    ((food.protein * (portionGrams || 0)) / 100) * 10,
  ) / 10
  const calculatedFat = Math.round(
    ((food.fat * (portionGrams || 0)) / 100) * 10,
  ) / 10
  const calculatedFiber = Math.round(
    ((food.fiber * (portionGrams || 0)) / 100) * 10,
  ) / 10

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()

    if (!targetPet) {
      addToast('Please register a pet first before logging meals!', 'warning')
      return
    }

    if (portionGrams <= 0) {
      addToast('Please enter a valid portion size.', 'error')
      return
    }

    logFeeding({
      petId: targetPet.id,
      foodId: food.id,
      foodName: food.name,
      portion: portionGrams,
      unit: 'g',
      calories: calculatedCalories,
      protein: calculatedProtein,
      fat: calculatedFat,
      fiber: calculatedFiber,
      fedBy: fedBy.trim() || 'Me',
    })

    addToast(
      `Napakain si ${targetPet.name}! Logged ${calculatedCalories} kcal of ${food.name}.`,
      'success',
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-scale-in my-6">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-dark text-white flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark">Log as Meal</h2>
              <p className="text-xs text-stone-500 line-clamp-1">{food.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {/* Pet Selector */}
          {pets.length > 0 ? (
            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">
                Select Pet
              </label>
              <div className="grid grid-cols-2 gap-2">
                {pets.map((p) => {
                  const isSelected = p.id === (targetPet?.id ?? '')
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPetId(p.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand-sage bg-emerald-50/70 ring-2 ring-brand-sage/20 font-semibold'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-xl">{p.avatarEmoji || '🐾'}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-brand-dark truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-stone-500 capitalize">
                          {p.species} • {p.weight}kg
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Pet Calorie status */}
              {targetPet && (
                <div className="mt-2.5 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
                  <span className="text-stone-600">Today's Total:</span>
                  <div className="font-semibold text-brand-dark">
                    <span>{todayCalories}</span> / {dailyTarget} kcal
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">No pets registered yet</p>
                <p className="text-amber-800 mt-0.5">
                  You can register a pet in Pet Wellness or Meal Tracker to start tracking their daily calories.
                </p>
              </div>
            </div>
          )}

          {/* Portion Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Portion Amount
              </label>
              <span className="text-xs text-stone-500">
                Standard: {food.servingSize}g
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                max="2000"
                required
                value={portionGrams}
                onChange={(e) => setPortionGrams(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-sage font-bold text-brand-dark"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                grams (g)
              </span>
            </div>

            {/* Quick Portion Chips */}
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 150, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPortionGrams(amt)}
                  className={`flex-1 py-1 text-xs rounded-lg border font-medium transition-colors ${
                    portionGrams === amt
                      ? 'bg-brand-sage text-white border-brand-sage'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {amt}g
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Output Card */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-500">Nutrition for this meal</span>
              <div className="flex items-center gap-1 font-display text-lg font-bold text-brand-dark">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{calculatedCalories} kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-stone-200/60">
                <span className="text-[10px] text-stone-500 block">Protein</span>
                <span className="font-bold text-brand-sage">{calculatedProtein}g</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200/60">
                <span className="text-[10px] text-stone-500 block">Fat</span>
                <span className="font-bold text-amber-600">{calculatedFat}g</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200/60">
                <span className="text-[10px] text-stone-500 block">Fiber</span>
                <span className="font-bold text-stone-600">{calculatedFiber}g</span>
              </div>
            </div>
          </div>

          {/* Fed By */}
          <div>
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">
              Fed By
            </label>
            <input
              type="text"
              value={fedBy}
              onChange={(e) => setFedBy(e.target.value)}
              placeholder="e.g. Me, Mom, Kuya"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-dark hover:bg-brand-sage text-white shadow-sm transition-all active:scale-95"
            >
              <Utensils className="w-4 h-4" />
              <span>Napakain ako (Log Meal)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
