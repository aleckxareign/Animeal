import { useState } from 'react'
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RotateCcw,
  Tag,
  ChevronDown,
  User,
  Bell,
  Sparkles,
} from 'lucide-react'
import type { Pet, ScheduleTask } from '../../types'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { formatDate, formatTime, isToday, timeAgo } from '../../utils/formatters'
import AddTaskModal, { TASK_TYPE_CONFIGS } from './AddTaskModal'

interface CareScheduleProps {
  pet: Pet
}

type FilterTab = 'all' | 'today' | 'upcoming' | 'completed'

export default function CareSchedule({ pet }: CareScheduleProps) {
  const { tasks, completeTask, snoozeTask, removeTask, household } = useApp()
  const { addToast } = useToast()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('today')
  const [completerName, setCompleterName] = useState<string>('Me')

  // Filter tasks for this pet
  const petTasks = tasks.filter((t) => t.petId === pet.id)

  const isTaskOverdue = (task: ScheduleTask) => {
    if (task.completed) return false
    const now = new Date()
    // If snoozed into future, not currently overdue
    if (task.snoozedUntil && new Date(task.snoozedUntil) > now) {
      return false
    }
    const due = new Date(`${task.dueDate}T${task.time || '00:00'}`)
    return due < now
  }

  const isTaskDueToday = (task: ScheduleTask) => {
    return isToday(task.dueDate)
  }

  const isTaskUpcoming = (task: ScheduleTask) => {
    if (task.completed) return false
    const todayStr = new Date().toISOString().split('T')[0]
    return task.dueDate > todayStr
  }

  // Segment tasks by tab
  const filteredTasks = petTasks.filter((task) => {
    switch (activeTab) {
      case 'today':
        return isTaskDueToday(task) && !task.completed
      case 'upcoming':
        return isTaskUpcoming(task)
      case 'completed':
        return task.completed
      case 'all':
      default:
        return true
    }
  })

  // Counts for tab badges
  const counts = {
    all: petTasks.length,
    today: petTasks.filter((t) => isTaskDueToday(t) && !t.completed).length,
    upcoming: petTasks.filter((t) => isTaskUpcoming(t)).length,
    completed: petTasks.filter((t) => t.completed).length,
  }

  const handleComplete = (taskId: string, title: string) => {
    completeTask(taskId, completerName)
    addToast(`"${title}" marked complete by ${completerName}!`, 'success')
  }

  const handleSnooze = (taskId: string, hoursAhead: number, label: string) => {
    const futureDate = new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString()
    snoozeTask(taskId, futureDate)
    addToast(`Task snoozed (${label})`, 'info')
  }

  const handleSnoozeTomorrow = (taskId: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    snoozeTask(taskId, tomorrow.toISOString())
    addToast('Task snoozed until tomorrow 9:00 AM', 'info')
  }

  const handleDelete = (taskId: string) => {
    if (window.confirm('Delete this reminder?')) {
      removeTask(taskId)
      addToast('Task removed from schedule', 'info')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-card rounded-2xl p-5 sm:p-7 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-sage/10 text-brand-accent border border-brand-sage/20 mb-2">
            <Bell className="w-3.5 h-3.5" />
            Care Schedule & Reminders
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {pet.name}&apos;s Care Schedule
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mt-1">
            Stay on top of feedings, medication doses, vet appointments, and grooming so your household never misses a beat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Member acting selector */}
          <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Acting as:</span>
            <select
              value={completerName}
              onChange={(e) => setCompleterName(e.target.value)}
              className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {household.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} {m.isOwner ? '(Owner)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-sage text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'today', label: 'Due Today', count: counts.today },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'all', label: 'All Tasks', count: counts.all },
          { id: 'completed', label: 'Completed', count: counts.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id as FilterTab)
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeTab === tab.id
                ? 'bg-brand-sage text-white border-brand-sage shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === tab.id
                  ? 'bg-card/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List / Empty States */}
      {filteredTasks.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 border border-border text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
            <Calendar className="w-6 h-6 stroke-1 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">No tasks in this view</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {activeTab === 'today'
              ? `You're all caught up for today! No pending care tasks due for ${pet.name}.`
              : activeTab === 'upcoming'
                ? `No upcoming scheduled events yet for ${pet.name}. Plan your next vet visit or grooming!`
                : activeTab === 'completed'
                  ? 'No completed tasks yet. Mark tasks as done to build your care history.'
                  : `No tasks found for ${pet.name}. Create one to stay organized!`}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground bg-muted hover:bg-accent rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule a Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const config = TASK_TYPE_CONFIGS[task.type] || TASK_TYPE_CONFIGS.feeding
            const Icon = config.icon
            const overdue = isTaskOverdue(task)
            const isSnoozed =
              task.snoozedUntil && new Date(task.snoozedUntil) > new Date()

            return (
              <div
                key={task.id}
                className={`relative bg-card rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  task.completed
                    ? 'border-emerald-200/60 dark:border-emerald-400/30 bg-emerald-50/20 dark:bg-emerald-500/15 opacity-80'
                    : overdue
                      ? 'border-brand-alert/40 bg-red-50/30 dark:bg-red-500/15'
                      : 'border-border hover:border-border hover:shadow-sm'
                }`}
              >
                {/* Top badges & icon */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.badgeBg} ${config.badgeText}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}
                          >
                            {config.label}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md capitalize">
                            {task.frequency}
                          </span>
                          {overdue && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-alert text-white flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                          {isSnoozed && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300">
                              Snoozed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="text-stone-300 hover:text-destructive p-1 rounded-md transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Notes */}
                  <h4
                    className={`text-base font-bold text-foreground ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {task.notes}
                    </p>
                  )}
                </div>

                {/* Footer Due info & Actions */}
                <div className="pt-4 mt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatDate(task.dueDate)}
                    </span>
                    {task.time && (
                      <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {task.time}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {task.completed ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Done by {task.completedBy || 'Me'}{' '}
                        {task.completedAt ? `(${timeAgo(task.completedAt)})` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Snooze selection */}
                      <select
                        aria-label={`Snooze ${task.title}`}
                        value=""
                        onChange={(event) => {
                          if (event.target.value === 'tomorrow') handleSnoozeTomorrow(task.id)
                          else if (event.target.value === '1') handleSnooze(task.id, 1, '+1 Hour')
                          else if (event.target.value === '3') handleSnooze(task.id, 3, '+3 Hours')
                        }}
                      >
                        <option value="" disabled>Snooze</option>
                        <option value="1">+ 1 Hour</option>
                        <option value="3">+ 3 Hours</option>
                        <option value="tomorrow">Tomorrow (9:00 AM)</option>
                      </select>

                      {/* Mark Done Button */}
                      <button
                        type="button"
                        onClick={() => handleComplete(task.id, task.title)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-sage hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        petId={pet.id}
        petName={pet.name}
      />
    </div>
  )
}
