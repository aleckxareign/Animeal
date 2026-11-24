import { Flame, Droplets, Utensils, AlertTriangle, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { Pet } from '../../types'

type CalorieDashboardProps = {
  pet: Pet
  onEditPet: (pet: Pet) => void
  onOpenFeedModal: () => void
}

export default function CalorieDashboard({
  pet,
  onOpenFeedModal,
}: CalorieDashboardProps) {
  const {
    getTodayFeedings,
    getTodayCalories,
    getTodayWater,
    logWater,
  } = useApp()
  const { addToast } = useToast()

  const todayFeedings = getTodayFeedings(pet.id)
  const consumedCalories = getTodayCalories(pet.id)
  const targetCalories = pet.dailyCalorieTarget || 500
  const remainingCalories = targetCalories - consumedCalories
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100))
  const isOverTarget = consumedCalories > targetCalories
  const isNearTarget = !isOverTarget && caloriePercent >= 90

  // Water tracking
  const waterConsumed = getTodayWater(pet.id)
  const waterGoal = pet.waterGoal || Math.round(pet.weight * 50)
  const waterPercent = Math.min(100, Math.round((waterConsumed / waterGoal) * 100))

  // Macros
  const totalProtein = todayFeedings.reduce((sum, f) => sum + f.protein, 0)
  const totalFat = todayFeedings.reduce((sum, f) => sum + f.fat, 0)
  const totalFiber = todayFeedings.reduce((sum, f) => sum + f.fiber, 0)

  const handleQuickWater = (ml: number) => {
    logWater(pet.id, ml)
    addToast(`Logged +${ml}ml water for ${pet.name}! 💧`, 'success')
  }

  // Progress bar color
  let progressColor = 'bg-brand-sage'
  if (isOverTarget) progressColor = 'bg-brand-alert'
  else if (isNearTarget) progressColor = 'bg-amber-500'

  return (
    <div className="rounded-3xl bg-card border border-foreground/10 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Top row: Big numbers & progress */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
              <Flame className="h-3.5 w-3.5 text-destructive" />
              Today's Calorie Budget
            </span>
            {isOverTarget && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-alert/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Over target
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 pt-2">
            <span className="font-display text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {consumedCalories}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground/40">
              / {targetCalories}
            </span>
            <span className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
              kcal
            </span>
          </div>

          <p className="text-sm font-medium text-foreground/70">
            {isOverTarget ? (
              <span className="text-destructive font-bold">
                +{Math.abs(remainingCalories)} kcal over daily target
              </span>
            ) : (
              <span>
                <strong className="text-brand-accent font-bold">
                  {remainingCalories} kcal
                </strong>{' '}
                remaining for today
              </span>
            )}
          </p>
        </div>

        {/* Quick action button right on dashboard header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFeedModal}
            className="flex items-center gap-2 rounded-2xl bg-brand-sage px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-sage/90 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            <span>Napakain ako</span>
          </button>
        </div>
      </div>

      {/* Calorie Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-foreground/60">
          <span>{caloriePercent}% Consumed</span>
          <span>Target: {targetCalories} kcal</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${Math.min(100, (consumedCalories / targetCalories) * 100)}%` }}
          />
        </div>

        {/* Over target alert banner */}
        {isOverTarget && (
          <div className="flex items-center gap-2 rounded-xl bg-brand-alert/10 px-4 py-2.5 text-xs font-semibold text-destructive animate-shake">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Target exceeded by {consumedCalories - targetCalories} kcal! Keep an eye on portion sizes and extra treats for today.
            </span>
          </div>
        )}
      </div>

      {/* Grid of 4 Nutrition & Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
        {/* Meals Logged */}
        <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 transition hover:bg-background/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              Meals
            </span>
            <Utensils className="h-4 w-4 text-foreground/50" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {todayFeedings.length}
            </span>
            <span className="text-xs text-foreground/60">logged today</span>
          </div>
        </div>

        {/* Water Logged */}
        <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 transition hover:bg-background/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              Water
            </span>
            <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {waterConsumed}
            </span>
            <span className="text-xs text-foreground/60">/ {waterGoal} ml ({waterPercent}%)</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <button
              onClick={() => handleQuickWater(50)}
              className="rounded-lg bg-cyan-100/80 dark:bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-800 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900"
            >
              +50ml
            </button>
            <button
              onClick={() => handleQuickWater(100)}
              className="rounded-lg bg-cyan-100/80 dark:bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-800 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900"
            >
              +100ml
            </button>
          </div>
        </div>

        {/* Protein */}
        <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 transition hover:bg-background/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              Protein
            </span>
            <div className="h-2.5 w-2.5 rounded-full bg-brand-sage" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-accent">
              {totalProtein}
            </span>
            <span className="text-xs text-foreground/60">grams</span>
          </div>
          <div className="mt-1 text-[11px] text-foreground/50">
            {totalProtein > 0 ? `${totalProtein * 4} kcal from protein` : 'None logged'}
          </div>
        </div>

        {/* Fat & Fiber */}
        <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 transition hover:bg-background/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              Fat & Fiber
            </span>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-alert" />
              <span className="h-2 w-2 rounded-full bg-[#8b6914]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div>
              <span className="text-xl font-bold text-destructive">{totalFat}g</span>
              <span className="text-[10px] text-foreground/50 ml-0.5">fat</span>
            </div>
            <span className="text-foreground/20">•</span>
            <div>
              <span className="text-xl font-bold text-amber-800 dark:text-amber-300">{totalFiber}g</span>
              <span className="text-[10px] text-foreground/50 ml-0.5">fiber</span>
            </div>
          </div>
          <div className="mt-1 text-[11px] text-foreground/50">
            Balanced energy & digestion
          </div>
        </div>
      </div>
    </div>
  )
}
