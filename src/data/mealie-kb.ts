export type KBEntry = {
  keywords: string[]
  answer: string
  severity?: 'info' | 'caution' | 'emergency'
}

export const toxicFoods: KBEntry[] = [
  {
    keywords: ['chocolate', 'cacao', 'cocoa'],
    answer:
      '🚨 **Chocolate is toxic to both dogs and cats.** It contains theobromine and caffeine, which pets cannot metabolize properly. Dark chocolate and baking chocolate are especially dangerous.\n\n**If your pet ate chocolate, contact your veterinarian or an emergency vet clinic immediately.** Note the type and amount eaten.',
    severity: 'emergency',
  },
  {
    keywords: ['onion', 'sibuyas', 'garlic', 'bawang', 'leek', 'chives'],
    answer:
      '🚨 **Onions, garlic, leeks, and chives are toxic to dogs and cats.** They belong to the Allium family and can damage red blood cells, causing anemia. This includes raw, cooked, and powdered forms.\n\n**If your pet ate a significant amount, contact your veterinarian.**',
    severity: 'emergency',
  },
  {
    keywords: ['grape', 'raisin', 'ubas'],
    answer:
      '🚨 **Grapes and raisins are toxic to dogs** and can cause kidney failure even in small amounts. The exact toxic substance is not fully understood.\n\n**If your dog ate grapes or raisins, contact your veterinarian or emergency vet immediately**, even if your dog seems fine.',
    severity: 'emergency',
  },
  {
    keywords: ['xylitol', 'sugar-free', 'artificial sweetener'],
    answer:
      '🚨 **Xylitol is extremely toxic to dogs.** It can cause a rapid drop in blood sugar and liver failure. It\'s found in sugar-free gum, candy, toothpaste, and some baked goods.\n\n**If your dog ingested xylitol, seek emergency veterinary care immediately.**',
    severity: 'emergency',
  },
  {
    keywords: ['avocado'],
    answer:
      '⚠️ **Avocado contains persin**, which can cause vomiting and diarrhea in dogs. The pit is also a choking hazard. While small amounts of avocado flesh are generally less toxic to dogs than to other animals, it\'s safest to avoid it.\n\n**For cats, avocado should be avoided entirely.**',
    severity: 'caution',
  },
  {
    keywords: ['alcohol', 'beer', 'wine', 'alak'],
    answer:
      '🚨 **Alcohol is very dangerous for pets.** Even small amounts can cause vomiting, diarrhea, breathing difficulty, and in severe cases, coma or death. This includes beer, wine, liquor, and foods containing alcohol.\n\n**If your pet consumed alcohol, contact your veterinarian immediately.**',
    severity: 'emergency',
  },
  {
    keywords: ['caffeine', 'coffee', 'kape', 'tea'],
    answer:
      '⚠️ **Caffeine is harmful to pets.** Coffee, tea, energy drinks, and caffeine pills can cause restlessness, rapid breathing, heart palpitations, and muscle tremors.\n\n**If your pet consumed caffeine, monitor closely and contact your vet if symptoms appear.**',
    severity: 'caution',
  },
  {
    keywords: ['chicken bone', 'buto', 'cooked bone'],
    answer:
      '⚠️ **Cooked bones (especially chicken and pork) can splinter** and cause choking, mouth injuries, or intestinal blockage. **Raw bones are generally safer but still carry risks.**\n\nIf your pet ate cooked bones, watch for signs of distress (drooling, pawing at mouth, vomiting, straining to defecate) and contact your vet if any appear.',
    severity: 'caution',
  },
]

