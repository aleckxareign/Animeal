import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export type AuthResponse = {
  user: User | null
  session: Session | null
  error: AuthError | Error | null
}

export type ProfileData = {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}

/**
 * Service for Supabase Authentication operations.
 * Handles user sign-up, sign-in, sign-out, session restoration,
 * and user profile synchronization.
 */
export const supabaseAuth = {
  /**
   * Register a new user with email and password
   */
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'),
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        },
      },
    })

    return {
      user: data.user,
      session: data.session,
      error,
    }
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'),
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return {
      user: data.user,
      session: data.session,
      error,
    }
  },

  /**
   * Sign in or Sign up with Google OAuth via Supabase
   * Works for both existing users (Sign In) and new users (Sign Up)
   */
  async signInWithGoogle(): Promise<{ error: AuthError | Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
        ),
      }
    }

    const redirectTo = `${window.location.origin}/`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    return { error }
  },

  /**
   * Sign in using a Google ID token from Google Identity Services (GIS).
   * Runs client-side so the prompt appears directly on https://animeal-livid.vercel.app,
   * completely avoiding the raw Supabase URL screen.
   */
  async signInWithGoogleIdToken(idToken: string, nonce?: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        error: new Error(
          'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
        ),
      }
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      nonce: nonce || undefined,
    })

    return {
      user: data.user,
      session: data.session,
      error,
    }
  },

  /**
   * Sign out the active user session
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get the current active session
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  /**
   * Get the currently logged-in user
   */
  async getUser(): Promise<User | null> {
    if (!isSupabaseConfigured) return null
    const { data } = await supabase.auth.getUser()
    return data.user
  },

  /**
   * Subscribe to Supabase auth state transitions (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
   */
  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null)
    })

    return {
      unsubscribe: () => subscription.unsubscribe(),
    }
  },

  /**
   * Fetch user profile from public.profiles
   */
  async getProfile(userId: string): Promise<ProfileData | null> {
    if (!isSupabaseConfigured) return null
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) return null
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
      }
    } catch {
      return null
    }
  },
}

/**
 * Generate a cryptographically secure random nonce and its SHA-256 hash.
 * Used for Google Identity Services: Google receives the hashed nonce,
 * while Supabase receives the raw nonce to verify against the ID token claim.
 */
export async function generateNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  try {
    const rawNonce = crypto.randomUUID()
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(rawNonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return { rawNonce, hashedNonce }
  } catch (e) {
    console.warn('Nonce generation fallback triggered:', e)
    const rawNonce = Math.random().toString(36).substring(2) + Date.now().toString(36)
    return { rawNonce, hashedNonce: rawNonce }
  }
}

