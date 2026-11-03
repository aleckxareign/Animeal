import { useState, useMemo } from 'react'
import {
  X,
  Search,
  Check,
  AlertTriangle,
  Utensils,
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { Pet, PortionUnit, FoodCategory, FoodItem } from '../../types'

type FeedModalProps = {
  isOpen: boolean
  pet: Pet
  onClose: () => void
}

const UNITS: { value: PortionUnit; label: string; desc: string }[] = [
  { value: 'g', label: 'Grams (g)', desc: 'Direct weight' },
  { value: 'scoop', label: 'Scoop', desc: '~30g per scoop' },
  { value: 'can', label: 'Can', desc: 'Full can / pouch' },
  { value: 'cup', label: 'Cup', desc: '~120g kibble' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)', desc: '~15g' },
  { value: 'piece', label: 'Piece / Treat', desc: '~10g snack' },
]

const CATEGORIES: { value: 'all' | FoodCategory; label: string }[] = [
  { value: 'all', label: 'All Foods' },
  { value: 'dry', label: 'Dry Kibble' },
  { value: 'wet', label: 'Wet / Canned' },
  { value: 'treat', label: 'Treats' },
  { value: 'raw', label: 'Raw / Fresh' },
  { value: 'homemade', label: 'Homemade' },
]

export default function FeedModal({ isOpen, pet, onClose }: FeedModalProps) {
  const { getAllFoods, household, logFeeding, getTodayCalories } = useApp()
  const { addToast } = useToast()

  const allFoods = useMemo(() => getAllFoods(), [getAllFoods])

  // Form states
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | FoodCategory>('all')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [portion, setPortion] = useState<string>('50')
  const [unit, setUnit] = useState<PortionUnit>('g')
  const [fedBy, setFedBy] = useState<string>(household[0]?.name || 'Me')

  if (!isOpen) return null

  // Filter foods
  const filteredFoods = allFoods.filter((item) => {
    // Check species match
    const matchesSpecies = item.species.includes(pet.species)
    // Check category match
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory
    // Check search query
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSpecies && matchesCategory && matchesSearch
  })

  // Calculate live portion grams & calories
  const numericPortion = Math.max(0, parseFloat(portion) || 0)
  let portionGrams = numericPortion
  if (unit === 'scoop') portionGrams = numericPortion * 30
  else if (unit === 'can') portionGrams = numericPortion * (selectedFood?.servingSize || 100)
  else if (unit === 'cup') portionGrams = numericPortion * 120
  else if (unit === 'tbsp') portionGrams = numericPortion * 15
  else if (unit === 'piece') portionGrams = numericPortion * 10

  const mealCalories = selectedFood
    ? Math.round((selectedFood.caloriesPer100g * portionGrams) / 100)
    : 0
  const mealProtein = selectedFood
    ? Math.round((selectedFood.protein * portionGrams) / 100)
    : 0
  const mealFat = selectedFood
    ? Math.round((selectedFood.fat * portionGrams) / 100)
    : 0
  const mealFiber = selectedFood
    ? Math.round((selectedFood.fiber * portionGrams) / 100)
    : 0

  const currentCalories = getTodayCalories(pet.id)
  const targetCalories = pet.dailyCalorieTarget || 500
  const projectedCalories = currentCalories + mealCalories
  const willExceed = projectedCalories > targetCalories
  const excessAmount = projectedCalories - targetCalories

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food)
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFood || numericPortion <= 0) return

    logFeeding({
      petId: pet.id,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      portion: numericPortion,
      unit,
      calories: mealCalories,
      protein: mealProtein,
      fat: mealFat,
      fiber: mealFiber,
      fedBy: fedBy.trim() || 'Me',
    })

    addToast(
      `Fed ${pet.name} ${numericPortion} ${unit} of ${selectedFood.name}! 🍲`,
      'success',
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-brand-dark/10 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-dark p-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cream/80 mb-1">
            <Utensils className="h-4 w-4 text-brand-sage" />
            <span>Feed Tracker • Sino Nagpakain?</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Log Meal for {pet.name} {pet.avatarEmoji}
          </h2>
          <p className="mt-1 text-xs text-brand-cream/80">
            Select food, set portion size, and log who prepared it.
          </p>

          {/* Stepper tabs */}
          <div className="mt-4 flex items-center gap-2">
            {[
              { num: 1, label: 'Select Food' },
              { num: 2, label: 'Portion Size' },
              { num: 3, label: 'Who Fed?' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num === 1 || selectedFood) setStep(s.num as 1 | 2 | 3)
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  step === s.num
                    ? 'bg-brand-sage text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP 1: Select Food */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-brand-dark/40" />
                <input
                  type="text"
                  placeholder="Search pet food brand or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 pl-10 pr-4 py-2.5 text-sm text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedCategory === cat.value
                        ? 'bg-brand-sage text-white'
                        : 'bg-brand-cream text-brand-dark/70 hover:bg-brand-dark/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Food List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredFoods.length === 0 ? (
                  <div className="py-8 text-center text-brand-dark/60">
                    <p className="text-sm">No foods match your search for {pet.species}.</p>
                    <p className="text-xs mt-1">Try another keyword or view all categories.</p>
                  </div>
                ) : (
                  filteredFoods.map((food) => {
                    const isSelected = selectedFood?.id === food.id
                    return (
                      <div
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-brand-sage bg-brand-sage/10 ring-2 ring-brand-sage/30'
                            : 'border-brand-dark/10 hover:border-brand-dark/30 hover:bg-brand-cream/30'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sage">
                              {food.brand}
                            </span>
                            <span className="rounded-sm bg-brand-cream px-1.5 py-0.2 text-[9px] font-semibold text-brand-dark/60 uppercase">
                              {food.category}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-brand-dark truncate">
                            {food.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-brand-dark/60">
                            <span>{food.caloriesPer100g} kcal/100g</span>
                            <span>•</span>
                            <span>P: {food.protein}%</span>
                            <span>•</span>
                            <span>F: {food.fat}%</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <ChevronRight className="h-5 w-5 text-brand-dark/40" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Portion Input & Calorie Preview */}
          {step === 2 && selectedFood && (
            <div className="space-y-5 animate-slide-up">
              {/* Selected food summary badge */}
              <div className="flex items-center justify-between rounded-xl bg-brand-cream/60 border border-brand-dark/10 p-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sage">
                    {selectedFood.brand}
                  </span>
                  <p className="font-bold text-sm text-brand-dark">
                    {selectedFood.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-brand-sage hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Portion number & unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                    Portion Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-4 py-3 text-lg font-bold text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as PortionUnit)}
                    className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-3 py-3 text-sm font-semibold text-brand-dark focus:border-brand-sage focus:outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label} ({u.desc})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time calculated nutrition card */}
              <div className="rounded-2xl border border-brand-sage/30 bg-brand-cream/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70">
                    Calculated Nutrition
                  </span>
                  <span className="text-xs text-brand-dark/60 font-medium">
                    ~{Math.round(portionGrams)}g portion weight
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-white p-2 border border-brand-dark/10">
                    <span className="text-[10px] uppercase font-bold text-brand-dark/60">
                      Calories
                    </span>
                    <p className="font-extrabold text-base text-brand-sage">
                      {mealCalories}
                    </p>
                    <span className="text-[9px] text-brand-dark/50">kcal</span>
                  </div>

                  <div className="rounded-xl bg-white p-2 border border-brand-dark/10">
                    <span className="text-[10px] uppercase font-bold text-brand-dark/60">
                      Protein
                    </span>
                    <p className="font-bold text-base text-brand-dark">
                      {mealProtein}g
                    </p>
                    <span className="text-[9px] text-brand-dark/50">{selectedFood.protein}%</span>
                  </div>

                  <div className="rounded-xl bg-white p-2 border border-brand-dark/10">
                    <span className="text-[10px] uppercase font-bold text-brand-dark/60">
                      Fat
                    </span>
                    <p className="font-bold text-base text-brand-dark">{mealFat}g</p>
                    <span className="text-[9px] text-brand-dark/50">{selectedFood.fat}%</span>
                  </div>

                  <div className="rounded-xl bg-white p-2 border border-brand-dark/10">
                    <span className="text-[10px] uppercase font-bold text-brand-dark/60">
                      Fiber
                    </span>
                    <p className="font-bold text-base text-brand-dark">{mealFiber}g</p>
                    <span className="text-[9px] text-brand-dark/50">{selectedFood.fiber}%</span>
                  </div>
                </div>

                {/* Over target warning */}
                {willExceed && (
                  <div className="flex items-center gap-2 rounded-xl bg-brand-alert/10 p-3 text-xs font-semibold text-brand-alert">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Sobrang busog warning: This meal (+{mealCalories} kcal) will put {pet.name} {excessAmount} kcal over their daily target ({targetCalories} kcal).
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: "Sino nagpakain?" (Who fed?) */}
          {step === 3 && selectedFood && (
            <div className="space-y-5 animate-slide-up">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
                  Sino nagpakain? (Who fed {pet.name}?)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {household.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setFedBy(member.name)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-sm font-semibold transition ${
                        fedBy === member.name
                          ? 'border-brand-sage bg-brand-sage/10 text-brand-sage ring-2 ring-brand-sage/30'
                          : 'border-brand-dark/15 bg-white text-brand-dark/80 hover:bg-brand-cream'
                      }`}
                    >
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: member.color || '#44632f' }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{member.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom person entry */}
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Or enter someone else's name (e.g., Kuya, Ate, Sitter)..."
                    value={fedBy}
                    onChange={(e) => setFedBy(e.target.value)}
                    className="w-full rounded-xl border border-brand-dark/20 bg-brand-cream/30 px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                  />
                </div>
              </div>

              {/* Complete Meal Review Summary */}
              <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/30 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60">
                  Ready to Log Meal
                </span>
                <div className="flex justify-between items-baseline">
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark">
                      {portion} {unit} of {selectedFood.name}
                    </h4>
                    <p className="text-xs text-brand-dark/60">
                      Fed by <strong className="text-brand-dark">{fedBy || 'Me'}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xl font-bold text-brand-sage">
                      +{mealCalories}
                    </span>
                    <span className="text-xs text-brand-dark/50 ml-1">kcal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between border-t border-brand-dark/10 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="rounded-xl border border-brand-dark/20 px-4 py-2 text-xs font-semibold text-brand-dark hover:bg-brand-cream"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                type="button"
                disabled={!selectedFood}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-dark px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark/90 disabled:opacity-40"
              >
                Next: Portion Size
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-dark px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark/90"
              >
                Next: Who Fed?
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-sage px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-sage/90"
              >
                <Check className="h-4 w-4" />
                Confirm & Log Meal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
