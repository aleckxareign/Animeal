import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Pet,
  FeedingEntry,
  FoodItem,
  WaterLog,
  WeightLog,
  ScheduleTask,
  PortionUnit,
} from '../types'

/**
 * Type-safe database service mapping Supabase PostgreSQL tables to AniMeal frontend models.
 * Automatically translates between Postgres snake_case and TypeScript camelCase.
 */
export const supabaseDb = {
  // =========================================================================
  // 1. PETS
  // =========================================================================

  async getPets(userId: string): Promise<Pet[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        species: row.species,
        breed: row.breed,
        weight: Number(row.weight_kg),
        age: Number(row.age_years),
        neutered: Boolean(row.neutered),
        lifeStage: row.life_stage,
        avatarEmoji: row.avatar_emoji || (row.species === 'cat' ? '🐱' : '🐕'),
        dailyCalorieTarget: Number(row.daily_rer_target),
        waterGoal: Number(row.water_goal_ml),
        createdAt: row.created_at,
      }))
    } catch (err) {
      console.error('Failed to load pets from Supabase:', err)
      return []
    }
  },

  async createPet(userId: string, pet: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert({
          user_id: userId,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          weight_kg: pet.weight,
          age_years: pet.age,
          neutered: pet.neutered,
          life_stage: pet.lifeStage,
          avatar_emoji: pet.avatarEmoji,
          daily_rer_target: pet.dailyCalorieTarget,
          water_goal_ml: pet.waterGoal,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        name: data.name,
        species: data.species,
        breed: data.breed,
        weight: Number(data.weight_kg),
        age: Number(data.age_years),
        neutered: Boolean(data.neutered),
        lifeStage: data.life_stage,
        avatarEmoji: data.avatar_emoji,
        dailyCalorieTarget: Number(data.daily_rer_target),
        waterGoal: Number(data.water_goal_ml),
        createdAt: data.created_at,
      }
    } catch (err) {
      console.error('Failed to create pet in Supabase:', err)
      return null
    }
  },

  async updatePet(petId: string, updates: Partial<Pet>): Promise<boolean> {
    if (!isSupabaseConfigured || !petId) return false
    try {
      const payload: Record<string, unknown> = {}
      if (updates.name !== undefined) payload.name = updates.name
      if (updates.species !== undefined) payload.species = updates.species
      if (updates.breed !== undefined) payload.breed = updates.breed
      if (updates.weight !== undefined) payload.weight_kg = updates.weight
      if (updates.age !== undefined) payload.age_years = updates.age
      if (updates.neutered !== undefined) payload.neutered = updates.neutered
      if (updates.lifeStage !== undefined) payload.life_stage = updates.lifeStage
      if (updates.avatarEmoji !== undefined) payload.avatar_emoji = updates.avatarEmoji
      if (updates.dailyCalorieTarget !== undefined) payload.daily_rer_target = updates.dailyCalorieTarget
      if (updates.waterGoal !== undefined) payload.water_goal_ml = updates.waterGoal
      payload.updated_at = new Date().toISOString()

      const { error } = await supabase.from('pets').update(payload).eq('id', petId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to update pet in Supabase:', err)
      return false
    }
  },

  async deletePet(petId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !petId) return false
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to delete pet in Supabase:', err)
      return false
    }
  },

  // =========================================================================
  // 2. FEEDING LOGS
  // =========================================================================

  async getFeedings(userId: string, petId?: string): Promise<FeedingEntry[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('feeding_logs')
        .select('*')
        .eq('user_id', userId)
        .order('fed_at', { ascending: false })

      if (petId) {
        query = query.eq('pet_id', petId)
      }

      const { data, error } = await query
      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        petId: row.pet_id,
        foodId: row.food_id || '',
        foodName: row.food_name,
        portion: Number(row.portion_g),
        unit: (row.portion_unit || 'g') as PortionUnit,
        calories: Number(row.calories_consumed),
        protein: Number(row.protein_g || 0),
        fat: Number(row.fat_g || 0),
        fiber: Number(row.fiber_g || 0),
        fedBy: row.fed_by_name || 'Owner',
        timestamp: row.fed_at,
      }))
    } catch (err) {
      console.error('Failed to load feeding logs from Supabase:', err)
      return []
    }
  },

  async addFeeding(
    userId: string,
    entry: Omit<FeedingEntry, 'id' | 'timestamp'> & { timestamp?: string }
  ): Promise<FeedingEntry | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('feeding_logs')
        .insert({
          user_id: userId,
          pet_id: entry.petId,
          food_id: entry.foodId,
          food_name: entry.foodName,
          brand: entry.foodName,
          portion_g: entry.portion,
          portion_unit: entry.unit || 'g',
          calories_consumed: entry.calories,
          protein_g: entry.protein || 0,
          fat_g: entry.fat || 0,
          fiber_g: entry.fiber || 0,
          fed_by_name: entry.fedBy || 'Owner',
          fed_at: entry.timestamp || new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        petId: data.pet_id,
        foodId: data.food_id || '',
        foodName: data.food_name,
        portion: Number(data.portion_g),
        unit: (data.portion_unit || 'g') as PortionUnit,
        calories: Number(data.calories_consumed),
        protein: Number(data.protein_g || 0),
        fat: Number(data.fat_g || 0),
        fiber: Number(data.fiber_g || 0),
        fedBy: data.fed_by_name,
        timestamp: data.fed_at,
      }
    } catch (err) {
      console.error('Failed to save feeding log in Supabase:', err)
      return null
    }
  },

  async deleteFeeding(feedingId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !feedingId) return false
    try {
      const { error } = await supabase.from('feeding_logs').delete().eq('id', feedingId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to delete feeding log in Supabase:', err)
      return false
    }
  },

  // =========================================================================
  // 3. FOOD CATALOG & CUSTOM FOODS
  // =========================================================================

  async getFoods(userId?: string): Promise<FoodItem[]> {
    if (!isSupabaseConfigured) return []
    try {
      let query = supabase.from('foods').select('*')
      if (userId) {
        query = query.or(`verified.eq.true,user_id.eq.${userId}`)
      } else {
        query = query.eq('verified', true)
      }

      const { data, error } = await query.order('brand', { ascending: true })
      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        species: row.species || ['dog'],
        category: row.category,
        lifeStageSuitability: row.life_stage_suitability || ['adult'],
        caloriesPer100g: Number(row.calories_per_100g),
        protein: Number(row.protein_pct),
        fat: Number(row.fat_pct),
        fiber: Number(row.fiber_pct),
        moisture: Number(row.moisture_pct),
        servingSize: Number(row.serving_size_g || 100),
        servingUnit: row.serving_unit || 'g',
        price: Number(row.price_php || 0),
        packageSize: Number(row.package_size_g || 1000),
        pricePerCalorie: row.price_per_calorie ? Number(row.price_per_calorie) : undefined,
        verified: Boolean(row.verified),
        isCustom: Boolean(row.is_custom),
      }))
    } catch (err) {
      console.error('Failed to load foods from Supabase:', err)
      return []
    }
  },

  async addCustomFood(
    userId: string,
    food: Omit<FoodItem, 'id' | 'verified' | 'isCustom'>
  ): Promise<FoodItem | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('foods')
        .insert({
          user_id: userId,
          name: food.name,
          brand: food.brand,
          species: food.species,
          category: food.category,
          life_stage_suitability: food.lifeStageSuitability,
          calories_per_100g: food.caloriesPer100g,
          protein_pct: food.protein,
          fat_pct: food.fat,
          fiber_pct: food.fiber,
          moisture_pct: food.moisture,
          serving_size_g: food.servingSize,
          serving_unit: food.servingUnit,
          price_php: food.price,
          package_size_g: food.packageSize,
          price_per_calorie: food.pricePerCalorie,
          verified: false,
          is_custom: true,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        name: data.name,
        brand: data.brand,
        species: data.species,
        category: data.category,
        lifeStageSuitability: data.life_stage_suitability,
        caloriesPer100g: Number(data.calories_per_100g),
        protein: Number(data.protein_pct),
        fat: Number(data.fat_pct),
        fiber: Number(data.fiber_pct),
        moisture: Number(data.moisture_pct),
        servingSize: Number(data.serving_size_g),
        servingUnit: data.serving_unit,
        price: Number(data.price_php),
        packageSize: Number(data.package_size_g),
        pricePerCalorie: data.price_per_calorie ? Number(data.price_per_calorie) : undefined,
        verified: false,
        isCustom: true,
      }
    } catch (err) {
      console.error('Failed to save custom food in Supabase:', err)
      return null
    }
  },

  // =========================================================================
  // 4. WELLNESS: HYDRATION
  // =========================================================================

  async getHydrationLogs(userId: string, petId?: string): Promise<WaterLog[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })

      if (petId) {
        query = query.eq('pet_id', petId)
      }

      const { data, error } = await query
      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        petId: row.pet_id,
        amount: Number(row.amount_ml),
        timestamp: row.logged_at,
      }))
    } catch (err) {
      console.error('Failed to load hydration logs from Supabase:', err)
      return []
    }
  },

  async addHydrationLog(
    userId: string,
    petId: string,
    amount: number
  ): Promise<WaterLog | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('hydration_logs')
        .insert({
          user_id: userId,
          pet_id: petId,
          amount_ml: amount,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        petId: data.pet_id,
        amount: Number(data.amount_ml),
        timestamp: data.logged_at,
      }
    } catch (err) {
      console.error('Failed to save hydration log in Supabase:', err)
      return null
    }
  },

  // =========================================================================
  // 5. WELLNESS: WEIGHT
  // =========================================================================

  async getWeightLogs(userId: string, petId?: string): Promise<WeightLog[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: true })

      if (petId) {
        query = query.eq('pet_id', petId)
      }

      const { data, error } = await query
      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        petId: row.pet_id,
        weight: Number(row.weight_kg),
        date: row.logged_at,
        notes: row.notes || undefined,
      }))
    } catch (err) {
      console.error('Failed to load weight logs from Supabase:', err)
      return []
    }
  },

  async addWeightLog(
    userId: string,
    petId: string,
    weight: number,
    notes?: string,
    date?: string
  ): Promise<WeightLog | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          pet_id: petId,
          weight_kg: weight,
          notes: notes || null,
          logged_at: date || new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        petId: data.pet_id,
        weight: Number(data.weight_kg),
        date: data.logged_at,
        notes: data.notes || undefined,
      }
    } catch (err) {
      console.error('Failed to save weight log in Supabase:', err)
      return null
    }
  },

  async removeWeightLog(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !id) return false
    try {
      const { error } = await supabase.from('weight_logs').delete().eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to remove weight log from Supabase:', err)
      return false
    }
  },

  // =========================================================================
  // 6. CARE TASKS & SCHEDULES
  // =========================================================================

  async getCareTasks(userId: string, petId?: string): Promise<ScheduleTask[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('care_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })

      if (petId) {
        query = query.eq('pet_id', petId)
      }

      const { data, error } = await query
      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        petId: row.pet_id,
        type: row.task_type,
        title: row.title,
        notes: row.notes || undefined,
        frequency: row.frequency || 'once',
        time: row.time || '09:00',
        dueDate: row.due_date,
        completed: Boolean(row.completed),
        completedBy: row.completed_by || undefined,
        completedAt: row.completed_at || undefined,
        snoozedUntil: row.snoozed_until || undefined,
        createdAt: row.created_at,
      }))
    } catch (err) {
      console.error('Failed to load care tasks from Supabase:', err)
      return []
    }
  },

  async addCareTask(
    userId: string,
    task: Omit<ScheduleTask, 'id' | 'completed' | 'createdAt'>
  ): Promise<ScheduleTask | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('care_tasks')
        .insert({
          user_id: userId,
          pet_id: task.petId,
          title: task.title,
          task_type: task.type,
          notes: task.notes || null,
          frequency: task.frequency || 'once',
          time: task.time || '09:00',
          due_date: task.dueDate,
          completed: false,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        petId: data.pet_id,
        type: data.task_type,
        title: data.title,
        notes: data.notes || undefined,
        frequency: data.frequency,
        time: data.time,
        dueDate: data.due_date,
        completed: false,
        createdAt: data.created_at,
      }
    } catch (err) {
      console.error('Failed to add care task in Supabase:', err)
      return null
    }
  },

  async updateCareTask(
    taskId: string,
    updates: Partial<ScheduleTask>
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !taskId) return false
    try {
      const payload: Record<string, unknown> = {}
      if (updates.completed !== undefined) {
        payload.completed = updates.completed
        payload.completed_at = updates.completed ? new Date().toISOString() : null
      }
      if (updates.completedBy !== undefined) payload.completed_by = updates.completedBy
      if (updates.snoozedUntil !== undefined) payload.snoozed_until = updates.snoozedUntil
      if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
      if (updates.title !== undefined) payload.title = updates.title
      if (updates.notes !== undefined) payload.notes = updates.notes

      const { error } = await supabase.from('care_tasks').update(payload).eq('id', taskId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to update care task in Supabase:', err)
      return false
    }
  },

  async deleteCareTask(taskId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !taskId) return false
    try {
      const { error } = await supabase.from('care_tasks').delete().eq('id', taskId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to delete care task from Supabase:', err)
      return false
    }
  },
}

