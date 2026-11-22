import { useState } from 'react'
import { X, Settings, Bell, Moon, Sun, Globe, DollarSign, Check, Shield } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme()
  const { addToast } = useToast()

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  })
  const [inAppSound, setInAppSound] = useState(true)
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [language, setLanguage] = useState<'taglish' | 'en'>('taglish')

  if (!isOpen) return null

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      addToast('Browser notifications are not supported on this device.', 'warning')
      return
    }

    if (Notification.permission === 'granted') {
      addToast('Notifications are already active!', 'info')
      setNotificationsEnabled(true)
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        addToast('Push notifications enabled for pet feeding reminders! 🔔', 'success')
        new Notification('Animeal Pet Care', {
          body: 'Feeding and care reminders are now active for your household!',
          icon: '/favicon.svg',
        })
      } else {
        setNotificationsEnabled(false)
        addToast('Notification permission was declined.', 'warning')
      }
    } catch {
      addToast('Could not request notification permissions.', 'error')
    }
  }

  const handleSave = () => {
    addToast('Settings preferences saved! ✨', 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center">
              <Settings className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-brand-dark dark:text-white">Settings & Preferences</h2>
              <p className="text-xs text-stone-500 dark:text-slate-400">Configure notifications, theme & units</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Theme Option */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider">
              Display Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  theme === 'light'
                    ? 'border-brand-sage bg-brand-sage/10 ring-2 ring-brand-sage/40 text-brand-dark'
                    : 'border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60 text-stone-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="size-5 text-amber-500" />
                  <span className="text-sm font-bold">Light Mode</span>
                </div>
                {theme === 'light' && <Check className="size-4 text-brand-sage" />}
              </button>

              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  theme === 'dark'
                    ? 'border-brand-sage bg-brand-sage/20 ring-2 ring-brand-sage/40 text-white'
                    : 'border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60 text-stone-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="size-5 text-indigo-400" />
                  <span className="text-sm font-bold">Dark Mode</span>
                </div>
                {theme === 'dark' && <Check className="size-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider">
              Notifications & Reminders
            </h3>

            <div className="rounded-2xl border border-stone-200 dark:border-slate-800 p-4 space-y-3 bg-stone-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="size-5 text-brand-sage" />
                  <div>
                    <p className="text-sm font-bold text-brand-dark dark:text-white">Browser Push Notifications</p>
                    <p className="text-xs text-stone-500 dark:text-slate-400">
                      Alerts for meal times, hydration checks & medication
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    notificationsEnabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-200 hover:bg-brand-sage hover:text-white'
                  }`}
                >
                  {notificationsEnabled ? 'Enabled ✓' : 'Enable'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-brand-dark dark:text-white">In-App Reminder Banners</p>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">Show reminder toasts when tasks are due</p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppSound}
                  onChange={(e) => setInAppSound(e.target.checked)}
                  className="size-4 rounded accent-brand-sage"
                />
              </div>
            </div>
          </div>

          {/* Localization & Units */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider">
              Localization & Units
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-500 dark:text-slate-400 mb-1">
                  Weight Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-sage/40"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 dark:text-slate-400 mb-1">
                  Language Style
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'taglish' | 'en')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-sage/40"
                >
                  <option value="taglish">Taglish (Pinoy)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-slate-800 flex justify-end gap-3 bg-stone-50/50 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-bold text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-brand-sage text-white text-xs font-bold shadow-md hover:bg-brand-sage/90 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

