import { generateMealieAnswer } from '../src/components/ask-mealie/mealie-assistant'
import type { Pet } from '../src/types'

const bantay: Pet = {
  id: 'p1',
  name: 'Bantay',
  species: 'dog',
  breed: 'Aspin',
  weight: 12,
  age: 2,
  lifeStage: 'adult',
  dailyCalorieTarget: 720,
  waterGoal: 600,
  avatarEmoji: '🐕',
}

const mochi: Pet = {
  id: 'p2',
  name: 'Mochi',
  species: 'cat',
  breed: 'Persian',
  weight: 4,
  age: 1,
  lifeStage: 'adult',
  dailyCalorieTarget: 220,
  waterGoal: 200,
  avatarEmoji: '🐱',
}

type TestCase = {
  name: string
  query: string
  pet: Pet | null
  expectSeverity?: 'info' | 'caution' | 'emergency'
  shouldContain: string[]
  shouldNotContain?: string[]
}

const testCases: TestCase[] = [
  // 1. Toxic & Emergency
  {
    name: 'Chocolate for dogs',
    query: 'Is chocolate safe for dogs?',
    pet: bantay,
    expectSeverity: 'emergency',
    shouldContain: ['Chocolate is toxic', 'theobromine', 'EMERGENCY'],
    shouldNotContain: ['Daily Calorie Target', 'While I don\'t have a direct answer'],
  },
  {
    name: 'Grapes for dogs',
    query: 'Can my dog eat grapes or raisins?',
    pet: bantay,
    expectSeverity: 'emergency',
    shouldContain: ['kidney failure', 'Grapes and raisins'],
  },
  {
    name: 'Lilies for cats',
    query: 'Can cats smell lilies?',
    pet: mochi,
    expectSeverity: 'emergency',
    shouldContain: ['Lilies', 'fatal to cats', 'kidney failure'],
  },
  {
    name: 'Human painkillers',
    query: 'Pwede ba uminom ng biogesic o paracetamol ang aso ko?',
    pet: bantay,
    expectSeverity: 'emergency',
    shouldContain: ['Paracetamol', 'toxic and fatal'],
  },

  // 2. Safe Foods
  {
    name: 'Boiled chicken',
    query: 'Can dogs eat chicken and rice?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Boiled Chicken & Rice', 'Treat Moderation for Bantay'],
    shouldNotContain: ['While I don\'t have a direct answer'],
  },
  {
    name: 'Cooked eggs',
    query: 'Pwede ba ang itlog sa aso?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Eggs (Itlog) for Pets', 'protein'],
  },
  {
    name: 'Kalabasa / pumpkin',
    query: 'Is kalabasa safe for pets?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Kalabasa (Squash / Pumpkin)', 'Soluble Fiber'],
  },
  {
    name: 'Carrots',
    query: 'Can dogs eat carrots?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Carrots for Pets', 'chew toy'],
  },
  {
    name: 'Dairy / Milk caution',
    query: 'Can cats drink cow milk?',
    pet: mochi,
    expectSeverity: 'caution',
    shouldContain: ['lactose intolerant', 'Cow\'s Milk'],
  },

  // 3. Hydration vs Feeding Portions (No Hijacking!)
  {
    name: 'Water needs question (must not return food portions)',
    query: 'How much water does my pet need daily?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Daily Pet Water & Hydration Guidelines', '~50 to 60 ml', '600 ml of fresh water daily'],
    shouldNotContain: ['RER/MER', 'Daily Energy', '720 kcal/day in food per day'],
  },
  {
    name: 'Food portion question (must return food calories)',
    query: 'How much food should I feed my pet?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Portion Sizing & Calorie Guidelines', '~720 kcal/day'],
  },

  // 4. Symptoms
  {
    name: 'Vomiting triage',
    query: 'My dog is vomiting — what to do?',
    pet: bantay,
    expectSeverity: 'caution',
    shouldContain: ['Pet Vomiting (Pagsusuka)', 'bland boiled chicken'],
  },
  {
    name: 'Diarrhea care',
    query: 'My pet has diarrhea and watery poop',
    pet: bantay,
    expectSeverity: 'caution',
    shouldContain: ['Pet Diarrhea', 'kalabasa'],
  },
  {
    name: 'Ticks and fleas',
    query: 'May garapata at pulgas ang aso ko',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Ticks & Fleas (Garapata at Pulgas)', 'NexGard', 'Bravecto'],
  },

  // 5. Healthcare & Triage
  {
    name: 'Vet checkup costs (must not return food portion)',
    query: 'Magkano magpa-vet at pacheckup?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Philippine Veterinary Consultation & Procedure Estimates', '₱300 – ₱700'],
    shouldNotContain: ['720 kcal/day'],
  },
  {
    name: 'When to see a vet',
    query: 'Kailan dapat dalhin sa vet ang alaga?',
    pet: bantay,
    expectSeverity: 'caution',
    shouldContain: ['RED FLAGS', 'YELLOW FLAGS'],
  },

  // 6. Conversational
  {
    name: 'Greeting',
    query: 'Hello Mealie!',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['Hello there! 🐾 I am **Mealie**', 'Food Safety Checks'],
    shouldNotContain: ['While I don\'t have a direct answer'],
  },
  {
    name: 'Gratitude',
    query: 'Maraming salamat Mealie',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['You are very welcome! 🐾'],
    shouldNotContain: ['While I don\'t have a direct answer'],
  },

  // 7. Unknown / Fallback: should not be repetitive or broken
  {
    name: 'Uncataloged food fallback',
    query: 'Can dogs eat dragonfruit or pitaya?',
    pet: bantay,
    expectSeverity: 'info',
    shouldContain: ['food safety for **Bantay**', 'dragonfruit'],
  },
]

let passed = 0
let failed = 0

console.log('\n🧪 Testing Mealie Assistant Local Knowledge Engine...\n')

for (const t of testCases) {
  const res = generateMealieAnswer(t.query, t.pet)
  let ok = true
  const errors: string[] = []

  if (t.expectSeverity && res.severity !== t.expectSeverity) {
    ok = false
    errors.push(`Expected severity '${t.expectSeverity}', got '${res.severity}'`)
  }

  for (const needle of t.shouldContain) {
    if (!res.content.toLowerCase().includes(needle.toLowerCase())) {
      ok = false
      errors.push(`Content missing expected substring: "${needle}"`)
    }
  }

  if (t.shouldNotContain) {
    for (const needle of t.shouldNotContain) {
      if (res.content.toLowerCase().includes(needle.toLowerCase())) {
        ok = false
        errors.push(`Content unexpectedly contained forbidden substring: "${needle}"`)
      }
    }
  }

  if (ok) {
    console.log(`  ✓ PASS: ${t.name}`)
    passed++
  } else {
    console.log(`  ✗ FAIL: ${t.name}`)
    errors.forEach((e) => console.log(`     -> ${e}`))
    failed++
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`)
process.exit(failed > 0 ? 1 : 0)
