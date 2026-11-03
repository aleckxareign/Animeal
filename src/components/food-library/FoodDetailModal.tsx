import { useEffect, useState } from 'react'
import {
  X,
  CheckCircle2,
  Sparkles,
  Dog,
  Cat,
  Scale,
  Utensils,
  Plus,
  Check,
  Calculator,
  Info,
  Tag,
} from 'lucide-react'
import type { FoodItem } from '../../types'
import { formatMoney } from '../../utils/formatters'
import { calcPricePer100Kcal } from './FoodCard'

interface FoodDetailModalProps {
  food: FoodItem | null
  isOpen: boolean
  isCompared: boolean
  onClose: () => void
  onToggleCompare: (food: FoodItem) => void
  onLogMeal: (food: FoodItem) => void
}

export default function FoodDetailModal({
  food,
  isOpen,
  isCompared,
  onClose,
  onToggleCompare,
  onLogMeal,
}: FoodDetailModalProps) {
  const [customPortion, setCustomPortion] = useState<number>(100)

  // Reset portion when a new food opens
  useEffect(() => {
    if (food) {
      setCustomPortion(food.servingSize || 100)
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

  const pricePer100Kcal = calcPricePer100Kcal(
    food.price,
    food.packageSize,
    food.caloriesPer100g,
  )

  const portionCalories = Math.round((food.caloriesPer100g * (customPortion || 0)) / 100)
  const portionCost =
    food.price && food.packageSize
      ? (food.price / food.packageSize) * (customPortion || 0)
      : 0

  const isDog = food.species.includes('dog')
  const isCat = food.species.includes('cat')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-scale-in my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-stone-100 flex items-start justify-between gap-4 bg-stone-50/60">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 tracking-wide">
                {food.brand}
              </span>

              {food.verified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Label
                </span>
              ) : food.isCustom ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-800 bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-300">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Custom Pet Food
                </span>
              ) : null}

              <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {food.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark leading-tight">
              {food.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Key Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-orange-50/70 rounded-2xl p-3.5 border border-orange-200/60 text-center">
              <span className="text-xs font-medium text-orange-800 block">Energy Density</span>
              <div className="text-xl sm:text-2xl font-bold text-brand-dark font-display mt-0.5">
                {food.caloriesPer100g}
              </div>
              <span className="text-[11px] font-semibold text-stone-500">kcal / 100g</span>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/60 text-center">
              <span className="text-xs font-medium text-emerald-800 block">Value Rating</span>
              <div className="text-lg sm:text-xl font-bold text-brand-dark font-display mt-0.5">
                {pricePer100Kcal ? formatMoney(pricePer100Kcal) : 'N/A'}
              </div>
              <span className="text-[11px] font-semibold text-emerald-700">per 100 kcal</span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 text-center">
              <span className="text-xs font-medium text-stone-600 block">Package Size</span>
              <div className="text-lg sm:text-xl font-bold text-brand-dark font-display mt-0.5">
                {food.packageSize >= 1000 ? `${food.packageSize / 1000} kg` : `${food.packageSize} g`}
              </div>
              <span className="text-[11px] font-semibold text-stone-500">
                {food.price ? formatMoney(food.price) : 'Free'}
              </span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 text-center">
              <span className="text-xs font-medium text-stone-600 block">Target Species</span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {isDog && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    <Dog className="w-3.5 h-3.5" /> Dog
                  </span>
                )}
                {isCat && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md">
                    <Cat className="w-3.5 h-3.5" /> Cat
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Guaranteed Nutritional Analysis */}
          <div>
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>Guaranteed Nutritional Analysis</span>
              <span className="text-xs font-normal text-stone-400 normal-case">(as fed)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Protein */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-brand-dark">Crude Protein</span>
                  <span className="font-bold text-brand-sage">{food.protein}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-sage h-full rounded-full"
                    style={{ width: `${Math.min(100, food.protein * 2)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">Min guarantee</span>
              </div>

              {/* Fat */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-brand-dark">Crude Fat</span>
                  <span className="font-bold text-amber-600">{food.fat}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, food.fat * 3.5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">Min guarantee</span>
              </div>

              {/* Fiber */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-brand-dark">Crude Fiber</span>
                  <span className="font-bold text-stone-700">{food.fiber}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-stone-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, food.fiber * 8)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">Max guarantee</span>
              </div>

              {/* Moisture */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-brand-dark">Moisture</span>
                  <span className="font-bold text-sky-600">{food.moisture}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, food.moisture)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">Max guarantee</span>
              </div>
            </div>
          </div>

          {/* Serving Guideline & Life Stage Suitability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-stone-500" />
                Serving Guideline
              </h4>
              <p className="text-sm font-semibold text-brand-dark">
                {food.servingSize} {food.servingUnit}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Typical manufacturer suggested daily ration based on adult weight.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-stone-500" />
                Life Stage Suitability
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {food.lifeStageSuitability.map((stage) => (
                  <span
                    key={stage}
                    className="text-xs font-semibold capitalize px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200/60"
                  >
                    {stage}
                  </span>
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Formulated to meet nutritional levels established for these growth stages.
              </p>
            </div>
          </div>

          {/* Interactive Portion Calculator */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                Portion Calorie & Cost Calculator
              </h4>
              <span className="text-[11px] font-medium text-emerald-700">Quick estimate</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customPortion}
                  onChange={(e) => setCustomPortion(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-center font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-sage"
                />
                <span className="text-xs font-semibold text-stone-600">grams (g)</span>
              </div>

              <div className="flex items-center gap-4 sm:ml-auto">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase block font-semibold">Calories</span>
                  <span className="text-base font-bold text-brand-dark font-display">
                    {portionCalories} kcal
                  </span>
                </div>
                {food.price > 0 && food.packageSize > 0 && (
                  <div className="pl-4 border-l border-emerald-200">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Cost / meal</span>
                    <span className="text-base font-bold text-emerald-800 font-display">
                      {formatMoney(portionCost)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-xs">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Safety Note:</strong> Nutritional values are from manufacturer labels. Always consult your vet for specific dietary needs, allergies, and health conditions.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleCompare(food)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              isCompared
                ? 'bg-brand-sage text-white border-brand-sage'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {isCompared ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Remove from Compare</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-stone-500" />
                <span>Add to Compare</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onLogMeal(food)
                onClose()
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-dark hover:bg-brand-sage text-white shadow-sm transition-colors"
            >
              <Utensils className="w-4 h-4" />
              <span>Log as Meal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
