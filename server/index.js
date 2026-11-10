import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '15mb' }))

// Database file path
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initial default database structure
const defaultDb = {
  pets: [
    {
      id: 'sample-bruno',
      name: 'Bruno',
      species: 'dog',
      breed: 'Golden Retriever',
      weight: 12,
      age: 24,
      neutered: true,
      lifeStage: 'adult',
      avatarEmoji: '🐕',
      dailyCalorieTarget: 720,
      waterGoal: 600,
      createdAt: new Date().toISOString(),
    },
  ],
  feedings: [
    {
      id: 'feed-1',
      petId: 'sample-bruno',
      foodId: 'dog-ped-adult',
      foodName: 'Pedigree Adult Chicken & Vegetables',
      portion: 180,
      unit: 'g',
      calories: 621,
      protein: 38,
      fat: 18,
      fiber: 9,
      fedBy: 'Maria',
      timestamp: new Date().toISOString(),
    },
  ],
  waterLogs: [
    {
      id: 'water-1',
      petId: 'sample-bruno',
      amount: 450,
      timestamp: new Date().toISOString(),
    },
  ],
  weightLogs: [
    {
      id: 'weight-1',
      petId: 'sample-bruno',
      weight: 12.4,
      date: new Date().toISOString(),
      notes: 'Healthy active weight',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      petId: 'sample-bruno',
      type: 'deworming',
      title: 'Deworming Booster',
      notes: 'Quarterly veterinary scheduled dose',
      frequency: 'monthly',
      time: '09:00',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      petId: 'sample-bruno',
      type: 'feeding',
      title: 'Dinner Time (180g)',
      frequency: 'daily',
      time: '18:00',
      dueDate: new Date().toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ],
  household: [
    { id: 'owner', name: 'Me', color: '#44632f', isOwner: true },
    { id: 'member-1', name: 'Maria', color: '#164040', isOwner: false },
    { id: 'member-2', name: 'Kuya Jun', color: '#b5432f', isOwner: false },
  ],
  customFoods: [],
}

// Load DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8')
      return defaultDb
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading db, using defaults:', err)
    return defaultDb
  }
}

// Save DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing db:', err)
  }
}

// ID Generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Scientific RER Calorie Formula
function calculateDailyCalories(weightKg, species, lifeStage, neutered) {
  if (weightKg <= 0) return 0
  const rer = 70 * Math.pow(weightKg, 0.75)
  let multiplier = 1.6
  if (species === 'dog') {
    if (lifeStage === 'puppy') multiplier = 2.0
    else if (lifeStage === 'senior') multiplier = 1.4
    else multiplier = neutered ? 1.6 : 1.8
  } else {
    if (lifeStage === 'kitten') multiplier = 2.5
    else if (lifeStage === 'senior') multiplier = 1.1
    else multiplier = neutered ? 1.2 : 1.4
  }
  return Math.round(rer * multiplier)
}

// ─────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────

