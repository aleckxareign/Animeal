import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import type {
  Pet,
  FeedingEntry,
  WaterLog,
  WeightLog,
  ScheduleTask,
  HouseholdMember,
  FoodItem,
} from '../types'
import { loadFromStorage, saveToStorage, generateId } from '../utils/storage'
import {
  calculateDailyCalories,
  calculateWaterGoal,
  caloriesFromPortion,
} from '../utils/calories'
import { isToday } from '../utils/formatters'
import { getFoodById, foods as builtinFoods } from '../data/foods'
import { api } from '../services/api'
import { isSupabaseConfigured } from '../lib/supabase'
import { supabaseDb } from '../services/supabase-db'
import { useAuth } from './AuthContext'

// ───────── State shape ─────────
type AppState = {
  pets: Pet[]
  activePetId: string | null
  feedingLog: FeedingEntry[]
  waterLogs: WaterLog[]
  weightLogs: WeightLog[]
  tasks: ScheduleTask[]
  household: HouseholdMember[]
  customFoods: FoodItem[]
}

const defaultState: AppState = {
  pets: [],
  activePetId: null,
  feedingLog: [],
  waterLogs: [],
  weightLogs: [],
  tasks: [],
  household: [
    { id: 'owner', name: 'Me', color: '#44632f', isOwner: true },
  ],
  customFoods: [],
}

