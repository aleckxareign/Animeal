/**
 * gemini.ts – Thin wrapper around the @google/genai SDK.
 *
 * ► Chat  – askMealie()   → Taglish pet-nutrition assistant
 * ► Scan  – scanLabel()   → Multimodal food-packaging analyser
 *
 * All Gemini calls happen client-side via the browser SDK so we
 * don't need a Node backend for the prototype.  The API key is
 * read from the VITE_GEMINI_API_KEY env-var (set in .env).
 */

import { GoogleGenAI, Type } from '@google/genai'
import type { GeminiChatMessage as ChatMessage, PetProfile, ScanResult } from '../types'

// ─── Client singleton ──────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

function getClient(): GoogleGenAI {
  if (!API_KEY) {
    throw new Error(
      'VITE_GEMINI_API_KEY is not set. Copy .env.example → .env and add your key.',
    )
  }
  return new GoogleGenAI({ apiKey: API_KEY })
}

// ─── Model config ──────────────────────────────────────────────
const CHAT_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
]
const VISION_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
]

// ─── System prompt (Ask Mealie) ────────────────────────────────
function buildChatSystemPrompt(pet?: PetProfile): string {
  const petCtx = pet
    ? `\nActive pet profile:\n- Name: ${pet.name}\n- Species: ${pet.species}\n- Breed: ${pet.breed}\n- Age: ${pet.ageMonths} months\n- Weight: ${pet.weightKg} kg${pet.lifeStage ? `\n- Life stage: ${pet.lifeStage}` : ''}${pet.neutered !== undefined ? `\n- Neutered: ${pet.neutered ? 'Yes' : 'No'}` : ''}${pet.dailyCalorieTarget ? `\n- Daily calorie target: ${pet.dailyCalorieTarget} kcal` : ''}${pet.dietaryPreference && pet.dietaryPreference !== 'any' ? `\n- Dietary preference: ${pet.dietaryPreference.replace('_', ' ')}` : ''}${pet.preferredFoods?.length ? `\n- Preferred/favorite foods: ${pet.preferredFoods.join(', ')}` : ''}${pet.avoidedFoods?.length ? `\n- Foods to avoid: ${pet.avoidedFoods.join(', ')}` : ''}\nAlways tailor portion sizes, food choices, and recommendations to this pet's specific needs. Respect their dietary preferences and avoid suggesting foods they don't like.`
    : '\nNo active pet profile is provided. Give general safe pet nutrition advice. Before estimating specific portions or calorie targets, ask the user what species and approximate weight their pet is. NEVER assume a placeholder pet name like "Bantay" or any default profile.'

  return `You are **Mealie**, the friendly AI assistant for **Animeal** — a Filipino pet-care platform.

LANGUAGE RULES:
• Respond in **Taglish** (mixed Tagalog + English) by default.
• If the user writes in pure English, reply in English but keep a warm, casual Filipino tone.
• Keep answers clear and concise (2–4 short paragraphs or bullet points max, under 200 words unless the user asks for detail).

PET SAFETY GUARDRAILS (STRICT — never override):
1. TOXIC FOOD LIST — if the user mentions ANY of these foods for a dog or cat, immediately flag them as TOXIC/DANGEROUS and give first-aid guidance:
   Dogs: chocolate, grapes, raisins, onions, garlic, xylitol/birch sugar, macadamia nuts, avocado, alcohol, caffeine, cooked bones, raw yeast dough.
   Cats: all of the above PLUS lilies, raw fish (thiaminase), milk/dairy (most cats are lactose-intolerant).
2. Never recommend a specific commercial brand as "the best". You may compare nutrient profiles objectively.
3. If the user describes symptoms of poisoning or a medical emergency, tell them to visit a veterinarian IMMEDIATELY and provide the Philippine Animal Welfare Society (PAWS) hotline: (02) 8475-1688.
4. Do NOT provide dosage for any medication. Always defer to a licensed vet.

PERSONALITY:
• Friendly, supportive, slightly playful 🐾
• Use emoji sparingly (1-2 per message max)

OFF-TOPIC REDIRECT:
If the question is completely unrelated to pets, food, nutrition, or animal care, politely redirect the user back to pet-related topics.

BRAND NEUTRALITY:
Never recommend a specific commercial brand as "the best." You may compare nutrient profiles objectively.
${petCtx}`
}

// ─── Ask Mealie (chat) ─────────────────────────────────────────
export async function askMealie(
  history: ChatMessage[],
  userMessage: string,
  pet?: PetProfile,
): Promise<string> {
  const ai = getClient()

  // Multiturn requests must begin with a user turn in the Gemini API
  const userFirstHistory: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = []
  let seenUser = false
  for (const m of history) {
    const isUser = m.role === 'user'
    if (isUser) seenUser = true
    if (seenUser) {
      userFirstHistory.push({
        role: isUser ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }],
      })
    }
  }

  // Add the new user message
  const contents = [
    ...userFirstHistory,
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ]

  const config = {
    systemInstruction: buildChatSystemPrompt(pet),
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 600,
    thinkingConfig: { thinkingBudget: 0 },
  }

  let lastError: unknown = null
  for (const model of CHAT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      })

      if (response.text) {
        return response.text
      }
    } catch (err: unknown) {
      lastError = err
      // If overloaded, 404, or 503, try next candidate model
      continue
    }
  }

  throw lastError || new Error('All Gemini chat models unavailable')
}