// Root info route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; background: #f6f3ec; color: #164040;">
        <h1>🐾 AniMeal Backend API is Running</h1>
        <p>This is the backend server (port 3001). To view the actual website, open:</p>
        <p><a href="http://localhost:5173" style="font-size: 1.25rem; font-weight: bold; color: #44632f;">👉 http://localhost:5173</a></p>
      </body>
    </html>
  `)
})

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AniMeal Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ── 1. PETS ──
app.get('/api/pets', (req, res) => {
  const db = readDb()
  res.json(db.pets || [])
})

app.post('/api/pets', (req, res) => {
  const db = readDb()
  const { name, species, breed, weight, age, neutered, lifeStage, avatarEmoji } = req.body

  const weightNum = Number(weight) || 5
  const dailyCalorieTarget = calculateDailyCalories(weightNum, species, lifeStage, neutered)
  const waterGoal = Math.round(weightNum * 50)

  const newPet = {
    id: generateId(),
    name: name || 'Furry Friend',
    species: species || 'dog',
    breed: breed || 'Mixed Breed',
    weight: weightNum,
    age: Number(age) || 12,
    neutered: Boolean(neutered),
    lifeStage: lifeStage || 'adult',
    avatarEmoji: avatarEmoji || (species === 'cat' ? '🐱' : '🐕'),
    dailyCalorieTarget,
    waterGoal,
    createdAt: new Date().toISOString(),
  }

  db.pets.push(newPet)
  writeDb(db)
  res.status(201).json(newPet)
})

app.put('/api/pets/:id', (req, res) => {
  const db = readDb()
  const idx = db.pets.findIndex((p) => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Pet not found' })

  const current = db.pets[idx]
  const updated = { ...current, ...req.body }

  if (req.body.weight || req.body.species || req.body.lifeStage || req.body.neutered !== undefined) {
    updated.dailyCalorieTarget = calculateDailyCalories(
      updated.weight,
      updated.species,
      updated.lifeStage,
      updated.neutered
    )
    updated.waterGoal = Math.round(updated.weight * 50)
  }

  db.pets[idx] = updated
  writeDb(db)
  res.json(updated)
})

app.delete('/api/pets/:id', (req, res) => {
  const db = readDb()
  db.pets = db.pets.filter((p) => p.id !== req.params.id)
  db.feedings = db.feedings.filter((f) => f.petId !== req.params.id)
  db.waterLogs = db.waterLogs.filter((w) => w.petId !== req.params.id)
  db.weightLogs = db.weightLogs.filter((w) => w.petId !== req.params.id)
  db.tasks = db.tasks.filter((t) => t.petId !== req.params.id)
  writeDb(db)
  res.json({ success: true, message: 'Pet and associated logs removed' })
})

// ── 2. FEEDING & NUTRITION ──
app.get('/api/feedings', (req, res) => {
  const db = readDb()
  const { petId, todayOnly } = req.query
  let list = db.feedings || []
  if (petId) {
    list = list.filter((f) => f.petId === petId)
  }
  if (todayOnly === 'true') {
    const todayStr = new Date().toDateString()
    list = list.filter((f) => new Date(f.timestamp).toDateString() === todayStr && !f.undone)
  }
  res.json(list)
})

app.post('/api/feedings', (req, res) => {
  const db = readDb()
  const entry = {
    ...req.body,
    id: generateId(),
    timestamp: req.body.timestamp || new Date().toISOString(),
  }
  db.feedings.unshift(entry)
  writeDb(db)
  res.status(201).json(entry)
})

app.post('/api/feedings/:id/undo', (req, res) => {
  const db = readDb()
  const item = db.feedings.find((f) => f.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Feeding entry not found' })
  item.undone = true
  writeDb(db)
  res.json(item)
})

// ── 3. WELLNESS (WATER & WEIGHT) ──
app.get('/api/wellness/water/:petId', (req, res) => {
  const db = readDb()
  const list = (db.waterLogs || []).filter((w) => w.petId === req.params.petId)
  const todayStr = new Date().toDateString()
  const todayTotal = list
    .filter((w) => new Date(w.timestamp).toDateString() === todayStr)
    .reduce((sum, w) => sum + w.amount, 0)
  res.json({ logs: list, todayTotal })
})

app.post('/api/wellness/water', (req, res) => {
  const db = readDb()
  const entry = {
    id: generateId(),
    petId: req.body.petId,
    amount: Number(req.body.amount) || 50,
    timestamp: new Date().toISOString(),
  }
  db.waterLogs.unshift(entry)
  writeDb(db)
  res.status(201).json(entry)
})

app.get('/api/wellness/weight/:petId', (req, res) => {
  const db = readDb()
  const list = (db.weightLogs || [])
    .filter((w) => w.petId === req.params.petId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  res.json(list)
})

app.post('/api/wellness/weight', (req, res) => {
  const db = readDb()
  const entry = {
    id: generateId(),
    petId: req.body.petId,
    weight: Number(req.body.weight),
    date: req.body.date || new Date().toISOString(),
    notes: req.body.notes || '',
  }
  db.weightLogs.unshift(entry)
  writeDb(db)
  res.status(201).json(entry)
})

// ── 4. CARE SCHEDULE & TASKS ──
app.get('/api/tasks', (req, res) => {
  const db = readDb()
  const { petId } = req.query
  let list = db.tasks || []
  if (petId) {
    list = list.filter((t) => t.petId === petId)
  }
  res.json(list)
})

app.post('/api/tasks', (req, res) => {
  const db = readDb()
  const task = {
    ...req.body,
    id: generateId(),
    completed: false,
    createdAt: new Date().toISOString(),
  }
  db.tasks.unshift(task)
  writeDb(db)
  res.status(201).json(task)
})

app.put('/api/tasks/:id/complete', (req, res) => {
  const db = readDb()
  const task = db.tasks.find((t) => t.id === req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  task.completed = true
  task.completedBy = req.body.completedBy || 'Me'
  task.completedAt = new Date().toISOString()
  writeDb(db)
  res.json(task)
})

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDb()
  db.tasks = db.tasks.filter((t) => t.id !== req.params.id)
  writeDb(db)
  res.json({ success: true })
})

// ── 5. SHARED HOUSEHOLD ──
app.get('/api/household', (req, res) => {
  const db = readDb()
  res.json(db.household || [])
})

app.post('/api/household', (req, res) => {
  const db = readDb()
  const colors = ['#44632f', '#164040', '#b5432f', '#8b6914', '#6b21a8', '#0e7490']
  const member = {
    id: generateId(),
    name: req.body.name || 'Family Member',
    color: colors[db.household.length % colors.length],
    isOwner: false,
  }
  db.household.push(member)
  writeDb(db)
  res.status(201).json(member)
})

// ── 6. MEALIE AI CONVERSATION ENGINE ──
const TOXIC_TRIGGERS = [
  { words: ['chocolate', 'tsokolate', 'cacao'], item: 'Chocolate', danger: 'high' },
  { words: ['onion', 'sibuyas', 'garlic', 'bawang', 'leek'], item: 'Onions / Garlic (Allium)', danger: 'high' },
  { words: ['grape', 'raisin', 'ubas'], item: 'Grapes / Raisins', danger: 'high' },
  { words: ['xylitol', 'sugar-free', 'sweetener'], item: 'Xylitol', danger: 'high' },
  { words: ['paracetamol', 'biogesic', 'ibuprofen', 'panadol'], item: 'Human Painkillers', danger: 'emergency' },
]

app.post('/api/mealie/chat', (req, res) => {
  const { message, petContext } = req.body
  const q = (message || '').toLowerCase()

  // 1. Check for emergency toxic substances
  for (const trigger of TOXIC_TRIGGERS) {
    if (trigger.words.some((w) => q.includes(w))) {
      return res.json({
        role: 'mealie',
        severity: 'emergency',
        content: `🚨 **EMERGENCY WARNING: ${trigger.item} is extremely toxic to pets!**\n\nIngestion can cause acute organ damage or toxicity. Do NOT induce vomiting without consulting a professional.\n\n**Immediate Action:** Please contact or proceed immediately to the nearest veterinary emergency clinic!`,
        actions: [
          { label: '🏥 Find Emergency Vet Clinic Now', type: 'link', value: '/#nearby-vets' },
          { label: '📞 Call Emergency Hotline', type: 'link', value: 'tel:0285349012' },
        ],
        timestamp: new Date().toISOString(),
      })
    }
  }

  // 2. Personalized response with pet context
  const petName = petContext?.name ? `**${petContext.name}**` : 'your pet'
  const petSpecies = petContext?.species || 'pet'

  if (q.includes('how much') || q.includes('magkano') || q.includes('portion') || q.includes('gaano karami')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `For ${petName} (${petContext?.weight ? `${petContext.weight} kg` : ''} ${petSpecies}), daily food intake depends on calculated Resting Energy Requirements (RER).\n\n💡 **AniMeal Recommendation:**\n• Estimated target: **${petContext?.dailyCalorieTarget || '600–750'} kcal per day**\n• Divide portions across **2 to 3 balanced meals**\n• Adjust if ${petName} is unusually active or recovering.\n\nCheck your **Meal Tracker** to log meals with automatic portion calculation!`,
      actions: [
        { label: '🍲 Open Meal Tracker', type: 'link', value: '/meal-tracker' },
        { label: '📖 Explore Food Library', type: 'link', value: '/food-library' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  if (q.includes('water') || q.includes('tubig') || q.includes('hydration')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `💧 Hydration is essential! The veterinary guideline for ${petSpecies}s is **~50 ml of fresh water per kg of body weight** daily.\n\nFor ${petName}, that's roughly **${petContext?.waterGoal || 500} ml per day**. Tip: If ${petName} is a picky drinker, incorporating wet food helps boost water intake!`,
      actions: [
        { label: '💧 Track Water Today', type: 'link', value: '/pet-wellness?tab=water' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // General helpful response
  res.json({
    role: 'mealie',
    severity: 'info',
    content: `Kamusta! I am **Mealie**, your AI pet nutrition assistant! 🐾\n\nI can help you review ingredients, calculate portion targets for ${petName}, or guide you on when to visit the clinic.\n\nAsk me about safe fruits, best foods for Pinoy pets, or common symptoms!`,
    actions: [
      { label: '🍲 What foods are safe?', type: 'chip', value: 'Can dogs eat human food?' },
      { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
    ],
    timestamp: new Date().toISOString(),
  })
})

// ── 7. SERVER-SIDE GEMINI AI PROXY ──
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY

function getGeminiClient() {
  if (!GEMINI_KEY) return null
  return new GoogleGenAI({ apiKey: GEMINI_KEY })
}

function buildServerMealiePrompt(pet) {
  const petCtx = pet
    ? `\nActive pet profile:\n- Name: ${pet.name || 'Pet'}\n- Species: ${pet.species || 'dog'}\n- Breed: ${pet.breed || 'Mixed'}\n- Age: ${pet.age ? `${pet.age} years` : '1 year'}\n- Weight: ${pet.weight || pet.weightKg || '5'} kg\nAlways tailor advice to this pet's exact profile.`
    : '\nNo pet profile is active. Ask the user about their pet when relevant.'

  return `You are **Mealie**, the friendly AI pet nutrition & care assistant for **AniMeal** — a Filipino pet-care platform.

LANGUAGE RULES:
• Respond in natural **Taglish** (conversational mixed Tagalog and English).
• If the user queries in pure English, reply in friendly English with Filipino hospitality.
• Keep responses concise (under 200 words unless in-depth breakdown is explicitly requested).

CRITICAL PET SAFETY GUARDRAILS (STRICT):
1. TOXIC SUBSTANCES: Immediately flag and alert on: chocolate/cacao, grapes, raisins, onions (sibuyas), garlic (bawang), chives, xylitol (artificial sweetener), macadamia nuts, avocado, alcohol, coffee/caffeine, cooked bones, raw yeast dough, paracetamol/biogesic/ibuprofen.
   Cats additionally: lilies (deadly!), raw fish (thiaminase), cow's milk (lactose intolerance).
2. EMERGENCY: If user describes poisoning symptoms or severe distress, urge them to visit a veterinarian IMMEDIATELY and mention the PAWS Emergency line: (02) 8475-1688.
3. NEVER prescribe drug dosages or substitute for veterinary diagnoses.
${petCtx}`
}

app.post('/api/ai/chat', async (req, res) => {
  const { message, history = [], pet } = req.body
  const ai = getGeminiClient()

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the backend server. Falling back to local assistant.',
      fallback: true,
    })
  }

  try {
    const contents = history.map((m) => ({
      role: m.role === 'assistant' || m.role === 'mealie' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }))

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: buildServerMealiePrompt(pet),
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    })

    const reply = response.text || 'Pasensya na, hindi ko nakuha ang sagot. Subukan mo ulit!'
    res.json({ reply, role: 'mealie', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Server Gemini error:', err)
    res.status(500).json({
      error: err.message || 'Gemini API call failed',
      fallback: true,
    })
  }
})

