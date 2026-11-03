import { useState, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  SearchX,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import type { FoodItem } from '../types'
import FoodFilterBar, {
  type FilterState,
} from '../components/food-library/FoodFilterBar'
import FoodCard, { calcPricePer100Kcal } from '../components/food-library/FoodCard'
import FoodDetailModal from '../components/food-library/FoodDetailModal'
import FoodCompareModal, {
  FoodCompareBar,
} from '../components/food-library/FoodCompareModal'
import AddCustomFoodModal from '../components/food-library/AddCustomFoodModal'
import QuickLogModal from '../components/food-library/QuickLogModal'

const initialFilters: FilterState = {
  search: '',
  species: 'all',
  category: 'all',
  lifeStage: 'all',
  sortBy: 'featured',
}

export default function FoodLibraryPage() {
  const { getAllFoods, addCustomFood } = useApp()
  const { addToast } = useToast()

  const allFoods = getAllFoods()

  // Filters State
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Modals & Drawers State
  const [selectedFoodForDetails, setSelectedFoodForDetails] = useState<FoodItem | null>(null)
  const [selectedFoodForLog, setSelectedFoodForLog] = useState<FoodItem | null>(null)
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [comparedFoodIds, setComparedFoodIds] = useState<string[]>([])

  // Derived compared items list
  const comparedFoods = useMemo(() => {
    return comparedFoodIds
      .map((id) => allFoods.find((f) => f.id === id))
      .filter((f): f is FoodItem => Boolean(f))
  }, [comparedFoodIds, allFoods])

  // Comparison toggle handler
  const handleToggleCompare = (food: FoodItem) => {
    if (comparedFoodIds.includes(food.id)) {
      setComparedFoodIds(comparedFoodIds.filter((id) => id !== food.id))
      addToast(`Removed "${food.name}" from comparison`, 'info')
    } else {
      if (comparedFoodIds.length >= 3) {
        addToast('You can compare up to 3 products at a time. Remove one first.', 'warning')
        return
      }
      setComparedFoodIds([...comparedFoodIds, food.id])
      addToast(`Added "${food.name}" to comparison!`, 'info')
    }
  }

  const handleRemoveFromCompare = (foodId: string) => {
    setComparedFoodIds((prev) => prev.filter((id) => id !== foodId))
  }

  const handleClearCompare = () => {
    setComparedFoodIds([])
    addToast('Comparison cleared', 'info')
  }

  // Filter & Sort Logic
  const filteredAndSortedFoods = useMemo(() => {
    const query = filters.search.trim().toLowerCase()

    const filtered = allFoods.filter((food) => {
      // 1. Search query (matches name, brand, category)
      if (query) {
        const matchName = food.name.toLowerCase().includes(query)
        const matchBrand = food.brand.toLowerCase().includes(query)
        const matchCategory = food.category.toLowerCase().includes(query)
        if (!matchName && !matchBrand && !matchCategory) {
          return false
        }
      }

      // 2. Species filter
      if (filters.species !== 'all') {
        if (!food.species.includes(filters.species)) {
          return false
        }
      }

      // 3. Category filter
      if (filters.category !== 'all') {
        if (food.category !== filters.category) {
          return false
        }
      }

      // 4. Life stage filter
      if (filters.lifeStage !== 'all') {
        if (!food.lifeStageSuitability.includes(filters.lifeStage)) {
          return false
        }
      }

      return true
    })

    // Sort foods
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'cal-asc':
          return a.caloriesPer100g - b.caloriesPer100g
        case 'cal-desc':
          return b.caloriesPer100g - a.caloriesPer100g
        case 'protein-desc':
          return b.protein - a.protein
        case 'price-asc':
          return a.price - b.price
        case 'value-asc': {
          const valA = calcPricePer100Kcal(a.price, a.packageSize, a.caloriesPer100g) ?? Infinity
          const valB = calcPricePer100Kcal(b.price, b.packageSize, b.caloriesPer100g) ?? Infinity
          return valA - valB
        }
        case 'featured':
        default:
          return 0
      }
    })
  }, [allFoods, filters])

  return (
    <div className="min-h-screen bg-brand-cream/60 py-10 sm:py-14 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sage/10 text-brand-sage text-sm font-bold mb-3">
              <BookOpen className="size-4" />
              <span>Pet Food Directory & Nutritional Index</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tight font-display">
              Pet Food Library
            </h1>
            <p className="text-stone-600 text-base sm:text-lg mt-2 max-w-3xl leading-relaxed">
              Explore, compare, and check nutritional details of popular pet foods in the Philippines.
              Find the healthiest options and the best value for your budget!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddFoodOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-sage hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Custom Food</span>
            </button>
          </div>
        </div>

        {/* Informative Value Metric Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-brand-dark block sm:inline mr-1">
                Pinoy Tip: Watch the "Price per 100 kcal"
              </span>
              <span>
                Don't just check the bag price! Comparing price per 100 kcal tells you which food provides the most energy per peso.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{allFoods.length} Verified & Custom items</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <FoodFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters(initialFilters)}
          totalCount={allFoods.length}
          filteredCount={filteredAndSortedFoods.length}
        />

        {/* Food Grid / Empty State */}
        {filteredAndSortedFoods.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-1">Walang nahanap na pagkain</h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              We couldn't find any pet food matching your current search and filters. Try adjusting your search term or clearing the filters.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setFilters(initialFilters)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-sage text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </button>
              <button
                type="button"
                onClick={() => setIsAddFoodOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-brand-dark text-xs sm:text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 text-stone-500" />
                Add as Custom Food
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pb-20">
            {filteredAndSortedFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                isCompared={comparedFoodIds.includes(food.id)}
                onToggleCompare={handleToggleCompare}
                onViewDetails={setSelectedFoodForDetails}
                onLogMeal={setSelectedFoodForLog}
              />
            ))}
          </div>
        )}

        {/* Floating Comparison Bar (when items selected) */}
        <FoodCompareBar
          comparedFoods={comparedFoods}
          onOpenCompare={() => setIsCompareModalOpen(true)}
          onRemove={handleRemoveFromCompare}
          onClear={handleClearCompare}
        />

        {/* Product Detail Modal */}
        <FoodDetailModal
          food={selectedFoodForDetails}
          isOpen={selectedFoodForDetails !== null}
          isCompared={
            selectedFoodForDetails
              ? comparedFoodIds.includes(selectedFoodForDetails.id)
              : false
          }
          onClose={() => setSelectedFoodForDetails(null)}
          onToggleCompare={handleToggleCompare}
          onLogMeal={setSelectedFoodForLog}
        />

        {/* Side-by-Side Comparison Modal */}
        <FoodCompareModal
          isOpen={isCompareModalOpen}
          comparedFoods={comparedFoods}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={handleRemoveFromCompare}
          onClearAll={handleClearCompare}
          onLogMeal={setSelectedFoodForLog}
        />

        {/* Add Custom Food Modal */}
        <AddCustomFoodModal
          isOpen={isAddFoodOpen}
          onClose={() => setIsAddFoodOpen(false)}
          onAddFood={addCustomFood}
        />

        {/* Quick Log Meal Modal */}
        <QuickLogModal
          food={selectedFoodForLog}
          isOpen={selectedFoodForLog !== null}
          onClose={() => setSelectedFoodForLog(null)}
        />
      </div>
    </div>
  )
}
