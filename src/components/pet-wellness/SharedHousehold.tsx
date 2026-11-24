import { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Utensils,
  Droplets,
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake,
  Trash2,
  X,
  Activity,
  Scale,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import type { Pet, HouseholdMember, FeedingEntry, WaterLog, ScheduleTask, WeightLog } from '../../types'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { timeAgo, formatDateTime, isToday } from '../../utils/formatters'
import { foods } from '../../data/foods'

interface SharedHouseholdProps {
  pet: Pet
}

type TimelineActivity = {
  id: string
  type: 'feeding' | 'water' | 'task' | 'weight'
  title: string
  description: string
  performedBy: string
  timestamp: string
  color: string
}

export default function SharedHousehold({ pet }: SharedHouseholdProps) {
  const {
    household,
    addMember,
    removeMember,
    feedingLog,
    waterLogs,
    tasks,
    weightLogs,
    logFeeding,
  } = useApp()
  const { addToast } = useToast()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [activeFeeder, setActiveFeeder] = useState<string>(household[0]?.name || 'Me')

  // Find latest feeding for this pet
  const petFeedings = feedingLog.filter((f) => f.petId === pet.id && !f.undone)
  const todayFeedings = petFeedings.filter((f) => isToday(f.timestamp))
  const latestFeeding = petFeedings[0] // logFeeding prepends to list

  // Quick Feed action ("Napakain ko na!")
  const handleQuickFeed = () => {
    // Find suitable food for this pet's species
    const defaultFood =
      foods.find((f) => f.species.includes(pet.species)) || foods[0]

    const portionGrams = pet.species === 'cat' ? 45 : 90

    logFeeding({
      petId: pet.id,
      foodId: defaultFood.id,
      foodName: defaultFood.name,
      portion: portionGrams,
      unit: 'g',
      fedBy: activeFeeder,
    })

    addToast(`Napakain na si ${pet.name} ni ${activeFeeder}! Busog na siya 🐾`, 'success')
  }

  // Add Member
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newMemberName.trim()
    if (!trimmed) return

    if (household.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      addToast('A household member with this name already exists.', 'warning')
      return
    }

    addMember(trimmed)
    addToast(`${trimmed} added to household!`, 'success')
    setNewMemberName('')
    setIsAddModalOpen(false)
  }

  const handleRemoveMember = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from your shared household?`)) {
      removeMember(id)
      addToast(`${name} removed from household.`, 'info')
    }
  }

  // Build combined live timeline
  const activityTimeline: TimelineActivity[] = useMemo(() => {
    const list: TimelineActivity[] = []

    // 1. Feedings
    petFeedings.forEach((f) => {
      list.push({
        id: `feed-${f.id}`,
        type: 'feeding',
        title: `Fed ${pet.name}`,
        description: `${f.portion}${f.unit} of ${f.foodName} (${f.calories} kcal)`,
        performedBy: f.fedBy || 'Family Member',
        timestamp: f.timestamp,
        color: '#b45309', // amber
      })
    })

    // 2. Water logs
    waterLogs
      .filter((w) => w.petId === pet.id)
      .forEach((w) => {
        list.push({
          id: `water-${w.id}`,
          type: 'water',
          title: `Logged Water`,
          description: `Added +${w.amount} ml of clean water`,
          performedBy: 'Household',
          timestamp: w.timestamp,
          color: '#0891b2', // cyan
        })
      })

    // 3. Completed Tasks
    tasks
      .filter((t) => t.petId === pet.id && t.completed)
      .forEach((t) => {
        list.push({
          id: `task-${t.id}`,
          type: 'task',
          title: `Completed ${t.title}`,
          description: t.notes || `Task marked completed`,
          performedBy: t.completedBy || 'Family Member',
          timestamp: t.completedAt || t.createdAt,
          color: '#44632f', // brand-sage
        })
      })

    // 4. Weight logs
    weightLogs
      .filter((w) => w.petId === pet.id)
      .forEach((w) => {
        list.push({
          id: `weight-${w.id}`,
          type: 'weight',
          title: `Recorded Weight`,
          description: `Weighed in at ${w.weight.toFixed(1)} kg${w.notes ? ` (${w.notes})` : ''}`,
          performedBy: 'Household',
          timestamp: w.date,
          color: '#4f46e5', // indigo
        })
      })

    // Sort descending by timestamp
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }, [pet.id, pet.name, petFeedings, waterLogs, tasks, weightLogs])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview & Quick Status Banner */}
      <div className="bg-card rounded-2xl p-5 sm:p-7 border border-border shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-dark/10 text-foreground border border-foreground/20 mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            Family Sync & Shared Care
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Shared Household for {pet.name}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Keep your whole family in sync so {pet.name} never gets double-fed or missed. Real-time updates let everyone see who fed or walked {pet.name} last.
          </p>
        </div>

        {/* Big Filipino Quick Action Banner: "Napakain na ba si [Pet]?" */}
        <div
          className={`rounded-2xl p-5 sm:p-6 border transition-all ${
            todayFeedings.length > 0
              ? 'bg-linear-to-r from-emerald-50 via-teal-50 to-card dark:from-background dark:via-muted dark:to-card border-emerald-200 dark:border-emerald-400/30'
              : 'bg-linear-to-r from-amber-50 via-orange-50 to-card dark:from-background dark:via-muted dark:to-card border-amber-200 dark:border-amber-400/30'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Philippine Household Check
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                Napakain na ba si {pet.name}?
              </h3>

              {todayFeedings.length > 0 && latestFeeding ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-card/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-400/30 shadow-2xs w-fit">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                  <span>
                    ✅ Fed {timeAgo(latestFeeding.timestamp)} by{' '}
                    <strong className="text-emerald-950 dark:text-emerald-300 font-bold">{latestFeeding.fedBy}</strong>
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({latestFeeding.portion} {latestFeeding.unit} of {latestFeeding.foodName})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300 bg-card/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-200/80 dark:border-amber-400/30 shadow-2xs w-fit">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0" />
                  <span>⚠️ Not fed yet today! Gutom pa si {pet.name}.</span>
                </div>
              )}
            </div>

            {/* Quick Button + Who is feeding */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground shadow-2xs">
                <span>Who&apos;s feeding:</span>
                <select
                  value={activeFeeder}
                  onChange={(e) => setActiveFeeder(e.target.value)}
                  className="font-bold text-foreground bg-transparent focus:outline-none cursor-pointer"
                >
                  {household.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleQuickFeed}
                className="px-5 py-3 rounded-xl bg-brand-dark hover:bg-brand-sage text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                Napakain ko na!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Household Members List Section */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-4">
        <div className="flex max-sm:flex-wrap max-sm:gap-3 items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" />
              Household Caretakers
            </h3>
            <p className="text-xs text-muted-foreground">
              Family members and caretakers who care for {pet.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-accent text-foreground text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {household.map((member) => {
            const memberFeedings = petFeedings.filter((f) => f.fedBy === member.name).length
            const memberTasks = tasks.filter(
              (t) => t.petId === pet.id && t.completed && t.completedBy === member.name,
            ).length

            return (
              <div
                key={member.id}
                className="relative bg-muted/70 hover:bg-muted border border-border/70 rounded-xl p-4 flex max-sm:flex-wrap max-sm:gap-3 items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
                    style={{ backgroundColor: member.color || '#44632f' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-foreground">{member.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          member.isOwner
                            ? 'bg-brand-sage/15 text-brand-accent'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {member.isOwner ? 'Owner' : 'Family Member'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{memberFeedings} feedings</span>
                      <span>•</span>
                      <span>{memberTasks} tasks done</span>
                    </div>
                  </div>
                </div>

                {!member.isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="text-stone-300 hover:text-destructive p-1.5 rounded-md transition-colors"
                    title={`Remove ${member.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Shared Activity Feed */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-4">
        <div className="flex max-sm:flex-wrap max-sm:gap-3 items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-foreground" />
              Shared Activity Feed
            </h3>
            <p className="text-xs text-muted-foreground">
              Live chronological timeline of household care for {pet.name}
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            {activityTimeline.length} events
          </span>
        </div>

        {activityTimeline.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-2">
            <Activity className="w-8 h-8 mx-auto stroke-1 text-stone-300" />
            <p className="text-xs">No care activity logged yet for {pet.name}.</p>
            <p className="text-[11px] text-muted-foreground">
              Feedings, water logs, and scheduled tasks will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-accent">
            {activityTimeline.slice(0, 20).map((act) => {
              return (
                <div key={act.id} className="relative flex items-start gap-3 text-xs">
                  {/* Timeline bullet dot */}
                  <div
                    className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: act.color }}
                  >
                    {act.type === 'feeding' ? (
                      <Utensils className="w-2.5 h-2.5" />
                    ) : act.type === 'water' ? (
                      <Droplets className="w-2.5 h-2.5" />
                    ) : act.type === 'weight' ? (
                      <Scale className="w-2.5 h-2.5" />
                    ) : (
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    )}
                  </div>

                  {/* Activity Details Card */}
                  <div className="flex-1 bg-muted/80 hover:bg-muted border border-border/60 p-3 rounded-xl transition-colors">
                    <div className="flex max-sm:flex-wrap max-sm:gap-3 items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{act.title}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(act.timestamp)}
                      </span>
                    </div>

                    <p className="text-muted-foreground mt-1">{act.description}</p>

                    <div className="mt-2 pt-2 border-t border-border/50 flex max-sm:flex-wrap max-sm:gap-3 items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium text-muted-foreground">
                        By: <span className="font-bold text-foreground">{act.performedBy}</span>
                      </span>
                      <span className="text-muted-foreground">{formatDateTime(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-member-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-xl max-h-[calc(100dvh-2rem)] overflow-y-auto animate-scale-in">
            <div className="flex max-sm:flex-wrap max-sm:gap-3 items-center justify-between px-5 py-4 border-b border-border bg-background/60">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-accent" />
                <h3 id="add-member-title" className="font-bold text-foreground">
                  Add Family Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-muted-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="member-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Member Name
                </label>
                <input
                  id="member-name-input"
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g., Ate Maria, Kuya Paolo, Mom"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
                  required
                  autoFocus
                />
              </div>

              <p className="text-xs text-muted-foreground">
                A color-coded avatar will be automatically created so they can log feedings and complete tasks.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-dark hover:bg-brand-sage rounded-xl shadow-xs"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
