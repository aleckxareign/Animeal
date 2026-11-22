import type { Pet, ChatAction } from '../../types'
import { findAnswer, defaultResponse } from '../../data/mealie-kb'

export type MealieResponse = {
  content: string
  severity: 'info' | 'caution' | 'emergency'
  actions: ChatAction[]
}

// Extra Filipino & specific veterinary topics that augment the static KB
const extendedTopics: Array<{
  keywords: string[]
  severity: 'info' | 'caution' | 'emergency'
  answer: string
  actions?: ChatAction[]
}> = [
  {
    keywords: [
      'paracetamol',
      'biogesic',
      'panadol',
      'tylenol',
      'ibuprofen',
      'advil',
      'mefenamic',
      'gamot ng tao',
    ],
    severity: 'emergency',
    answer:
      '🚨 **CRITICAL WARNING: Human pain relievers (Paracetamol, Ibuprofen, Aspirin) are extremely toxic and fatal to dogs and cats!**\n\nEven a tiny fraction of a 500mg tablet can cause acute liver failure, kidney damage, and destroy red blood cells (especially fatal in cats within hours).\n\n**Action Needed NOW:**\n1. Do NOT induce vomiting unless instructed by a vet.\n2. Bring your pet to an emergency veterinary hospital immediately.\n3. Bring the medicine box or foil wrapper so the vet knows the exact dosage.',
    actions: [
      { label: '🚨 Find Emergency Vet Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '📞 What else is toxic?', type: 'chip', value: 'What human foods are toxic to pets?' },
    ],
  },
  {
    keywords: ['heatstroke', 'init', 'sobrang init', 'hinihingal', 'panting', 'stroke', 'overheat'],
    severity: 'emergency',
    answer:
      '🚨 **Heatstroke Warning in Pets (Sobrang Init):**\n\nPhilippine tropical heat can cause heatstroke very quickly. High-risk signs include:\n• Heavy panting or gasping for air\n• Bright red, dark purple, or pale gums\n• Thick, sticky saliva or drooling\n• Dizziness, unsteadiness, or collapse\n\n**Emergency First Aid:**\n1. Move pet immediately to a cool, shaded, or air-conditioned room.\n2. Wet their paws, belly, and neck with **room-temperature water** (NEVER ice water or ice baths, which cause vascular shock!).\n3. Turn on an electric fan directed at them.\n4. Rush to the nearest vet clinic right away.',
    actions: [
      { label: '🚨 Find Emergency Vet Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '💧 Pet Water Needs', type: 'chip', value: 'How much water does my pet need?' },
    ],
  },
  {
    keywords: [
      'kailan dapat dalhin sa vet',
      'dalhin sa vet',
      'when to see a vet',
      'when to go to vet',
      'puntang vet',
      'emergency ba',
    ],
    severity: 'caution',
    answer:
      '🏥 **When should you bring your pet to the vet? (Kailan dapat magpa-vet):**\n\n**🚨 RED FLAGS (Emergency — Visit a clinic IMMEDIATELY):**\n• Suspected poisoning (chocolate, lilies, paracetamol, rat poison)\n• Difficulty breathing, gasping, or pale/blue gums\n• Continuous vomiting or bloody diarrhea\n• Inability to stand, seizures, or loss of consciousness\n• Straining but unable to urinate (especially male cats!)\n\n**⚠️ YELLOW FLAGS (Visit within 24–48 hours):**\n• Skipping food or water for more than 24 hours\n• Persistent itching, redness, ear discharge\n• Limping or sudden behavioral changes',
    actions: [
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      { label: '📋 View Wellness Tracker', type: 'link', value: '/pet-wellness' },
    ],
  },
  {
    keywords: ['fruit', 'prutas', 'mansanas', 'apple', 'banana', 'saging', 'pakwan', 'watermelon', 'safe fruit'],
    severity: 'info',
    answer:
      '🍎 **Safe Fruits for Pets (in moderation as treats):**\n\n✅ **SAFE:**\n• **Apples (Mansanas):** Slice without seeds or core (seeds contain cyanide).\n• **Bananas (Saging):** Great occasional treat rich in potassium.\n• **Watermelon (Pakwan):** Hydrating and sweet (remove rind and seeds).\n• **Papaya & Mango:** Safe in bite-sized pieces without skin or pit.\n\n❌ **DANGEROUS / TOXIC:**\n• **Grapes & Raisins (Ubas):** Cause acute kidney failure!\n• **Avocado:** Persin and large pit risk.\n• **Cherries & Plums:** Pits are toxic choking hazards.',
    actions: [
      { label: '🍲 Explore Food Library', type: 'link', value: '/food-library' },
      { label: '🍫 Is chocolate safe?', type: 'chip', value: 'Is chocolate safe for dogs?' },
    ],
  },
  {
    keywords: ['affordable', 'mura', 'budget', 'presyo', 'tipid', 'cheap food', 'best affordable'],
    severity: 'info',
    answer:
      '💡 **Choosing Affordable & Nutritious Pet Food (Tipid Tips):**\n\n1. **Check Price-per-Calorie (₱/kcal):** Some budget kibbles have low nutrient density, meaning you need to feed double portions. Animeal calculates price-per-calorie automatically in the Food Library!\n2. **Look for Real Animal Protein:** The first 2 ingredients should clearly state poultry or meat (e.g., chicken meal, deboned salmon).\n3. **Buy in Bigger Bags (Bulk):** 10–15 kg sacks save 20–35% compared to small 1 kg pouches.\n4. **Supplement with Safe Budget Whole Foods:** Boil cheap chicken liver, squash (kalabasa), or carrots with rice as nutrient-dense meal toppers.',
    actions: [
      { label: '🔍 Compare Foods in Library', type: 'link', value: '/food-library' },
      { label: '📊 Track Meal Expenses', type: 'link', value: '/meal-tracker' },
    ],
  },
  {
    keywords: ['bakuna', 'vaccine', 'vaccination', 'deworm', 'purga', 'anti-rabies', '5-in-1', '4-in-1'],
    severity: 'info',
    answer:
      '💉 **Essential Philippine Pet Healthcare Schedule:**\n\n🐶 **Puppies & Dogs:**\n• **Deworming (Purga):** Starts at 2, 4, 6, 8 weeks, then monthly until 6 months, then every 3 months.\n• **Core Vaccines (5-in-1 / 6-in-1 / 8-in-1):** First shot at 6–8 weeks, booster every 3–4 weeks (3 shots total), then yearly.\n• **Anti-Rabies:** Mandatory at 3–4 months old, renewed annually.\n\n🐱 **Kittens & Cats:**\n• **4-in-1 Vaccine:** Starts at 8 weeks, booster 3–4 weeks later, then yearly.\n• **Anti-Rabies:** At 3–4 months old, then yearly.',
    actions: [
      { label: '🏥 Find Nearby Veterinary Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🗓️ Schedule Reminder', type: 'link', value: '/pet-wellness' },
    ],
  },
]

/**
 * Generate a smart, context-aware answer from Mealie.
 */
export function generateMealieAnswer(
  query: string,
  pet: Pet | null,
): MealieResponse {
  const cleanQuery = query.trim().toLowerCase()

  // 1. Check extended topics first (priority matches for high-risk or specific queries)
  for (const topic of extendedTopics) {
    if (topic.keywords.some((kw) => cleanQuery.includes(kw.toLowerCase()))) {
      let content = topic.answer
      if (pet) {
        content = personalizeResponse(content, pet, cleanQuery)
      }
      return {
        content,
        severity: topic.severity,
        actions: topic.actions ?? [
          { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
        ],
      }
    }
  }

  // 2. Check standard KB
  const kbMatch = findAnswer(cleanQuery)
  if (kbMatch) {
    let content = kbMatch.answer
    if (pet) {
      content = personalizeResponse(content, pet, cleanQuery)
    }

    const actions: ChatAction[] = []
    if (kbMatch.severity === 'emergency') {
      actions.push({
        label: '🚨 Find Emergency Vet Clinic',
        type: 'link',
        value: '/#nearby-vets',
      })
      actions.push({
        label: '📞 Emergency Red Flags',
        type: 'chip',
        value: 'Kailan dapat dalhin sa vet?',
      })
    } else if (
      cleanQuery.includes('food') ||
      cleanQuery.includes('portion') ||
      cleanQuery.includes('kain') ||
      cleanQuery.includes('magkano') ||
      cleanQuery.includes('calor')
    ) {
      actions.push({
        label: '🍲 View Food Library',
        type: 'link',
        value: '/food-library',
      })
      actions.push({
        label: '📝 Log a Meal',
        type: 'link',
        value: '/meal-tracker',
      })
    } else {
      actions.push({
        label: '🏥 Find Nearby Vets',
        type: 'link',
        value: '/#nearby-vets',
      })
      actions.push({
        label: '💧 Wellness & Vitals',
        type: 'link',
        value: '/pet-wellness',
      })
    }

    return {
      content,
      severity: (kbMatch.severity as 'info' | 'caution' | 'emergency') || 'info',
      actions,
    }
  }

  // 3. Fallback answer enriched with Pet context
  let fallbackText = defaultResponse
  if (pet) {
    fallbackText = `Hi there! I hear you asking about your pet. 🐾\n\nI'm Mealie, your AI Pet Nutrition & Care Assistant! While I don't have a direct answer for "${query.slice(0, 60)}${query.length > 60 ? '...' : ''}", here is helpful advice for **${pet.name}**:\n\n• **Species & Breed:** ${pet.avatarEmoji} ${pet.breed || pet.species}\n• **Current Weight:** ${pet.weight} kg (${pet.lifeStage} stage)\n• **Daily Calorie Target:** ~${pet.dailyCalorieTarget} kcal/day\n• **Daily Hydration Goal:** ~${pet.waterGoal} ml\n\nTry asking me about specific foods (e.g., "Can dogs eat banana?"), portion guidelines, common symptoms (e.g., "vomiting", "itching"), or veterinary emergencies!`
  }

  return {
    content: fallbackText,
    severity: 'info',
    actions: [
      { label: '🍫 Is chocolate safe?', type: 'chip', value: 'Is chocolate safe for dogs?' },
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
    ],
  }
}

function personalizeResponse(
  text: string,
  pet: Pet,
  cleanQuery: string,
): string {
  // If the question is about portions, feeding amounts, calories, or water
  const isFeedingQuestion =
    cleanQuery.includes('how much') ||
    cleanQuery.includes('portion') ||
    cleanQuery.includes('serving') ||
    cleanQuery.includes('magkano') ||
    cleanQuery.includes('gaano') ||
    cleanQuery.includes('calor')

  const isWaterQuestion =
    cleanQuery.includes('water') ||
    cleanQuery.includes('tubig') ||
    cleanQuery.includes('hydration') ||
    cleanQuery.includes('inom')

  if (isFeedingQuestion) {
    const lifeStageNote =
      pet.lifeStage === 'puppy' || pet.lifeStage === 'kitten'
        ? `\n• As a **${pet.lifeStage}**, ${pet.name} is in an active growth phase! Divide food into 3–4 smaller meals a day with high protein and DHA.`
        : pet.lifeStage === 'senior'
          ? `\n• As a **senior**, ${pet.name} benefits from easy-to-digest proteins, joint supplements, and controlled phosphorus.`
          : `\n• Divide their meals into 2 balanced servings per day to maintain ideal body condition.`

    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 **Personalized Calculation for ${pet.name} (${pet.avatarEmoji} ${pet.species}, ${pet.weight} kg):**\n• **Estimated Daily Energy (RER/MER):** ~${pet.dailyCalorieTarget} kcal/day\n• **Suggested Daily Water:** ~${pet.waterGoal} ml${lifeStageNote}`
  }

  if (isWaterQuestion) {
    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━\n💧 **Hydration Target for ${pet.name}:**\nBased on ${pet.name}'s current weight of **${pet.weight} kg**, aim for approximately **${pet.waterGoal} ml of fresh water daily**.`
  }

  return text
}
