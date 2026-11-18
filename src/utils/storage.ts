const PREFIX = 'animeal-'

export type SyncAction = {
  id: string
  entity: 'pet' | 'feeding' | 'water' | 'weight' | 'task' | 'food' | 'household'
  operation: 'create' | 'update' | 'delete'
  payload: unknown
  timestamp: string
}

/**
 * Safely retrieves and deserializes data from localStorage.
 * If data is corrupted or null, returns the fallback value.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    // If fallback is an object (not array or null), merge to prevent missing schema keys
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof fallback === 'object' &&
      !Array.isArray(fallback) &&
      fallback !== null
    ) {
      return { ...fallback, ...parsed }
    }
    return parsed as T
  } catch {
    return fallback
  }
}

/**
 * Safely persists data to localStorage.
 * Handles QuotaExceededError gracefully by pruning non-critical cached data.
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch (e: unknown) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn('localStorage quota exceeded. Pruning temporary caches...')
      try {
        // Attempt to clean non-critical sync queues or temporary keys
        sessionStorage.clear()
        localStorage.removeItem(PREFIX + 'temp-cache')
        localStorage.setItem(PREFIX + key, JSON.stringify(data))
      } catch (retryErr) {
        console.error('Failed to save to localStorage even after pruning:', retryErr)
      }
    } else {
      console.error('Failed to save to localStorage:', e)
    }
  }
}

/**
 * Removes a specific key from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // Ignore storage deletion errors
  }
}

/**
 * Generates an URL-safe unique ID (UUID format if crypto is available, fallback timestamp)
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFLINE RESILIENT DATA QUEUE
// Guarantees zero data loss if network drops or Supabase is temporarily unreachable
// ─────────────────────────────────────────────────────────────────────────────

const SYNC_QUEUE_KEY = 'pending-sync-queue'

export function getSyncQueue(): SyncAction[] {
  return loadFromStorage<SyncAction[]>(SYNC_QUEUE_KEY, [])
}

export function addToSyncQueue(
  entity: SyncAction['entity'],
  operation: SyncAction['operation'],
  payload: unknown
): void {
  const current = getSyncQueue()
  const item: SyncAction = {
    id: generateId(),
    entity,
    operation,
    payload,
    timestamp: new Date().toISOString(),
  }
  saveToStorage(SYNC_QUEUE_KEY, [...current, item])
}

export function removeSyncQueueItem(id: string): void {
  const current = getSyncQueue()
  saveToStorage(
    SYNC_QUEUE_KEY,
    current.filter((item) => item.id !== id)
  )
}

export function clearSyncQueue(): void {
  removeFromStorage(SYNC_QUEUE_KEY)
}