app.post('/api/ai/scan', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body
  const ai = getGeminiClient()

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the backend server.',
    })
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64 in request body' })
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const prompt = `You are an expert veterinary nutritionist AI. Analyze this pet food packaging photo.
Extract the guaranteed analysis and details into ONLY a valid raw JSON object (no markdown, no backticks, no code fence):

{
  "brand": "<brand name or 'Unknown'>",
  "productName": "<product name or 'Unknown Pet Food'>",
  "caloriesPer100g": <number in kcal or null>,
  "protein": <crude protein percentage as number or null>,
  "fat": <crude fat percentage as number or null>,
  "fiber": <crude fiber percentage as number or null>,
  "moisture": <moisture percentage as number or null>,
  "packageWeight": <weight in grams as number or null>,
  "price": <price in PHP or null>,
  "confidence": "<high|medium|low>",
  "suitability": "<safe|caution|unsafe>",
  "suitabilityNote": "<one sentence advice in Taglish>"
}`

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    })

    const text = response.text || '{}'
    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (err) {
    console.error('Server Gemini scan error:', err)
    res.status(500).json({ error: err.message || 'Failed to scan image with Gemini' })
  }
})

// Start Express Server
app.listen(PORT, () => {
  console.log(`🐾 AniMeal Backend Server running on http://localhost:${PORT}`)
})

