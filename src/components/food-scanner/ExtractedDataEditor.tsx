import { useState } from 'react'
import {
  Edit3,
  Check,
  X,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Dna,
  Droplets,
  Wheat,
  Scale,
  Coins,
  ShieldCheck,
} from 'lucide-react'
import type { Species, FoodCategory } from '../../types'
import type { ScannedFoodData } from './ScannerUpload'
import { formatMoney } from '../../utils/formatters'

type ExtractedDataEditorProps = {
  data: ScannedFoodData
  onUpdate: (updated: ScannedFoodData) => void
}

export default function ExtractedDataEditor({
  data,
  onUpdate,
}: ExtractedDataEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ScannedFoodData>(data)

  const handleStartEdit = () => {
    setFormData(data)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setFormData(data)
    setIsEditing(false)
  }

  const handleSave = () => {
    const calories = formData.calories !== null && formData.calories !== undefined ? Number(formData.calories) : null
    const protein = formData.protein !== null && formData.protein !== undefined ? Number(formData.protein) : null
    const fat = formData.fat !== null && formData.fat !== undefined ? Number(formData.fat) : null
    const fiber = formData.fiber !== null && formData.fiber !== undefined ? Number(formData.fiber) : null
    const moisture = formData.moisture !== null && formData.moisture !== undefined ? Number(formData.moisture) : null

    onUpdate({
      ...formData,
      calories,
      caloriesPer100g: calories,
      protein,
      crudeProteinPct: protein,
      fat,
      crudeFatPct: fat,
      fiber,
      crudeFiberPct: fiber,
      moisture,
      moisturePct: moisture,
      packageWeight: formData.packageWeight ? Number(formData.packageWeight) : null,
      price: formData.price !== null ? Number(formData.price) : null,
    })
    setIsEditing(false)
  }

  const confidenceConfig = {
    high: {
      label: 'High Confidence',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-400/30',
      icon: CheckCircle2,
      description: 'Clean optical scan. Guaranteed analysis verified.',
    },
    medium: {
      label: 'Medium Confidence',
      badgeClass: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-400/30',
      icon: AlertTriangle,
      description: 'Values extracted; please review moisture & weight.',
    },
    low: {
      label: 'Low Confidence',
      badgeClass: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-400/30',
      icon: AlertTriangle,
      description: 'Blurry label detected. Manual review recommended.',
    },
  }[data.confidence]

  const ConfidenceIcon = confidenceConfig.icon

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5 sm:p-6 shadow-sm">
      {/* Top Header & Confidence Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-sage/15 p-2 text-brand-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Extracted Label Data
            </h2>
            <p className="text-xs text-foreground/60">
              Guaranteed analysis and packaging details extracted via OCR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${confidenceConfig.badgeClass}`}
            title={confidenceConfig.description}
          >
            <ConfidenceIcon className="h-3.5 w-3.5" />
            <span>{confidenceConfig.label}</span>
          </span>

          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand-sage hover:bg-brand-sage hover:text-white transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-sage px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-sage/90 transition"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 rounded-lg border border-foreground/20 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/70 hover:bg-background/50 transition"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!isEditing ? (
        /* View Mode */
        <div className="mt-5 space-y-5 animate-fade-in">
          {/* Product Title & Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-background/40 p-4 border border-foreground/5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                {data.brand || 'Unbranded'}
              </span>
              <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
                {data.productName || data.product || 'Scanned Pet Food'}
              </h3>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="rounded-lg bg-brand-dark/10 px-2.5 py-1 text-xs font-semibold text-foreground capitalize">
                {data.species === 'dog' ? '🐶 Dog' : '🐱 Cat'}
              </span>
              <span className="rounded-lg bg-brand-sage/10 px-2.5 py-1 text-xs font-semibold text-brand-accent capitalize">
                {data.category} food
              </span>
            </div>
          </div>

          {/* Guaranteed Analysis Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
              <span>Guaranteed Analysis (Min/Max Ratios)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Protein */}
              <div className="rounded-xl border border-foreground/10 bg-card p-3.5 transition hover:border-brand-sage/40">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span className="font-medium">Crude Protein</span>
                  <Dna className="h-4 w-4 text-brand-accent" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    {data.protein ?? data.crudeProteinPct ?? '—'}
                  </span>
                  <span className="text-xs font-bold text-foreground/70">%</span>
                </div>
                <span className="text-[11px] text-foreground/50">min requirement</span>
              </div>

              {/* Fat */}
              <div className="rounded-xl border border-foreground/10 bg-card p-3.5 transition hover:border-brand-sage/40">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span className="font-medium">Crude Fat</span>
                  <Droplets className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    {data.fat ?? data.crudeFatPct ?? '—'}
                  </span>
                  <span className="text-xs font-bold text-foreground/70">%</span>
                </div>
                <span className="text-[11px] text-foreground/50">essential lipids</span>
              </div>

              {/* Fiber */}
              <div className="rounded-xl border border-foreground/10 bg-card p-3.5 transition hover:border-brand-sage/40">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span className="font-medium">Crude Fiber</span>
                  <Wheat className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    {data.fiber ?? data.crudeFiberPct ?? '—'}
                  </span>
                  <span className="text-xs font-bold text-foreground/70">%</span>
                </div>
                <span className="text-[11px] text-foreground/50">digestibility</span>
              </div>

              {/* Moisture */}
              <div className="rounded-xl border border-foreground/10 bg-card p-3.5 transition hover:border-brand-sage/40">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span className="font-medium">Moisture</span>
                  <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    {data.moisture ?? data.moisturePct ?? '—'}
                  </span>
                  <span className="text-xs font-bold text-foreground/70">%</span>
                </div>
                <span className="text-[11px] text-foreground/50">water content</span>
              </div>
            </div>
          </div>

          {/* Secondary stats: Calories & Package / Price */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background/30 p-3.5">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-500/15 p-2 text-orange-600 dark:text-orange-300">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-foreground/60">Energy Density</p>
                <p className="text-sm font-bold text-foreground">
                  {data.calories ?? data.caloriesPer100g ? `${data.calories ?? data.caloriesPer100g} kcal` : 'Estimated ~340 kcal'}{' '}
                  <span className="text-xs font-normal text-foreground/60">/ 100g</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background/30 p-3.5">
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-300">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-foreground/60">Package Net Weight</p>
                <p className="text-sm font-bold text-foreground">
                  {data.packageWeight ? `${data.packageWeight}g (${(data.packageWeight / 1000).toFixed(1)}kg)` : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background/30 p-3.5">
              <div className="rounded-lg bg-brand-sage/15 p-2 text-brand-accent">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-foreground/60">Retail Price (PHP)</p>
                <p className="text-sm font-bold text-foreground">
                  {data.price !== null ? formatMoney(data.price) : '₱0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Form */
        <div className="mt-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Product Title
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Target Pet
              </label>
              <select
                value={formData.species}
                onChange={(e) =>
                  setFormData({ ...formData, species: e.target.value as Species })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              >
                <option value="dog">🐶 Dog</option>
                <option value="cat">🐱 Cat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Food Form
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as FoodCategory,
                  })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage capitalize"
              >
                <option value="dry">Dry Kibble</option>
                <option value="wet">Wet / Canned</option>
                <option value="treat">Treat</option>
                <option value="raw">Raw</option>
                <option value="homemade">Homemade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Calories (kcal/100g)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.calories ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calories: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g. 350"
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Package Net Weight (g)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.packageWeight ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageWeight: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g. 1500"
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>
          </div>

          {/* Guaranteed Analysis Inputs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Crude Protein %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.protein ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    protein: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Crude Fat %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.fat ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fat: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Crude Fiber %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.fiber ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiber: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Moisture %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.moisture ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    moisture: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Price (₱ PHP)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g. 155"
                className="w-full rounded-xl border border-foreground/20 bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-brand-sage focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormData(data)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground/70 hover:bg-background/50 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Scanned</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-sage px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-sage/90 transition"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
