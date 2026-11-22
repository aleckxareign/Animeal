import {
  CheckCircle2,
  Sparkles,
  Dog,
  Cat,
  Utensils,
  Eye,
  Plus,
  Check,
  Flame,
} from 'lucide-react'
import type { FoodItem } from '../../types'
import { formatMoney } from '../../utils/formatters'

export function calcPricePer100Kcal(
  price: number,
  packageSizeG: number,
  caloriesPer100g: number,
): number | null {
  if (price <= 0 || packageSizeG <= 0 || caloriesPer100g <= 0) return null
  const totalCalories = (caloriesPer100g * packageSizeG) / 100
  if (totalCalories <= 0) return null
  return (price / totalCalories) * 100
}

interface FoodCardProps {
  food: FoodItem
  isCompared: boolean
  onToggleCompare: (food: FoodItem) => void
  onViewDetails: (food: FoodItem) => void
  onLogMeal: (food: FoodItem) => void
}

export default function FoodCard({
  food,
  isCompared,
  onToggleCompare,
  onViewDetails,
  onLogMeal,
}: FoodCardProps) {
  const pricePer100Kcal = calcPricePer100Kcal(
    food.price,
    food.packageSize,
    food.caloriesPer100g,
  )

  // Format package weight nicely: 1500g -> "1.5 kg", 400g -> "400g"
  const formattedWeight =
    food.packageSize >= 1000
      ? `${(food.packageSize / 1000).toFixed(food.packageSize % 1000 === 0 ? 0 : 1)} kg`
      : `${food.packageSize}g`

  // Macronutrient sum for mini distribution bar
  const macroTotal = Math.max(
    1,
    food.protein + food.fat + food.fiber + food.moisture,
  )
  const proteinPct = Math.round((food.protein / macroTotal) * 100)
  const fatPct = Math.round((food.fat / macroTotal) * 100)
  const fiberPct = Math.round((food.fiber / macroTotal) * 100)
  const moisturePct = Math.max(
    0,
    100 - (proteinPct + fatPct + fiberPct),
  )

  const isDog = food.species.includes('dog')
  const isCat = food.species.includes('cat')

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border flex flex-col overflow-hidden ${
        isCompared
          ? 'border-brand-sage ring-2 ring-brand-sage/20 bg-emerald-50/20'
          : 'border-stone-200/80 hover:border-brand-sage/40'
      }`}
    >
      {/* Top Banner / Tags */}
      <div className="p-4 sm:p-5 pb-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 tracking-wide">
              {food.brand}
            </span>
            {food.verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            ) : food.isCustom ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Custom
              </span>
            ) : null}
          </div>

          {/* Species Badge */}
          <div className="flex items-center gap-1">
            {isDog && (
              <span
                title="Suitable for Dogs"
                className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50"
              >
                <Dog className="w-3.5 h-3.5" />
              </span>
            )}
            {isCat && (
              <span
                title="Suitable for Cats"
                className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/50"
              >
                <Cat className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onViewDetails(food)}
          className="font-bold text-brand-dark text-base sm:text-lg leading-snug line-clamp-2 hover:text-brand-sage cursor-pointer transition-colors"
          title={food.name}
        >
          {food.name}
        </h3>

        {/* Category & Life Stage Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3">
          <span className="text-[11px] font-medium uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
            {food.category}
          </span>
          {food.lifeStageSuitability.map((stage) => (
            <span
              key={stage}
              className="text-[11px] font-medium capitalize px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/40"
            >
              {stage}
            </span>
          ))}
        </div>

        {/* Calorie & Budget Highlight Box */}
        <div className="mt-auto bg-stone-50 rounded-xl p-3 border border-stone-200/60 mb-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <Flame className="w-4 h-4 text-orange-500 inline self-center" />
              <span className="text-xl sm:text-2xl font-black text-brand-dark font-display">
                {food.caloriesPer100g}
              </span>
              <span className="text-xs font-semibold text-stone-500">kcal/100g</span>
            </div>

            {/* Price per 100 kcal */}
            {pricePer100Kcal !== null && (
              <div className="text-right">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  {formatMoney(pricePer100Kcal)} / 100 kcal
                </span>
              </div>
            )}
          </div>

          {/* Pricing & Package info */}
          <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold text-brand-dark">
              {formatMoney(food.price)}
            </span>
            <span className="text-stone-500">
              {formattedWeight} ({food.pricePerCalorie ? formatMoney(food.pricePerCalorie * 1000) + '/kg' : Math.round((food.price / food.packageSize) * 1000) > 0 ? `₱${Math.round((food.price / food.packageSize) * 1000)}/kg` : ''})
            </span>
          </div>
        </div>

        {/* Mini Macronutrient Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
            <span className="text-emerald-700 font-semibold">Protein {food.protein}%</span>
            <span className="text-amber-700">Fat {food.fat}%</span>
            <span className="text-stone-600">Fiber {food.fiber}%</span>
            <span className="text-sky-700">Moist {food.moisture}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-100 flex overflow-hidden">
            <div
              style={{ width: `${proteinPct}%` }}
              title={`Protein: ${food.protein}%`}
              className="bg-brand-sage h-full"
            />
            <div
              style={{ width: `${fatPct}%` }}
              title={`Fat: ${food.fat}%`}
              className="bg-amber-500 h-full"
            />
            <div
              style={{ width: `${fiberPct}%` }}
              title={`Fiber: ${food.fiber}%`}
              className="bg-stone-400 h-full"
            />
            <div
              style={{ width: `${moisturePct}%` }}
              title={`Moisture: ${food.moisture}%`}
              className="bg-sky-400 h-full"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-200/70 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(food)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:text-brand-sage transition-colors px-2 py-1.5 rounded-lg hover:bg-stone-200/60"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleCompare(food)}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
              isCompared
                ? 'bg-brand-sage text-white border-brand-sage shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {isCompared ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Comparing</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-stone-500" />
                <span>Compare</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onLogMeal(food)}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-dark hover:bg-brand-sage text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Log Meal</span>
            <span className="xs:hidden">Log</span>
          </button>
        </div>
      </div>
    </div>
  )
}