export const generalTopics: KBEntry[] = [
  {
    keywords: ['how much', 'magkano', 'how many', 'portion', 'serving', 'gaano karami'],
    answer:
      'The right amount of food depends on your pet\'s **weight, age, activity level, and the specific food** you\'re using. As a general guide:\n\n🐕 **Dogs:** Check the feeding guide on your food\'s packaging — it usually recommends grams per day based on weight.\n🐱 **Cats:** Most adult cats need about 200–300 kcal per day, but this varies.\n\nYou can use AniMeal\'s **Calorie Calculator** in your pet\'s profile to get an estimate. Remember, these are guidelines — your vet can give the best advice for your pet.',
    severity: 'info',
  },
  {
    keywords: ['best food', 'recommended', 'pinakamabuti', 'good food', 'best brand'],
    answer:
      'There\'s no single "best" food — it depends on your pet\'s **species, age, health, and your budget**. Here are some tips:\n\n✅ Look for food appropriate for your pet\'s **life stage** (puppy/kitten, adult, senior)\n✅ Check that **protein** is listed as the first ingredient\n✅ Compare **price per calorie** to find good value\n✅ Choose brands with clear nutritional information\n\nYou can explore and compare options in the **Food Library**! For specific dietary needs, consult your vet.',
    severity: 'info',
  },
  {
    keywords: ['wet food', 'dry food', 'canned', 'kibble'],
    answer:
      'Both wet and dry food have benefits:\n\n**Dry food (kibble):**\n✅ More convenient and affordable per serving\n✅ Helps with dental health (some abrasion)\n✅ Longer shelf life once opened\n\n**Wet food (canned/pouch):**\n✅ Higher moisture — good for hydration\n✅ Often more palatable for picky eaters\n✅ Can be easier for older pets to eat\n\nMany pet owners use a **mix of both**. The most important thing is choosing food appropriate for your pet\'s age and species.',
    severity: 'info',
  },
  {
    keywords: ['human food', 'table food', 'pagkain ng tao', 'share food'],
    answer:
      'Some human foods are **safe in moderation** for pets, while others are **dangerous**. Here\'s a quick guide:\n\n✅ **Generally safe for dogs:** plain cooked chicken, rice, carrots, sweet potato, banana\n✅ **Generally safe for cats:** plain cooked chicken or fish (no bones)\n\n❌ **Avoid:** chocolate, onion, garlic, grapes, xylitol, alcohol, caffeine, salty/fatty foods\n\n⚠️ Human food should be **occasional treats**, not a primary diet. Always introduce new foods gradually and in small amounts.',
    severity: 'info',
  },
  {
    keywords: ['water', 'tubig', 'drinking', 'thirsty', 'hydration'],
    answer:
      '💧 Water is essential! As a general guide:\n\n🐕 **Dogs:** About **50 ml per kg** of body weight per day (e.g., a 10 kg dog needs ~500 ml)\n🐱 **Cats:** About **50 ml per kg** — but cats are often poor drinkers\n\n**Tips to encourage drinking:**\n• Keep water fresh and change it daily\n• Use a wide, shallow bowl (cats prefer this)\n• Try a pet water fountain\n• Wet food can help increase water intake\n\nIf your pet is drinking **significantly more or less** than usual, consult your vet — it could indicate a health issue.',
    severity: 'info',
  },
]

