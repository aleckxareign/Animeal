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