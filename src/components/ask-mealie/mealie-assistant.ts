import type { Pet, ChatAction } from '../../types'
import { findAnswer, defaultResponse } from '../../data/mealie-kb'

export type MealieResponse = {
  content: string
  severity: 'info' | 'caution' | 'emergency'
  actions: ChatAction[]
}

export type TopicCategory =
  | 'emergency'
  | 'safe_food'
  | 'toxic_food'
  | 'symptom'
  | 'care_routine'
  | 'portion_calories'
  | 'hydration'
  | 'vet_triage'
  | 'conversational'

type KnowledgeTopic = {
  id: string
  category: TopicCategory
  keywords: string[]
  excludeKeywords?: string[]
  severity: 'info' | 'caution' | 'emergency'
  answer: string
  actions?: ChatAction[]
}

/**
 * High-coverage knowledge base for Mealie AI.
 * Handles English & Taglish veterinary and nutrition questions with high accuracy.
 */
const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  // ─── 1. EMERGENCIES & DEADLY TOXIC SUBSTANCES ───────────────────
  {
    id: 'paracetamol',
    category: 'emergency',
    keywords: [
      'paracetamol',
      'biogesic',
      'panadol',
      'tylenol',
      'ibuprofen',
      'advil',
      'mefenamic',
      'gamot ng tao',
      'gamot sa lagnat ng tao',
      'aspirin',
    ],
    severity: 'emergency',
    answer:
      '🚨 **CRITICAL EMERGENCY: Human pain relievers (Paracetamol, Biogesic, Ibuprofen, Aspirin) are extremely toxic and fatal to dogs and cats!**\n\nEven a tiny fraction of a 500mg tablet causes acute liver necrosis, kidney shutdown, and destroys red blood cells (especially fatal in cats within hours).\n\n**Action Needed NOW:**\n1. Do NOT induce vomiting unless a licensed vet tells you to.\n2. Bring your pet to an emergency veterinary clinic immediately.\n3. Bring the medicine blister pack or bottle so the vet knows the exact mg dosage.',
    actions: [
      { label: '🚨 Emergency Vet Clinics', type: 'link', value: '/#nearby-vets' },
      { label: '📞 Call PAWS Hotline', type: 'link', value: 'tel:0284751688' },
    ],
  },
  {
    id: 'chocolate',
    category: 'emergency',
    keywords: [
      'chocolate',
      'tsokolate',
      'cacao',
      'cocoa',
      'dark chocolate',
      'baking chocolate',
      'tablea',
    ],
    severity: 'emergency',
    answer:
      '🚨 **EMERGENCY WARNING: Chocolate is toxic to both dogs and cats!**\n\nIt contains **theobromine** and **caffeine**, which pets cannot metabolize. Dark chocolate, baking cocoa, and Filipino tablea are the most dangerous.\n\n**Common Signs of Toxicity:**\n• Vomiting, diarrhea, and extreme restlessness\n• Rapid heartbeat, panting, and muscle tremors\n• Seizures or cardiac arrest in severe cases\n\n**Next Steps:** Contact your nearest veterinary hospital immediately with the pet’s weight and estimated grams of chocolate consumed.',
    actions: [
      { label: '🚨 Find Emergency Vet Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '📞 Call PAWS Hotline: (02) 8475-1688', type: 'link', value: 'tel:0284751688' },
    ],
  },
  {
    id: 'grapes',
    category: 'emergency',
    keywords: ['grape', 'grapes', 'raisin', 'raisins', 'ubas', 'pasas'],
    severity: 'emergency',
    answer:
      '🚨 **CRITICAL WARNING: Grapes and raisins (ubas at pasas) can cause sudden acute kidney failure in dogs!**\n\nToxicity is not strictly dose-dependent: even a single grape or raisin has caused irreversible renal failure in some dogs.\n\n**Immediate Action:**\n1. Rush your dog to an animal clinic or emergency vet right away.\n2. Decontamination (emesis/activated charcoal) is most effective if done within 2 hours of ingestion.',
    actions: [
      { label: '🚨 Find Emergency Vet Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🏥 When to see a vet?', type: 'chip', value: 'Kailan dapat dalhin sa vet?' },
    ],
  },
  {
    id: 'onions_garlic',
    category: 'emergency',
    keywords: [
      'onion',
      'onions',
      'sibuyas',
      'garlic',
      'bawang',
      'leek',
      'leeks',
      'chives',
      'shallot',
      'shallots',
    ],
    severity: 'emergency',
    answer:
      '🚨 **TOXIC WARNING: Onions (sibuyas) and garlic (bawang) are dangerous to dogs and cats.**\n\nThey contain thiosulfate and disulfides, which oxidize hemoglobin and destroy red blood cells (Heinz body hemolytic anemia). This includes raw, cooked, fried, and powdered forms (garlic/onion powder in ulam or soups).\n\n**Symptoms:** Pale gums, dark reddish-brown urine, weakness, vomiting, and elevated heart rate.',
    actions: [
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      { label: '🍲 What human food is safe?', type: 'chip', value: 'Can dogs eat chicken and rice?' },
    ],
  },
  {
    id: 'xylitol',
    category: 'emergency',
    keywords: ['xylitol', 'birch sugar', 'artificial sweetener', 'sugar-free gum', 'sugar free gum'],
    severity: 'emergency',
    answer:
      '🚨 **DEADLY TOXIN: Xylitol is extremely toxic to dogs!**\n\nCommonly found in sugar-free chewing gum, diabetic sweets, sugar-free peanut butter, and human toothpaste. In dogs, xylitol triggers an immediate, massive insulin surge, causing severe hypoglycemia (low blood sugar) within 30–60 minutes, followed by acute liver necrosis.\n\n**Immediate veterinary hospitalization with IV glucose is required.**',
    actions: [
      { label: '🚨 Find Emergency Clinic', type: 'link', value: '/#nearby-vets' },
    ],
  },
  {
    id: 'lilies_cats',
    category: 'emergency',
    keywords: ['lily', 'lilies', 'liryo', 'peace lily', 'tiger lily', 'daylily', 'easter lily'],
    severity: 'emergency',
    answer:
      '🚨 **CAT APOSTROPHE / DEADLY WARNING: True lilies (Lilium and Hemerocallis species) are extremely fatal to cats!**\n\nEven a tiny speck of pollen licked from fur, a nibble on a petal/leaf, or drinking water from the flower vase causes fatal acute kidney failure within 24–72 hours.\n\n**Action:** Wash any pollen off immediately and rush your cat to an emergency clinic for continuous IV fluid therapy.',
    actions: [
      { label: '🚨 Find 24/7 Vet Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🐱 Cat Hydration Guide', type: 'chip', value: 'How much water does my cat need?' },
    ],
  },
  {
    id: 'heatstroke',
    category: 'emergency',
    keywords: ['heatstroke', 'heat stroke', 'sobrang init', 'na-initan', 'hinihingal', 'panting heavily', 'overheat'],
    severity: 'emergency',
    answer:
      '🚨 **Heatstroke Warning in Pets (Sobrang Init):**\n\nPhilippine tropical heat and high humidity can induce heatstroke very rapidly. High-risk signs:\n• Heavy gasping, loud rapid panting\n• Bright red, dark purple, or pale gums\n• Thick ropy drool, unsteadiness, or collapse\n\n**Emergency First Aid:**\n1. Move pet into a shaded or air-conditioned room.\n2. Wet their paws, belly, and groins with **room-temperature tap water** (NEVER ice baths, which trigger capillary shock).\n3. Turn a fan directly toward them.\n4. Rush to a veterinary hospital immediately.',
    actions: [
      { label: '🚨 Find Emergency Vet Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '💧 How much water does my pet need?', type: 'chip', value: 'How much water does my pet need?' },
    ],
  },
  {
    id: 'cooked_bones',
    category: 'toxic_food',
    keywords: ['cooked bone', 'cooked bones', 'buto ng manok', 'buto ng baboy', 'chicken bone', 'pork bone', 'splinter'],
    severity: 'caution',
    answer:
      '⚠️ **Warning on Cooked Bones (Buto ng Manok o Baboy):**\n\nCooking makes animal bones brittle. They splinter easily into razor-sharp shards that can pierce the esophagus, stomach, or intestines, causing internal bleeding, sepsis, or intestinal obstruction.\n\n**If your pet ingested cooked bones:**\n• Watch closely for: vomiting, retching, bloody stool, lethargy, or abdominal pain.\n• Feed high-fiber foods (like canned kalabasa or whole-wheat bread) to cushion the digestive tract.\n• If distress or vomiting occurs, see a vet immediately for an X-ray.',
    actions: [
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      { label: '🍲 Explore Safe Foods', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'alcohol_caffeine',
    category: 'emergency',
    keywords: ['alcohol', 'beer', 'wine', 'alak', 'liquor', 'caffeine', 'coffee', 'kape', 'energy drink', 'milktea'],
    severity: 'emergency',
    answer:
      '🚨 **Toxic Hazard: Alcohol & Caffeine are dangerous to pets.**\n\n• **Alcohol (Alak):** Pet livers cannot break down ethanol. It causes dangerously low blood sugar, hypothermia, seizures, and respiratory failure.\n• **Caffeine (Kape/Tea/Milktea):** Stimulates the central nervous system, causing cardiac arrhythmia, hyperthermia, and tremors.\n\nSeek immediate veterinary assistance if your pet consumed alcoholic drinks or concentrated caffeine.',
    actions: [
      { label: '🚨 Find Emergency Clinic', type: 'link', value: '/#nearby-vets' },
    ],
  },
  {
    id: 'avocado',
    category: 'toxic_food',
    keywords: ['avocado', 'abukado'],
    severity: 'caution',
    answer:
      '⚠️ **Avocado Advisory for Pets:**\n\n• **Persin Toxin:** Avocados contain persin, primarily concentrated in the pit, skin, and leaves. It causes stomach upset, vomiting, and diarrhea in dogs and cats.\n• **Choking & Obstruction Hazard:** The large avocado pit is a frequent cause of fatal surgical intestinal obstruction in dogs.\n• **High Fat Content:** The high fat in avocado flesh can trigger pancreatitis in sensitive dogs.\n\nIt is safest to avoid giving avocados to pets completely.',
    actions: [
      { label: '🍲 Safe Fruits for Pets', type: 'chip', value: 'What fruits are safe for pets?' },
      { label: '📖 Food Library', type: 'link', value: '/food-library' },
    ],
  },

  // ─── 2. SAFE & POPULAR WHOLE HUMAN FOODS ────────────────────────
  {
    id: 'chicken_rice',
    category: 'safe_food',
    keywords: [
      'chicken',
      'manok',
      'rice',
      'kanin',
      'lugaw',
      'boiled chicken',
      'chicken and rice',
      'manok at kanin',
    ],
    excludeKeywords: ['bone', 'buto'],
    severity: 'info',
    answer:
      '✅ **Boiled Chicken & Rice (Angkop na Pagkain):**\n\nPlain boiled chicken with white rice is one of the safest, most digestible home-cooked meals for both dogs and recovering cats!\n\n**How to prepare safely:**\n• **Chicken:** Skinless, boneless chicken breast boiled in plain water. (NO garlic, onions, soy sauce, or MSG!).\n• **Rice:** Soft-boiled plain white rice or lugaw.\n• **Great for:** Soothing an upset stomach, mild diarrhea, or recovering appetite.\n\n⚠️ Note: Chicken and rice is a bland diet for short-term soothing. For daily long-term feeding, complete vitamins and minerals must be balanced.',
    actions: [
      { label: '🍲 Log Meal in Tracker', type: 'link', value: '/meal-tracker' },
      { label: '🥣 Can dogs eat eggs?', type: 'chip', value: 'Can dogs eat eggs?' },
    ],
  },
  {
    id: 'eggs',
    category: 'safe_food',
    keywords: ['egg', 'eggs', 'itlog', 'scrambled egg', 'boiled egg'],
    severity: 'info',
    answer:
      '🍳 **Eggs (Itlog) for Pets — Nutritious & Safe!**\n\nCooked eggs are a fantastic source of highly digestible protein, essential amino acids, iron, and riboflavin for both dogs and cats.\n\n**Preparation Rules:**\n• **Always Cooked:** Hard-boiled or scrambled plain with **zero butter, cooking oil, salt, or onions**.\n• **Avoid Raw Egg Whites:** Raw whites contain avidin, which inhibits biotin (Vitamin B7) absorption, and raw eggs carry Salmonella risks.\n• **Serving:** 1/2 to 1 egg once or twice a week is a great meal topper for an adult dog; 1–2 teaspoons for a cat.',
    actions: [
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
      { label: '🥩 Can pets eat pork or beef?', type: 'chip', value: 'Can dogs eat pork or beef?' },
    ],
  },
  {
    id: 'fish_tuna_salmon',
    category: 'safe_food',
    keywords: ['fish', 'isda', 'salmon', 'tuna', 'sardines', 'sardinas', 'tilapia', 'bangus'],
    severity: 'info',
    answer:
      '🐟 **Fish for Dogs & Cats (Salmon, Tuna, Sardines):**\n\nCooked fish is packed with lean protein and Omega-3 fatty acids (EPA & DHA), which support healthy skin, shiny fur, and joint flexibility.\n\n**Golden Rules:**\n• **Remove All Bones:** Fish bones cause throat choking and stomach punctures.\n• **Fully Cooked:** Never feed raw freshwater fish (risk of parasites and thiaminase, which destroys Vitamin B1).\n• **Canned Tuna / Sardines:** Choose varieties packed in **plain water with no added salt** (never in tomato sauce, chili, or oil).',
    actions: [
      { label: '🍲 Check Ingredients in Library', type: 'link', value: '/food-library' },
      { label: '🍗 Can pets eat chicken?', type: 'chip', value: 'Can dogs eat chicken and rice?' },
    ],
  },
  {
    id: 'pork_beef',
    category: 'safe_food',
    keywords: ['pork', 'baboy', 'beef', 'baka', 'ground beef', 'giniling', 'liempo'],
    excludeKeywords: ['bone', 'buto'],
    severity: 'info',
    answer:
      '🥩 **Pork & Beef for Pets (Baboy at Baka):**\n\nCooked lean pork and beef are rich in protein, zinc, and iron.\n\n**Safety Tips:**\n• **Lean Cuts Only:** Avoid fatty table scraps like crispy pata, liempo, or skin. High fats trigger acute **pancreatitis** (severe inflammation of the pancreas).\n• **No Marinade / Adobo / Sinigang:** Human dishes contain toxic onions, garlic, and excessive sodium.\n• **Thoroughly Cooked:** Never feed raw pork due to the risk of Trichinella parasites.',
    actions: [
      { label: '🍲 Log Meal in Tracker', type: 'link', value: '/meal-tracker' },
      { label: '🥣 Safe Veggies & Fruits', type: 'chip', value: 'What vegetables are safe for pets?' },
    ],
  },
  {
    id: 'squash_pumpkin',
    category: 'safe_food',
    keywords: ['squash', 'pumpkin', 'kalabasa', 'calabasa'],
    severity: 'info',
    answer:
      '🎃 **Kalabasa (Squash / Pumpkin) — The Superfood for Pet Digestion!**\n\nPlain cooked kalabasa is one of the best Philippine vegetables you can offer dogs and cats.\n\n**Benefits:**\n• **High Soluble Fiber:** Gently remedies **both diarrhea and constipation** by absorbing excess water or softening stool.\n• **Low Calorie:** Helps overweight pets feel full.\n• **Rich in Vitamins A, C, and Beta-Carotene.**\n\n**Serving:** Steam or boil kalabasa in water until soft, mash with a fork, and mix 1–2 spoonfuls into their regular meal.',
    actions: [
      { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      { label: '💩 Pet has diarrhea — advice', type: 'chip', value: 'My pet has diarrhea — what to do?' },
    ],
  },
  {
    id: 'carrots',
    category: 'safe_food',
    keywords: ['carrot', 'carrots', 'karot'],
    severity: 'info',
    answer:
      '🥕 **Carrots for Pets — Healthy Crunchy Treat!**\n\nCarrots are completely safe, low-calorie, and rich in fiber and Vitamin A.\n\n• **Raw Carrots:** Great natural chew toy for dogs that helps gently clean plaque from teeth.\n• **Cooked / Steamed Carrots:** Easy to digest and a wonderful colorful meal topper for both dogs and cats.\n• **Tip:** Cut into bite-sized coins or sticks to prevent small dogs from choking.',
    actions: [
      { label: '🍎 What fruits are safe?', type: 'chip', value: 'What fruits are safe for pets?' },
      { label: '📖 Explore Food Library', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'fruits_safe',
    category: 'safe_food',
    keywords: [
      'fruit',
      'fruits',
      'prutas',
      'apple',
      'apples',
      'mansanas',
      'banana',
      'bananas',
      'saging',
      'watermelon',
      'pakwan',
      'papaya',
      'mango',
      'mangga',
    ],
    excludeKeywords: ['grape', 'raisin', 'ubas', 'pasas', 'avocado'],
    severity: 'info',
    answer:
      '🍎 **Safe Philippine Fruits for Pets (In Moderation):**\n\n✅ **SAFE TO FEED:**\n• **Apples (Mansanas):** Slice without seeds or core (apple seeds contain trace cyanide).\n• **Bananas (Saging):** Potassium-rich treat; 2–3 bite-sized slices for dogs.\n• **Watermelon (Pakwan):** Hydrating summer treat. Remove all seeds and green rind.\n• **Papaya & Mango:** Sweet, digestive enzymes. Remove skin and pit.\n\n❌ **NEVER FEED:**\n• Grapes / Raisins (cause acute kidney failure!)\n• Avocado (persin & large pit hazard)\n• Cherries & Plums (cyanide in pits).',
    actions: [
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
      { label: '🍫 Is chocolate safe?', type: 'chip', value: 'Is chocolate safe for dogs?' },
    ],
  },
  {
    id: 'sweet_potato',
    category: 'safe_food',
    keywords: ['sweet potato', 'sweet potatoes', 'kamote', 'camote'],
    severity: 'info',
    answer:
      '🍠 **Kamote (Sweet Potato) for Pets:**\n\nCooked sweet potato is a safe, wholesome carbohydrate packed with dietary fiber, Vitamin B6, Vitamin C, and potassium.\n\n• **Preparation:** Always bake, steam, or boil until soft. Never feed raw kamote (hard on pet digestion).\n• **No Seasoning:** Serve plain without brown sugar, butter, or marshmallows.\n• **Serving:** Great as an occasional treat or fiber booster for firm, healthy stools.',
    actions: [
      { label: '🍲 Compare Foods in Library', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'bread',
    category: 'safe_food',
    keywords: ['bread', 'tinapay', 'pandesal', 'pan de sal', 'white bread', 'wheat bread'],
    severity: 'info',
    answer:
      '🍞 **Bread & Pandesal (Tinapay) for Pets:**\n\nPlain baked bread or pandesal is generally **not toxic**, but offers very little nutritional benefit to dogs and cats.\n\n• **Tiny Amounts Only:** A small crust of pandesal as an occasional treat is fine for most adult dogs.\n• **⚠️ STRICT WARNING — RAW DOUGH:** Raw yeast dough is dangerous! The warm, moist stomach causes the dough to expand (gastric distention) and ferment, producing toxic ethanol alcohol.\n• **Avoid Sweetened/Filled Breads:** Skip ensaymada, chocolate bread, garlic bread, or raisin bread.',
    actions: [
      { label: '🍲 View Healthy Treats in Food Library', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'peanut_butter',
    category: 'safe_food',
    keywords: ['peanut butter', 'mani'],
    severity: 'info',
    answer:
      '🥜 **Peanut Butter for Dogs:**\n\nPeanut butter is a popular, high-value treat for hiding pills or stuffing into chew toys.\n\n**CRITICAL CHECKLIST BEFORE GIVING:**\n1. **Check Ingredient Label for XYLITOL:** Some sugar-free peanut butters contain xylitol, which is fatal to dogs. Only use 100% xylitol-free peanut butter.\n2. **Unsalted / Low Sodium:** Choose all-natural peanut butter made only with roasted peanuts.\n3. **Moderation:** Peanut butter is calorie-dense and fatty. 1/2 to 1 teaspoon is plenty for small to medium dogs.',
    actions: [
      { label: '🚨 Check Xylitol Danger', type: 'chip', value: 'What is xylitol and why is it dangerous?' },
    ],
  },
  {
    id: 'dairy_milk_cheese',
    category: 'safe_food',
    keywords: ['milk', 'gatas', 'cheese', 'keso', 'dairy', 'ice cream', 'yogurt'],
    severity: 'caution',
    answer:
      '🥛 **Dairy, Milk & Cheese (Gatas at Keso) for Pets:**\n\nMost adult dogs and cats are **lactose intolerant**. After weaning as babies, they stop producing sufficient lactase enzyme to break down cow\'s milk.\n\n• **Cow\'s Milk:** Often causes gas, bloating, stomach cramps, and diarrhea.\n• **Cheese (Keso):** Hard cheeses (like cheddar) have lower lactose and are okay in tiny nibbles for dogs, but watch the high sodium and fat.\n• **Kittens:** Never give cow\'s milk to orphan kittens! Use a specialized Kitten Milk Replacer (KMR).\n• **Plain Unsweetened Yogurt:** Small spoonfuls contain probiotics and lower lactose, which some dogs tolerate well.',
    actions: [
      { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      { label: '🐱 Cat Hydration Target', type: 'chip', value: 'How much water does my pet need?' },
    ],
  },

  // ─── 3. SYMPTOMS & CLINICAL RED FLAGS ───────────────────────────
  {
    id: 'vomiting',
    category: 'symptom',
    keywords: ['vomit', 'vomiting', 'nagsuka', 'suka', 'throwing up', 'nagluluwa', 'isinuka'],
    severity: 'caution',
    answer:
      '🤢 **Pet Vomiting (Pagsusuka): What to Do:**\n\n**Monitor at home if:**\n• Only 1 single episode, pet is energetic, alert, and pink gums.\n• Rest their stomach for 2–3 hours, then offer small sips of water. If kept down, offer bland boiled chicken + white rice.\n\n**🚨 Rush to Clinic IMMEDIATELY if:**\n• Vomited 3+ times within a few hours\n• Blood or coffee-ground substance in vomit\n• Suspected ingestion of chocolate, lilies, medicines, or foreign toys\n• Abdomen is bloated, tight, or painful\n• Accompanied by extreme lethargy or pale/yellow gums.',
    actions: [
      { label: '🏥 Find Nearby Clinics', type: 'link', value: '/#nearby-vets' },
      { label: '🥣 Bland Chicken & Rice Guide', type: 'chip', value: 'Can dogs eat chicken and rice?' },
    ],
  },
  {
    id: 'diarrhea',
    category: 'symptom',
    keywords: ['diarrhea', 'loose stool', 'pagtatae', 'watery poop', 'lbm', 'nagtatae', 'malabnaw na tae'],
    severity: 'caution',
    answer:
      '💩 **Pet Diarrhea (Pagtatae / LBM) Care:**\n\nDiarrhea is commonly caused by sudden diet change, table scraps, internal parasites (worms), or infection.\n\n**Home Care for Mild Cases:**\n1. **Ensure Fresh Water:** Dehydration happens quickly, especially in puppies and kittens.\n2. **Bland Diet:** Feed small portions of boiled skinless chicken breast with soft white rice and 1 spoon of steamed kalabasa (pumpkin).\n\n**🚨 See a Vet Immediately if:**\n• Stool has bright red blood or black tarry color (melena)\n• Lasting more than 24 hours\n• Accompanied by repeated vomiting or fever\n• Puppy or kitten under 6 months old.',
    actions: [
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      { label: '💧 Water Tracking Tool', type: 'link', value: '/pet-wellness' },
    ],
  },
  {
    id: 'fleas_ticks',
    category: 'symptom',
    keywords: [
      'flea',
      'fleas',
      'tick',
      'ticks',
      'garapata',
      'pulgas',
      'kuto sa aso',
      'tick and flea',
      'garapata prevention',
    ],
    severity: 'info',
    answer:
      '🪲 **Ticks & Fleas (Garapata at Pulgas) Treatment & Prevention:**\n\nIn the Philippine climate, garapata and pulgas thrive year-round and transmit dangerous blood parasites (Ehrlichiosis / Anaplasmosis / Babesiosis).\n\n**Recommended Veterinary Prevention:**\n• **Oral Chewables (Fastest & Most Effective):** Fluralaner (Bravecto), Afoxolaner (NexGard), or Sarolaner (Simparica) provide 1–3 months of protection.\n• **Spot-On Pipettes:** Applied between shoulder blades (e.g., Frontline, Advocate).\n• **Environmental Cleaning:** Wash bedding in hot water and spray yard/kennel areas (80% of ticks/fleas live in the environment, not on the pet!).\n\n⚠️ If your pet has pale gums, fever, or nosebleeds, visit a clinic for a blood smear check.',
    actions: [
      { label: '🏥 Find Nearby Veterinary Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🗓️ Schedule Reminder in Care Hub', type: 'link', value: '/care-schedule' },
    ],
  },
  {
    id: 'itching_scratching',
    category: 'symptom',
    keywords: ['scratching', 'itching', 'kati', 'nangangati', 'skin', 'balat', 'galis', 'hair loss', 'fur loss', 'dermatitis'],
    severity: 'info',
    answer:
      '🐾 **Itching, Scratching & Skin Issues (Nangangati / Galis):**\n\n**Common Root Causes:**\n1. **Flea Allergy Dermatitis (FAD):** Even a single flea bite can trigger intense full-body scratching.\n2. **Food Allergies:** Common culprits in pet food include specific animal proteins (e.g., chicken or beef), not just grains.\n3. **Mange (Galis):** Demodectic or Sarcoptic mites require vet medication (like oral isoxazolines).\n4. **Fungal / Yeast Infection:** Causes a characteristic potato-chip or corn-chip odor, red skin, and greasy coat.\n\n**Care Advice:** Bathe with a veterinary medicated shampoo (chlorhexidine/ketoconazole). Avoid human soaps or harsh laundry bars.',
    actions: [
      { label: '🏥 Find Veterinary Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🍲 View Food Options in Library', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'not_eating',
    category: 'symptom',
    keywords: ['not eating', 'loss of appetite', 'ayaw kumain', 'walang gana', 'refuse food', 'ayaw ng pagkain'],
    severity: 'caution',
    answer:
      '😿 **Loss of Appetite (Ayaw Kumain / Walang Gana):**\n\n**When to Worry:**\n• **Cats:** A cat refusing food for **24–48 hours** is at high risk of **Hepatic Lipidosis** (fatty liver syndrome), a life-threatening medical emergency!\n• **Dogs:** If skipping meals for more than 24–36 hours, or refusing both food and water.\n\n**Appetite Stimulation Tips:**\n• Warm wet food or broth slightly in the microwave to heighten the aroma.\n• Add a spoonful of warm boiled chicken or plain pumpkin/kalabasa.\n• Ensure the bowl is clean and in a calm, quiet spot.\n• If accompanied by lethargy, fever, or vomiting, see a vet right away.',
    actions: [
      { label: '🏥 Find Nearby Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🍲 Explore Enticing Foods', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'lethargy',
    category: 'symptom',
    keywords: ['lethargic', 'lethargy', 'matamlay', 'nanghihina', 'walang sigla', 'weak', 'sleepy all day', 'tamad kumilos'],
    severity: 'caution',
    answer:
      '😴 **Lethargy & Weakness in Pets (Matamlay / Nanghihina):**\n\nWhile pets sleep a lot, true lethargy means your pet is unresponsive to walks, treats, or playtime.\n\n**Key Checkpoints:**\n• **Check Gum Color:** Lift their upper lip. Gums should be bubblegum pink. If white, pale, yellow, or brick red, seek emergency care!\n• **Hydration Check:** Gently pinch the skin behind their neck. If the skin tent stays raised rather than snapping back, your pet is dehydrated.\n• **Fever Check:** Hot dry ears, shivering, and rapid breathing indicate fever or infection.',
    actions: [
      { label: '🏥 Find Nearby Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '💧 Check Daily Water Goals', type: 'link', value: '/pet-wellness' },
    ],
  },
  {
    id: 'fever_infection',
    category: 'symptom',
    keywords: ['fever', 'lagnat', 'nilalagnat', 'mainit ang katawan', 'shivering', 'nanginginig', 'chills', 'tremors'],
    severity: 'caution',
    answer:
      '🌡️ **Pet Fever & Shivering (Lagnat at Nanginginig):**\n\nA normal pet body temperature is **38.0°C to 39.2°C (101.0°F to 102.5°F)** — warmer than humans!\n\n**Common Signs of Fever:**\n• Ears, nose, groin, and paws feel unusually hot to the touch\n• Shivering, trembling, or panting despite warm weather\n• Red eyes, dry warm nose, and lethargy\n\n**🚨 CRITICAL WARNING:** NEVER give human fever reducers (Paracetamol, Biogesic, Aspirin, Ibuprofen) — they are deadly to pets! Offer cool water, keep them in a well-ventilated room, and bring them to a vet clinic for diagnosis (fever usually indicates bacterial/viral infection or tick-borne disease).',
    actions: [
      { label: '🏥 Find Nearby Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🚨 Why is paracetamol fatal?', type: 'chip', value: 'Can I give paracetamol or biogesic to my pet?' },
    ],
  },
  {
    id: 'coughing_sneezing',
    category: 'symptom',
    keywords: ['cough', 'coughing', 'ubo', 'umuubo', 'sneeze', 'sneezing', 'bumabahing', 'kennel cough', 'sipon'],
    severity: 'caution',
    answer:
      '🐕 **Coughing & Sneezing in Pets (Ubo at Sipon):**\n\n• **Kennel Cough (Bordetella):** Causes a dry, harsh, honking goose-like cough, often after boarding, grooming, or dog park visits.\n• **Heartworm Disease:** Transmitted by mosquitoes in the Philippines; causes chronic cough, exercise fatigue, and breathing difficulty.\n• **Feline Upper Respiratory Infection:** Sneezing, eye discharge, and runny nose in cats.\n\nNever administer human cough syrups or decongestants! Have a vet listen to their lungs and heart with a stethoscope.',
    actions: [
      { label: '🏥 Find Nearby Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🗓️ Check Vaccine Schedule', type: 'link', value: '/care-schedule' },
    ],
  },
  {
    id: 'constipation',
    category: 'symptom',
    keywords: ['constipated', 'constipation', 'hindi makatae', 'straining to poop', 'hirap tumae', 'tigas ng dumi'],
    severity: 'caution',
    answer:
      '📦 **Pet Constipation (Hindi Makatae / Hirap Tumae):**\n\nCommon causes include low water intake, swallowed bone fragments, lack of dietary fiber, or hairballs.\n\n**Safe Home Remedies:**\n• Add 1–2 tablespoons of plain cooked **kalabasa (pumpkin)** for natural soluble fiber.\n• Ensure plenty of fresh drinking water; try switching to wet food for moisture.\n• Take dogs on a brisk walk to stimulate bowel motility.\n\n⚠️ **CRITICAL WARNING FOR MALE CATS:** If a cat is straining in the litter box and producing nothing, verify whether they are trying to pee or poop! **Urinary blockage in male cats is a fatal emergency within 24 hours!**',
    actions: [
      { label: '🏥 Find Nearby Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '💧 Track Water Today', type: 'link', value: '/pet-wellness' },
    ],
  },
  {
    id: 'bad_breath',
    category: 'symptom',
    keywords: ['bad breath', 'mabahong hininga', 'amoy ang bibig', 'dental', 'tartar', 'plaque', 'teeth'],
    severity: 'info',
    answer:
      '🦷 **Pet Dental Health & Bad Breath (Mabahong Hininga):**\n\nPersistent foul breath usually signals periodontal disease, bacterial plaque, or decayed teeth.\n\n**Home Dental Care:**\n• **Pet Toothpaste:** Brush teeth 2–3 times a week using enzymatic pet toothpaste (NEVER human toothpaste, which contains toxic foaming agents and xylitol).\n• **Dental Chews & Raw Carrots:** Help scrape tartar.\n• **Professional Dental Scaling:** If tartar is thick, brown, or gums bleed easily, a veterinary dental cleaning under anesthesia is required.',
    actions: [
      { label: '🏥 Find Dental Vet Clinic', type: 'link', value: '/#nearby-vets' },
    ],
  },

  // ─── 4. ROUTINE CARE, HEALTHCARE & NUTRITION ────────────────────
  {
    id: 'water_needs',
    category: 'hydration',
    keywords: [
      'water',
      'tubig',
      'hydration',
      'drinking',
      'thirsty',
      'uhaw',
      'how much water',
      'gaano karaming tubig',
      'ilang tubig',
      'water requirement',
    ],
    severity: 'info',
    answer:
      '💧 **Daily Pet Water & Hydration Guidelines:**\n\n**Veterinary Standard Guideline:**\n• **Dogs & Cats need approximately ~50 to 60 ml of fresh water per kg of body weight daily.**\n  *(e.g., A 5 kg pet needs ~250–300 ml; a 10 kg pet needs ~500–600 ml daily).* \n\n**Tips for Picky Drinkers (Especially Cats):**\n• Use wide ceramic or stainless steel bowls (avoids whisker fatigue).\n• Try a circulating pet water fountain (cats prefer moving water).\n• Mix warm water or sodium-free broth into dry kibble, or incorporate wet canned food (which is 75–80% moisture).',
    actions: [
      { label: '💧 Track Pet Hydration', type: 'link', value: '/pet-wellness' },
      { label: '🍲 Explore Wet Foods', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'feeding_portions',
    category: 'portion_calories',
    keywords: [
      'how much food',
      'gaano karaming pagkain',
      'how many grams',
      'how much to feed',
      'portion',
      'serving',
      'daily portion',
      'feeding amount',
      'calorie target',
      'calories',
      'kcal',
      'rer',
      'mer',
      'ilang grams',
    ],
    excludeKeywords: ['water', 'tubig', 'vet', 'price', 'presyo'],
    severity: 'info',
    answer:
      '🍲 **Portion Sizing & Calorie Guidelines (Gaano Karami Ipakain):**\n\nThe exact feeding amount depends on weight, age, activity level, and the caloric density (kcal/kg) of the specific pet food.\n\n**General Daily Feeding Rules:**\n• **Adult Dogs:** Typically 2%–3% of their ideal body weight in food per day, divided across 2 balanced meals.\n• **Adult Cats:** Average 200–250 kcal/day, divided into 2–3 smaller meals.\n• **Puppies & Kittens:** Need 2x–3x more calories per kg than adults; divide into 3–4 meals daily.\n\nUse the AniMeal Meal Tracker to automatically calculate your exact grams based on your pet profile!',
    actions: [
      { label: '📊 Open Meal Tracker', type: 'link', value: '/meal-tracker' },
      { label: '🔍 Compare Foods in Library', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'vaccine_deworming',
    category: 'care_routine',
    keywords: [
      'bakuna',
      'vaccine',
      'vaccination',
      'deworm',
      'deworming',
      'purga',
      'anti-rabies',
      'anti rabies',
      '5-in-1',
      '6-in-1',
      '8-in-1',
      '4-in-1',
    ],
    severity: 'info',
    answer:
      '💉 **Philippine Pet Healthcare & Vaccination Schedule:**\n\n🐶 **Puppies & Dogs:**\n• **Deworming (Purga):** Starts at 2, 4, 6, 8 weeks, then monthly until 6 months, then every 3 months for life.\n• **Core Vaccines (5-in-1 / 6-in-1 / 8-in-1):** First dose at 6–8 weeks, booster every 3–4 weeks (3 shots total), then yearly boosters.\n• **Anti-Rabies:** Mandatory by Philippine law at 3–4 months of age, renewed every year.\n\n🐱 **Kittens & Cats:**\n• **4-in-1 (FVRCP) Vaccine:** First shot at 8 weeks, booster 3–4 weeks later, then annually.\n• **Anti-Rabies:** First shot at 3–4 months, then annually.',
    actions: [
      { label: '🏥 Find Nearby Veterinary Clinic', type: 'link', value: '/#nearby-vets' },
      { label: '🗓️ Care Reminders Hub', type: 'link', value: '/care-schedule' },
    ],
  },
  {
    id: 'vet_cost',
    category: 'vet_triage',
    keywords: [
      'magkano magpa-vet',
      'magkano vet',
      'presyo ng vet',
      'vet cost',
      'vet visit cost',
      'bayad sa vet',
      'consultation fee',
      'magkano pacheckup',
      'vet consultation',
    ],
    severity: 'info',
    answer:
      '🏥 **Philippine Veterinary Consultation & Procedure Estimates:**\n\nCosts vary by clinic location (Metro Manila vs provinces) and clinic tier:\n\n• **Basic Consultation / Check-up:** ~₱300 – ₱700\n• **Core Vaccination (5-in-1 / 4-in-1):** ~₱450 – ₱800 per shot\n• **Anti-Rabies Shot:** ~₱250 – ₱450 (or free at local city veterinary offices!)\n• **Deworming (Purga):** ~₱150 – ₱350 based on pet weight\n• **Complete Blood Count (CBC):** ~₱600 – ₱1,200\n• **Emergency / Overnight Hospitalization:** ~₱1,500 – ₱4,000+ per night\n\n*Tip: City and municipal veterinary offices regularly provide free rabies vaccinations and low-cost spay/neuter drives.*',
    actions: [
      { label: '🏥 Find Nearby Vet Clinics', type: 'link', value: '/#nearby-vets' },
      { label: '🚨 Emergency Red Flags', type: 'chip', value: 'Kailan dapat dalhin sa vet?' },
    ],
  },
  {
    id: 'when_to_see_vet',
    category: 'vet_triage',
    keywords: [
      'kailan dapat dalhin sa vet',
      'dalhin sa vet',
      'when to see a vet',
      'when to go to vet',
      'puntang vet',
      'emergency ba',
      'red flags',
    ],
    severity: 'caution',
    answer:
      '🏥 **When Should You Bring Your Pet to the Vet? (Triage Guide):**\n\n**🚨 RED FLAGS (Emergency — Visit a clinic IMMEDIATELY):**\n• Suspected poisoning (chocolate, lilies, paracetamol, rat poison)\n• Difficulty breathing, gasping, or pale/blue gums\n• Continuous vomiting or bloody diarrhea\n• Inability to stand, seizures, or loss of consciousness\n• Straining but unable to urinate (especially male cats!)\n\n**⚠️ YELLOW FLAGS (Visit within 24–48 hours):**\n• Skipping food or water for more than 24 hours\n• Persistent itching, redness, ear discharge\n• Limping or sudden behavioral changes.',
    actions: [
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      { label: '📋 View Wellness Tracker', type: 'link', value: '/pet-wellness' },
    ],
  },
  {
    id: 'bathing_grooming',
    category: 'care_routine',
    keywords: ['paliligo', 'paliguan', 'ligo', 'how often to bathe', 'bathing', 'bath', 'grooming', 'shampoo'],
    severity: 'info',
    answer:
      '🛁 **Pet Bathing & Grooming Guidelines (Paliligo):**\n\n🐶 **Dogs:**\n• **Frequency:** Bathe every 1 to 2 weeks. Bathing too often strips natural skin oils and causes dry, itchy skin.\n• **Shampoo:** Always use a pH-balanced pet shampoo. Never use human shampoo or dishwashing liquids, which disrupt their skin acid mantle.\n• **Drying:** Thoroughly towel-dry or blow-dry on cool/warm setting (avoid trapped dampness that triggers fungal growth).\n\n🐱 **Cats:**\n• Healthy adult cats spend up to 30% of their day self-grooming and rarely need full water baths unless dirty or sticky.',
    actions: [
      { label: '🐾 Skin & Fur Care Tips', type: 'chip', value: 'My pet is scratching and itching — help!' },
    ],
  },
  {
    id: 'food_transition',
    category: 'care_routine',
    keywords: ['transition', 'switch food', 'palit ng pagkain', 'bagong pagkain', 'changing food'],
    severity: 'info',
    answer:
      '🔄 **How to Switch Pet Food Safely (7-Day Transition Rule):**\n\nAbrupt diet changes shock pet gut microflora and cause diarrhea and vomiting. Always transition gradually over 7 to 10 days:\n\n• **Days 1–2:** 75% old food + 25% new food\n• **Days 3–4:** 50% old food + 50% new food\n• **Days 5–6:** 25% old food + 75% new food\n• **Day 7 onward:** 100% new food\n\n*Tip: If mild loose stool occurs, pause the progression for 2 days until digestion stabilizes.*',
    actions: [
      { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      { label: '📊 Meal Tracker', type: 'link', value: '/meal-tracker' },
    ],
  },
  {
    id: 'puppy_kitten_care',
    category: 'care_routine',
    keywords: ['puppy', 'puppies', 'tuta', 'kitten', 'kittens', 'kuting', 'baby pet'],
    severity: 'info',
    answer:
      '🍼 **Puppy & Kitten Nutrition & Care (Tuta at Kuting):**\n\nYoung pets grow rapidly and require high protein, healthy fats (DHA for brain development), and calcium/phosphorus.\n\n• **Feeding Schedule:** 3 to 4 smaller meals daily until 6 months of age.\n• **Life Stage Food:** Choose food formulated specifically for "Puppy" or "Kitten" (or "All Life Stages"). Adult food lacks sufficient calories.\n• **Hydration:** Always ensure fresh water is accessible in shallow bowls.\n• **Deworming & Vaccines:** Must start promptly at 6–8 weeks old to protect against Parvovirus and Distemper.',
    actions: [
      { label: '🗓️ Vaccine Schedule', type: 'link', value: '/care-schedule' },
      { label: '🍲 View Food Options', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'senior_pet_care',
    category: 'care_routine',
    keywords: ['senior', 'senior pet', 'matandang aso', 'matandang pusa', 'older dog', 'older cat', 'aging'],
    severity: 'info',
    answer:
      '🐾 **Senior Pet Care & Nutrition Guidelines:**\n\nPets are generally considered seniors around 7 years of age.\n\n• **Controlled Calories & Easy Digestibility:** Slower metabolism means senior pets gain weight easily; prioritize lean protein with moderate fat.\n• **Joint Support:** Look for foods enriched with Glucosamine, Chondroitin, and Omega-3 fatty acids for arthritis relief.\n• **Hydration & Kidneys:** Older cats often face kidney disease; adding wet food helps maintain kidney function.\n• **Softer Textures:** If teeth are worn or missing, soak dry kibble in warm water or switch to savory stews.',
    actions: [
      { label: '🍲 Compare Senior Foods in Library', type: 'link', value: '/food-library' },
      { label: '💧 Track Daily Water Intake', type: 'link', value: '/pet-wellness' },
    ],
  },
  {
    id: 'wet_vs_dry',
    category: 'portion_calories',
    keywords: ['wet food', 'dry food', 'canned', 'kibble', 'pouch', 'wet vs dry', 'mas maganda ba wet food'],
    severity: 'info',
    answer:
      '🥫 **Wet Food vs. Dry Kibble: Which is Better?**\n\nBoth offer unique advantages, and many pet parents feed a **50/50 mix**:\n\n**Dry Food (Kibble):**\n✅ Highly cost-effective per calorie (tipid)\n✅ Easy storage and longer shelf life\n✅ Helps gently abrade dental tartar\n\n**Wet Food (Canned / Pouches):**\n✅ 75–80% moisture — excellent for bladder and kidney hydration\n✅ Highly aromatic and irresistible to picky eaters\n✅ Softer for senior pets or pets with dental issues.',
    actions: [
      { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      { label: '📊 Meal Tracker', type: 'link', value: '/meal-tracker' },
    ],
  },
  {
    id: 'budget_tips',
    category: 'portion_calories',
    keywords: ['affordable', 'mura', 'budget', 'presyo', 'tipid', 'cheap food', 'best affordable'],
    severity: 'info',
    answer:
      '💡 **Choosing Affordable & Nutritious Pet Food (Tipid Tips):**\n\n1. **Check Price-per-Calorie (₱/kcal):** Some budget kibbles have low nutrient density, meaning you need to feed double portions. AniMeal calculates price-per-calorie automatically in the Food Library!\n2. **Look for Real Animal Protein:** The first 2 ingredients should clearly state poultry or meat (e.g., chicken meal, deboned salmon).\n3. **Buy in Bigger Bags (Bulk):** 10–15 kg sacks save 20–35% compared to small 1 kg pouches.\n4. **Supplement with Safe Budget Whole Foods:** Boil cheap chicken liver, squash (kalabasa), or carrots with rice as nutrient-dense meal toppers.',
    actions: [
      { label: '🔍 Compare Foods in Library', type: 'link', value: '/food-library' },
      { label: '📊 Track Meal Expenses', type: 'link', value: '/meal-tracker' },
    ],
  },

  // ─── 5. CONVERSATIONAL & SOCIAL INTERACTIONS ────────────────────
  {
    id: 'greeting',
    category: 'conversational',
    keywords: [
      'hello',
      'hi',
      'kamusta',
      'musta',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'magandang umaga',
      'magandang hapon',
      'magandang gabi',
      'sup',
    ],
    severity: 'info',
    answer:
      'Hello there! 🐾 I am **Mealie**, your AI Pet Nutrition & Care Assistant!\n\nI am ready to help you with:\n• **Food Safety Checks:** "Can dogs eat chicken and rice?", "Safe ba ang saging?"\n• **Toxic Hazard Alerts:** Warnings for chocolate, onions, grapes, paracetamol, etc.\n• **Portions & Hydration:** Daily calorie and water calculations tailored to your pet\n• **Everyday Wellness:** Symptom guidance, veterinary schedules, and care tips\n\nWhat would you like to ask or explore today?',
    actions: [
      { label: '🍫 Is chocolate safe?', type: 'chip', value: 'Is chocolate safe for dogs?' },
      { label: '🍗 Can dogs eat chicken & rice?', type: 'chip', value: 'Can dogs eat chicken and rice?' },
      { label: '💧 Daily water goal?', type: 'chip', value: 'How much water does my pet need?' },
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
    ],
  },
  {
    id: 'gratitude',
    category: 'conversational',
    keywords: ['thank you', 'thanks', 'salamat', 'maraming salamat', 'thank u', 'salamat mealie'],
    severity: 'info',
    answer:
      'You are very welcome! 🐾 Always happy to help keep your furry companion happy, healthy, and safe.\n\nFeel free to ask anytime you need food recommendations, portion calculations, or wellness advice. Give your pet an extra belly rub from Mealie! ❤️',
    actions: [
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
      { label: '📊 Open Meal Tracker', type: 'link', value: '/meal-tracker' },
    ],
  },
  {
    id: 'identity_help',
    category: 'conversational',
    keywords: [
      'who are you',
      'sino ka',
      'what can you do',
      'ano kaya mo',
      'help',
      'tulong',
      'anong pwede itanong',
      'features',
    ],
    severity: 'info',
    answer:
      '🐾 **Kamusta! I am Mealie**, your specialized AI pet care companion built for AniMeal.\n\n**Here is what I can do for you:**\n1. **Toxic Ingredients Check:** Instant emergency warnings on human foods and household hazards.\n2. **Safe Treat Advice:** Safe preparation tips for chicken, eggs, fruits, and veggies.\n3. **Tailored Nutrition:** Calorie & portion targets calculated specifically for your pet\'s weight and life stage.\n4. **Hydration Goals:** Daily water volume targets based on weight.\n5. **Symptom Triage:** Guidance on vomiting, diarrhea, ticks/fleas, and when to rush to the vet.',
    actions: [
      { label: '🍫 Is chocolate safe?', type: 'chip', value: 'Is chocolate safe for dogs?' },
      { label: '🍲 Open Food Library', type: 'link', value: '/food-library' },
      { label: '🏥 Nearby Vet Clinics', type: 'link', value: '/#nearby-vets' },
    ],
  },
  {
    id: 'farewell',
    category: 'conversational',
    keywords: ['bye', 'goodbye', 'paalam', 'cya', 'see you', 'alis na ako'],
    severity: 'info',
    answer:
      'Paalam! 🐾 Take great care of your pet, and remember to keep fresh water available at all times. Come back anytime you have nutrition or pet care questions!',
    actions: [
      { label: '💧 View Water Goals', type: 'link', value: '/pet-wellness' },
      { label: '🍲 Log Meal', type: 'link', value: '/meal-tracker' },
    ],
  },
  {
    id: 'pet_profile_query',
    category: 'conversational',
    keywords: [
      'tell me about my pet',
      'kamusta si',
      'profile ng pet',
      'pet profile',
      'my pet status',
    ],
    severity: 'info',
    answer:
      'I can provide personalized guidance based on your active pet profile! Make sure you select your pet from the top dropdown header so I can calculate their exact calories, hydration goals, and species-safe food suggestions.',
    actions: [
      { label: '📊 View Meal Tracker', type: 'link', value: '/meal-tracker' },
      { label: '💧 Pet Wellness', type: 'link', value: '/pet-wellness' },
    ],
  },
]

/**
 * Helper to match keyword with word boundary checks.
 * Prevents short keywords (like "hi", "cat", "egg") from false-matching inside unrelated words
 * (such as "shivering", "this", "white", "scatter").
 */
function matchesKeyword(cleanQuery: string, kw: string): boolean {
  const lowerKw = kw.toLowerCase().trim()
  if (!lowerKw) return false

  // If keyword is a phrase with spaces (e.g. "chicken and rice"), match phrase
  if (lowerKw.includes(' ')) {
    return cleanQuery.includes(lowerKw)
  }

  // Single word: use word boundary check
  const escaped = lowerKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i')
  return regex.test(cleanQuery)
}

/**
 * Intelligent topic matcher with word boundary scoring and negative keyword support.
 */
function findBestTopic(cleanQuery: string): KnowledgeTopic | null {
  let bestTopic: KnowledgeTopic | null = null
  let highestScore = 0

  for (const topic of KNOWLEDGE_TOPICS) {
    // Check if any exclude keywords match
    if (
      topic.excludeKeywords &&
      topic.excludeKeywords.some((ex) => matchesKeyword(cleanQuery, ex))
    ) {
      continue
    }

    let topicScore = 0

    for (const kw of topic.keywords) {
      const lowerKw = kw.toLowerCase().trim()
      if (cleanQuery === lowerKw) {
        // Exact full query match gets huge boost
        topicScore += 100
      } else if (matchesKeyword(cleanQuery, lowerKw)) {
        // Longer phrases are more specific
        const words = lowerKw.split(/\s+/).length
        topicScore += lowerKw.length + (words > 1 ? words * 15 : 0)
      }
    }

    // Emergency topics get higher priority to avoid misclassifying hazards
    if (topic.category === 'emergency' && topicScore > 0) {
      topicScore += 30
    }

    if (topicScore > highestScore) {
      highestScore = topicScore
      bestTopic = topic
    }
  }

  return highestScore > 0 ? bestTopic : null
}

/**
 * Generate a smart, context-aware answer from Mealie.
 */
export function generateMealieAnswer(
  query: string,
  pet: Pet | null,
): MealieResponse {
  const cleanQuery = query.trim().toLowerCase()

  // 1. Match from high-coverage knowledge topics
  const matchedTopic = findBestTopic(cleanQuery)
  if (matchedTopic) {
    let content = matchedTopic.answer
    if (pet) {
      content = personalizeResponse(content, pet, matchedTopic.category, cleanQuery)
    }

    const defaultActions: ChatAction[] = matchedTopic.category === 'emergency'
      ? [
          { label: '🚨 Find Emergency Vet Clinic', type: 'link', value: '/#nearby-vets' },
          { label: '📞 Call PAWS Hotline: (02) 8475-1688', type: 'link', value: 'tel:0284751688' },
        ]
      : [
          { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
          { label: '📊 Open Meal Tracker', type: 'link', value: '/meal-tracker' },
        ]

    return {
      content,
      severity: matchedTopic.severity,
      actions: matchedTopic.actions && matchedTopic.actions.length > 0 ? matchedTopic.actions : defaultActions,
    }
  }

  // 2. Check standard KB fallback (for any extra legacy topics)
  const legacyMatch = findAnswer(cleanQuery)
  if (legacyMatch) {
    let content = legacyMatch.answer
    if (pet) {
      content = personalizeResponse(content, pet, 'portion_calories', cleanQuery)
    }
    return {
      content,
      severity: (legacyMatch.severity as 'info' | 'caution' | 'emergency') || 'info',
      actions: [
        { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
        { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      ],
    }
  }

  // 3. Smart, non-repetitive contextual fallback
  return generateDynamicFallback(query, pet)
}

/**
 * Generates an intelligent, diverse fallback response when a query doesn't match a static topic.
 */
function generateDynamicFallback(query: string, pet: Pet | null): MealieResponse {
  const q = query.toLowerCase()

  const isFoodQuery =
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('pwede') ||
    q.includes('can i give') ||
    q.includes('safe') ||
    q.includes('kain') ||
    q.includes('ulam')

  const isSymptomQuery =
    q.includes('sick') ||
    q.includes('sakit') ||
    q.includes('masakit') ||
    q.includes('pain') ||
    q.includes('poop') ||
    q.includes('tae') ||
    q.includes('dugo') ||
    q.includes('blood')

  if (isFoodQuery) {
    const petText = pet ? `for **${pet.name}** (${pet.species})` : 'for your pet'
    return {
      content: `I hear you asking about food safety ${petText} regarding "${query}".\n\nWhile I don't have this exact item in my quick catalog, here are essential golden rules for whole foods:\n\n• **Always Safe in Moderation:** Plain boiled chicken breast, plain white rice, cooked pumpkin/kalabasa, cooked eggs, and carrots.\n• **Strictly Dangerous:** Onions, garlic, chocolate, grapes/raisins, xylitol, cooked bones, alcohol, and caffeine.\n• **Rule of Thumb:** Any human food given should be unseasoned (no salt, garlic, or onions) and keep treats under 10% of their daily calories.`,
      severity: 'info',
      actions: [
        { label: '🍲 Explore Food Library', type: 'link', value: '/food-library' },
        { label: '🍗 Can pets eat chicken & rice?', type: 'chip', value: 'Can dogs eat chicken and rice?' },
        { label: '🍫 What foods are toxic?', type: 'chip', value: 'Is chocolate safe for dogs?' },
      ],
    }
  }

  if (isSymptomQuery) {
    const petName = pet ? pet.name : 'your pet'
    return {
      content: `I noticed you asked about symptoms concerning **${petName}** ("${query}").\n\n**Veterinary Precaution:**\nIf ${petName} is showing persistent discomfort, refusal to drink, continuous vomiting, or difficulty breathing, please consult a licensed veterinarian right away.\n\nFeel free to ask me about specific symptoms like **vomiting**, **diarrhea**, **garapata (ticks)**, or **loss of appetite** for immediate first-aid steps!`,
      severity: 'caution',
      actions: [
        { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
        { label: '🤢 What to do for vomiting?', type: 'chip', value: 'My pet is vomiting — what do I do?' },
        { label: '💩 What to do for diarrhea?', type: 'chip', value: 'My pet has diarrhea — what to do?' },
      ],
    }
  }

  // General conversational fallback
  if (pet) {
    return {
      content: `Kamusta! I hear your question: *"${query}"*.\n\nWhile I didn't find an exact match for that phrasing, I am ready to help you with advice tailored for **${pet.name}** (${pet.avatarEmoji || '🐾'} ${pet.species}, ${pet.weight} kg, ${pet.lifeStage}):\n\n• **Daily Calorie Target:** ~${pet.dailyCalorieTarget} kcal/day\n• **Daily Hydration Goal:** ~${pet.waterGoal} ml\n\nTry asking me about specific ingredients (e.g. *"Pwede ba ang itlog o manok?"*), toxic items (*"Is chocolate or garlic safe?"*), or daily care!`,
      severity: 'info',
      actions: [
        { label: '🍗 Safe Human Foods', type: 'chip', value: 'Can dogs eat chicken and rice?' },
        { label: '💧 Water Intake Goal', type: 'chip', value: 'How much water does my pet need?' },
        { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
      ],
    }
  }

  return {
    content: defaultResponse,
    severity: 'info',
    actions: [
      { label: '🍫 Is chocolate safe for dogs?', type: 'chip', value: 'Is chocolate safe for dogs?' },
      { label: '🍲 How much should I feed?', type: 'chip', value: 'How much food should I feed my pet?' },
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
    ],
  }
}

/**
 * Augments responses with personalized pet metrics only when relevant.
 */
function personalizeResponse(
  text: string,
  pet: Pet,
  category: TopicCategory,
  cleanQuery: string,
): string {
  // 1. Feeding / calorie questions
  if (category === 'portion_calories' || cleanQuery.includes('daily calorie') || cleanQuery.includes('ilang grams')) {
    const lifeStageNote =
      pet.lifeStage === 'puppy' || pet.lifeStage === 'kitten'
        ? `\n• As a **${pet.lifeStage}**, ${pet.name} is in an active growth phase! Divide food into 3–4 smaller meals a day with high protein and DHA.`
        : pet.lifeStage === 'senior'
          ? `\n• As a **senior**, ${pet.name} benefits from easy-to-digest proteins, joint supplements, and controlled phosphorus.`
          : `\n• Divide their meals into 2 balanced servings per day to maintain ideal body condition.`

    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 **Personalized Target for ${pet.name} (${pet.avatarEmoji || '🐾'} ${pet.species}, ${pet.weight} kg):**\n• **Estimated Daily Energy (RER/MER):** ~${pet.dailyCalorieTarget} kcal/day\n• **Suggested Daily Water:** ~${pet.waterGoal} ml${lifeStageNote}`
  }

  // 2. Water / hydration questions
  if (category === 'hydration' || cleanQuery.includes('water') || cleanQuery.includes('tubig') || cleanQuery.includes('hydration')) {
    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━\n💧 **Hydration Goal for ${pet.name}:**\nBased on ${pet.name}'s weight of **${pet.weight} kg**, aim for approximately **${pet.waterGoal || Math.round(pet.weight * 50)} ml of fresh water daily**.`
  }

  // 3. Safe human treats: provide treat moderation guideline
  if (category === 'safe_food') {
    const maxTreatCalories = Math.round(pet.dailyCalorieTarget * 0.1)
    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━\n💡 **Treat Moderation for ${pet.name} (${pet.weight} kg):**\nTreats and whole-food additions should make up no more than 10% of ${pet.name}'s daily calories (**~${maxTreatCalories} kcal/day**). The rest should come from balanced pet food.`
  }

  // 4. Emergency / toxic alert: add immediate pet weight context
  if (category === 'emergency') {
    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━\n🚨 **Urgent Note for ${pet.name} (${pet.weight} kg):**\nToxicity severity is directly dependent on body weight. For a ${pet.weight} kg ${pet.species}, act immediately!`
  }

  return text
}
