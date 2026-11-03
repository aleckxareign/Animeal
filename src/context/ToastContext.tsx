import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Toast, ToastType } from '../types'
import { generateId } from '../utils/storage'

type ToastContextType = {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = generateId()
      const toast: Toast = { id, message, type, duration: 3000 }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => removeToast(id), toast.duration)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
              t.type === 'success'
                ? 'bg-brand-sage'
                : t.type === 'error'
                  ? 'bg-brand-alert'
                  : t.type === 'warning'
                    ? 'bg-amber-600'
                    : 'bg-brand-dark'
            }`}
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

