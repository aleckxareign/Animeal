import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// ── 1. SECURITY HEADERS (Helmet) ──
const isProduction = process.env.NODE_ENV === 'production'

app.use(
  helmet({
    // Enable CSP only in production (Vite HMR needs loosened rules in dev)
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://*.supabase.co', 'https://generativelanguage.googleapis.com'],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    // Enforce HSTS in production
    strictTransportSecurity: isProduction
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
  })
)

// ── Disable X-Powered-By to avoid fingerprinting ──
app.disable('x-powered-by')

// ── 2. CORS STRICT ORIGIN RESTRICTION ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile curl, internal health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('CORS policy: Access blocked from unauthorized origin.'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── 3. RATE LIMITING ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
})

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Masyadong mabilis ang AI requests! Paki-subukan ulit makalipas ang ilang minuto.',
    fallback: true,
  },
})

app.use('/api', generalLimiter)
app.use('/api/ai', aiLimiter)

app.use(express.json({ limit: '15mb' }))

// ── 4. Secure Cookies helper (used if session cookies ever needed) ──
// Sessions are JWT-based via Supabase; cookies are set by Supabase client-side.
// If you ever set server-side cookies, always use:
// res.cookie('name', value, { httpOnly: true, secure: isProduction, sameSite: 'strict' })

// ── 5. Disable debug-mode info leakage ──
if (!isProduction) {
  console.info('⚠️  Running in DEVELOPMENT mode. Set NODE_ENV=production before deploying.')
}

// Database file path
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// ── 6. INPUT SANITIZATION HELPERS ──
/**
 * Strip HTML tags and control characters from a string to prevent XSS/injection.
 * Since Express JSON bodies go into a JSON file (not SQL), the main risk is stored XSS
 * if any value is later rendered via innerHTML. Strip tags as a defence-in-depth measure.
 */
function sanitizeString(value, maxLen = 500) {
  if (typeof value !== 'string') return value
  return value
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[^\x09\x0A\x0D\x20-\uFFFF]/g, '') // strip control chars
    .trim()
    .slice(0, maxLen)
}

function sanitizePet(pet) {
  if (!pet || typeof pet !== 'object') return pet
  return {
    ...pet,
    name: sanitizeString(pet.name, 100),
    breed: sanitizeString(pet.breed, 100),
    notes: sanitizeString(pet.notes, 1000),
  }
}

function sanitizeFeeding(feeding) {
  if (!feeding || typeof feeding !== 'object') return feeding
  return {
    ...feeding,
    foodName: sanitizeString(feeding.foodName, 200),
    fedBy: sanitizeString(feeding.fedBy, 100),
    notes: sanitizeString(feeding.notes, 500),
  }
}

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

// In-memory DB cache for ultra-fast, zero-overhead reads
let inMemoryDb = null

// Load DB with atomic fallback
function readDb() {
  if (inMemoryDb) return inMemoryDb
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultDb)
      inMemoryDb = JSON.parse(JSON.stringify(defaultDb))
      return inMemoryDb
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    inMemoryDb = JSON.parse(raw)
    return inMemoryDb
  } catch (err) {
    console.error('Error reading db, using defaults:', err)
    inMemoryDb = JSON.parse(JSON.stringify(defaultDb))
    return inMemoryDb
  }
}