const previewDate = new Date()
const previewFeedingTime = new Date(previewDate)
previewFeedingTime.setHours(8, 30, 0, 0)
const previewState: AppState = {
  pets: [{
    id: 'preview-bruno',
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
    createdAt: previewDate.toISOString(),
  }],
  activePetId: 'preview-bruno',
  feedingLog: [{
    id: 'preview-feeding',
    petId: 'preview-bruno',
    foodId: 'dog-ped-adult',
    foodName: 'Pedigree Adult Chicken & Vegetables',
    portion: 156,
    unit: 'g',
    calories: 540,
    protein: 38,
    fat: 18,
    fiber: 9,
    fedBy: 'Maria',
    timestamp: previewFeedingTime.toISOString(),
  }],
  waterLogs: [{
    id: 'preview-water',
    petId: 'preview-bruno',
    amount: 450,
    timestamp: previewDate.toISOString(),
  }],
  weightLogs: [{
    id: 'preview-weight',
    petId: 'preview-bruno',
    weight: 12.4,
    date: previewDate.toISOString().slice(0, 10),
    notes: 'Healthy active weight',
  }],
  tasks: [{
    id: 'preview-deworming',
    petId: 'preview-bruno',
    type: 'deworming',
    title: 'Deworming Booster',
    frequency: 'monthly',
    time: '09:00',
    dueDate: new Date(previewDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    createdAt: previewDate.toISOString(),
  }],
  household: [
    { id: 'preview-owner', name: 'Me', color: '#44632f', isOwner: true },
    { id: 'preview-maria', name: 'Maria', color: '#164040', isOwner: false },
  ],
  customFoods: [],
}

// ───────── Context type ─────────
type AppContextType = AppState & {
  activePet: Pet | null
  // Pet actions
  addPet: (pet: Omit<Pet, 'id' | 'dailyCalorieTarget' | 'waterGoal' | 'createdAt'>) => Pet
  updatePet: (id: string, data: Partial<Pet>) => void
  removePet: (id: string) => void
  setActivePet: (id: string) => void
  // Feeding actions
  logFeeding: (entry: Omit<FeedingEntry, 'id' | 'timestamp' | 'calories' | 'protein' | 'fat' | 'fiber'> & { calories?: number; protein?: number; fat?: number; fiber?: number }) => void
  undoFeeding: (id: string) => void
  getTodayFeedings: (petId: string) => FeedingEntry[]
  getTodayCalories: (petId: string) => number
  // Water actions
  logWater: (petId: string, amount: number) => void
  getTodayWater: (petId: string) => number
  // Weight actions
  logWeight: (petId: string, weight: number, notes?: string, date?: string) => void
  removeWeightLog: (id: string) => void
  getWeightHistory: (petId: string) => WeightLog[]
  // Task actions
  addTask: (task: Omit<ScheduleTask, 'id' | 'completed' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<ScheduleTask>) => void
  completeTask: (id: string, completedBy?: string) => void
  snoozeTask: (id: string, until: string) => void
  removeTask: (id: string) => void
  getPendingTasks: (petId: string) => ScheduleTask[]
  // Household actions
  addMember: (name: string) => void
  removeMember: (id: string) => void
  // Custom food actions
  addCustomFood: (food: Omit<FoodItem, 'id' | 'verified' | 'isCustom'>) => void
  removeCustomFood: (id: string) => void
  getAllFoods: () => FoodItem[]
}

const AppContext = createContext<AppContextType | null>(null)

// ───────── Provider ─────────
export function AppProvider({ children, preview = false }: { children: ReactNode; preview?: boolean }) {
  const { user } = useAuth()
  const [state, setState] = useState<AppState>(() =>
    preview ? previewState : loadFromStorage('app-state', defaultState),
  )

  // Persist on every state change to local storage
  useEffect(() => {
    if (preview) return
    saveToStorage('app-state', state)
  }, [state, preview])

  // Sync with Supabase (Primary) or Express backend (Secondary)
  useEffect(() => {
    if (preview) return
    let cancelled = false

    async function syncData() {
      // 1. If Supabase is configured and a real authenticated user is signed in
      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        try {
          const [dbPets, dbFeedings, dbFoods, dbWater, dbWeight, dbTasks, dbHousehold] = await Promise.all([
            supabaseDb.getPets(user.id),
            supabaseDb.getFeedings(user.id),
            supabaseDb.getFoods(user.id),
            supabaseDb.getHydrationLogs(user.id),
            supabaseDb.getWeightLogs(user.id),
            supabaseDb.getCareTasks(user.id),
            supabaseDb.getHouseholdMembers(user.id),
          ])

          if (cancelled) return

          setState((prev) => ({
            ...prev,
            pets: dbPets.length > 0 ? dbPets : prev.pets,
            activePetId: prev.activePetId || dbPets[0]?.id || prev.pets[0]?.id || null,
            feedingLog: dbFeedings.length > 0 ? dbFeedings : prev.feedingLog,
            customFoods: dbFoods.filter((f) => f.isCustom),
            waterLogs: dbWater.length > 0 ? dbWater : prev.waterLogs,
            weightLogs: dbWeight.length > 0 ? dbWeight : prev.weightLogs,
            tasks: dbTasks.length > 0 ? dbTasks : prev.tasks,
            household:
              dbHousehold.length > 0
                ? [
                    prev.household.find((h) => h.isOwner) || { id: 'owner', name: user?.fullName || 'Me', color: '#44632f', isOwner: true },
                    ...dbHousehold.filter((h) => !h.isOwner),
                  ]
                : prev.household,
          }))
          return
        } catch (err) {
          console.warn('Supabase initial fetch fallback to local/express:', err)
        }
      }

      // 2. Fallback to Express backend if available
      try {
        const [backendPets, backendHousehold, backendTasks, backendFeedings] = await Promise.all([
          api.getPets().catch(() => [] as Pet[]),
          api.getHousehold().catch(() => [] as HouseholdMember[]),
          api.getTasks().catch(() => [] as ScheduleTask[]),
          api.getFeedings().catch(() => [] as FeedingEntry[]),
        ])
        if (cancelled) return

        setState((prev) => {
          const hasLocalPets = prev.pets.length > 0
          const mergedPets = hasLocalPets ? prev.pets : backendPets.length > 0 ? backendPets : prev.pets
          const activePetId = prev.activePetId || mergedPets[0]?.id || null

          return {
            ...prev,
            pets: mergedPets,
            activePetId,
            household:
              prev.household.length > 1
                ? prev.household
                : backendHousehold.length > 0
                  ? backendHousehold
                  : prev.household,
            tasks:
              prev.tasks.length > 0
                ? prev.tasks
                : backendTasks.length > 0
                  ? backendTasks
                  : prev.tasks,
            feedingLog:
              prev.feedingLog.length > 0
                ? prev.feedingLog
                : backendFeedings.length > 0
                  ? backendFeedings
                  : prev.feedingLog,
          }
        })
      } catch {
        // Fallback to local storage state seamlessly
      }
    }

    syncData()
    return () => {
      cancelled = true
    }
  }, [user?.id, preview])

  const activePet =
    state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0] ?? null

  // ── Pet actions ──
  const addPet = useCallback(
    (
      data: Omit<Pet, 'id' | 'dailyCalorieTarget' | 'waterGoal' | 'createdAt'>,
    ): Pet => {
      const pet: Pet = {
        ...data,
        id: generateId(),
        dailyCalorieTarget: calculateDailyCalories(
          data.weight,
          data.species,
          data.lifeStage,
          data.neutered,
        ),
        waterGoal: calculateWaterGoal(data.weight),
        createdAt: new Date().toISOString(),
      }

      setState((s) => ({
        ...s,
        pets: [...s.pets, pet],
        activePetId: s.pets.length === 0 ? pet.id : s.activePetId,
      }))

      // Persist to Supabase if logged in
      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        supabaseDb.createPet(user.id, pet).then((created) => {
          if (created) {
            // Replace temporary client ID with Supabase UUID
            setState((s) => ({
              ...s,
              pets: s.pets.map((p) => (p.id === pet.id ? created : p)),
              activePetId: s.activePetId === pet.id ? created.id : s.activePetId,
            }))
          }
        }).catch(() => {})
      }

      // Persist to Express backend
      api.createPet(data).catch(() => {})
      return pet
    },
    [user?.id],
  )

  const updatePet = useCallback((id: string, data: Partial<Pet>) => {
    setState((s) => ({
      ...s,
      pets: s.pets.map((p) => {
        if (p.id !== id) return p
        const updated = { ...p, ...data }
        // Recalculate targets if relevant fields changed
        if (data.weight || data.species || data.lifeStage || data.neutered !== undefined) {
          updated.dailyCalorieTarget = calculateDailyCalories(
            updated.weight,
            updated.species,
            updated.lifeStage,
            updated.neutered,
          )
          updated.waterGoal = calculateWaterGoal(updated.weight)
        }
        return updated
      }),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.updatePet(id, data).catch(() => {})
    }
    api.updatePet(id, data).catch(() => {})
  }, [user?.id])

  const removePet = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      pets: s.pets.filter((p) => p.id !== id),
      activePetId: s.activePetId === id ? (s.pets.filter(p => p.id !== id)[0]?.id ?? null) : s.activePetId,
      feedingLog: s.feedingLog.filter((f) => f.petId !== id),
      waterLogs: s.waterLogs.filter((w) => w.petId !== id),
      weightLogs: s.weightLogs.filter((w) => w.petId !== id),
      tasks: s.tasks.filter((t) => t.petId !== id),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.deletePet(id).catch(() => {})
    }
    api.deletePet(id).catch(() => {})
  }, [user?.id])

  const setActivePet = useCallback((id: string) => {
    setState((s) => ({ ...s, activePetId: id }))
  }, [])

  // ── Feeding actions ──
  const logFeeding = useCallback(
    (
      data: Omit<FeedingEntry, 'id' | 'timestamp' | 'calories' | 'protein' | 'fat' | 'fiber'> & {
        calories?: number
        protein?: number
        fat?: number
        fiber?: number
      },
    ) => {
      const food = getFoodById(data.foodId)
      // Convert portion to grams if needed
      let portionGrams = data.portion
      if (data.unit === 'scoop') portionGrams = data.portion * 30
      else if (data.unit === 'can') portionGrams = data.portion * (food?.servingSize ?? 100)
      else if (data.unit === 'cup') portionGrams = data.portion * 120
      else if (data.unit === 'tbsp') portionGrams = data.portion * 15
      else if (data.unit === 'piece') portionGrams = data.portion * 10

      const entry: FeedingEntry = {
        ...data,
        id: generateId(),
        calories:
          data.calories ?? (food ? caloriesFromPortion(food.caloriesPer100g, portionGrams) : 0),
        protein: data.protein ?? (food ? Math.round((food.protein * portionGrams) / 100) : 0),
        fat: data.fat ?? (food ? Math.round((food.fat * portionGrams) / 100) : 0),
        fiber: data.fiber ?? (food ? Math.round((food.fiber * portionGrams) / 100) : 0),
        timestamp: new Date().toISOString(),
      }

      setState((s) => ({
        ...s,
        feedingLog: [entry, ...s.feedingLog],
      }))

      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        supabaseDb.addFeeding(user.id, entry).then((saved) => {
          if (saved) {
            setState((s) => ({
              ...s,
              feedingLog: s.feedingLog.map((f) => (f.id === entry.id ? saved : f)),
            }))
          }
        }).catch(() => {})
      }

      api.logFeeding(entry).catch(() => {})
    },
    [user?.id],
  )

  const undoFeeding = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      feedingLog: s.feedingLog.map((f) =>
        f.id === id ? { ...f, undone: true } : f,
      ),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.deleteFeeding(id).catch(() => {})
    }
    api.undoFeeding(id).catch(() => {})
  }, [user?.id])

  const getTodayFeedings = useCallback(
    (petId: string) =>
      state.feedingLog.filter(
        (f) => f.petId === petId && !f.undone && isToday(f.timestamp),
      ),
    [state.feedingLog],
  )

  const getTodayCalories = useCallback(
    (petId: string) =>
      getTodayFeedings(petId).reduce((sum, f) => sum + f.calories, 0),
    [getTodayFeedings],
  )

  // ── Water actions ──
  const logWater = useCallback((petId: string, amount: number) => {
    const entry = { id: generateId(), petId, amount, timestamp: new Date().toISOString() }
    setState((s) => ({
      ...s,
      waterLogs: [entry, ...s.waterLogs],
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.addHydrationLog(user.id, petId, amount).then((saved) => {
        if (saved) {
          setState((s) => ({
            ...s,
            waterLogs: s.waterLogs.map((w) => (w.id === entry.id ? saved : w)),
          }))
        }
      }).catch(() => {})
    }

    api.logWater(petId, amount).catch(() => {})
  }, [user?.id])

  const getTodayWater = useCallback(
    (petId: string) =>
      state.waterLogs
        .filter((w) => w.petId === petId && isToday(w.timestamp))
        .reduce((sum, w) => sum + w.amount, 0),
    [state.waterLogs],
  )

  // ── Weight actions ──
  const logWeight = useCallback(
    (petId: string, weight: number, notes?: string, date?: string) => {
      const logDate = date || new Date().toISOString()
      const newLog = {
        id: generateId(),
        petId,
        weight,
        date: logDate,
        notes,
      }

      setState((s) => ({
        ...s,
        pets: s.pets.map((p) => {
          if (p.id !== petId) return p
          return {
            ...p,
            weight,
            dailyCalorieTarget: calculateDailyCalories(
              weight,
              p.species,
              p.lifeStage,
              p.neutered,
            ),
            waterGoal: calculateWaterGoal(weight),
          }
        }),
        weightLogs: [newLog, ...s.weightLogs],
      }))

      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        supabaseDb.addWeightLog(user.id, petId, weight, notes, logDate).then((saved) => {
          if (saved) {
            setState((s) => ({
              ...s,
              weightLogs: s.weightLogs.map((w) => (w.id === newLog.id ? saved : w)),
            }))
          }
        }).catch(() => {})
      }

      api.logWeight(petId, weight, notes, logDate).catch(() => {})
    },
    [user?.id],
  )

  const removeWeightLog = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      weightLogs: s.weightLogs.filter((w) => w.id !== id),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.removeWeightLog(id).catch(() => {})
    }
  }, [user?.id])

  const getWeightHistory = useCallback(
    (petId: string) =>
      state.weightLogs
        .filter((w) => w.petId === petId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [state.weightLogs],
  )

  // ── Task actions ──
  const addTask = useCallback(
    (data: Omit<ScheduleTask, 'id' | 'completed' | 'createdAt'>) => {
      const task: ScheduleTask = {
        ...data,
        id: generateId(),
        completed: false,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        tasks: [task, ...s.tasks],
      }))

      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        supabaseDb.addCareTask(user.id, task).then((saved) => {
          if (saved) {
            setState((s) => ({
              ...s,
              tasks: s.tasks.map((t) => (t.id === task.id ? saved : t)),
            }))
          }
        }).catch(() => {})
      }

      api.createTask(task).catch(() => {})
    },
    [user?.id],
  )

  const updateTask = useCallback((id: string, updates: Partial<ScheduleTask>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.updateCareTask(id, updates as any).catch(() => {})
    }
  }, [user?.id])

  const completeTask = useCallback((id: string, completedBy?: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: true,
              completedBy: completedBy ?? 'Me',
              completedAt: new Date().toISOString(),
            }
          : t,
      ),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.updateCareTask(id, { completed: true, completedBy: completedBy ?? 'Me' }).catch(() => {})
    }

    api.completeTask(id, completedBy).catch(() => {})
  }, [user?.id])

  const snoozeTask = useCallback((id: string, until: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, snoozedUntil: until } : t,
      ),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.updateCareTask(id, { snoozedUntil: until }).catch(() => {})
    }
  }, [user?.id])

  const removeTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.deleteCareTask(id).catch(() => {})
    }

    api.deleteTask(id).catch(() => {})
  }, [user?.id])

  const getPendingTasks = useCallback(
    (petId: string) =>
      state.tasks.filter(
        (t) =>
          t.petId === petId &&
          !t.completed &&
          (!t.snoozedUntil || new Date(t.snoozedUntil) <= new Date()),
      ),
    [state.tasks],
  )

  // ── Household actions ──
  const addMember = useCallback((name: string) => {
    const colors = ['#44632f', '#164040', '#b5432f', '#8b6914', '#6b21a8', '#0e7490']
    const memberColor = colors[state.household.length % colors.length]
    const tempMember = {
      id: generateId(),
      name,
      color: memberColor,
      isOwner: false,
    }

    setState((s) => ({
      ...s,
      household: [...s.household, tempMember],
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.addHouseholdMember(user.id, name, memberColor, false).then((created) => {
        if (created) {
          setState((s) => ({
            ...s,
            household: s.household.map((h) => (h.id === tempMember.id ? created : h)),
          }))
        }
      }).catch(() => {})
    }

    api.addHouseholdMember(name).catch(() => {})
  }, [state.household.length, user?.id])

  const removeMember = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      household: s.household.filter((m) => m.id !== id || m.isOwner),
    }))

    if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
      supabaseDb.removeHouseholdMember(id).catch(() => {})
    }
    api.deleteHouseholdMember(id).catch(() => {})
  }, [user?.id])

  // ── Custom food actions ──
  const addCustomFood = useCallback(
    (food: Omit<FoodItem, 'id' | 'verified' | 'isCustom'>) => {
      const customFoodItem: FoodItem = {
        ...food,
        id: generateId(),
        verified: false,
        isCustom: true,
      }

      setState((s) => ({
        ...s,
        customFoods: [...s.customFoods, customFoodItem],
      }))

      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        supabaseDb.addCustomFood(user.id, food).then((saved) => {
          if (saved) {
            setState((s) => ({
              ...s,
              customFoods: s.customFoods.map((f) => (f.id === customFoodItem.id ? saved : f)),
            }))
          }
        }).catch(() => {})
      }
      api.addCustomFood(customFoodItem as any).catch(() => {})
    },
    [user?.id],
  )

  const removeCustomFood = useCallback(
    (id: string) => {
      setState((s) => ({
        ...s,
        customFoods: s.customFoods.filter((f) => f.id !== id),
      }))

      if (isSupabaseConfigured && user?.id && user.id !== 'demo-user-id') {
        supabaseDb.deleteCustomFood(id).catch(() => {})
      }
      api.deleteCustomFood(id).catch(() => {})
    },
    [user?.id],
  )

  const getAllFoods = useCallback((): FoodItem[] => {
    return [...builtinFoods, ...state.customFoods]
  }, [state.customFoods])

  return (
    <AppContext.Provider
      value={{
        ...state,
        activePet,
        addPet,
        updatePet,
        removePet,
        setActivePet,
        logFeeding,
        undoFeeding,
        getTodayFeedings,
        getTodayCalories,
        logWater,
        getTodayWater,
        logWeight,
        removeWeightLog,
        getWeightHistory,
        addTask,
        updateTask,
        completeTask,
        snoozeTask,
        removeTask,
        getPendingTasks,
        addMember,
        removeMember,
        addCustomFood,
        removeCustomFood,
        getAllFoods,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