// ─── Scan Label (vision) ───────────────────────────────────────
function buildScanPrompt(pet?: PetProfile | null): string {
  const petCtx = pet
    ? `\nActive pet profile:
- Name: ${pet.name}
- Species: ${pet.species}
- Breed: ${pet.breed}
- Life stage: ${pet.lifeStage || 'adult'}
- Weight: ${pet.weightKg} kg
${pet.dietaryPreference && pet.dietaryPreference !== 'any' ? `- Dietary preference: ${pet.dietaryPreference.replace('_', ' ')}\n` : ''}${pet.preferredFoods?.length ? `- Preferred foods: ${pet.preferredFoods.join(', ')}\n` : ''}${pet.avoidedFoods?.length ? `- Avoided foods: ${pet.avoidedFoods.join(', ')}\n` : ''}
Evaluate suitability specifically for this pet — considering species toxicity, life-stage suitability, and their dietary preferences/avoided foods.`
    : `\nNo active pet profile. Evaluate general dog/cat safety. Note in suitabilityNote that registering a pet profile enables personalized life-stage and preference checks.`

  return `You are an expert veterinary nutritionist AI. Analyze this image.

STEP 1 — CLASSIFY THE IMAGE:
• If this image is pet food packaging, guaranteed analysis table, or a pet food product:
  - isFoodItem: true
  - detectedCategory: "pet_food_label"
• If this image is human food, whole ingredients (e.g. cooked chicken, carrots, fruits, meat):
  - isFoodItem: true
  - detectedCategory: "whole_or_human_food"
• If this image is NOT a food item (e.g., person, household object, blank/blurry screen, car, electronics, landscape, or non-food):
  - isFoodItem: false
  - detectedCategory: "unrelated_image"
  - brand: "N/A"
  - product: "Not a food item"
  - caloriesPer100g: null, crudeProteinPct: null, crudeFatPct: null, crudeFiberPct: null, moisturePct: null
  - suitability: "unknown"
  - suitabilityNote: "Hindi ito pagkain ng alaga o food product. Mangyaring mag-upload ng malinaw na litrato ng pet food packaging o pagkain."
  - ingredients: []

STEP 2 — IF isFoodItem IS TRUE:
• Extract nutritional values from the packaging or estimate for whole foods. If not visible or readable, use null.
• Determine "suitability":
  - "safe" = standard pet food with no concerning ingredients, appropriate for the pet
  - "caution" = contains fillers, by-products, artificial additives, slight species/life-stage mismatch, or ingredients the pet prefers to avoid
  - "unsafe" = contains known toxic ingredients for pets (e.g. chocolate, xylitol, grapes, onions, garlic, lilies, raw fish/dairy for cats) or severe species mismatch (e.g. dog food containing high copper/low taurine fed to a cat)
  - "unknown" = cannot determine from the image
• List the first 10 ingredients max.
${petCtx}

Return ONLY valid JSON according to the schema.`
}

export async function scanLabel(
  imageBase64: string,
  mimeType: string,
  pet?: PetProfile | null,
): Promise<ScanResult> {
  const ai = getClient()

  const config = {
    responseMimeType: 'application/json' as const,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        isFoodItem: { type: Type.BOOLEAN },
        detectedCategory: {
          type: Type.STRING,
          enum: ['pet_food_label', 'whole_or_human_food', 'unrelated_image'],
        },
        brand: { type: Type.STRING },
        product: { type: Type.STRING },
        caloriesPer100g: { type: Type.NUMBER, nullable: true },
        crudeProteinPct: { type: Type.NUMBER, nullable: true },
        crudeFatPct: { type: Type.NUMBER, nullable: true },
        crudeFiberPct: { type: Type.NUMBER, nullable: true },
        moisturePct: { type: Type.NUMBER, nullable: true },
        suitability: { type: Type.STRING, enum: ['safe', 'caution', 'unsafe', 'unknown'] },
        suitabilityNote: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        'isFoodItem',
        'detectedCategory',
        'brand',
        'product',
        'caloriesPer100g',
        'crudeProteinPct',
        'crudeFatPct',
        'crudeFiberPct',
        'moisturePct',
        'suitability',
        'suitabilityNote',
        'ingredients',
      ],
    },
    temperature: 0.2,
    maxOutputTokens: 1024,
    thinkingConfig: { thinkingBudget: 0 },
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  const contents = [
    {
      role: 'user' as const,
      parts: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        { text: buildScanPrompt(pet) },
      ],
    },
  ]

  for (const model of VISION_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      })

      const text = response.text ?? '{}'
      return JSON.parse(text) as ScanResult
    } catch {
      continue
    }
  }

  throw new Error('Mealie could not parse the label. Try a clearer photo.')
}

