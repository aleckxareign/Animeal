import { CalendarDays, BookOpen, ScanLine, HeartPulse } from 'lucide-react'
import type { Feature } from '../types'

export const features: Feature[] = [
  {
    title: 'Meal Tracker',
    description: 'Log meals, record food portions, and review feeding history.',
    linkLabel: 'Log a meal',
    to: '/meal-tracker',
    icon: CalendarDays,
  },
  {
    title: 'Food Library',
    description: 'Explore pet foods, compare products, and check ingredients and nutrition.',
    linkLabel: 'Explore pet foods',
    to: '/food-library',
    icon: BookOpen,
  },
  {
    title: 'Food Scanner',
    description: 'Scan or upload food labels to understand ingredients and nutritional details.',
    linkLabel: 'Scan a food label',
    to: '/food-scanner',
    icon: ScanLine,
  },
  {
    title: 'Pet Wellness',
    description: 'Track weight, hydration, health records, and care reminders.',
    linkLabel: 'View wellness records',
    to: '/pet-wellness',
    icon: HeartPulse,
  },
]