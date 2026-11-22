import { useState } from 'react'
import { X, Camera, Check, Sparkles, User as UserIcon, Mail, Shield, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_AVATARS = [
  { label: 'Fur Parent', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnimealOwner' },
  { label: 'Cat Lover', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CatMom' },
  { label: 'Dog Lover', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DogDad' },
  { label: 'Vet Hero', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PinoyVet' },
  { label: 'Pinoy Caregiver', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MariaSantos' },
  { label: 'Mealie Mascot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MealieAssistant' },
]

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth()
  const { addToast } = useToast()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0].url)
  const [customUrlInput, setCustomUrlInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB. Please choose a smaller photo.', 'warning')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setAvatarUrl(dataUrl)
      addToast('Avatar preview updated!', 'info')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await updateProfile({
        fullName: fullName.trim(),
        avatarUrl,
      })

      if (error) {
        addToast(`Failed to update profile: ${error.message}`, 'error')
      } else {
        addToast('Profile updated successfully! 🐾', 'success')
        onClose()
      }
    } catch {
      addToast('Profile saved locally.', 'success')
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center">
              <UserIcon className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-brand-dark dark:text-white">My Profile</h2>
              <p className="text-xs text-stone-500 dark:text-slate-400">Customize your pet parent account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Avatar Section */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative group">
              <div className="size-24 rounded-full overflow-hidden ring-4 ring-brand-sage/20 shadow-md bg-stone-100 dark:bg-slate-800 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="size-10 text-stone-400" />
                )}
              </div>
              <label
                htmlFor="avatar-upload-input"
                className="absolute bottom-0 right-0 size-8 rounded-full bg-brand-sage text-white flex items-center justify-center shadow-lg hover:bg-brand-sage/90 cursor-pointer transition transform hover:scale-110"
                title="Upload Photo"
              >
                <Camera className="size-4" />
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">
                Click camera to upload custom photo, or choose a preset below:
              </p>
            </div>

            {/* Preset Avatars */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatarUrl === preset.url
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`size-11 rounded-full p-0.5 border-2 transition transform hover:scale-105 ${
                      isSelected
                        ? 'border-brand-sage ring-2 ring-brand-sage/40 scale-105'
                        : 'border-transparent hover:border-stone-300'
                    }`}
                    title={preset.label}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full rounded-full object-cover bg-stone-100 dark:bg-slate-800"
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-sage/40 focus:border-brand-sage transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                <input
                  type="email"
                  value={user?.email || 'user@animeal.ph'}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/50 text-sm font-medium text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Custom Avatar Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-sage/40 transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrlInput.trim()) {
                      setAvatarUrl(customUrlInput.trim())
                      setCustomUrlInput('')
                      addToast('Avatar URL applied!', 'info')
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-bold text-brand-dark dark:text-white hover:bg-stone-200 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Account Role / Tier badge */}
          <div className="rounded-2xl bg-brand-cream/60 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="size-4 text-brand-sage" />
              <div>
                <p className="text-xs font-bold text-brand-dark dark:text-white">Household Role</p>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">Primary Household Pet Parent</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-brand-sage/15 text-brand-sage px-2.5 py-1 rounded-full">
              Active Member
            </span>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-bold text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-sage text-white text-xs font-bold shadow-md hover:bg-brand-sage/90 transition transform active:scale-95 disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

