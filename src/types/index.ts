import type { LucideIcon } from 'lucide-react'

// ===== Landing page types =====
export type Feature = {
  title: string
  description: string
  linkLabel: string
  to: string
  icon: LucideIcon
}

// ===== Pet types =====
export type Species = 'dog' | 'cat'
export type LifeStage = 'puppy' | 'kitten' | 'adult' | 'senior'
export type DietaryPreference = 'any' | 'wet_only' | 'dry_only' | 'home_cooked' | 'picky'

export type Pet = {
  id: string
  name: string
  species: Species
  breed: string
  weight: number
  age: number
  neutered: boolean
  sex?: 'male' | 'female' | 'unknown'
  lifeStage: LifeStage
  avatarEmoji: string
  dailyCalorieTarget: number
  dietaryPreference?: DietaryPreference
  preferredFoods?: string[]
  avoidedFoods?: string[]
  waterGoal: number
  createdAt: string
}

// ===== Food types =====
export type FoodCategory = 'dry' | 'wet' | 'treat' | 'raw' | 'homemade'

export type FoodItem = {
  id: string
  name: string
  brand: string
  species: Species[]
  category: FoodCategory
  lifeStageSuitability: LifeStage[]
  caloriesPer100g: number
  protein: number
  fat: number
  fiber: number
  moisture: number
  servingSize: number
  servingUnit: string
  price: number
  packageSize: number
  pricePerCalorie?: number
  verified: boolean
  isCustom?: boolean
}

// ===== Feeding types =====
export type PortionUnit = 'g' | 'scoop' | 'can' | 'piece' | 'cup' | 'tbsp'

export type FeedingEntry = {
  id: string
  petId: string
  foodId: string
  foodName: string
  portion: number
  unit: PortionUnit
  calories: number
  protein: number
  fat: number
  fiber: number
  fedBy: string
  timestamp: string
  undone?: boolean
}

// ===== Wellness types =====
export type WaterLog = {
  id: string
  petId: string
  amount: number
  timestamp: string
}

export type WeightLog = {
  id: string
  petId: string
  weight: number
  date: string
  notes?: string
}

// ===== Schedule types =====
export type TaskType =
  | 'feeding'
  | 'water'
  | 'medication'
  | 'grooming'
  | 'exercise'
  | 'weight-check'
  | 'vaccination'
  | 'vet-appointment'
  | 'deworming'

export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly'

export type ScheduleTask = {
  id: string
  petId: string
  type: TaskType
  title: string
  notes?: string
  frequency: TaskFrequency
  time: string
  dueDate: string
  completed: boolean
  completedBy?: string
  completedAt?: string
  snoozedUntil?: string
  createdAt: string
  assignedTo?: string
}

// ===== Household types =====
export type HouseholdMember = {
  id: string
  name: string
  color: string
  isOwner: boolean
  role?: 'owner' | 'admin' | 'caregiver' | 'sitter'
  email?: string
  status?: 'active' | 'invited'
  avatarUrl?: string
}

export type HouseholdInvitation = {
  id: string
  email: string
  role: 'admin' | 'caregiver' | 'sitter'
  invitedAt: string
  invitedBy: string
  status: 'pending' | 'accepted' | 'declined'
}

// ===== Chat types =====
export type ChatMessage = {
  id: string
  role: 'user' | 'mealie'
  content: string
  timestamp: string
  actions?: ChatAction[]
}

export type ChatAction = {
  label: string
  type: 'link' | 'chip'
  value: string
}

// ===== Vet types =====
export type Vet = {
  id: number | string
  name: string
  address: string
  city: string
  phone: string
  distance: string
  distanceKm?: number
  latitude?: number
  longitude?: number
  emergency: boolean
  openNow: boolean
  hours?: string
  services?: string[]
  rating?: number
  verified?: boolean
}

// ─── Pet Profile (used for AI context) ─────────────────────────
export type PetProfile = {
  name: string
  species: 'dog' | 'cat'
  breed: string
  ageMonths: number
  weightKg: number
  lifeStage?: string
  neutered?: boolean
  dailyCalorieTarget?: number
  dietaryPreference?: string
  preferredFoods?: string[]
  avoidedFoods?: string[]
}

// ─── Chat types ────────────────────────────────────────────────
export type GeminiChatRole = 'user' | 'assistant'

export type GeminiChatMessage = {
  role: GeminiChatRole
  text: string
  timestamp: number
}

// ===== Scanner types =====
export type ScanResult = {
  productName: string
  product?: string
  brand: string
  calories: number | null
  caloriesPer100g?: number | null
  protein: number | null
  crudeProteinPct?: number | null
  fat: number | null
  crudeFatPct?: number | null
  fiber: number | null
  crudeFiberPct?: number | null
  moisture: number | null
  moisturePct?: number | null
  packageWeight: number | null
  price: number | null
  confidence: 'high' | 'medium' | 'low'
  isFoodItem?: boolean
  detectedCategory?: 'pet_food_label' | 'whole_or_human_food' | 'unrelated_image'
  suitability?: 'safe' | 'caution' | 'unsafe' | 'unknown'
  suitabilityNote?: string
  ingredients?: string[]
}

export type FoodVerdict = 'good' | 'okay' | 'review'

// ===== Toast types =====
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  message: string
  type: ToastType
  duration?: number
}