export const symptomTopics: KBEntry[] = [
  {
    keywords: ['vomit', 'vomiting', 'nagsuka', 'suka', 'throwing up'],
    answer:
      '🤢 Occasional vomiting can happen, but watch for patterns:\n\n**Monitor at home if:**\n• Single episode, pet seems fine otherwise\n• Still eating and drinking normally\n• No blood in vomit\n\n**Contact your vet if:**\n• Vomiting repeatedly (3+ times in a day)\n• Blood in vomit\n• Lethargy or refusing food/water\n• Suspected ingestion of something toxic\n\n**Seek emergency care if:**\n• Continuous vomiting with distress\n• Swollen/bloated abdomen\n• Signs of poisoning\n\n⚠️ *This is general guidance — not a diagnosis. When in doubt, contact your veterinarian.*',
    severity: 'caution',
  },
  {
    keywords: ['diarrhea', 'loose stool', 'pagtatae', 'watery poop'],
    answer:
      '💩 Diarrhea can have many causes (diet change, stress, infection, etc.).\n\n**Monitor at home if:**\n• Mild and pet is still active\n• No blood in stool\n• Still eating and drinking\n\n**Contact your vet if:**\n• Lasts more than 24–48 hours\n• Blood or mucus in stool\n• Accompanied by vomiting or lethargy\n• Puppy or kitten (they dehydrate faster)\n\n**In the meantime:** Ensure your pet has access to fresh water. For dogs, a bland diet (boiled chicken + rice) may help temporarily.\n\n⚠️ *This is general guidance — not a diagnosis. When in doubt, contact your veterinarian.*',
    severity: 'caution',
  },
  {
    keywords: ['not eating', 'loss of appetite', 'ayaw kumain', 'won\'t eat', 'refuse food'],
    answer:
      '😿 Loss of appetite can be concerning. Here\'s what to consider:\n\n**Monitor at home if:**\n• Skipped one meal but otherwise normal\n• Recent diet change (may just be picky)\n• Stress from a new environment\n\n**Contact your vet if:**\n• Not eating for **24+ hours (cats)** or **48+ hours (dogs)**\n• Accompanied by vomiting, diarrhea, or lethargy\n• Weight loss\n• Unusual behavior\n\n**Tips to encourage eating:**\n• Warm the food slightly to enhance aroma\n• Try mixing wet food with dry food\n• Ensure a quiet, comfortable feeding area\n\n⚠️ *Cats especially should not go without food for extended periods — it can lead to liver problems.*',
    severity: 'caution',
  },
  {
    keywords: ['lethargic', 'lethargy', 'tired', 'pagod', 'weak', 'sleepy', 'tamad'],
    answer:
      '😴 Some tiredness is normal, but prolonged lethargy can be a concern:\n\n**Normal tiredness:** After exercise, on hot days, or during growth spurts in puppies/kittens.\n\n**Contact your vet if:**\n• Unusually tired for more than a day\n• Refusing food and water\n• Accompanied by other symptoms (vomiting, diarrhea, breathing changes)\n• Sudden change in energy level\n\n⚠️ *This is general guidance — not a diagnosis. When in doubt, contact your veterinarian.*',
    severity: 'caution',
  },
  {
    keywords: ['scratching', 'itching', 'kati', 'skin', 'balat', 'hair loss', 'fur'],
    answer:
      '🐾 Scratching and skin issues can have various causes:\n\n**Common causes:** Fleas, ticks, allergies (food or environmental), fungal infection (ringworm), dry skin.\n\n**When to see a vet:**\n• Persistent scratching causing hair loss or wounds\n• Red, inflamed, or flaky skin\n• Lumps, bumps, or open sores\n• Foul smell from skin or ears\n\n**Basic care:**\n• Keep up with flea/tick prevention\n• Bathe with pet-appropriate shampoo (not human shampoo)\n• Check for parasites regularly\n\n⚠️ *This is general guidance — not a diagnosis. When in doubt, contact your veterinarian.*',
    severity: 'caution',
  },
]

export const quickChips = [
  'How much food should I give?',
  'Is chocolate safe for pets?',
  'Best affordable pet food?',
  'My pet is vomiting — what do I do?',
  'Wet food vs. dry food?',
  'Human food safe for dogs?',
  'How much water does my pet need?',
  'My cat won\'t eat — help!',
]

/**
 * Find the most relevant KB entry for a user question.
 */
export function findAnswer(
  question: string,
): { answer: string; severity: string } | null {
  const q = question.toLowerCase()
  const allEntries = [...toxicFoods, ...symptomTopics, ...generalTopics]

  let bestMatch: KBEntry | null = null
  let bestScore = 0

  for (const entry of allEntries) {
    let score = 0
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length // longer keyword matches are more specific
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  if (bestMatch && bestScore > 0) {
    return { answer: bestMatch.answer, severity: bestMatch.severity || 'info' }
  }

  return null
}

export const defaultResponse =
  "I'm Mealie, your pet care assistant! 🐾 I can help with questions about pet food, nutrition, common symptoms, and general care. Try asking me about specific foods, feeding amounts, or health concerns.\n\n⚠️ **Disclaimer:** I provide general pet care information only. I am not a substitute for professional veterinary advice. If your pet is experiencing a medical emergency, please contact your veterinarian immediately."

export const disclaimer =
  '⚠️ *Mealie provides general pet care information only and is not a substitute for professional veterinary advice. Always consult a veterinarian for medical concerns.*'

