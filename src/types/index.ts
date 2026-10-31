import type { LucideIcon } from 'lucide-react'

export type Feature = {
  title: string
  description: string
  linkLabel: string
  to: string
  icon: LucideIcon
}

export type Vet = {
  id: number
  name: string
  address: string
  phone: string
  distance: string
  emergency: boolean
  openNow: boolean
}

// ─── Pet Profile (used for AI context) ─────────────────────────
export type PetProfile = {
  name: string
  species: 'dog' | 'cat'
  breed: string
  ageMonths: number
  weightKg: number
}

// ─── Chat types ────────────────────────────────────────────────
export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  text: string
  timestamp: number
}

// ─── Food Scanner result ───────────────────────────────────────
export type ScanResult = {
  brand: string
  product: string
  caloriesPer100g: number | null
  crudeProteinPct: number | null
  crudeFatPct: number | null
  crudeFiberPct: number | null
  moisturePct: number | null
  suitability: 'safe' | 'caution' | 'unsafe' | 'unknown'
  suitabilityNote: string
  ingredients: string[]
}
