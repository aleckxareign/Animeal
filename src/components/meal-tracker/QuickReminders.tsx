import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Circle,
  Plus,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { Pet, TaskType } from '../../types'

type QuickRemindersProps = {
  pet: Pet
}

export default function QuickReminders({ pet }: QuickRemindersProps) {
  const { getPendingTasks, completeTask, addTask } = useApp()
  const { addToast } = useToast()

  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('feeding')
  const [taskTime, setTaskTime] = useState('18:00')

  const pendingTasks = getPendingTasks(pet.id)

  const handleComplete = (id: string, title: string) => {
    completeTask(id, 'Me')
    addToast(`Completed: ${title}! Good job! 🐾`, 'success')
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    addTask({
      petId: pet.id,
      title: taskTitle.trim(),
      type: taskType,
      frequency: 'daily',
      time: taskTime,
      dueDate: new Date().toISOString().split('T')[0],
    })

    addToast(`Added reminder for ${pet.name}!`, 'success')
    setTaskTitle('')
    setShowQuickAdd(false)
  }

  return (
    <div className="rounded-3xl bg-white border border-brand-dark/10 shadow-sm p-6 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-dark/10 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-sage" />
          <h3 className="font-display text-xl font-bold text-brand-dark">
            Today's Care Tasks
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickAdd((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-xl bg-brand-cream px-3 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand-dark/10 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
          <Link
            to="/pet-wellness"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-sage hover:underline"
          >
            <span>Full Schedule</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Quick Add Form */}
      {showQuickAdd && (
        <form
          onSubmit={handleAddTask}
          className="rounded-2xl bg-brand-cream/40 border border-brand-dark/10 p-4 space-y-3 animate-slide-up"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70">
              New Reminder for {pet.name}
            </span>
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="text-xs text-brand-dark/50 hover:text-brand-dark"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="e.g. Evening Kibble, Dewormer, Walk"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-brand-dark/20 bg-white px-3 py-2 text-xs font-medium text-brand-dark focus:border-brand-sage focus:outline-none"
            />
            <input
              type="time"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="rounded-xl border border-brand-dark/20 bg-white px-3 py-2 text-xs font-medium text-brand-dark focus:border-brand-sage focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(['feeding', 'water', 'medication', 'exercise', 'grooming'] as TaskType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTaskType(t)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                    taskType === t
                      ? 'bg-brand-sage text-white'
                      : 'bg-white text-brand-dark/60 hover:bg-brand-cream'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-brand-sage px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-sage/90"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {pendingTasks.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-brand-sage/10 flex items-center justify-center text-brand-sage mb-2">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-sm text-brand-dark">
            All caught up for today!
          </h4>
          <p className="text-xs text-brand-dark/60 mt-0.5">
            No pending tasks for {pet.name}. Tap "+ Add Task" to set a feeding or medication reminder.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingTasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-brand-dark/10 bg-brand-cream/20 p-3.5 transition hover:bg-brand-cream/40"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleComplete(task.id, task.title)}
                  className="text-brand-dark/30 hover:text-brand-sage transition transform hover:scale-110"
                  aria-label={`Mark ${task.title} as completed`}
                >
                  <Circle className="h-5 w-5" />
                </button>

                <div>
                  <h4 className="text-sm font-semibold text-brand-dark">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-brand-dark/60 mt-0.5">
                    <span className="capitalize text-brand-sage font-medium">
                      {task.type}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.time}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleComplete(task.id, task.title)}
                className="shrink-0 rounded-xl bg-white border border-brand-dark/10 px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-sage hover:text-white transition shadow-2xs"
              >
                Done
              </button>
            </div>
          ))}

          {pendingTasks.length > 5 && (
            <div className="text-center pt-2">
              <Link
                to="/pet-wellness"
                className="text-xs font-bold text-brand-sage hover:underline"
              >
                + {pendingTasks.length - 5} more tasks on Wellness Schedule →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
