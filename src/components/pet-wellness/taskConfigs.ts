import {
  Utensils,
  Droplets,
  Pill,
  Sparkles,
  Footprints,
  Scale,
  ShieldAlert,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react'
import type { TaskType } from '../../types'

export type TaskTypeConfig = {
  label: string
  icon: typeof Utensils
  defaultTitle: string
  badgeBg: string
  badgeText: string
  activeRing: string
}

export const TASK_TYPE_CONFIGS: Record<TaskType, TaskTypeConfig> = {
  feeding: {
    label: 'Feeding',
    icon: Utensils,
    defaultTitle: 'Meal Time',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    activeRing: 'ring-amber-500',
  },
  water: {
    label: 'Water',
    icon: Droplets,
    defaultTitle: 'Fresh Water Refill',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    activeRing: 'ring-cyan-500',
  },
  medication: {
    label: 'Medication',
    icon: Pill,
    defaultTitle: 'Give Medication / Supplement',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    activeRing: 'ring-rose-500',
  },
  grooming: {
    label: 'Grooming',
    icon: Sparkles,
    defaultTitle: 'Brushing & Bath',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    activeRing: 'ring-purple-500',
  },
  exercise: {
    label: 'Exercise',
    icon: Footprints,
    defaultTitle: 'Walk & Playtime',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    activeRing: 'ring-emerald-500',
  },
  'weight-check': {
    label: 'Weight Check',
    icon: Scale,
    defaultTitle: 'Weigh-in Check',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    activeRing: 'ring-indigo-500',
  },
  vaccination: {
    label: 'Vaccination',
    icon: ShieldAlert,
    defaultTitle: 'Vaccine Booster',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    activeRing: 'ring-blue-500',
  },
  'vet-appointment': {
    label: 'Vet Visit',
    icon: Stethoscope,
    defaultTitle: 'Vet Consultation',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    activeRing: 'ring-teal-500',
  },
  deworming: {
    label: 'Deworming',
    icon: ShieldCheck,
    defaultTitle: 'Deworming Dose',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    activeRing: 'ring-orange-500',
  },
}
