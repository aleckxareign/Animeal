import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Pet,
  FeedingEntry,
  FoodItem,
  WaterLog,
  WeightLog,
  ScheduleTask,
  PortionUnit,
  HouseholdMember,
  Vet,
} from '../types'

/**
 * Type-safe, high-performance database service mapping Supabase PostgreSQL tables
 * to AniMeal frontend models with snake_case <-> camelCase mapping, query bounding,
 * and robust error handling.
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
          name: pet.name.trim(),
          species: pet.species,
          breed: pet.breed.trim(),
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
      if (updates.name !== undefined) payload.name = updates.name.trim()
      if (updates.species !== undefined) payload.species = updates.species
      if (updates.breed !== undefined) payload.breed = updates.breed.trim()
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

  /**
   * Fetches feeding logs with optional petId and limit.
   * Default limit of 100 prevents unbounded memory and payload sizes.
   */
  async getFeedings(userId: string, petId?: string, limit = 100): Promise<FeedingEntry[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('feeding_logs')
        .select('*')
        .eq('user_id', userId)
        .order('fed_at', { ascending: false })
        .limit(limit)

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

  /**
   * High-efficiency query fetching only today's feeding records for calorie calculation
   */
  async getTodayFeedings(userId: string, petId: string): Promise<FeedingEntry[]> {
    if (!isSupabaseConfigured || !userId || !petId) return []
    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('feeding_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .gte('fed_at', startOfDay.toISOString())
        .order('fed_at', { ascending: false })

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
      console.error('Failed to fetch today feedings from Supabase:', err)
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
          portion_g: Math.max(0, entry.portion),
          portion_unit: entry.unit || 'g',
          calories_consumed: Math.max(0, entry.calories),
          protein_g: Math.max(0, entry.protein || 0),
          fat_g: Math.max(0, entry.fat || 0),
          fiber_g: Math.max(0, entry.fiber || 0),
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

  async updateFeeding(
    feedingId: string,
    updates: Partial<FeedingEntry>
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !feedingId) return false
    try {
      const payload: Record<string, unknown> = {}
      if (updates.portion !== undefined) payload.portion_g = Math.max(0, updates.portion)
      if (updates.unit !== undefined) payload.portion_unit = updates.unit
      if (updates.calories !== undefined) payload.calories_consumed = Math.max(0, updates.calories)
      if (updates.protein !== undefined) payload.protein_g = Math.max(0, updates.protein)
      if (updates.fat !== undefined) payload.fat_g = Math.max(0, updates.fat)
      if (updates.fiber !== undefined) payload.fiber_g = Math.max(0, updates.fiber)
      if (updates.foodName !== undefined) payload.food_name = updates.foodName
      if (updates.fedBy !== undefined) payload.fed_by_name = updates.fedBy

      const { error } = await supabase.from('feeding_logs').update(payload).eq('id', feedingId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to update feeding log in Supabase:', err)
      return false
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
          name: food.name.trim(),
          brand: food.brand.trim(),
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

  async updateCustomFood(
    foodId: string,
    updates: Partial<FoodItem>
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !foodId) return false
    try {
      const payload: Record<string, unknown> = {}
      if (updates.name !== undefined) payload.name = updates.name.trim()
      if (updates.brand !== undefined) payload.brand = updates.brand.trim()
      if (updates.species !== undefined) payload.species = updates.species
      if (updates.category !== undefined) payload.category = updates.category
      if (updates.lifeStageSuitability !== undefined) payload.life_stage_suitability = updates.lifeStageSuitability
      if (updates.caloriesPer100g !== undefined) payload.calories_per_100g = updates.caloriesPer100g
      if (updates.protein !== undefined) payload.protein_pct = updates.protein
      if (updates.fat !== undefined) payload.fat_pct = updates.fat
      if (updates.fiber !== undefined) payload.fiber_pct = updates.fiber
      if (updates.moisture !== undefined) payload.moisture_pct = updates.moisture
      if (updates.servingSize !== undefined) payload.serving_size_g = updates.servingSize
      if (updates.servingUnit !== undefined) payload.serving_unit = updates.servingUnit
      if (updates.price !== undefined) payload.price_php = updates.price
      if (updates.packageSize !== undefined) payload.package_size_g = updates.packageSize
      if (updates.pricePerCalorie !== undefined) payload.price_per_calorie = updates.pricePerCalorie

      const { error } = await supabase.from('foods').update(payload).eq('id', foodId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to update custom food in Supabase:', err)
      return false
    }
  },

  async deleteCustomFood(foodId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !foodId) return false
    try {
      const { error } = await supabase.from('foods').delete().eq('id', foodId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to delete custom food in Supabase:', err)
      return false
    }
  },

  // =========================================================================
  // 4. WELLNESS: HYDRATION
  // =========================================================================

  async getHydrationLogs(userId: string, petId?: string, limit = 100): Promise<WaterLog[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(limit)

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
          amount_ml: Math.max(0, amount),
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

  async getWeightLogs(userId: string, petId?: string, limit = 100): Promise<WeightLog[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      let query = supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: true })
        .limit(limit)

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
          weight_kg: Math.max(0.1, weight),
          notes: notes ? notes.trim() : null,
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
          title: task.title.trim(),
          task_type: task.type,
          notes: task.notes ? task.notes.trim() : null,
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
      if (updates.title !== undefined) payload.title = updates.title.trim()
      if (updates.notes !== undefined) payload.notes = updates.notes ? updates.notes.trim() : null
      payload.updated_at = new Date().toISOString()

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

  // =========================================================================
  // 7. SHARED HOUSEHOLD MEMBERS
  // =========================================================================

  async getHouseholdMembers(userId: string): Promise<HouseholdMember[]> {
    if (!isSupabaseConfigured || !userId) return []
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (!data) return []

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color || '#44632f',
        isOwner: Boolean(row.is_owner),
      }))
    } catch (err) {
      console.error('Failed to load household members from Supabase:', err)
      return []
    }
  },

  async addHouseholdMember(
    userId: string,
    name: string,
    color = '#44632f',
    isOwner = false
  ): Promise<HouseholdMember | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      const { data, error } = await supabase
        .from('household_members')
        .insert({
          user_id: userId,
          name: name.trim(),
          color,
          is_owner: isOwner,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        name: data.name,
        color: data.color,
        isOwner: data.is_owner,
      }
    } catch (err) {
      console.error('Failed to add household member in Supabase:', err)
      return null
    }
  },

  async updateHouseholdMember(
    id: string,
    updates: Partial<HouseholdMember>
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !id) return false
    try {
      const payload: Record<string, unknown> = {}
      if (updates.name !== undefined) payload.name = updates.name.trim()
      if (updates.color !== undefined) payload.color = updates.color
      if (updates.isOwner !== undefined) payload.is_owner = updates.isOwner
      payload.updated_at = new Date().toISOString()

      const { error } = await supabase.from('household_members').update(payload).eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to update household member in Supabase:', err)
      return false
    }
  },

  async removeHouseholdMember(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !id) return false
    try {
      const { error } = await supabase.from('household_members').delete().eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to remove household member from Supabase:', err)
      return false
    }
  },

  // =========================================================================
  // 8. ASK MEALIE AI CHAT CONVERSATIONS
  // =========================================================================

  async getChatConversation(userId: string, petId?: string): Promise<unknown[] | null> {
    if (!isSupabaseConfigured || !userId) return null
    try {
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (petId) query = query.eq('pet_id', petId)

      const { data, error } = await query.limit(1).maybeSingle()
      if (error || !data) return null
      return Array.isArray(data.messages) ? data.messages : null
    } catch (err) {
      console.error('Failed to load chat from Supabase:', err)
      return null
    }
  },

  async saveChatConversation(
    userId: string,
    messages: unknown[],
    petId?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false
    try {
      const { error } = await supabase.from('chat_conversations').upsert(
        {
          user_id: userId,
          pet_id: petId || null,
          title: 'Chat with Mealie',
          messages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to persist chat in Supabase:', err)
      return false
    }
  },

  // =========================================================================
  // 9. VETERINARY CLINICS DIRECTORY
  // =========================================================================

  async getVets(city?: string): Promise<Vet[]> {
    if (!isSupabaseConfigured) return []
    try {
      let query = supabase
        .from('vets')
        .select('*')
        .order('rating', { ascending: false })

      if (city) {
        query = query.ilike('city', `%${city}%`)
      }

      const { data, error } = await query
      if (error) throw error
      if (!data || data.length === 0) return []

      return data.map((row, idx) => ({
        id: row.id || idx + 1,
        name: row.name,
        address: row.address,
        city: row.city,
        phone: row.phone,
        distance: row.distance || '2.5 km',
        latitude: row.latitude ? Number(row.latitude) : undefined,
        longitude: row.longitude ? Number(row.longitude) : undefined,
        emergency: Boolean(row.emergency),
        openNow: Boolean(row.open_now),
        hours: row.hours || undefined,
        services: Array.isArray(row.services) ? row.services : ['General Checkup', 'Vaccination'],
        rating: row.rating ? Number(row.rating) : 4.5,
        verified: Boolean(row.verified ?? true),
      }))
    } catch (err) {
      console.error('Failed to load vets directory from Supabase:', err)
      return []
    }
  },

  async seedVetsIfEmpty(demoVets: Vet[]): Promise<boolean> {
    if (!isSupabaseConfigured || !demoVets || demoVets.length === 0) return false
    try {
      const { count, error: countErr } = await supabase
        .from('vets')
        .select('*', { count: 'exact', head: true })

      if (countErr) {
        console.warn('Could not check vets count in Supabase:', countErr.message)
        return false
      }

      if (count && count > 0) return true // Already seeded

      const rows = demoVets.map((v) => ({
        name: v.name,
        address: v.address,
        city: v.city,
        phone: v.phone,
        distance: v.distance,
        latitude: v.latitude,
        longitude: v.longitude,
        emergency: v.emergency,
        open_now: v.openNow,
        hours: v.hours,
        services: v.services,
        rating: v.rating,
        verified: v.verified ?? true,
      }))

      const { error: insertErr } = await supabase.from('vets').insert(rows)
      if (insertErr) {
        console.warn('Could not auto-seed vets into Supabase:', insertErr.message)
        return false
      }
      return true
    } catch (err) {
      console.warn('Auto-seed exception:', err)
      return false
    }
  },
}
