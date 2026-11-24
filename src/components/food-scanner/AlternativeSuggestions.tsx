import { useState, useMemo } from 'react'
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Dna,
  Flame,
  Droplets,
  Wheat,
  Coins,
} from 'lucide-react'
import type { FoodItem } from '../../types'
import type { ScannedFoodData } from './ScannerUpload'
import { foods as allFoods } from '../../data/foods'
import { formatMoney } from '../../utils/formatters'

type AlternativeSuggestionsProps = {
  data: ScannedFoodData
  onSelectAlternative?: (food: FoodItem) => void
}

export default function AlternativeSuggestions({
  data,
  onSelectAlternative,
}: AlternativeSuggestionsProps) {
  const [comparingFood, setComparingFood] = useState<FoodItem | null>(null)

  // 1. Calculate Scanned Cost per 100 kcal
  const scannedPricePer100Kcal = useMemo(() => {
    if (!data.price || !data.packageWeight || !data.calories) return null
    const totalCalories = (data.calories * data.packageWeight) / 100
    if (totalCalories <= 0) return null
    return (data.price / totalCalories) * 100
  }, [data.price, data.packageWeight, data.calories])

  // 2. Calculate Database Average Cost per 100 kcal for similar category & species
  const { averagePricePer100Kcal, alternatives } = useMemo(() => {
    const matchingFoods = allFoods.filter(
      (f) =>
        f.species.includes(data.species) &&
        f.category === data.category &&
        f.price > 0 &&
        f.packageSize > 0 &&
        f.caloriesPer100g > 0,
    )

    let sumCost = 0
    let count = 0

    const scored = matchingFoods.map((f) => {
      const totalCal = (f.caloriesPer100g * f.packageSize) / 100
      const costPer100Kcal = totalCal > 0 ? (f.price / totalCal) * 100 : 0
      sumCost += costPer100Kcal
      count++
      return { food: f, costPer100Kcal }
    })

    const avg = count > 0 ? sumCost / count : 3.5

    // Pick 2 smart alternatives:
    // Option A: Higher protein if scanned is low/moderate
    // Option B: Better value if scanned is expensive
    const currentProtein = data.protein ?? 20

    const higherProtein = scored
      .filter((s) => s.food.protein > currentProtein)
      .sort((a, b) => b.food.protein - a.food.protein)[0]?.food

    const bestValue = scored
      .filter((s) => (scannedPricePer100Kcal ? s.costPer100Kcal < scannedPricePer100Kcal : true))
      .sort((a, b) => a.costPer100Kcal - b.costPer100Kcal)[0]?.food

    const selected: { food: FoodItem; reason: string; badge: string }[] = []

    if (higherProtein) {
      selected.push({
        food: higherProtein,
        reason: `Provides ${higherProtein.protein}% crude protein (+${(higherProtein.protein - currentProtein).toFixed(0)}% more than scanned).`,
        badge: 'Higher Protein',
      })
    }

    if (bestValue && (!higherProtein || bestValue.id !== higherProtein.id)) {
      const totalCal = (bestValue.caloriesPer100g * bestValue.packageSize) / 100
      const cost = totalCal > 0 ? (bestValue.price / totalCal) * 100 : 0
      selected.push({
        food: bestValue,
        reason: `Priced at ~${formatMoney(cost)}/100 kcal for budget-conscious quality feeding.`,
        badge: 'Best Value',
      })
    }

    // Fallback if none picked yet
    if (selected.length < 2) {
      for (const s of scored) {
        if (!selected.some((item) => item.food.id === s.food.id)) {
          selected.push({
            food: s.food,
            reason: `Balanced verified formula for adult ${data.species}s.`,
            badge: 'Popular Alternative',
          })
          if (selected.length >= 2) break
        }
      }
    }

    return {
      averagePricePer100Kcal: avg,
      alternatives: selected,
    }
  }, [data.species, data.category, data.protein, scannedPricePer100Kcal])

  // Price comparison status
  const priceComparison = useMemo(() => {
    if (!scannedPricePer100Kcal || !averagePricePer100Kcal) return null
    const diffPercent = Math.round(
      ((scannedPricePer100Kcal - averagePricePer100Kcal) / averagePricePer100Kcal) * 100,
    )

    if (diffPercent <= -15) {
      return {
        type: 'cheaper',
        text: `${Math.abs(diffPercent)}% cheaper than database average`,
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-400/30',
        icon: TrendingDown,
        badge: 'Great Value',
      }
    }

    if (diffPercent >= 15) {
      return {
        type: 'expensive',
        text: `${diffPercent}% higher than database average`,
        color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-400/30',
        icon: TrendingUp,
        badge: 'Premium Price',
      }
    }

    return {
      type: 'average',
      text: `Right in line with typical ${data.species} food prices`,
      color: 'text-foreground bg-background/60 border-foreground/15',
      icon: Scale,
      badge: 'Market Average',
    }
  }, [scannedPricePer100Kcal, averagePricePer100Kcal, data.species])

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-brand-accent" />
            <span>Value & Budget Intelligence</span>
          </h2>
          <p className="text-xs text-foreground/60 mt-0.5">
            Normalized price per 100 calories compared to Philippine pet nutrition benchmarks
          </p>
        </div>
      </div>

      {/* Price per 100 kcal Comparison Card */}
      <div className="rounded-xl border border-foreground/10 bg-background/30 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
              Normalized Calorie Cost
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">
                {scannedPricePer100Kcal !== null
                  ? formatMoney(scannedPricePer100Kcal)
                  : '—'}
              </span>
              <span className="text-xs font-bold text-foreground/60">per 100 kcal</span>
            </div>
          </div>

          {priceComparison && (
            <div
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold self-start sm:self-auto ${priceComparison.color}`}
            >
              <priceComparison.icon className="h-4 w-4 shrink-0" />
              <span>{priceComparison.text}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-foreground/10 pt-2.5 text-xs text-foreground/70">
          <span>
            Database average for {data.species} {data.category} food:
          </span>
          <span className="font-bold text-foreground">
            {formatMoney(averagePricePer100Kcal)} / 100 kcal
          </span>
        </div>
      </div>

      {/* Smart Alternatives */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-brand-accent" />
            <span>Smart Recommendations from Library</span>
          </h3>
          <span className="text-[11px] font-medium text-foreground/50">
            Same species & category
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {alternatives.map(({ food, reason, badge }) => {
            const totalCal = (food.caloriesPer100g * food.packageSize) / 100
            const costPer100Kcal = totalCal > 0 ? (food.price / totalCal) * 100 : 0

            return (
              <div
                key={food.id}
                className="flex flex-col justify-between rounded-xl border border-foreground/10 bg-card p-4 transition-all hover:border-brand-sage/60 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="rounded-md bg-brand-sage/10 px-2 py-0.5 text-[10px] font-bold text-brand-accent">
                      {badge}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {formatMoney(food.price)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground leading-snug">
                    {food.name}
                  </h4>
                  <p className="text-xs text-foreground/50 mb-2">{food.brand}</p>

                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-background/40 p-2 text-center text-[11px] mb-2.5">
                    <div>
                      <p className="text-foreground/50">Protein</p>
                      <p className="font-bold text-brand-accent">{food.protein}%</p>
                    </div>
                    <div>
                      <p className="text-foreground/50">Energy</p>
                      <p className="font-bold text-foreground">{food.caloriesPer100g}k</p>
                    </div>
                    <div>
                      <p className="text-foreground/50">Cost/100k</p>
                      <p className="font-bold text-foreground">{formatMoney(costPer100Kcal)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/70 leading-relaxed mb-3">
                    {reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-foreground/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setComparingFood(food)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:underline"
                  >
                    <span>Compare Side-by-Side</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  {onSelectAlternative && (
                    <button
                      type="button"
                      onClick={() => onSelectAlternative(food)}
                      className="rounded-lg bg-brand-dark/5 px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-brand-sage hover:text-white transition"
                    >
                      Use This Food
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {comparingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-card p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                  Head-to-Head Comparison
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Scanned Product vs Alternative
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComparingFood(null)}
                className="rounded-lg p-1.5 text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-foreground/20 bg-background/30 p-3">
                  <span className="text-[10px] font-bold uppercase text-foreground/50">
                    Your Scanned Food
                  </span>
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {data.productName}
                  </p>
                  <p className="text-xs text-foreground/60">{data.brand}</p>
                </div>

                <div className="rounded-xl border border-brand-sage/40 bg-brand-sage/10 p-3">
                  <span className="text-[10px] font-bold uppercase text-brand-accent">
                    Suggested Alternative
                  </span>
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {comparingFood.name}
                  </p>
                  <p className="text-xs text-brand-accent font-medium">{comparingFood.brand}</p>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2 text-xs">
                {/* Protein */}
                <div className="flex items-center justify-between rounded-lg bg-background/20 p-2.5">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Dna className="h-4 w-4 text-brand-accent" />
                    <span>Crude Protein</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="w-16 text-right font-bold text-foreground">
                      {data.protein ?? '—'}%
                    </span>
                    <span
                      className={`w-16 text-right font-bold ${
                        comparingFood.protein > (data.protein ?? 0)
                          ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : 'text-foreground'
                      }`}
                    >
                      {comparingFood.protein}%
                    </span>
                  </div>
                </div>

                {/* Fat */}
                <div className="flex items-center justify-between rounded-lg bg-background/20 p-2.5">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Droplets className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    <span>Crude Fat</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="w-16 text-right font-bold text-foreground">
                      {data.fat ?? '—'}%
                    </span>
                    <span className="w-16 text-right font-bold text-foreground">
                      {comparingFood.fat}%
                    </span>
                  </div>
                </div>

                {/* Fiber */}
                <div className="flex items-center justify-between rounded-lg bg-background/20 p-2.5">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Wheat className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    <span>Crude Fiber</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="w-16 text-right font-bold text-foreground">
                      {data.fiber ?? '—'}%
                    </span>
                    <span className="w-16 text-right font-bold text-foreground">
                      {comparingFood.fiber}%
                    </span>
                  </div>
                </div>

                {/* Calories */}
                <div className="flex items-center justify-between rounded-lg bg-background/20 p-2.5">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                    <span>Calories / 100g</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="w-16 text-right font-bold text-foreground">
                      {data.calories ?? '—'} kcal
                    </span>
                    <span className="w-16 text-right font-bold text-foreground">
                      {comparingFood.caloriesPer100g} kcal
                    </span>
                  </div>
                </div>

                {/* Retail Price */}
                <div className="flex items-center justify-between rounded-lg bg-background/20 p-2.5">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Coins className="h-4 w-4 text-brand-accent" />
                    <span>Package Price</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="w-16 text-right font-bold text-foreground">
                      {data.price !== null ? formatMoney(data.price) : '—'}
                    </span>
                    <span className="w-16 text-right font-bold text-foreground">
                      {formatMoney(comparingFood.price)}
                    </span>
                  </div>
                </div>

                {/* Price per 100 kcal */}
                {(() => {
                  const altTotalCal =
                    (comparingFood.caloriesPer100g * comparingFood.packageSize) / 100
                  const altCost100k =
                    altTotalCal > 0 ? (comparingFood.price / altTotalCal) * 100 : 0

                  return (
                    <div className="flex items-center justify-between rounded-lg bg-brand-sage/10 p-2.5 font-bold">
                      <div className="flex items-center gap-2 text-foreground">
                        <Scale className="h-4 w-4 text-brand-accent" />
                        <span>Cost / 100 kcal</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="w-16 text-right text-foreground">
                          {scannedPricePer100Kcal !== null
                            ? formatMoney(scannedPricePer100Kcal)
                            : '—'}
                        </span>
                        <span className="w-16 text-right text-brand-accent">
                          {formatMoney(altCost100k)}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-foreground/10">
                <button
                  type="button"
                  onClick={() => setComparingFood(null)}
                  className="rounded-xl border border-foreground/20 px-4 py-2 text-xs font-semibold text-foreground hover:bg-background/60 transition"
                >
                  Close
                </button>
                {onSelectAlternative && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAlternative(comparingFood)
                      setComparingFood(null)
                    }}
                    className="rounded-xl bg-brand-sage px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-sage/90 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Adopt This Food</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
