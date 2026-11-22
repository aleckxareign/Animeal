import type { Species, LifeStage } from '../types'

/**
 * Resting Energy Requirement (RER) = 70 × (body weight in kg)^0.75
 * This is a standard veterinary formula.
 */
export function calculateRER(weightKg: number): number {
  if (weightKg <= 0) return 0
  return 70 * Math.pow(weightKg, 0.75)
}

/**
 * Daily Energy Requirement (DER) = RER × life-stage multiplier.
 * Multipliers are approximate ranges from veterinary guidelines.
 * A disclaimer should always be shown that actual needs may vary.
 */
export function getLifeStageMultiplier(
  species: Species,
  lifeStage: LifeStage,
  neutered: boolean,
): number {
  if (species === 'dog') {
    switch (lifeStage) {
      case 'puppy':
        return 2.0
      case 'adult':
        return neutered ? 1.6 : 1.8
      case 'senior':
        return 1.4
      default:
        return 1.6
    }
  } else {
    switch (lifeStage) {
      case 'kitten':
        return 2.5
      case 'adult':
        return neutered ? 1.2 : 1.4
      case 'senior':
        return 1.1
      default:
        return 1.2
    }
  }
}

export function calculateDailyCalories(
  weightKg: number,
  species: Species,
  lifeStage: LifeStage,
  neutered: boolean,
): number {
  const rer = calculateRER(weightKg)
  const multiplier = getLifeStageMultiplier(species, lifeStage, neutered)
  return Math.round(rer * multiplier)
}

/**
 * Estimate daily water goal: roughly 50 ml per kg body weight.
 */
export function calculateWaterGoal(weightKg: number): number {
  return Math.round(weightKg * 50)
}

/**
 * Calculate calories from a portion of food.
 */
export function caloriesFromPortion(
  caloriesPer100g: number,
  portionGrams: number,
): number {
  return Math.round((caloriesPer100g * portionGrams) / 100)
}

/**
 * Calculate price per 100 kcal for comparison shopping.
 */
export function pricePerCalorie(
  price: number,
  packageSizeG: number,
  caloriesPer100g: number,
): number | null {
  if (price <= 0 || packageSizeG <= 0 || caloriesPer100g <= 0) return null
  const totalCalories = (caloriesPer100g * packageSizeG) / 100
  return price / totalCalories
}

/**
 * Get a suggested life stage from age in months and species.
 */
export function suggestLifeStage(
  species: Species,
  ageMonths: number,
): LifeStage {
  if (species === 'dog') {
    if (ageMonths < 12) return 'puppy'
    if (ageMonths >= 84) return 'senior' // ~7 years
    return 'adult'
  } else {
    if (ageMonths < 12) return 'kitten'
    if (ageMonths >= 132) return 'senior' // ~11 years
    return 'adult'
  }
}

