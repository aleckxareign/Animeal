import { useEffect } from 'react'
import {
  X,
  Scale,
  Award,
  TrendingDown,
  Utensils,
  Dog,
  Cat,
  Flame,
  Trash2,
} from 'lucide-react'
import type { FoodItem } from '../../types'
import { formatMoney } from '../../utils/formatters'
import { calcPricePer100Kcal } from './FoodCard'

interface FoodCompareModalProps {
  isOpen: boolean
  comparedFoods: FoodItem[]
  onClose: () => void
  onRemoveFromCompare: (foodId: string) => void
  onClearAll: () => void
  onLogMeal: (food: FoodItem) => void
}

export default function FoodCompareModal({
  isOpen,
  comparedFoods,
  onClose,
  onRemoveFromCompare,
  onClearAll,
  onLogMeal,
}: FoodCompareModalProps) {
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

  if (!isOpen) return null

  // Calculate Best Value (lowest price per 100 kcal)
  let bestValueId: string | null = null
  let lowestCostPer100Kcal = Infinity

  comparedFoods.forEach((food) => {
    const val = calcPricePer100Kcal(food.price, food.packageSize, food.caloriesPer100g)
    if (val !== null && val < lowestCostPer100Kcal) {
      lowestCostPer100Kcal = val
      bestValueId = food.id
    }
  })

  // Calculate Highest Protein
  let highestProteinId: string | null = null
  let maxProtein = -Infinity

  comparedFoods.forEach((food) => {
    if (food.protein > maxProtein) {
      maxProtein = food.protein
      highestProteinId = food.id
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden z-10 animate-scale-in my-0 max-h-[min(92vh,calc(100dvh-2rem))] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border flex items-center justify-between gap-4 bg-background">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-sage/10 text-brand-accent flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Product Comparison
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comparing {comparedFoods.length} {comparedFoods.length === 1 ? 'item' : 'items'} side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedFoods.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:text-destructive/80 px-2.5 py-1.5 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-muted-foreground p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {comparedFoods.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground">No foods selected to compare</p>
              <p className="text-xs text-muted-foreground mt-1">
                Select up to 3 foods in the library to see their nutritional and price comparison.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div
                className="grid gap-4 min-w-[640px]"
                style={{
                  gridTemplateColumns: `200px repeat(${comparedFoods.length}, minmax(210px, 1fr))`,
                }}
              >
                {/* Header Row (Product Titles & Highlights) */}
                <div className="p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground self-end">
                  Product
                </div>
                {comparedFoods.map((food) => {
                  const isBestValue = food.id === bestValueId
                  const isHighestProtein = food.id === highestProteinId

                  return (
                    <div
                      key={food.id}
                      className={`relative p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                        isBestValue
                          ? 'border-emerald-300 dark:border-emerald-400/30 bg-emerald-50/30 dark:bg-emerald-500/15'
                          : isHighestProtein
                            ? 'border-amber-300 dark:border-amber-400/30 bg-amber-50/20 dark:bg-amber-500/15'
                            : 'border-border bg-muted/50'
                      }`}
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveFromCompare(food.id)}
                        className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-muted-foreground p-1 rounded-md hover:bg-card"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Badges */}
                      <div className="space-y-1 mb-2 pr-6">
                        {isBestValue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-400/30">
                            <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                            Best Value
                          </span>
                        )}
                        {isHighestProtein && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-400/30 ml-1">
                            <Award className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                            Highest Protein
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {food.brand}
                      </div>
                      <h4 className="font-bold text-foreground text-sm leading-snug line-clamp-2 mt-1 mb-3">
                        {food.name}
                      </h4>

                      <button
                        type="button"
                        onClick={() => {
                          onLogMeal(food)
                          onClose()
                        }}
                        className="w-full mt-auto inline-flex items-center justify-center gap-1 text-xs font-bold bg-brand-dark hover:bg-brand-sage text-white py-1.5 px-3 rounded-xl transition-colors"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        Log as Meal
                      </button>
                    </div>
                  )
                })}

                {/* Section Divider */}
                <div className="col-span-full pt-3 pb-1 border-t border-border">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Pricing & Value
                  </span>
                </div>

                {/* Package Price */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Package Price
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-sm font-bold text-foreground self-center">
                    {formatMoney(f.price)}
                  </div>
                ))}

                {/* Package Size */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Package Size
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs font-medium text-muted-foreground self-center">
                    {f.packageSize >= 1000 ? `${f.packageSize / 1000} kg` : `${f.packageSize} g`}
                  </div>
                ))}

                {/* Price per 100 kcal (Highlighted) */}
                <div className="p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 self-center flex items-center gap-1">
                  <span>Price / 100 kcal</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-normal">(budget metric)</span>
                </div>
                {comparedFoods.map((f) => {
                  const val = calcPricePer100Kcal(f.price, f.packageSize, f.caloriesPer100g)
                  const isBest = f.id === bestValueId
                  return (
                    <div
                      key={f.id}
                      className={`p-3 self-center rounded-xl ${
                        isBest ? 'bg-emerald-100/90 dark:bg-emerald-500/15 font-bold text-emerald-900 dark:text-emerald-300' : 'text-xs text-muted-foreground'
                      }`}
                    >
                      <span className="text-sm font-bold">
                        {val ? `${formatMoney(val)}` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">per 100 kcal</span>
                    </div>
                  )
                })}

                {/* Section Divider: Nutrition */}
                <div className="col-span-full pt-4 pb-1 border-t border-border">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Nutritional Breakdown
                  </span>
                </div>

                {/* Calories per 100g */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Calories / 100g
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-sm font-bold text-foreground self-center flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{f.caloriesPer100g} kcal</span>
                  </div>
                ))}

                {/* Crude Protein */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Crude Protein
                </div>
                {comparedFoods.map((f) => {
                  const isHighest = f.id === highestProteinId
                  return (
                    <div
                      key={f.id}
                      className={`p-3 self-center rounded-xl ${
                        isHighest ? 'bg-amber-100 dark:bg-amber-500/15 font-bold text-amber-900 dark:text-amber-300' : 'text-xs text-muted-foreground'
                      }`}
                    >
                      <span className="text-sm font-bold text-brand-accent">{f.protein}%</span>
                    </div>
                  )
                })}

                {/* Crude Fat */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Crude Fat
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs font-semibold text-amber-700 dark:text-amber-300 self-center">
                    {f.fat}%
                  </div>
                ))}

                {/* Crude Fiber */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Crude Fiber
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs font-medium text-muted-foreground self-center">
                    {f.fiber}%
                  </div>
                ))}

                {/* Moisture */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Moisture
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs font-medium text-sky-700 dark:text-sky-300 self-center">
                    {f.moisture}%
                  </div>
                ))}

                {/* Section Divider: Suitability */}
                <div className="col-span-full pt-4 pb-1 border-t border-border">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Suitability & Feeding
                  </span>
                </div>

                {/* Category */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Category
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs uppercase font-medium text-muted-foreground self-center">
                    {f.category}
                  </div>
                ))}

                {/* Species */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Target Pet
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs self-center flex items-center gap-1.5">
                    {f.species.includes('dog') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-400/30">
                        <Dog className="w-3 h-3" /> Dog
                      </span>
                    )}
                    {f.species.includes('cat') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-400/30">
                        <Cat className="w-3 h-3" /> Cat
                      </span>
                    )}
                  </div>
                ))}

                {/* Life Stages */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Life Stage
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs self-center flex flex-wrap gap-1">
                    {f.lifeStageSuitability.map((st) => (
                      <span
                        key={st}
                        className="capitalize px-2 py-0.5 bg-muted rounded text-[11px] text-muted-foreground"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                ))}

                {/* Serving guideline */}
                <div className="p-3 text-xs font-semibold text-muted-foreground self-center">
                  Serving Guideline
                </div>
                {comparedFoods.map((f) => (
                  <div key={f.id} className="p-3 text-xs text-muted-foreground self-center leading-relaxed">
                    {f.servingSize} {f.servingUnit}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-background border-t border-border flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-dark hover:bg-brand-sage text-white transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Floating Comparison Bar (Docked at the bottom when items > 0)
// ────────────────────────────────────────────────────────────────
interface FoodCompareBarProps {
  comparedFoods: FoodItem[]
  onOpenCompare: () => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function FoodCompareBar({
  comparedFoods,
  onOpenCompare,
  onRemove,
  onClear,
}: FoodCompareBarProps) {
  if (comparedFoods.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-slide-up">
      <div className="bg-brand-dark text-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Selected food chips */}
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-stone-700">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Compare ({comparedFoods.length}/3):</span>
          </div>

          <div className="flex items-center gap-2 flex-nowrap">
            {comparedFoods.map((food) => (
              <div
                key={food.id}
                className="inline-flex items-center gap-1.5 bg-stone-800/80 border border-stone-700 text-stone-200 text-xs px-2.5 py-1 rounded-xl max-w-[150px] truncate"
              >
                <span className="truncate font-medium">{food.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(food.id)}
                  className="text-muted-foreground hover:text-white shrink-0 p-0.5 rounded-full hover:bg-stone-700"
                  aria-label={`Remove ${food.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-stone-200 px-2 py-1.5 transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-sage hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
