import { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Sparkles,
  Dog,
  Cat,
  Flame,
} from 'lucide-react'
import type { FoodItem, Species, FoodCategory, LifeStage } from '../../types'
import { useToast } from '../../context/ToastContext'

interface AddCustomFoodModalProps {
  isOpen: boolean
  onClose: () => void
  onAddFood: (food: Omit<FoodItem, 'id' | 'verified' | 'isCustom'>) => void
}

export default function AddCustomFoodModal({
  isOpen,
  onClose,
  onAddFood,
}: AddCustomFoodModalProps) {
  const { addToast } = useToast()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [species, setSpecies] = useState<Species[]>(['dog'])
  const [category, setCategory] = useState<FoodCategory>('dry')
  const [lifeStages, setLifeStages] = useState<LifeStage[]>(['adult'])

  const [caloriesPer100g, setCaloriesPer100g] = useState<string>('350')
  const [protein, setProtein] = useState<string>('24')
  const [fat, setFat] = useState<string>('12')
  const [fiber, setFiber] = useState<string>('4')
  const [moisture, setMoisture] = useState<string>('10')

  const [packageSize, setPackageSize] = useState<string>('1000')
  const [price, setPrice] = useState<string>('250')
  const [servingSize, setServingSize] = useState<string>('150')
  const [servingUnit, setServingUnit] = useState<string>('g/day')

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Escape key handler
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

  const toggleSpecies = (s: Species) => {
    if (species.includes(s)) {
      if (species.length > 1) {
        setSpecies(species.filter((item) => item !== s))
      }
    } else {
      setSpecies([...species, s])
    }
  }

  const toggleLifeStage = (st: LifeStage) => {
    if (lifeStages.includes(st)) {
      if (lifeStages.length > 1) {
        setLifeStages(lifeStages.filter((item) => item !== st))
      }
    } else {
      setLifeStages([...lifeStages, st])
    }
  }

  // Quick auto-estimate calories from macros if requested
  const handleEstimateCalories = () => {
    // 4 kcal per g protein, 9 kcal per g fat, ~4 kcal per g carb (remainder)
    const p = parseFloat(protein) || 0
    const f = parseFloat(fat) || 0
    const fib = parseFloat(fiber) || 0
    const m = parseFloat(moisture) || 0
    const ash = 7
    const carbs = Math.max(0, 100 - (p + f + fib + m + ash))
    const estimated = Math.round(p * 3.5 + f * 8.5 + carbs * 3.5)
    setCaloriesPer100g(estimated > 0 ? estimated.toString() : '350')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Food name is required'
    if (!brand.trim()) newErrors.brand = 'Brand or maker is required'
    if (species.length === 0) newErrors.species = 'Select at least one species'

    const cal = parseFloat(caloriesPer100g)
    if (isNaN(cal) || cal <= 0) newErrors.calories = 'Valid calorie count is required'

    const pkg = parseFloat(packageSize)
    if (isNaN(pkg) || pkg <= 0) newErrors.packageSize = 'Valid package weight is required'

    const prc = parseFloat(price)
    if (isNaN(prc) || prc < 0) newErrors.price = 'Valid price is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const newFood: Omit<FoodItem, 'id' | 'verified' | 'isCustom'> = {
      name: name.trim(),
      brand: brand.trim(),
      species,
      category,
      lifeStageSuitability: lifeStages,
      caloriesPer100g: Math.round(cal),
      protein: Math.max(0, parseFloat(protein) || 0),
      fat: Math.max(0, parseFloat(fat) || 0),
      fiber: Math.max(0, parseFloat(fiber) || 0),
      moisture: Math.max(0, parseFloat(moisture) || 0),
      servingSize: Math.max(1, parseFloat(servingSize) || 100),
      servingUnit: servingUnit.trim() || 'g/day',
      packageSize: pkg,
      price: prc,
    }

    onAddFood(newFood)
    addToast(`"${newFood.name}" added to your custom food library!`, 'success')

    // Reset form
    setName('')
    setBrand('')
    setErrors({})
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
      <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden z-10 animate-scale-in my-0 max-h-[min(92vh,calc(100dvh-2rem))] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border flex items-center justify-between gap-4 bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Add Custom Food
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add homemade recipes, vet formulas, or unlisted pet foods
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-muted-foreground p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 custom-scrollbar p-5 sm:p-6 space-y-5">
          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Food Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                placeholder="e.g. Boiled Chicken Breast with Carrots"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-brand-alert ring-1 ring-brand-alert'
                    : 'border-border focus:ring-brand-sage focus:border-brand-sage'
                }`}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Brand / Made By <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value)
                  if (errors.brand) setErrors({ ...errors, brand: '' })
                }}
                placeholder="e.g. Homemade, Special Diet, Aozi"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 transition-all ${
                  errors.brand
                    ? 'border-brand-alert ring-1 ring-brand-alert'
                    : 'border-border focus:ring-brand-sage focus:border-brand-sage'
                }`}
              />
              {errors.brand && <p className="text-xs text-destructive mt-1">{errors.brand}</p>}
            </div>
          </div>

          {/* Species & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Species Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Target Species <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleSpecies('dog')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    species.includes('dog')
                      ? 'bg-amber-100/80 dark:bg-amber-500/15 border-amber-300 dark:border-amber-400/30 text-amber-900 dark:text-amber-300 shadow-xs'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Dog className="w-4 h-4" />
                  Dogs
                </button>
                <button
                  type="button"
                  onClick={() => toggleSpecies('cat')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    species.includes('cat')
                      ? 'bg-indigo-100/80 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-400/30 text-indigo-900 dark:text-indigo-300 shadow-xs'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Cat className="w-4 h-4" />
                  Cats
                </button>
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Food Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-sage"
              >
                <option value="dry">Dry Kibble</option>
                <option value="wet">Wet / Canned</option>
                <option value="treat">Treat</option>
                <option value="homemade">Homemade</option>
                <option value="raw">Raw / Fresh</option>
              </select>
            </div>
          </div>

          {/* Life Stages */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Suitable Life Stages
            </label>
            <div className="flex flex-wrap gap-2">
              {(['puppy', 'kitten', 'adult', 'senior'] as LifeStage[]).map((stage) => {
                const active = lifeStages.includes(stage)
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => toggleLifeStage(stage)}
                    className={`capitalize px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-brand-sage text-white border-brand-sage shadow-xs'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {stage}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nutritional Breakdown (Guaranteed Analysis) */}
          <div className="p-4 bg-background rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Nutritional Values (per 100g)
              </span>
              <button
                type="button"
                onClick={handleEstimateCalories}
                className="text-[11px] font-semibold text-brand-accent hover:text-foreground underline flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5" />
                Auto-estimate kcal from macros
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Calories */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Calories (kcal) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="900"
                  required
                  value={caloriesPer100g}
                  onChange={(e) => setCaloriesPer100g(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border text-sm bg-card font-bold text-foreground text-center"
                />
              </div>

              {/* Protein */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Protein %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border text-sm bg-card text-center font-medium"
                />
              </div>

              {/* Fat */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border text-sm bg-card text-center font-medium"
                />
              </div>

              {/* Fiber */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Fiber %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border text-sm bg-card text-center font-medium"
                />
              </div>

              {/* Moisture */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Moisture %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border text-sm bg-card text-center font-medium"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Packaging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Package / Batch Weight (g) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={packageSize}
                  onChange={(e) => setPackageSize(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-sage pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  grams
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Total Price (PHP ₱) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  ₱
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-sage font-medium"
                />
              </div>
            </div>
          </div>

          {/* Serving Guideline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Standard Portion Size
              </label>
              <input
                type="number"
                min="1"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Portion Unit / Note
              </label>
              <input
                type="text"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                placeholder="e.g. g/day for 10kg dog"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-sage"
              />
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-sage hover:bg-emerald-700 text-white shadow-sm transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Save Custom Food
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
