import {
  Search,
  X,
  SlidersHorizontal,
  Dog,
  Cat,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react'
import type { Species, FoodCategory, LifeStage } from '../../types'

export type SortOption =
  | 'featured'
  | 'name-asc'
  | 'name-desc'
  | 'cal-asc'
  | 'cal-desc'
  | 'protein-desc'
  | 'price-asc'
  | 'value-asc'

export type FilterState = {
  search: string
  species: 'all' | Species
  category: 'all' | FoodCategory
  lifeStage: 'all' | LifeStage
  sortBy: SortOption
}

interface FoodFilterBarProps {
  filters: FilterState
  onFilterChange: (newFilters: FilterState) => void
  onReset: () => void
  totalCount: number
  filteredCount: number
}

export default function FoodFilterBar({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
}: FoodFilterBarProps) {
  const isFiltered =
    filters.search !== '' ||
    filters.species !== 'all' ||
    filters.category !== 'all' ||
    filters.lifeStage !== 'all' ||
    filters.sortBy !== 'featured'

  const speciesOptions: Array<{ id: 'all' | Species; label: string; icon?: typeof Dog }> = [
    { id: 'all', label: 'All Pets' },
    { id: 'dog', label: 'Dogs', icon: Dog },
    { id: 'cat', label: 'Cats', icon: Cat },
  ]

  const categoryOptions: Array<{ id: 'all' | FoodCategory; label: string }> = [
    { id: 'all', label: 'All Types' },
    { id: 'dry', label: 'Dry Kibble' },
    { id: 'wet', label: 'Wet Food' },
    { id: 'treat', label: 'Treats' },
    { id: 'homemade', label: 'Homemade' },
  ]

  const lifeStageOptions: Array<{ id: 'all' | LifeStage; label: string }> = [
    { id: 'all', label: 'All Stages' },
    { id: 'puppy', label: 'Puppy' },
    { id: 'kitten', label: 'Kitten' },
    { id: 'adult', label: 'Adult' },
    { id: 'senior', label: 'Senior' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/70 p-4 sm:p-6 mb-8 transition-all">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-4 border-b border-stone-100">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by product name, brand, or ingredients..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage/40 focus:border-brand-sage text-brand-dark placeholder-stone-400 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              aria-label="Clear search text"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto min-w-[210px]">
          <ArrowUpDown className="w-4 h-4 text-stone-400 hidden sm:block shrink-0" />
          <div className="relative w-full">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({ ...filters, sortBy: e.target.value as SortOption })
              }
              aria-label="Sort pet foods"
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-sage/40 focus:border-brand-sage cursor-pointer"
            >
              <option value="featured">Featured (Default)</option>
              <option value="value-asc">Best Value (₱ / 100 kcal)</option>
              <option value="protein-desc">Highest Protein</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="cal-asc">Calories: Low to High</option>
              <option value="cal-desc">Calories: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Rows */}
      <div className="pt-4 space-y-3.5">
        {/* Species filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider w-16 shrink-0">
            Species:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {speciesOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = filters.species === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, species: opt.id })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-sage text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider w-16 shrink-0">
            Type:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {categoryOptions.map((opt) => {
              const isSelected = filters.category === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, category: opt.id })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Life Stage filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider w-16 shrink-0">
            Life Stage:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {lifeStageOptions.map((opt) => {
              const isSelected = filters.lifeStage === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, lifeStage: opt.id })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Status Bar: counts and clear button */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
          <span>
            Showing <strong className="text-brand-dark font-semibold">{filteredCount}</strong> of{' '}
            {totalCount} products
          </span>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-alert hover:text-brand-alert/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  )
}
