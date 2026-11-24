import { useState } from 'react'
import {
  Droplets,
  Plus,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import type { Pet } from '../../types'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { formatTime, percent, isToday } from '../../utils/formatters'

interface WaterTrackerProps {
  pet: Pet
}

export default function WaterTracker({ pet }: WaterTrackerProps) {
  const { logWater, getTodayWater, waterLogs } = useApp()
  const { addToast } = useToast()

  const [customAmount, setCustomAmount] = useState<string>('')
  const [customError, setCustomError] = useState<string>('')

  // Goal calculation: fallback to 50ml/kg if pet.waterGoal is not set
  const waterGoal = pet.waterGoal > 0 ? pet.waterGoal : Math.round(pet.weight * 50)
  const todayWater = getTodayWater(pet.id)
  const progressPct = percent(todayWater, waterGoal)
  const remaining = Math.max(0, waterGoal - todayWater)

  // Today's logs
  const todayLogs = waterLogs
    .filter((w) => w.petId === pet.id && isToday(w.timestamp))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleQuickAdd = (amount: number, label: string) => {
    logWater(pet.id, amount)
    addToast(`+${amount} ml water logged for ${pet.name} (${label})!`, 'success')
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(customAmount, 10)
    if (isNaN(amount) || amount <= 0) {
      setCustomError('Please enter a valid amount in ml.')
      return
    }
    if (amount > 3000) {
      setCustomError('Amount too high for a single log.')
      return
    }
    logWater(pet.id, amount)
    addToast(`+${amount} ml logged for ${pet.name}!`, 'success')
    setCustomAmount('')
    setCustomError('')
  }

  // Hydration Tips tailored for dog vs cat
  const hydrationTips =
    pet.species === 'cat'
      ? [
          {
            title: 'Cats prefer running water',
            desc: 'Consider a pet water fountain. In the wild, running water signals freshness to felines.',
          },
          {
            title: 'Separate water from food',
            desc: 'Cats instinctively avoid drinking right beside their food bowl to prevent cross-contamination.',
          },
          {
            title: 'Wet food hydration boost',
            desc: 'Quality wet food contains up to 75-80% moisture, significantly aiding feline kidney health.',
          },
          {
            title: 'Try ceramic or stainless bowls',
            desc: 'Plastic bowls can harbor bacteria and cause chin acne. Wide shallow dishes prevent whisker fatigue.',
          },
        ]
      : [
          {
            title: 'Hot tropical climate caution',
            desc: 'Philippine humidity increases dehydration risk. Always bring a travel water bottle on walks.',
          },
          {
            title: 'Fresh bowl every day',
            desc: 'Wash water bowls daily with pet-safe soap to stop biofilm slime and bacterial buildup.',
          },
          {
            title: 'After exercise cool-down',
            desc: 'Offer water in moderation right after heavy play or running, then refill fully once panting slows.',
          },
          {
            title: 'Flavor booster for picky drinkers',
            desc: 'Add a dash of unsalted bone broth (strictly no onion or garlic) to entice drinking.',
          },
        ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Progress Metric */}
      <div className="bg-card rounded-2xl shadow-xs border border-border p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-400/30">
              <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300 animate-pulse" />
              Daily Hydration Goal: ~50 ml / kg
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {pet.name}&apos;s Daily Water Intake
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Based on {pet.name}&apos;s current weight of{' '}
              <span className="font-semibold text-foreground">{pet.weight} kg</span>, healthy daily water intake is roughly{' '}
              <span className="font-semibold text-foreground">{waterGoal} ml</span>.
            </p>
          </div>

          {/* Large Numbers */}
          <div className="flex items-baseline md:flex-col md:items-end gap-2 bg-muted/80 p-4 rounded-xl border border-border">
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
              <span className="text-cyan-700 dark:text-cyan-300">{todayWater}</span>
              <span className="text-muted-foreground text-xl font-normal"> / {waterGoal} ml</span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {progressPct}% Completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground">Hydration Progress</span>
            {remaining > 0 ? (
              <span className="text-cyan-700 dark:text-cyan-300 flex items-center gap-1 font-medium">
                <Droplets className="w-3.5 h-3.5" /> {remaining} ml remaining today
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target achieved today!
              </span>
            )}
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                progressPct >= 100
                  ? 'bg-linear-to-r from-teal-500 to-emerald-500'
                  : 'bg-linear-to-r from-cyan-400 to-sky-600'
              }`}
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add & Custom Log Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add Buttons */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-xs border border-border p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
                Quick Log Water
              </h3>
              <p className="text-xs text-muted-foreground">Tap to instantly record water consumption</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { amount: 50, label: 'Small Sip', desc: '50 ml' },
              { amount: 100, label: 'Half Cup', desc: '100 ml' },
              { amount: 200, label: 'Full Cup', desc: '200 ml' },
              { amount: 250, label: 'Refill Bowl', desc: '250 ml' },
            ].map((btn) => (
              <button
                key={btn.amount}
                type="button"
                onClick={() => handleQuickAdd(btn.amount, btn.label)}
                className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl border border-cyan-100 dark:border-cyan-400/30 bg-cyan-50/40 dark:bg-cyan-500/15 hover:bg-cyan-100 dark:hover:bg-cyan-900 hover:border-cyan-300 transition-all duration-200 text-center hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-500/15 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mb-1.5 transition-colors">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-foreground">+{btn.amount} ml</span>
                <span className="text-xs text-muted-foreground font-medium">{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Amount Form */}
          <div className="pt-3 border-t border-border">
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <label htmlFor="custom-water" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Or Log Custom Amount
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    id="custom-water"
                    type="number"
                    min="5"
                    max="3000"
                    step="5"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setCustomError('')
                    }}
                    placeholder="Enter amount (e.g. 150)"
                    className="w-full px-4 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all pr-12"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    ml
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-dark hover:bg-cyan-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Water
                </button>
              </div>
              {customError && (
                <p className="text-xs text-destructive font-medium">{customError}</p>
              )}
            </form>
          </div>
        </div>

        {/* Today's Log History */}
        <div className="bg-card rounded-2xl shadow-xs border border-border p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Today&apos;s Water Logs
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {todayLogs.length} entries
              </span>
            </div>

            {todayLogs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground space-y-2">
                <Droplets className="w-8 h-8 mx-auto stroke-1 text-stone-300" />
                <p className="text-xs">No water logged for {pet.name} yet today.</p>
                <p className="text-[11px] text-muted-foreground">Tap a quick-add button above when you fill their dish.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-background hover:bg-muted/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0">
                        <Droplets className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-foreground">+{log.amount} ml</span>
                    </div>
                    <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Today:</span>
            <span className="font-bold text-foreground">{todayWater} ml</span>
          </div>
        </div>
      </div>

      {/* Hydration Tips Section */}
      <div className="bg-linear-to-br from-background to-muted rounded-2xl border border-border p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-300" />
            <h3 className="text-base font-bold">
              Hydration Tips for {pet.species === 'cat' ? 'Cats' : 'Dogs'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-card px-2.5 py-1 rounded-full border border-border">
            Species: {pet.species}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {hydrationTips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-card p-4 rounded-xl border border-border shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300 shrink-0" />
                <span>{tip.title}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>

        {/* Dehydration Warning Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-700 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">How to check for dehydration:</span> Gently pinch the skin
            at the back of {pet.name}&apos;s neck (skin turgor test). In well-hydrated pets, it snaps right back. If it
            tent-folds or returns slowly, or if gums feel sticky or dry, provide fresh water immediately and consult your vet.
          </div>
        </div>
      </div>
    </div>
  )
}
