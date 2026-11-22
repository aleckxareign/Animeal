import { useState } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  User,
  Bell,
  Sparkles,
  AlertCircle,
  Tag,
  Repeat,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import type { ScheduleTask, TaskType, TaskFrequency } from '../types'
import { formatDate, formatTime, isToday } from '../utils/formatters'
import AddTaskModal, { TASK_TYPE_CONFIGS } from '../components/pet-wellness/AddTaskModal'

type ViewMode = 'daily' | 'weekly' | 'all'
type FilterStatus = 'all' | 'pending' | 'completed'

export default function CareSchedulePage() {
  const { pets, activePet, setActivePet, tasks, updateTask, completeTask, snoozeTask, removeTask, household } = useApp()
  const { addToast } = useToast()

  const [selectedPetId, setSelectedPetId] = useState<string>(activePet?.id || pets[0]?.id || 'all')
  const [selectedCategory, setSelectedCategory] = useState<TaskType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null)
  const [activeCompleter, setActiveCompleter] = useState<string>(household[0]?.name || 'Me')

  // Notification status
  const [hasNotificationPermission, setHasNotificationPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  })

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      addToast('Push notifications are not supported on this browser.', 'warning')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setHasNotificationPermission(true)
      addToast('Browser reminders enabled! You will be notified when care tasks are due.', 'success')
      new Notification('Animeal Care Schedule Active', {
        body: 'You will receive reminders for scheduled pet tasks and feeding.',
        icon: '/favicon.svg',
      })
    } else {
      addToast('Notification permission was denied.', 'warning')
    }
  }

  // Filter tasks based on selected pet, category, status, and view
  const filteredTasks = tasks.filter((t) => {
    if (selectedPetId !== 'all' && t.petId !== selectedPetId) return false
    if (selectedCategory !== 'all' && t.type !== selectedCategory) return false

    if (statusFilter === 'pending' && t.completed) return false
    if (statusFilter === 'completed' && !t.completed) return false

    const todayStr = new Date().toISOString().split('T')[0]
    if (viewMode === 'daily') {
      return t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr)
    }
    if (viewMode === 'weekly') {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekStr = nextWeek.toISOString().split('T')[0]
      return t.dueDate <= nextWeekStr
    }
    return true
  })

  const currentPet = pets.find((p) => p.id === selectedPetId) || activePet || pets[0]

  const handleToggleComplete = (task: ScheduleTask) => {
    if (task.completed) {
      updateTask(task.id, { completed: false, completedBy: undefined, completedAt: undefined })
      addToast(`"${task.title}" marked as pending.`, 'info')
    } else {
      completeTask(task.id, activeCompleter)
      addToast(`"${task.title}" completed by ${activeCompleter}! 🐾`, 'success')
    }
  }

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      removeTask(id)
      addToast(`Task "${title}" removed.`, 'info')
    }
  }

  const pendingCount = tasks.filter((t) => !t.completed).length
  const completedTodayCount = tasks.filter((t) => t.completed && t.completedAt && isToday(t.completedAt)).length

  return (
    <div className="min-h-screen bg-brand-cream/30 dark:bg-slate-950 py-10 px-4 sm:px-8 lg:px-12 transition-colors">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-sage/10 dark:bg-brand-sage/20 px-3.5 py-1 text-xs font-bold text-brand-sage mb-2">
              <Calendar className="size-3.5" />
              <span>Scheduling & Smart Reminders System</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
              Care Schedule & Reminders
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-slate-400 mt-1">
              Plan, assign, and track feeding, medication, grooming, and veterinary care for your household.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!hasNotificationPermission && (
              <button
                type="button"
                onClick={requestNotifications}
                className="flex items-center gap-2 rounded-xl border border-brand-sage/40 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-brand-sage hover:bg-brand-sage/10 transition"
              >
                <Bell className="size-4 animate-bounce" />
                <span>Enable Push Notifications</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-brand-sage px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-sage/90 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="size-5" />
              <span>Add Care Task</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Pending Tasks
            </p>
            <p className="font-display text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount}
            </p>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Awaiting completion</p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Completed Today
            </p>
            <p className="font-display text-3xl font-extrabold text-brand-sage dark:text-emerald-400 mt-1">
              {completedTodayCount}
            </p>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Tasks accomplished</p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Active Completer
            </p>
            <div className="flex items-center gap-2 mt-2">
              <User className="size-4 text-brand-sage" />
              <select
                value={activeCompleter}
                onChange={(e) => setActiveCompleter(e.target.value)}
                className="bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-brand-dark dark:text-white"
              >
                {household.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} {m.isOwner ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1">Attributed on check-off</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex rounded-xl bg-stone-100 dark:bg-slate-800 p-1 text-xs font-bold text-stone-600 dark:text-slate-300">
              <button
                onClick={() => setViewMode('daily')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
                  viewMode === 'daily'
                    ? 'bg-white dark:bg-slate-700 text-brand-dark dark:text-white shadow-2xs'
                    : 'hover:text-brand-dark'
                }`}
              >
                <CalendarDays className="size-3.5" />
                <span>Today's Agenda</span>
              </button>

              <button
                onClick={() => setViewMode('weekly')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
                  viewMode === 'weekly'
                    ? 'bg-white dark:bg-slate-700 text-brand-dark dark:text-white shadow-2xs'
                    : 'hover:text-brand-dark'
                }`}
              >
                <CalendarRange className="size-3.5" />
                <span>7-Day Agenda</span>
              </button>

              <button
                onClick={() => setViewMode('all')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-brand-dark dark:text-white shadow-2xs'
                    : 'hover:text-brand-dark'
                }`}
              >
                <Calendar className="size-3.5" />
                <span>All Scheduled</span>
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">Status:</span>
              <div className="flex rounded-lg border border-stone-200 dark:border-slate-700 p-0.5 text-xs font-bold">
                {(['all', 'pending', 'completed'] as FilterStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-md capitalize transition ${
                      statusFilter === st
                        ? 'bg-brand-sage text-white shadow-xs'
                        : 'text-stone-600 dark:text-slate-300 hover:text-brand-dark'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pet Switcher & Category Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-slate-800">
            {/* Pet Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 shrink-0">Pet:</span>
              <button
                onClick={() => setSelectedPetId('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition ${
                  selectedPetId === 'all'
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300'
                }`}
              >
                All Pets
              </button>
              {pets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPetId(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 transition ${
                    selectedPetId === p.id
                      ? 'bg-brand-sage text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300'
                  }`}
                >
                  <span>{p.avatarEmoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TaskType | 'all')}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-bold text-brand-dark dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="feeding">Feeding</option>
                <option value="water">Water Refresh</option>
                <option value="medication">Medication</option>
                <option value="grooming">Grooming</option>
                <option value="exercise">Exercise & Walk</option>
                <option value="weight-check">Weight Check</option>
                <option value="vaccination">Vaccination</option>
                <option value="vet-appointment">Veterinary Visit</option>
                <option value="deworming">Deworming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards List */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4 shadow-sm">
            <div className="size-16 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center mx-auto">
              <Calendar className="size-8" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-brand-dark dark:text-white">
                Walang naka-schedule na task!
              </h3>
              <p className="text-sm text-stone-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Lahat ng reminders ay natapos na o wala pang naka-schedule sa napiling filter.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-sage px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-sage/90 transition"
            >
              <Plus className="size-4" />
              <span>Mag-schedule ng Task</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const cfg = TASK_TYPE_CONFIGS[task.type] || TASK_TYPE_CONFIGS.feeding
              const Icon = cfg.icon
              const associatedPet = pets.find((p) => p.id === task.petId)

              return (
                <div
                  key={task.id}
                  className={`relative rounded-2xl border p-5 transition flex flex-col justify-between shadow-2xs ${
                    task.completed
                      ? 'border-stone-200 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-900/40 opacity-75'
                      : 'border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-sage/60 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Category badge & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
                          <Icon className="size-3.5" />
                          <span>{cfg.label}</span>
                        </span>

                        {task.frequency !== 'once' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-[10px] font-semibold text-stone-600 dark:text-slate-400">
                            <Repeat className="size-2.5" />
                            <span className="capitalize">{task.frequency}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id, task.title)}
                          className="size-7 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition"
                          title="Delete task"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Notes */}
                    <div>
                      <h3
                        className={`text-base font-bold leading-snug ${
                          task.completed
                            ? 'line-through text-stone-500 dark:text-slate-500'
                            : 'text-brand-dark dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.notes && (
                        <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>

                    {/* Pet & Due Metadata */}
                    <div className="pt-2 border-t border-stone-100 dark:border-slate-800 space-y-1.5 text-xs text-stone-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="size-3.5 text-brand-sage" />
                          <span>{formatDate(task.dueDate)} • {formatTime(task.time)}</span>
                        </span>

                        {associatedPet && (
                          <span className="font-bold text-brand-dark dark:text-white flex items-center gap-1">
                            <span>{associatedPet.avatarEmoji}</span>
                            <span>{associatedPet.name}</span>
                          </span>
                        )}
                      </div>

                      {task.assignedTo && (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-slate-400">
                          <User className="size-3 text-stone-400" />
                          <span>Assigned to: <strong className="text-brand-dark dark:text-white">{task.assignedTo}</strong></span>
                        </div>
                      )}

                      {task.completed && task.completedBy && (
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                          <span>Completed by <strong>{task.completedBy}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Action Button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        task.completed
                          ? 'border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-50'
                          : 'bg-brand-sage text-white hover:bg-brand-sage/90 active:scale-[0.99]'
                      }`}
                    >
                      <CheckCircle2 className="size-4" />
                      <span>{task.completed ? 'Mark as Incomplete' : 'Mark as Completed'}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {currentPet && (
        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          petId={currentPet.id}
          petName={currentPet.name}
        />
      )}
    </div>
  )
}

