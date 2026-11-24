import { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  FileText,
  Tag,
} from 'lucide-react'
import type { TaskType, TaskFrequency } from '../../types'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { TASK_TYPE_CONFIGS } from './taskConfigs'
export { TASK_TYPE_CONFIGS }

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  petId: string
  petName: string
}

const taskTypeEntries = Object.entries(TASK_TYPE_CONFIGS) as [
  TaskType,
  (typeof TASK_TYPE_CONFIGS)[TaskType],
][]

export default function AddTaskModal({
  isOpen,
  onClose,
  petId,
  petName,
}: AddTaskModalProps) {
  const { addTask } = useApp()
  const { addToast } = useToast()

  const todayStr = new Date().toISOString().split('T')[0]
  const defaultTimeStr = '08:00'

  const [type, setType] = useState<TaskType>('feeding')
  const [title, setTitle] = useState<string>(TASK_TYPE_CONFIGS.feeding.defaultTitle)
  const [dueDate, setDueDate] = useState<string>(todayStr)
  const [time, setTime] = useState<string>(defaultTimeStr)
  const [frequency, setFrequency] = useState<TaskFrequency>('daily')
  const [notes, setNotes] = useState<string>('')
  const [error, setError] = useState<string>('')

  if (!isOpen) return null

  const resetForm = () => {
    setType('feeding')
    setTitle(TASK_TYPE_CONFIGS.feeding.defaultTitle)
    setDueDate(new Date().toISOString().split('T')[0])
    setTime('08:00')
    setFrequency('daily')
    setNotes('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleTypeSelect = (selected: TaskType) => {
    setType(selected)
    const currentIsDefault = taskTypeEntries.some(([, cfg]) => cfg.defaultTitle === title)
    if (!title || currentIsDefault) {
      setTitle(TASK_TYPE_CONFIGS[selected].defaultTitle)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide a title for the task.')
      return
    }
    if (!dueDate) {
      setError('Please select a due date.')
      return
    }

    addTask({
      petId,
      type,
      title: title.trim(),
      notes: notes.trim() || undefined,
      frequency,
      time: time || '08:00',
      dueDate,
    })

    addToast(`Task "${title.trim()}" scheduled for ${petName}!`, 'success')
    resetForm()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="relative w-full max-w-lg my-0 bg-card rounded-2xl shadow-xl max-h-[calc(100dvh-2rem)] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-sage/15 text-brand-accent">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-task-title" className="font-semibold text-foreground">
                Schedule Care Task
              </h3>
              <p className="text-xs text-muted-foreground">For {petName} & family reminders</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-400/30 rounded-lg">
              {error}
            </div>
          )}

          {/* Task Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Task Category <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {taskTypeEntries.map(([tKey, cfg]) => {
                const Icon = cfg.icon
                const isSelected = type === tKey
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => handleTypeSelect(tKey)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `bg-brand-sage/10 border-brand-sage ring-2 ring-brand-sage/20 font-semibold text-foreground shadow-xs`
                        : `bg-background border-border text-muted-foreground hover:bg-muted hover:border-border`
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? cfg.badgeBg + ' ' + cfg.badgeText : 'bg-card text-muted-foreground shadow-2xs'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs leading-tight line-clamp-1">{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              Task Title <span className="text-destructive">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError('')
              }}
              placeholder="e.g., Morning kibble + fish oil"
              className="w-full px-3.5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="due-date" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Due Date <span className="text-destructive">*</span>
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-foreground bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="due-time" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Time
              </label>
              <input
                id="due-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-foreground bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Recurrence / Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'once', label: 'One-time' },
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                ] as const
              ).map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    frequency === freq.id
                      ? 'bg-brand-sage text-white border-brand-sage shadow-xs'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="task-notes" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Notes / Instructions <span className="font-normal text-muted-foreground lowercase">(optional)</span>
            </label>
            <textarea
              id="task-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Mix 1 dropper with wet food; don't give on an empty stomach."
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-dark hover:bg-brand-sage rounded-xl shadow-xs transition-colors"
            >
              Add Schedule Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
