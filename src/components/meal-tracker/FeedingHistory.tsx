import { useState } from 'react'
import {
  Utensils,
  Clock,
  RotateCcw,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import {
  formatTime,
  formatDate,
  timeAgo,
  isToday,
} from '../../utils/formatters'
import type { FeedingEntry, Pet } from '../../types'

type FeedingHistoryProps = {
  pet: Pet
  onOpenFeedModal: () => void
}

export default function FeedingHistory({ pet, onOpenFeedModal }: FeedingHistoryProps) {
  const { feedingLog, undoFeeding, household } = useApp()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState<'today' | 'past'>('today')

  // Get all entries for this pet
  const petFeedings = feedingLog.filter((f) => f.petId === pet.id)

  const todayFeedings = petFeedings.filter((f) => isToday(f.timestamp) && !f.undone)
  const pastFeedings = petFeedings.filter((f) => !isToday(f.timestamp) && !f.undone)

  // Group past feedings by day
  const groupedPastFeedings = pastFeedings.reduce<Record<string, FeedingEntry[]>>(
    (acc, entry) => {
      const dateKey = formatDate(entry.timestamp)
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(entry)
      return acc
    },
    {},
  )

  const handleUndo = (entry: FeedingEntry) => {
    undoFeeding(entry.id)
    addToast(`Removed ${entry.foodName} (${entry.calories} kcal) from log.`, 'info')
  }

  const getMemberColor = (name: string) => {
    const member = household.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    )
    return member?.color || '#44632f'
  }

  return (
    <div className="rounded-3xl bg-white border border-brand-dark/10 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/10 pb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-brand-dark flex items-center gap-2">
            <Utensils className="h-5 w-5 text-brand-sage" />
            Feeding Log & History
          </h3>
          <p className="text-xs text-brand-dark/60 mt-0.5">
            Real-time meal entries logged by household members
          </p>
        </div>

        {/* Tab switcher: Today vs Past Days */}
        <div className="flex items-center rounded-xl bg-brand-cream/80 p-1 border border-brand-dark/10">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'today'
                ? 'bg-brand-dark text-white shadow-xs'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Today ({todayFeedings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'past'
                ? 'bg-brand-dark text-white shadow-xs'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Past Days ({pastFeedings.length})</span>
          </button>
        </div>
      </div>

      {/* TODAY'S FEEDINGS */}
      {activeTab === 'today' && (
        <div className="space-y-3">
          {todayFeedings.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-brand-cream flex items-center justify-center text-3xl mb-3 shadow-inner">
                🍲
              </div>
              <h4 className="font-display text-base font-bold text-brand-dark">
                No meals logged yet today!
              </h4>
              <p className="mt-1 text-xs text-brand-dark/60 max-w-xs">
                Has {pet.name} eaten yet? Tap below to record breakfast, dinner, or a healthy treat.
              </p>
              <button
                onClick={onOpenFeedModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-sage px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-sage/90 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Napakain ako
              </button>
            </div>
          ) : (
            <div className="divide-y divide-brand-dark/10">
              {todayFeedings.map((entry) => (
                <div
                  key={entry.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-brand-cream/20 px-2 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-sage">
                      <Utensils className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-brand-dark">
                          {entry.foodName}
                        </h4>
                        <span className="rounded-full bg-brand-sage/10 px-2 py-0.5 text-[10px] font-extrabold text-brand-sage">
                          +{entry.calories} kcal
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-brand-dark/60">
                        <span>
                          Portion: {entry.portion} {entry.unit}
                        </span>
                        <span>•</span>
                        <span>{timeAgo(entry.timestamp)}</span>
                        <span>({formatTime(entry.timestamp)})</span>
                      </div>
                      {/* Macro pill summary */}
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-brand-dark/60">
                        <span className="font-medium text-brand-sage">
                          P: {entry.protein}g
                        </span>
                        <span>•</span>
                        <span className="font-medium text-brand-alert">
                          F: {entry.fat}g
                        </span>
                        <span>•</span>
                        <span className="font-medium text-[#8b6914]">
                          Fib: {entry.fiber}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-12 sm:pl-0">
                    {/* Fed by tag */}
                    <div className="flex items-center gap-1.5 rounded-full bg-brand-cream px-2.5 py-1 text-xs font-medium text-brand-dark">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getMemberColor(entry.fedBy) }}
                      />
                      <span>Fed by {entry.fedBy}</span>
                    </div>

                    {/* Undo button */}
                    <button
                      onClick={() => handleUndo(entry)}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-dark/15 px-2.5 py-1 text-xs font-semibold text-brand-dark/70 hover:bg-brand-alert/10 hover:border-brand-alert/30 hover:text-brand-alert transition"
                      title="Undo this meal entry"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Undo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PAST DAYS FEEDINGS */}
      {activeTab === 'past' && (
        <div className="space-y-6">
          {pastFeedings.length === 0 ? (
            <div className="py-12 text-center text-brand-dark/60">
              <Calendar className="mx-auto h-10 w-10 text-brand-dark/30 mb-2" />
              <p className="text-sm font-semibold">No past feeding history yet.</p>
              <p className="text-xs text-brand-dark/50 mt-1">
                Meals from previous days will automatically be cataloged here.
              </p>
            </div>
          ) : (
            Object.entries(groupedPastFeedings).map(([dateLabel, entries]) => {
              const dayTotalCalories = entries.reduce((s, e) => s + e.calories, 0)
              return (
                <div key={dateLabel} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-brand-dark/10 pb-1.5">
                    <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                      {dateLabel}
                    </span>
                    <span className="text-xs font-semibold text-brand-sage">
                      {dayTotalCalories} kcal total ({entries.length} meals)
                    </span>
                  </div>

                  <div className="divide-y divide-brand-dark/5">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-brand-dark">
                            {entry.foodName}
                          </p>
                          <p className="text-brand-dark/50">
                            {entry.portion} {entry.unit} • {formatTime(entry.timestamp)} • Fed by {entry.fedBy}
                          </p>
                        </div>
                        <span className="font-bold text-brand-sage">
                          +{entry.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
