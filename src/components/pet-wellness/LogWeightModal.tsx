import { useState } from 'react'
import { X, Scale, Calendar, FileText } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

interface LogWeightModalProps {
  isOpen: boolean
  onClose: () => void
  petId: string
  petName: string
  currentWeight: number
}

export default function LogWeightModal({
  isOpen,
  onClose,
  petId,
  petName,
  currentWeight,
}: LogWeightModalProps) {
  const { logWeight } = useApp()
  const { addToast } = useToast()

  const todayStr = new Date().toISOString().split('T')[0]
  const [weight, setWeight] = useState<string>(currentWeight > 0 ? currentWeight.toString() : '5.0')
  const [date, setDate] = useState<string>(todayStr)
  const [notes, setNotes] = useState<string>('')
  const [error, setError] = useState<string>('')

  if (!isOpen) return null

  const resetForm = () => {
    setWeight(currentWeight > 0 ? currentWeight.toString() : '5.0')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleQuickAdjust = (delta: number) => {
    const currentVal = parseFloat(weight) || currentWeight || 5
    const newVal = Math.max(0.1, Math.round((currentVal + delta) * 10) / 10)
    setWeight(newVal.toFixed(1))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericWeight = parseFloat(weight)
    if (isNaN(numericWeight) || numericWeight <= 0) {
      setError('Please enter a valid weight greater than 0 kg.')
      return
    }
    if (numericWeight > 150) {
      setError('Weight exceeds typical pet range (max 150 kg).')
      return
    }

    // Convert date to ISO string
    let isoDate = new Date().toISOString()
    if (date) {
      const selected = new Date(date)
      const now = new Date()
      selected.setHours(now.getHours(), now.getMinutes(), now.getSeconds())
      isoDate = selected.toISOString()
    }

    logWeight(petId, numericWeight, notes.trim() || undefined, isoDate)
    addToast(`Recorded ${numericWeight.toFixed(1)} kg for ${petName}!`, 'success')
    resetForm()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-weight-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-brand-cream/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-sage/15 text-brand-sage">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 id="log-weight-title" className="font-semibold text-brand-dark">
                Log Weight for {petName}
              </h3>
              <p className="text-xs text-stone-500">Record a new weigh-in to track trends</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-brand-alert bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Weight Input */}
          <div>
            <label htmlFor="weight-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Weight (kg) <span className="text-brand-alert">*</span>
            </label>
            <div className="relative">
              <input
                id="weight-input"
                type="number"
                step="0.05"
                min="0.1"
                max="150"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 text-2xl font-bold text-brand-dark bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all pr-14"
                placeholder="0.0"
                required
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-stone-400">
                kg
              </span>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-stone-400">Quick adjust:</span>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-0.5)}
                className="px-2 py-0.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-0.1)}
                className="px-2 py-0.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(+0.1)}
                className="px-2 py-0.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(+0.5)}
                className="px-2 py-0.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
              >
                +0.5
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="date-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              Date of Measurement
            </label>
            <input
              id="date-input"
              type="date"
              max={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-medium text-stone-800 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="notes-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              Notes <span className="font-normal text-stone-400 lowercase">(optional)</span>
            </label>
            <textarea
              id="notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., After morning walk, vet visit, switched to light kibble..."
              className="w-full px-3.5 py-2.5 text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent transition-all placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-dark hover:bg-brand-sage rounded-xl shadow-xs transition-colors"
            >
              Save Weight
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
