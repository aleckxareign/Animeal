import { Utensils, Info, PieChart, Sparkles } from 'lucide-react'
import type { FeedingEntry } from '../../types'

type PlateVisualizationProps = {
  feedings: FeedingEntry[]
  petName: string
  onOpenFeedModal?: () => void
}

export default function PlateVisualization({
  feedings,
  petName,
  onOpenFeedModal,
}: PlateVisualizationProps) {
  // Aggregate macro grams
  const proteinG = feedings.reduce((acc, f) => acc + (f.protein || 0), 0)
  const fatG = feedings.reduce((acc, f) => acc + (f.fat || 0), 0)
  const fiberG = feedings.reduce((acc, f) => acc + (f.fiber || 0), 0)
  const totalCalories = feedings.reduce((acc, f) => acc + (f.calories || 0), 0)

  // Estimate Carbohydrates / Other NFE grams from calories:
  // Carbs (g) ≈ Max(0, (Calories - (Protein * 4 + Fat * 9)) / 4)
  const estimatedCarbsG = Math.max(
    0,
    Math.round((totalCalories - (proteinG * 4 + fatG * 9)) / 4),
  )

  const totalMacroG = proteinG + fatG + fiberG + estimatedCarbsG

  // Empty state if no meals logged
  if (feedings.length === 0 || totalMacroG === 0) {
    return (
      <div className="rounded-3xl bg-card border border-foreground/10 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-brand-accent" />
            <h3 className="font-display text-xl font-bold text-foreground">
              Nutrition Plate Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold text-foreground/50">Today</span>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-background/80 flex items-center justify-center text-4xl mb-4 shadow-inner">
            🥣
          </div>
          <h4 className="font-display text-lg font-bold text-foreground">
            No meals logged yet today!
          </h4>
          <p className="mt-1.5 max-w-sm text-sm text-foreground/60">
            Feed {petName} to visualize their protein, fat, fiber, and carbohydrates balance on the plate.
          </p>
          {onOpenFeedModal && (
            <button
              onClick={onOpenFeedModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-sage px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-sage/90 transition"
            >
              <Sparkles className="h-4 w-4" />
              Log {petName}'s First Meal
            </button>
          )}
        </div>

        <p className="mt-4 text-[11px] text-center text-foreground/50 italic">
          Plate ratios are visual estimates from logged food data, not veterinary guarantees.
        </p>
      </div>
    )
  }

  // Calculate percentages
  const proteinPct = Math.round((proteinG / totalMacroG) * 100)
  const fatPct = Math.round((fatG / totalMacroG) * 100)
  const fiberPct = Math.round((fiberG / totalMacroG) * 100)
  const carbsPct = Math.max(0, 100 - (proteinPct + fatPct + fiberPct))

  // Donut SVG circumference calculation
  const radius = 68
  const circumference = 2 * Math.PI * radius // ≈ 427.26

  const segments = [
    {
      label: 'Protein',
      grams: proteinG,
      pct: proteinPct,
      color: '#44632f', // brand-sage
      bgBadge: 'bg-brand-sage/10 text-brand-accent',
      description: 'Muscle building & tissue repair',
    },
    {
      label: 'Fat',
      grams: fatG,
      pct: fatPct,
      color: '#b5432f', // brand-alert
      bgBadge: 'bg-brand-alert/10 text-destructive',
      description: 'Concentrated energy & cell health',
    },
    {
      label: 'Fiber',
      grams: fiberG,
      pct: fiberPct,
      color: '#8b6914', // warm brown
      bgBadge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
      description: 'Healthy digestion & microbiome',
    },
    {
      label: 'Other / Carbs',
      grams: estimatedCarbsG,
      pct: carbsPct,
      color: '#164040', // brand-dark
      bgBadge: 'bg-foreground/10 text-foreground',
      description: 'Digestible carbohydrates & minerals',
    },
  ]

  let accumulatedPct = 0

  return (
    <div className="rounded-3xl bg-card border border-foreground/10 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-brand-accent" />
            <h3 className="font-display text-xl font-bold text-foreground">
              Nutrition Plate Breakdown
            </h3>
          </div>
          <p className="text-xs text-foreground/60 mt-0.5">
            Macronutrient balance from {feedings.length} meal{feedings.length > 1 ? 's' : ''} logged today
          </p>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
          {totalMacroG}g total nutrients
        </span>
      </div>

      {/* Main Content: SVG Donut + Legends */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative h-56 w-56 flex items-center justify-center">
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 180 180"
              aria-label="Nutrition plate donut chart"
            >
              {/* Background circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-muted"
                strokeWidth="24"
                fill="none"
              />

              {/* Segment circles */}
              {segments.map((seg, idx) => {
                const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`
                const strokeDashoffset = -((accumulatedPct / 100) * circumference)
                accumulatedPct += seg.pct

                if (seg.pct <= 0) return null

                return (
                  <circle
                    key={idx}
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={seg.color}
                    strokeWidth="24"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                )
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <Utensils className="h-5 w-5 text-foreground/40 mb-0.5" />
              <span className="font-display text-2xl font-black text-foreground leading-none">
                {totalCalories}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                kcal today
              </span>
            </div>
          </div>

          {/* Stacked Horizontal Bar below donut */}
          <div className="w-full mt-4 flex h-3 overflow-hidden rounded-full bg-background">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.pct}%`}
                className="transition-all duration-500"
              />
            ))}
          </div>
        </div>

        {/* Breakdown Legend Cards */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="rounded-2xl border border-foreground/10 bg-background/20 p-3.5 transition hover:bg-background/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs font-bold text-foreground">
                    {seg.label}
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${seg.bgBadge}`}>
                  {seg.pct}%
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-foreground">
                  {seg.grams}g
                </span>
                <span className="text-[11px] text-foreground/60 font-medium">
                  {seg.label === 'Fat' ? seg.grams * 9 : seg.grams * 4} kcal
                </span>
              </div>

              <p className="mt-1 text-[10px] text-foreground/60 line-clamp-1">
                {seg.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="flex items-center gap-2 rounded-xl bg-background/50 px-4 py-2.5 text-xs text-foreground/70">
        <Info className="h-4 w-4 shrink-0 text-foreground/50" />
        <p className="italic">
          Plate ratios are visual estimates from logged food data, not veterinary guarantees. Consult your vet for medical dietary formulations.
        </p>
      </div>
    </div>
  )
}
