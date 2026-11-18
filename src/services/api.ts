import type {
  Pet,
  FeedingEntry,
  WaterLog,
  WeightLog,
  ScheduleTask,
  HouseholdMember,
  ChatAction,
} from '../types'

const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(errorBody.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Health
  health: () => request<{ status: string; service: string }>('/health'),

  // Pets
  getPets: () => request<Pet[]>('/pets'),
  createPet: (pet: Omit<Pet, 'id' | 'dailyCalorieTarget' | 'waterGoal' | 'createdAt'>) =>
    request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(pet),
    }),
  updatePet: (id: string, data: Partial<Pet>) =>
    request<Pet>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePet: (id: string) =>
    request<{ success: boolean }>(`/pets/${id}`, {
      method: 'DELETE',
    }),

  // Feedings
  getFeedings: (petId?: string, todayOnly?: boolean) => {
    const params = new URLSearchParams()
    if (petId) params.append('petId', petId)
    if (todayOnly) params.append('todayOnly', 'true')
    return request<FeedingEntry[]>(`/feedings?${params.toString()}`)
  },
  logFeeding: (entry: Partial<FeedingEntry>) =>
    request<FeedingEntry>('/feedings', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
  undoFeeding: (id: string) =>
    request<FeedingEntry>(`/feedings/${id}/undo`, {
      method: 'POST',
    }),
  updateFeeding: (id: string, updates: Partial<FeedingEntry>) =>
    request<FeedingEntry>(`/feedings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteFeeding: (id: string) =>
    request<{ success: boolean }>(`/feedings/${id}`, {
      method: 'DELETE',
    }),

  // Wellness: Water
  getWaterLogs: (petId: string) =>
    request<{ logs: WaterLog[]; todayTotal: number }>(`/wellness/water/${petId}`),
  logWater: (petId: string, amount: number) =>
    request<WaterLog>('/wellness/water', {
      method: 'POST',
      body: JSON.stringify({ petId, amount }),
    }),

  // Wellness: Weight
  getWeightLogs: (petId: string) => request<WeightLog[]>(`/wellness/weight/${petId}`),
  logWeight: (petId: string, weight: number, notes?: string, date?: string) =>
    request<WeightLog>('/wellness/weight', {
      method: 'POST',
      body: JSON.stringify({ petId, weight, notes, date }),
    }),

  // Tasks & Care Schedule
  getTasks: (petId?: string) => {
    const params = petId ? `?petId=${petId}` : ''
    return request<ScheduleTask[]>(`/tasks${params}`)
  },
  createTask: (task: Partial<ScheduleTask>) =>
    request<ScheduleTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  completeTask: (id: string, completedBy?: string) =>
    request<ScheduleTask>(`/tasks/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ completedBy }),
    }),
  deleteTask: (id: string) =>
    request<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Household
  getHousehold: () => request<HouseholdMember[]>('/household'),
  addHouseholdMember: (name: string) =>
    request<HouseholdMember>('/household', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  deleteHouseholdMember: (id: string) =>
    request<{ success: boolean }>(`/household/${id}`, {
      method: 'DELETE',
    }),

  // Foods
  getCustomFoods: () => request<Record<string, unknown>[]>('/foods'),
  addCustomFood: (food: Record<string, unknown>) =>
    request<Record<string, unknown>>('/foods', {
      method: 'POST',
      body: JSON.stringify(food),
    }),
  deleteCustomFood: (id: string) =>
    request<{ success: boolean }>(`/foods/${id}`, {
      method: 'DELETE',
    }),

  // Mealie AI Chat Engine
  chatMealie: (message: string, petContext?: Partial<Pet>) =>
    request<{
      role: 'mealie'
      severity: 'info' | 'caution' | 'emergency'
      content: string
      actions?: ChatAction[]
      timestamp: string
    }>('/mealie/chat', {
      method: 'POST',
      body: JSON.stringify({ message, petContext }),
    }),

  // Server-side Gemini AI Chat Proxy (protects API keys)
  chatGeminiProxy: (
    message: string,
    history?: { role: string; text?: string; content?: string }[],
    pet?: Partial<Pet>
  ) =>
    request<{
      reply: string
      role: 'mealie'
      timestamp: string
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, pet }),
    }),

  // Server-side Gemini Multimodal Scanner Proxy
  scanLabelProxy: (imageBase64: string, mimeType = 'image/jpeg') =>
    request<Record<string, unknown>>('/ai/scan', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    }),
}
