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
  completeTask: (id: string, completedBy?: string) => void
  snoozeTask: (id: string, until: string) => void
  removeTask: (id: string) => void
  getPendingTasks: (petId: string) => ScheduleTask[]
  // Household actions
  addMember: (name: string) => void
  removeMember: (id: string) => void
  // Custom food actions
  addCustomFood: (food: Omit<FoodItem, 'id' | 'verified' | 'isCustom'>) => void
  getAllFoods: () => FoodItem[]
}

const AppContext = createContext<AppContextType | null>(null)

// ───────── Provider ─────────
export function AppProvider({ children, preview = false }: { children: ReactNode; preview?: boolean }) {
  const [state, setState] = useState<AppState>(() =>
    preview ? previewState : loadFromStorage('app-state', defaultState),
  )

  // Persist on every state change
  useEffect(() => {
    if (preview) return
    saveToStorage('app-state', state)
  }, [state, preview])

  // Initial sync with backend API if available
  useEffect(() => {
    if (preview) return
    let cancelled = false
    async function syncBackend() {
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
    syncBackend()
    return () => {
      cancelled = true
    }
  }, [preview])

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
      api.createPet(data).catch(() => {})
      return pet
    },
    [],
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
    api.updatePet(id, data).catch(() => {})
  }, [])

  const removePet = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      pets: s.pets.filter((p) => p.id !== id),
      activePetId: s.activePetId === id ? (s.pets[0]?.id ?? null) : s.activePetId,
      feedingLog: s.feedingLog.filter((f) => f.petId !== id),
      waterLogs: s.waterLogs.filter((w) => w.petId !== id),
      weightLogs: s.weightLogs.filter((w) => w.petId !== id),
      tasks: s.tasks.filter((t) => t.petId !== id),
    }))
    api.deletePet(id).catch(() => {})
  }, [])

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
      api.logFeeding(entry).catch(() => {})
    },
    [],
  )

  const undoFeeding = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      feedingLog: s.feedingLog.map((f) =>
        f.id === id ? { ...f, undone: true } : f,
      ),
    }))
    api.undoFeeding(id).catch(() => {})
  }, [])

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
    setState((s) => ({
      ...s,
      waterLogs: [
        { id: generateId(), petId, amount, timestamp: new Date().toISOString() },
        ...s.waterLogs,
      ],
    }))
    api.logWater(petId, amount).catch(() => {})
  }, [])

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
        weightLogs: [
          {
            id: generateId(),
            petId,
            weight,
            date: logDate,
            notes,
          },
          ...s.weightLogs,
        ],
      }))
      api.logWeight(petId, weight, notes, logDate).catch(() => {})
    },
    [],
  )

  const removeWeightLog = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      weightLogs: s.weightLogs.filter((w) => w.id !== id),
    }))
  }, [])

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
      api.createTask(task).catch(() => {})
    },
    [],
  )

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
    api.completeTask(id, completedBy).catch(() => {})
  }, [])

  const snoozeTask = useCallback((id: string, until: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, snoozedUntil: until } : t,
      ),
    }))
  }, [])

  const removeTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
    api.deleteTask(id).catch(() => {})
  }, [])

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
    setState((s) => ({
      ...s,
      household: [
        ...s.household,
        {
          id: generateId(),
          name,
          color: colors[s.household.length % colors.length],
          isOwner: false,
        },
      ],
    }))
    api.addHouseholdMember(name).catch(() => {})
  }, [])

  const removeMember = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      household: s.household.filter((m) => m.id !== id || m.isOwner),
    }))
  }, [])

  // ── Custom food actions ──
  const addCustomFood = useCallback(
    (food: Omit<FoodItem, 'id' | 'verified' | 'isCustom'>) => {
      setState((s) => ({
        ...s,
        customFoods: [
          ...s.customFoods,
          { ...food, id: generateId(), verified: false, isCustom: true },
        ],
      }))
    },
    [],
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
        completeTask,
        snoozeTask,
        removeTask,
        getPendingTasks,
        addMember,
        removeMember,
        addCustomFood,
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
