import { useState } from 'react'
import {
  Users,
  UserPlus,
  Utensils,
  Droplets,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Mail,
  Trash2,
  Calendar,
  Activity,
  HeartHandshake,
  AlertCircle,
  Share2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { timeAgo, formatDateTime, isToday } from '../utils/formatters'
import type { HouseholdMember, HouseholdInvitation } from '../types'

export default function HouseholdPage() {
  const { pets, household, addMember, removeMember, feedingLog, tasks, logFeeding } = useApp()
  const { addToast } = useToast()

  const [householdName, setHouseholdName] = useState('Santos Family Pet Care')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'caregiver' | 'sitter'>('caregiver')
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeFeeder, setActiveFeeder] = useState<string>(household[0]?.name || 'Me')

  // Sample pending invitations to accept/reject
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([
    {
      id: 'inv-1',
      email: 'ate.cathy@gmail.com',
      role: 'caregiver',
      invitedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      invitedBy: household[0]?.name || 'Me',
      status: 'pending',
    },
  ])

  // Quick Feed action for the primary pet
  const primaryPet = pets[0]

  const handleQuickFeed = () => {
    if (!primaryPet) return
    logFeeding({
      petId: primaryPet.id,
      foodId: 'quick-feed',
      foodName: 'Standard Meal Portion',
      portion: primaryPet.species === 'cat' ? 45 : 90,
      unit: 'g',
      fedBy: activeFeeder,
    })
    addToast(`Napakain na si ${primaryPet.name} ni ${activeFeeder}! Busog na siya 🐾`, 'success')
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    const newInv: HouseholdInvitation = {
      id: `inv-${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      invitedAt: new Date().toISOString(),
      invitedBy: household[0]?.name || 'Me',
      status: 'pending',
    }

    setInvitations((prev) => [newInv, ...prev])
    addMember(inviteEmail.split('@')[0])
    addToast(`Invitation sent to ${inviteEmail}!`, 'success')
    setInviteEmail('')
    setIsInviteModalOpen(false)
  }

  const handleAcceptInvitation = (id: string) => {
    const inv = invitations.find((i) => i.id === id)
    if (inv) {
      addMember(inv.email.split('@')[0])
      setInvitations((prev) => prev.filter((i) => i.id !== id))
      addToast(`Joined household from invitation!`, 'success')
    }
  }

  const handleRejectInvitation = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id))
    addToast('Invitation declined.', 'info')
  }

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/household?invite=animeal-family-${Date.now().toString(36)}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    addToast('Household invite link copied to clipboard! 📋', 'success')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Combined Household Activity Timeline
  const recentActivities = [
    ...feedingLog.slice(0, 8).map((f) => ({
      id: f.id,
      type: 'feeding',
      title: `${f.foodName} (${f.portion}${f.unit})`,
      performedBy: f.fedBy || 'Household Member',
      timestamp: f.timestamp,
      petName: pets.find((p) => p.id === f.petId)?.name || 'Pet',
    })),
    ...tasks
      .filter((t) => t.completed && t.completedAt)
      .slice(0, 8)
      .map((t) => ({
        id: t.id,
        type: 'task',
        title: t.title,
        performedBy: t.completedBy || 'Me',
        timestamp: t.completedAt!,
        petName: pets.find((p) => p.id === t.petId)?.name || 'Pet',
      })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="min-h-screen bg-brand-cream/30 dark:bg-slate-950 py-10 px-4 sm:px-8 lg:px-12 transition-colors">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-sage/10 dark:bg-brand-sage/20 px-3.5 py-1 text-xs font-bold text-brand-sage mb-2">
              <Users className="size-3.5" />
              <span>Collaborative Pet Care Platform</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
              Shared Household Management
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-slate-400 mt-1">
              Share pet care responsibilities with family members, roommates, and pet sitters to prevent double-feeding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="flex items-center gap-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-brand-dark dark:text-white hover:bg-stone-50 dark:hover:bg-slate-800 transition"
            >
              {copiedLink ? <Check className="size-4 text-brand-sage" /> : <Copy className="size-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-brand-sage px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-sage/90 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus className="size-5" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Household Status & Quick Feed Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Household Info Card */}
          <div className="lg:col-span-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-sage">
                  Active Household
                </span>
                <h2 className="font-display text-2xl font-bold text-brand-dark dark:text-white mt-0.5">
                  {householdName}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online & Synced</span>
              </span>
            </div>

            {/* Quick Feeder Action Bar */}
            <div className="rounded-2xl bg-brand-cream/60 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-brand-dark dark:text-white flex items-center gap-2">
                    <Utensils className="size-4 text-brand-sage" />
                    <span>Quick "Napakain Ko Na!" Logger</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                    Select your name and tap feed to notify everyone in the household instantly.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">Ako si:</span>
                  <select
                    value={activeFeeder}
                    onChange={(e) => setActiveFeeder(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-brand-dark dark:text-white"
                  >
                    {household.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} {m.isOwner ? '(Ikaw)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickFeed}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-brand-sage text-white font-bold text-sm shadow-md hover:bg-brand-sage/90 transition transform active:scale-98"
              >
                <Sparkles className="size-4" />
                <span>Napakain ko na si {primaryPet?.name || 'Pet'}! 🐾</span>
              </button>
            </div>

            {/* Shared Pet Profiles in Household */}
            <div>
              <h3 className="text-xs font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                Shared Pets in this Household ({pets.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pet.avatarEmoji}</span>
                      <div>
                        <p className="text-sm font-bold text-brand-dark dark:text-white">{pet.name}</p>
                        <p className="text-xs text-stone-500 dark:text-slate-400">
                          {pet.species} • {pet.breed} ({pet.weight} kg)
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-brand-sage bg-brand-sage/10 px-2 py-0.5 rounded-md">
                      Shared ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members & Roles Column */}
          <div className="lg:col-span-5 rounded-3xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-brand-dark dark:text-white">Household Members</h3>
                <p className="text-xs text-stone-500 dark:text-slate-400">Roles and care permissions</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300">
                {household.length} active
              </span>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {household.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: member.color || '#44632f' }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-brand-dark dark:text-white">{member.name}</p>
                        {member.isOwner && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-slate-400">
                        {member.role ? member.role.toUpperCase() : member.isOwner ? 'Primary Caregiver' : 'Caregiver'}
                      </p>
                    </div>
                  </div>

                  {!member.isOwner && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="size-8 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition"
                      title="Remove member"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
              <div className="pt-4 border-t border-stone-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                  Pending Invitations ({invitations.length})
                </h4>
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-brand-dark dark:text-white">{inv.email}</p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300">
                        Role: {inv.role} • Invited {timeAgo(inv.invitedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAcceptInvitation(inv.id)}
                        className="px-2.5 py-1 rounded-lg bg-brand-sage text-white text-xs font-bold shadow-xs hover:bg-brand-sage/90"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectInvitation(inv.id)}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 text-xs font-bold hover:bg-white"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Collaborative Household Activity History */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-brand-sage" />
                <h3 className="font-bold text-xl text-brand-dark dark:text-white">Household Activity Log</h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                Real-time chronological feed of feeding logs and care task completions.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-sage bg-brand-sage/10 px-3 py-1 rounded-full">
              Live Updates
            </span>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-slate-400 text-center py-8">
                No recent activity logged yet. Log a meal or complete a task above!
              </p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 dark:border-slate-800 bg-stone-50/40 dark:bg-slate-800/30 hover:bg-white transition shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-brand-sage/15 text-brand-sage flex items-center justify-center">
                      {act.type === 'feeding' ? <Utensils className="size-4" /> : <CheckCircle2 className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark dark:text-white">
                        {act.title} for <span className="text-brand-sage">{act.petName}</span>
                      </p>
                      <p className="text-xs text-stone-500 dark:text-slate-400">
                        Performed by <strong className="text-brand-dark dark:text-white">{act.performedBy}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-stone-400 dark:text-slate-500">
                    {timeAgo(act.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & RLS Compliance Notice */}
        <div className="rounded-2xl border border-brand-sage/20 bg-brand-sage/5 p-4 flex items-center gap-3">
          <ShieldCheck className="size-5 text-brand-sage shrink-0" />
          <p className="text-xs text-brand-dark/80 dark:text-slate-300">
            <strong>Row Level Security (RLS) Active:</strong> All household members share authorized access to feeding logs and health records through Supabase Cloud. Unauthorized third parties cannot view your pet profiles.
          </p>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-brand-dark dark:text-white flex items-center gap-2">
                <UserPlus className="size-5 text-brand-sage" />
                <span>Invite Household Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="size-8 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address or Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. maria.santos@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-sage/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Household Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-dark dark:text-white"
                >
                  <option value="caregiver">Caregiver (Can log feeding & complete tasks)</option>
                  <option value="admin">Family Admin (Full pet & schedule edit permissions)</option>
                  <option value="sitter">Guest / Pet Sitter (Temporary feeding logger)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-sage text-white text-xs font-bold shadow-md hover:bg-brand-sage/90"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