// Atomic & Safe DB Writer: writes to unique .tmp file first, then atomically renames
function writeDb(data) {
  inMemoryDb = data
  try {
    const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8')
    fs.renameSync(tmpFile, DB_FILE)
  } catch (err) {
    console.error('Error atomic writing db:', err)
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
  const {
    name,
    species,
    breed,
    weight,
    age,
    neutered,
    lifeStage,
    avatarEmoji,
    dietaryPreference,
    preferredFoods,
    avoidedFoods,
  } = req.body

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
    dietaryPreference: dietaryPreference || 'any',
    preferredFoods: Array.isArray(preferredFoods) ? preferredFoods : [],
    avoidedFoods: Array.isArray(avoidedFoods) ? avoidedFoods : [],
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

app.put('/api/feedings/:id', (req, res) => {
  const db = readDb()
  const idx = db.feedings.findIndex((f) => f.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Feeding entry not found' })
  db.feedings[idx] = { ...db.feedings[idx], ...req.body }
  writeDb(db)
  res.json(db.feedings[idx])
})

app.delete('/api/feedings/:id', (req, res) => {
  const db = readDb()
  db.feedings = db.feedings.filter((f) => f.id !== req.params.id)
  writeDb(db)
  res.json({ success: true, message: 'Feeding removed' })
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

app.put('/api/household/:id', (req, res) => {
  const db = readDb()
  const idx = db.household.findIndex((m) => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Household member not found' })
  db.household[idx] = { ...db.household[idx], ...req.body }
  writeDb(db)
  res.json(db.household[idx])
})

app.delete('/api/household/:id', (req, res) => {
  const db = readDb()
  db.household = db.household.filter((m) => m.id !== req.params.id)
  writeDb(db)
  res.json({ success: true, message: 'Household member removed' })
})

// ── 5.1 FOODS & CUSTOM FOODS ──
app.get('/api/foods', (req, res) => {
  const db = readDb()
  res.json(db.customFoods || [])
})

app.post('/api/foods', (req, res) => {
  const db = readDb()
  const food = {
    ...req.body,
    id: generateId(),
    isCustom: true,
    verified: false,
    createdAt: new Date().toISOString(),
  }
  if (!db.customFoods) db.customFoods = []
  db.customFoods.unshift(food)
  writeDb(db)
  res.status(201).json(food)
})

app.delete('/api/foods/:id', (req, res) => {
  const db = readDb()
  if (!db.customFoods) db.customFoods = []
  db.customFoods = db.customFoods.filter((f) => f.id !== req.params.id)
  writeDb(db)
  res.json({ success: true, message: 'Custom food removed' })
})

// ── 6. MEALIE AI CONVERSATION ENGINE ──
const TOXIC_TRIGGERS = [
  { words: ['chocolate', 'tsokolate', 'cacao'], item: 'Chocolate', danger: 'high' },
  { words: ['onion', 'sibuyas', 'garlic', 'bawang', 'leek'], item: 'Onions / Garlic (Allium)', danger: 'high' },
  { words: ['grape', 'raisin', 'ubas', 'pasas'], item: 'Grapes / Raisins', danger: 'high' },
  { words: ['xylitol', 'sugar-free', 'sweetener'], item: 'Xylitol', danger: 'high' },
  { words: ['paracetamol', 'biogesic', 'ibuprofen', 'panadol', 'advil'], item: 'Human Painkillers', danger: 'emergency' },
  { words: ['lily', 'lilies', 'liryo'], item: 'Lilies (deadly to cats)', danger: 'emergency' },
  { words: ['alcohol', 'beer', 'wine', 'alak'], item: 'Alcohol', danger: 'high' },
  { words: ['coffee', 'kape', 'caffeine'], item: 'Caffeine', danger: 'high' },
]

app.post('/api/mealie/chat', (req, res) => {
  const { message, petContext } = req.body
  const q = (message || '').toLowerCase().trim()

  // 1. Check for emergency toxic substances
  for (const trigger of TOXIC_TRIGGERS) {
    if (trigger.words.some((w) => q.includes(w))) {
      return res.json({
        role: 'mealie',
        severity: 'emergency',
        content: `🚨 **EMERGENCY WARNING: ${trigger.item} is extremely toxic to pets!**\n\nIngestion can cause acute organ damage or toxicity. Do NOT induce vomiting without consulting a professional.\n\n**Immediate Action:** Please contact or proceed immediately to the nearest veterinary emergency clinic!`,
        actions: [
          { label: '🏥 Find Emergency Vet Clinic Now', type: 'link', value: '/#nearby-vets' },
          { label: '📞 Call PAWS Hotline: (02) 8475-1688', type: 'link', value: 'tel:0284751688' },
        ],
        timestamp: new Date().toISOString(),
      })
    }
  }

  // 2. Pet context
  const petName = petContext?.name ? `**${petContext.name}**` : 'your pet'
  const petSpecies = petContext?.species || 'pet'

  // Hydration first (so 'how much water' doesn't get hijacked by food portions!)
  if (q.includes('water') || q.includes('tubig') || q.includes('hydration') || q.includes('uhaw')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `💧 **Daily Hydration Guideline:**\nThe veterinary standard for ${petSpecies}s is **~50 ml of fresh water per kg of body weight** daily.\n\nFor ${petName}, that is approximately **${petContext?.waterGoal || 500} ml per day**.\n\n💡 **Tip:** If ${petName} is a picky drinker, incorporating wet canned food or soaking kibble helps boost water intake!`,
      actions: [
        { label: '💧 Track Water Today', type: 'link', value: '/pet-wellness?tab=water' },
        { label: '🍲 View Food Options', type: 'link', value: '/food-library' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Vet cost check (so 'magkano magpa-vet' doesn't get hijacked by food portions!)
  if (q.includes('magkano magpa-vet') || q.includes('presyo ng vet') || q.includes('vet cost') || q.includes('consultation fee')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `🏥 **Veterinary Consultation & Check-up Estimates (PH):**\n\n• **General Consultation:** ~₱300 – ₱700\n• **Core Vaccines (5-in-1 / 4-in-1):** ~₱450 – ₱800 per shot\n• **Anti-Rabies Shot:** ~₱250 – ₱450 (or free at your City Veterinary Office!)\n• **Deworming (Purga):** ~₱150 – ₱350 based on weight\n\nContact nearby veterinary clinics to confirm their specific consultation schedules.`,
      actions: [
        { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Safe foods: chicken & rice
  if (q.includes('chicken') || q.includes('manok') || q.includes('rice') || q.includes('kanin') || q.includes('lugaw')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `🍗 **Boiled Chicken & White Rice:**\n\nPlain boiled skinless chicken breast with soft white rice is one of the safest and most gentle bland meals for dogs and recovering cats!\n\n• **Preparation:** Boil in plain water without onions, garlic, soy sauce, or oil.\n• **Great for:** Soothing mild diarrhea or restoring appetite.`,
      actions: [
        { label: '🍲 Log Meal in Tracker', type: 'link', value: '/meal-tracker' },
        { label: '📖 Food Library', type: 'link', value: '/food-library' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Safe foods: eggs
  if (q.includes('egg') || q.includes('itlog')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `🍳 **Cooked Eggs for Pets:**\n\nPlain cooked eggs (scrambled or hard-boiled) are a healthy, highly digestible protein source packed with amino acids and riboflavin for ${petName}.\n\n• **Important:** Cook plain with no oil, butter, salt, or onions. Avoid raw egg whites.`,
      actions: [
        { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Safe foods: kalabasa / pumpkin
  if (q.includes('kalabasa') || q.includes('pumpkin') || q.includes('squash')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `🎃 **Kalabasa (Pumpkin / Squash):**\n\nPlain cooked kalabasa is a fantastic source of soluble fiber that soothes digestive upset, helping with both mild diarrhea and constipation in ${petSpecies}s!\n\n• **Serving:** Steam or boil soft, mash plain, and mix 1–2 spoonfuls with their meal.`,
      actions: [
        { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Symptoms: vomiting
  if (q.includes('vomit') || q.includes('suka') || q.includes('nagsuka')) {
    return res.json({
      role: 'mealie',
      severity: 'caution',
      content: `🤢 **Vomiting Advice for ${petName}:**\n\nIf it is a single isolated episode and ${petName} is active and alert, rest their stomach for 2 hours, offer small sips of water, then a bland meal of boiled chicken and white rice.\n\n🚨 **Rush to a vet immediately if:** vomiting repeatedly (3+ times), blood is present, swollen abdomen, or suspected toxic ingestion.`,
      actions: [
        { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Symptoms: diarrhea
  if (q.includes('diarrhea') || q.includes('pagtatae') || q.includes('lbm')) {
    return res.json({
      role: 'mealie',
      severity: 'caution',
      content: `💩 **Diarrhea Care for ${petName}:**\n\nEnsure access to fresh drinking water to prevent dehydration. Feed a bland diet of boiled skinless chicken breast + soft white rice + 1 spoon of steamed kalabasa.\n\n🚨 **See a clinic right away if:** there is blood in the stool, black tarry color, or lasts over 24 hours.`,
      actions: [
        { label: '🏥 Find Nearby Vets', type: 'link', value: '/#nearby-vets' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Symptoms: ticks & fleas
  if (q.includes('garapata') || q.includes('pulgas') || q.includes('flea') || q.includes('tick')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `🪲 **Ticks & Fleas (Garapata at Pulgas):**\n\nIn our Philippine climate, ticks and fleas transmit blood parasites (Ehrlichiosis). Veterinary oral chewables (such as NexGard, Bravecto, or Simparica) or topical spot-ons provide safe, month-long protection.\n\nWash pet bedding in hot water and clean outdoor resting spots!`,
      actions: [
        { label: '🏥 Find Nearby Vet Clinic', type: 'link', value: '/#nearby-vets' },
        { label: '🗓️ Care Schedule', type: 'link', value: '/care-schedule' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Greetings & Conversational
  if (q === 'hi' || q === 'hello' || q === 'kamusta' || q.startsWith('hi ') || q.startsWith('hello ')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `Hello there! 🐾 I am **Mealie**, your AI Pet Nutrition & Care Assistant!\n\nI am ready to help you with advice tailored for ${petName} (${petSpecies}). Ask me about safe vs toxic foods, daily calories, water goals, or everyday wellness!`,
      actions: [
        { label: '🍫 Is chocolate safe?', type: 'chip', value: 'Is chocolate safe for dogs?' },
        { label: '🍗 Can pets eat chicken & rice?', type: 'chip', value: 'Can dogs eat chicken and rice?' },
        { label: '💧 How much water?', type: 'chip', value: 'How much water does my pet need?' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Gratitude
  if (q.includes('thank') || q.includes('salamat')) {
    return res.json({
      role: 'mealie',
      severity: 'info',
      content: `Walang anuman! 🐾 Always happy to support you and ${petName}. Give them a gentle hug and treat from Mealie! ❤️`,
      actions: [
        { label: '🍲 Food Library', type: 'link', value: '/food-library' },
      ],
      timestamp: new Date().toISOString(),
    })
  }

  // Feeding & Portion calculations
  if (q.includes('how much') || q.includes('portion') || q.includes('gaano karami') || q.includes('pakainin') || q.includes('calorie')) {
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

  // General helpful response
  res.json({
    role: 'mealie',
    severity: 'info',
    content: `Kamusta! I hear your question: *"${message}"*.\n\nI can help review food safety for ${petName}, calculate daily calorie and water targets, or guide you on when to visit the clinic.\n\nTry asking me:\n• *"Pwede ba ang manok at kanin sa alaga ko?"*\n• *"How much water does my pet need?"*\n• *"Is chocolate or garlic safe?"*`,
    actions: [
      { label: '🍗 Safe Whole Foods', type: 'chip', value: 'Can dogs eat chicken and rice?' },
      { label: '🍲 View Food Library', type: 'link', value: '/food-library' },
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
    ? `\nActive pet profile:
- Name: ${pet.name || 'Pet'}
- Species: ${pet.species || 'dog'}
- Breed: ${pet.breed || 'Mixed'}
- Age: ${pet.age ? `${pet.age} years` : pet.ageMonths ? `${pet.ageMonths} months` : '1 year'}
- Weight: ${pet.weight || pet.weightKg || '5'} kg${pet.lifeStage ? `\n- Life stage: ${pet.lifeStage}` : ''}${pet.neutered !== undefined ? `\n- Neutered: ${pet.neutered ? 'Yes' : 'No'}` : ''}${pet.dailyCalorieTarget ? `\n- Daily calorie target: ${pet.dailyCalorieTarget} kcal` : ''}${pet.dietaryPreference && pet.dietaryPreference !== 'any' ? `\n- Dietary preference: ${pet.dietaryPreference.replace('_', ' ')}` : ''}${pet.preferredFoods?.length ? `\n- Preferred/favorite foods: ${Array.isArray(pet.preferredFoods) ? pet.preferredFoods.join(', ') : pet.preferredFoods}` : ''}${pet.avoidedFoods?.length ? `\n- Foods to avoid: ${Array.isArray(pet.avoidedFoods) ? pet.avoidedFoods.join(', ') : pet.avoidedFoods}` : ''}
Always tailor portion sizes, food choices, and recommendations to this pet's exact profile. Respect their dietary preferences and avoid suggesting foods they dislike.`
    : '\nNo active pet profile is provided. Give general safe pet nutrition advice. Before estimating specific portions or calorie targets, ask the user what species and approximate weight their pet is. NEVER assume a placeholder pet name like "Bantay" or any default profile.'

  return `You are **Mealie**, the friendly AI pet nutrition & care assistant for **AniMeal** — a Filipino pet-care platform.

LANGUAGE RULES:
• Respond in natural **Taglish** (conversational mixed Tagalog and English).
• If the user queries in pure English, reply in friendly English with Filipino hospitality.
• Keep answers clear and concise (2–4 short paragraphs or bullet points max, under 200 words unless in-depth breakdown is explicitly requested).

CRITICAL PET SAFETY GUARDRAILS (STRICT):
1. TOXIC SUBSTANCES: Immediately flag and alert on: chocolate/cacao, grapes, raisins, onions (sibuyas), garlic (bawang), chives, xylitol (artificial sweetener), macadamia nuts, avocado, alcohol, coffee/caffeine, cooked bones, raw yeast dough, paracetamol/biogesic/ibuprofen.
   Cats additionally: lilies (deadly!), raw fish (thiaminase), cow's milk (lactose intolerance).
2. EMERGENCY: If user describes poisoning symptoms or severe distress, urge them to visit a veterinarian IMMEDIATELY and mention the PAWS Emergency line: (02) 8475-1688.
3. NEVER prescribe drug dosages or substitute for veterinary diagnoses.
4. BRAND NEUTRALITY: Never recommend a specific commercial brand as "the best." You may compare nutrient profiles objectively.
5. OFF-TOPIC REDIRECT: If the question is completely unrelated to pets, food, nutrition, or animal care, politely redirect back to pet care.
${petCtx}`
}

app.post('/api/ai/chat', async (req, res) => {
  const { message, history = [], pet } = req.body

  // Input Sanitization & Validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' })
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message is too long (maximum 2,000 characters).' })
  }

  const ai = getGeminiClient()

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the backend server. Falling back to local assistant.',
      fallback: true,
    })
  }

  // Multiturn requests must begin with a user turn in the Gemini API
  const userFirstHistory = []
  let seenUser = false
  for (const m of history) {
    const isUser = m.role === 'user'
    if (isUser) seenUser = true
    if (seenUser) {
      userFirstHistory.push({
        role: isUser ? 'user' : 'model',
        parts: [{ text: m.text || m.content || '' }],
      })
    }
  }

  const contents = [
    ...userFirstHistory,
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ]

  const config = {
    systemInstruction: buildServerMealiePrompt(pet),
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 600,
    thinkingConfig: { thinkingBudget: 0 },
  }

  const candidateModels = [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
  ]

  let lastErr = null
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      })

      if (response.text) {
        return res.json({ reply: response.text, role: 'mealie', timestamp: new Date().toISOString() })
      }
    } catch (err) {
      lastErr = err
      continue
    }
  }

  console.error('Server Gemini error (all models exhausted):', lastErr)
  res.status(500).json({
    error: lastErr?.message || 'Gemini API call failed',
    fallback: true,
  })
})

app.post('/api/ai/scan', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', pet = null } = req.body

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid imageBase64 in request body.' })
  }

  // Allowed MIME types whitelist
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedMime.includes(mimeType)) {
    return res.status(400).json({ error: 'Unsupported file format. Please upload JPG, PNG, or WebP.' })
  }

  // Size cap verification (base64 string length <= ~20MB equates to ~15MB file)
  if (imageBase64.length > 20 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image exceeds maximum 15MB file upload limit.' })
  }

  const ai = getGeminiClient()

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the backend server.',
      fallback: true,
    })
  }

  const petCtx = pet
    ? `\nActive pet profile:
- Name: ${pet.name || 'Pet'}
- Species: ${pet.species || 'dog'}
- Breed: ${pet.breed || 'Mixed'}
- Life stage: ${pet.lifeStage || 'adult'}
- Weight: ${pet.weight || pet.weightKg || 5} kg
${pet.dietaryPreference && pet.dietaryPreference !== 'any' ? `- Dietary preference: ${pet.dietaryPreference.replace('_', ' ')}\n` : ''}${pet.preferredFoods?.length ? `- Preferred foods: ${Array.isArray(pet.preferredFoods) ? pet.preferredFoods.join(', ') : pet.preferredFoods}\n` : ''}${pet.avoidedFoods?.length ? `- Avoided foods: ${Array.isArray(pet.avoidedFoods) ? pet.avoidedFoods.join(', ') : pet.avoidedFoods}\n` : ''}
Evaluate suitability specifically for this pet — considering species toxicity, life-stage suitability, and their dietary preferences/avoided foods.`
    : '\nNo active pet profile is provided. Evaluate general dog/cat safety. Note in suitabilityNote that registering a pet profile enables personalized life-stage and preference checks.'

  const prompt = `You are an expert veterinary nutritionist AI. Analyze this image.

STEP 1 — CLASSIFY THE IMAGE:
• If this image is pet food packaging, a guaranteed analysis table, or a pet food product:
  - isFoodItem: true
  - detectedCategory: "pet_food_label"
• If this image is human food, whole ingredients (e.g. cooked chicken, carrots, fruits, meat):
  - isFoodItem: true
  - detectedCategory: "whole_or_human_food"
• If this image is NOT a food item (e.g. person, household object, blank/blurry screen, car, electronics, landscape, or non-food):
  - isFoodItem: false
  - detectedCategory: "unrelated_image"
  - brand: "N/A"
  - productName: "Not a food item"
  - caloriesPer100g: null, protein: null, fat: null, fiber: null, moisture: null, packageWeight: null, price: null
  - confidence: "low"
  - suitability: "unknown"
  - suitabilityNote: "Hindi ito pagkain ng alaga o food product. Mangyaring mag-upload ng malinaw na litrato ng pet food packaging o pagkain."
  - ingredients: []

STEP 2 — IF isFoodItem IS TRUE:
Extract the guaranteed analysis and details into a valid raw JSON object:
- brand: string
- product: string
- productName: string
- caloriesPer100g: number in kcal or null
- crudeProteinPct: crude protein percentage as number or null
- crudeFatPct: crude fat percentage as number or null
- crudeFiberPct: crude fiber percentage as number or null
- moisturePct: moisture percentage as number or null
- protein: crude protein percentage as number or null
- fat: crude fat percentage as number or null
- fiber: crude fiber percentage as number or null
- moisture: moisture percentage as number or null
- packageWeight: weight in grams as number or null
- price: price in PHP or null
- confidence: "high" | "medium" | "low"
- suitability: "safe" | "caution" | "unsafe" | "unknown"
- suitabilityNote: one sentence advice in Taglish
- ingredients: array of string ingredient names (max 10)
- isFoodItem: true
- detectedCategory: "pet_food_label" | "whole_or_human_food"

Suitability rating guidelines:
- "safe": balanced, no toxic ingredients, matches pet profile
- "caution": contains fillers, by-products, artificial additives, slight life-stage mismatch, or avoided foods
- "unsafe": contains known toxic substances (chocolate, xylitol, grapes, onions, garlic, lilies, raw fish/dairy for cats) or severe mismatch
- "unknown": cannot determine from image

${petCtx}

Return ONLY a valid JSON object (no markdown, no backticks, no code fence).`

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const contents = [
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
    ]

    const config = {
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    }

    let response
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config,
      })
    } catch (modelErr) {
      if (
        modelErr.status === 503 ||
        modelErr.message?.includes('503') ||
        modelErr.message?.includes('capacity') ||
        modelErr.message?.includes('overloaded') ||
        modelErr.message?.includes('RESOURCE_EXHAUSTED')
      ) {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents,
          config,
        })
      } else {
        throw modelErr
      }
    }

    const text = response.text || '{}'
    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (err) {
    console.error('Server Gemini scan error:', err)
    res.status(500).json({ error: err.message || 'Failed to scan image with Gemini' })
  }
})

// Global error handling middleware (avoids leaking stack traces in production)
app.use((err, req, res, _next) => {
  console.error('API Error:', err.message)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
  })
})

// Start Express Server
app.listen(PORT, () => {
  console.log(`🐾 AniMeal Backend Server running on http://localhost:${PORT}`)
})

