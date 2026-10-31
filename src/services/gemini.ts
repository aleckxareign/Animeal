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
import type { ChatMessage, PetProfile, ScanResult } from '../types'

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
const CHAT_MODEL = 'gemini-2.0-flash'
const VISION_MODEL = 'gemini-2.0-flash'

// ─── System prompt (Ask Mealie) ────────────────────────────────
function buildChatSystemPrompt(pet?: PetProfile): string {
  const petCtx = pet
    ? `\nActive pet profile:\n- Name: ${pet.name}\n- Species: ${pet.species}\n- Breed: ${pet.breed}\n- Age: ${pet.ageMonths} months\n- Weight: ${pet.weightKg} kg\nAlways consider this pet's specific needs when answering.`
    : '\nNo pet profile is active. Ask the user about their pet when relevant.'

  return `You are **Mealie**, the friendly AI assistant for **AniMeal** — a Filipino pet-care platform.

LANGUAGE RULES:
• Respond in **Taglish** (mixed Tagalog + English) by default.
• If the user writes in pure English, reply in English but keep a warm, casual Filipino tone.
• Keep answers concise (≤ 200 words unless the user asks for detail).

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
${petCtx}

If the question is completely unrelated to pets, politely redirect the user.`
}

// ─── Ask Mealie (chat) ─────────────────────────────────────────
export async function askMealie(
  history: ChatMessage[],
  userMessage: string,
  pet?: PetProfile,
): Promise<string> {
  const ai = getClient()

  // Build contents array from history
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.text }],
  }))

  // Add the new user message
  contents.push({
    role: 'user' as const,
    parts: [{ text: userMessage }],
  })

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction: buildChatSystemPrompt(pet),
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  })

  return response.text ?? 'Sorry, hindi ko na-process ang request. Try mo ulit!'
}

// ─── Scan Label (vision) ───────────────────────────────────────
const SCAN_PROMPT = `You are an expert pet nutritionist AI. Analyze this pet food packaging photo.

Extract the following information and return ONLY a valid JSON object (no markdown, no code fences):

{
  "brand": "<brand name or 'Unknown'>",
  "product": "<product name/variant or 'Unknown'>",
  "caloriesPer100g": <number or null>,
  "crudeProteinPct": <number or null>,
  "crudeFatPct": <number or null>,
  "crudeFiberPct": <number or null>,
  "moisturePct": <number or null>,
  "suitability": "<safe|caution|unsafe|unknown>",
  "suitabilityNote": "<brief explanation why>",
  "ingredients": ["<ingredient1>", "<ingredient2>", "..."]
}

RULES:
• If a value is not visible or readable, use null.
• "suitability" should be based on ingredient quality for dogs/cats:
  - "safe" = standard pet food with no concerning ingredients
  - "caution" = contains fillers, by-products, or artificial additives
  - "unsafe" = contains known toxic ingredients for pets
  - "unknown" = cannot determine from the image
• List the first 10 ingredients max.
• If this is NOT a pet food package, set suitability to "unsafe" and note it's human food.`

export async function scanLabel(imageBase64: string, mimeType: string): Promise<ScanResult> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: VISION_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: SCAN_PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
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
          'brand', 'product', 'caloriesPer100g', 'crudeProteinPct',
          'crudeFatPct', 'crudeFiberPct', 'moisturePct',
          'suitability', 'suitabilityNote', 'ingredients',
        ],
      },
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  })

  const text = response.text ?? '{}'

  try {
    return JSON.parse(text) as ScanResult
  } catch {
    throw new Error('Mealie could not parse the label. Try a clearer photo.')
  }
}

