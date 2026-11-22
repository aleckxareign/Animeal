import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here'
)

/**
 * Singleton Supabase client for browser authentication, database queries, and storage.
 * Gracefully logs a warning if keys are not configured yet so development can continue.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (createClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key'
    ) as SupabaseClient)

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase environment variables not set yet. Running in offline/mock mode.'
  )
}

