import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { supabaseAuth } from '../services/supabase-auth'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
}

type AuthContextType = {
  isLoggedIn: boolean
  user: AuthUser | null
  rawUser: User | null
  session: Session | null
  loading: boolean
  login: () => void
  logout: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  demoLogin: () => void
  updateProfile: (updates: { fullName?: string; avatarUrl?: string }) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USER: AuthUser = {
  id: 'demo-user-id',
  email: 'petparent@animeal.ph',
  fullName: 'Pinoy Pet Parent',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AniMealOwner',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [rawUser, setRawUser] = useState<User | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const activeSession = await supabaseAuth.getSession()
          if (!mounted) return

          if (activeSession?.user) {
            setSession(activeSession)
            setRawUser(activeSession.user)
            setUser({
              id: activeSession.user.id,
              email: activeSession.user.email || '',
              fullName:
                activeSession.user.user_metadata?.full_name ||
                activeSession.user.user_metadata?.name ||
                activeSession.user.email?.split('@')[0] ||
                'Pet Parent',
              avatarUrl:
                activeSession.user.user_metadata?.avatar_url ||
                activeSession.user.user_metadata?.picture,
            })
          } else if (localStorage.getItem('animeal-demo-session') === 'true') {
            setUser(DEMO_USER)
          }
        } else {
          // Offline / local development mode
          const wasLoggedIn =
            localStorage.getItem('animeal-logged-in') === 'true' ||
            localStorage.getItem('animeal-demo-session') === 'true'
          if (wasLoggedIn) {
            setUser(DEMO_USER)
          }
        }
      } catch (err) {
        console.warn('Auth initialization warning:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes if Supabase is active
    const { unsubscribe } = supabaseAuth.onAuthStateChange((newSession, authUser) => {
      if (!mounted) return
      setSession(newSession)
      setRawUser(authUser)
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          fullName:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'Pet Parent',
          avatarUrl:
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture,
        })
        localStorage.removeItem('animeal-demo-session')
      } else if (localStorage.getItem('animeal-demo-session') === 'true') {
        setUser(DEMO_USER)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    const res = await supabaseAuth.signIn(email, password)
    setLoading(false)
    if (!res.error && res.user) {
      setSession(res.session)
      setRawUser(res.user)
      setUser({
        id: res.user.id,
        email: res.user.email || email,
        fullName:
          res.user.user_metadata?.full_name || email.split('@')[0] || 'Pet Parent',
        avatarUrl: res.user.user_metadata?.avatar_url,
      })
      localStorage.setItem('animeal-logged-in', 'true')
    }
    return { error: res.error }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    const res = await supabaseAuth.signUp(email, password, fullName)
    setLoading(false)
    if (!res.error && res.user && res.session) {
      setSession(res.session)
      setRawUser(res.user)
      setUser({
        id: res.user.id,
        email: res.user.email || email,
        fullName: fullName || email.split('@')[0],
        avatarUrl: res.user.user_metadata?.avatar_url,
      })
      localStorage.setItem('animeal-logged-in', 'true')
    }
    return { error: res.error, needsEmailConfirmation: !res.session && !res.error }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    const res = await supabaseAuth.signInWithGoogle()
    if (res.error) {
      setLoading(false)
      return { error: res.error }
    }
    // Browser redirects to Google consent page on success
    return { error: null }
  }, [])

  const demoLogin = useCallback(() => {
    localStorage.setItem('animeal-logged-in', 'true')
    localStorage.setItem('animeal-demo-session', 'true')
    setUser(DEMO_USER)
  }, [])

  const login = useCallback(() => {
    demoLogin()
  }, [demoLogin])

  const logout = useCallback(async () => {
    localStorage.removeItem('animeal-logged-in')
    localStorage.removeItem('animeal-demo-session')
    setUser(null)
    setSession(null)
    setRawUser(null)
    await supabaseAuth.signOut()
  }, [])

  const updateProfile = useCallback(async (updates: { fullName?: string; avatarUrl?: string }) => {
    try {
      setUser((prev) => {
        if (!prev) return null
        return {
          ...prev,
          fullName: updates.fullName !== undefined ? updates.fullName : prev.fullName,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : prev.avatarUrl,
        }
      })

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: updates.fullName,
            avatar_url: updates.avatarUrl,
          },
        })
        if (error) return { error }
      }
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }, [])

  const isLoggedIn = Boolean(user)

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        rawUser,
        session,
        loading,
        login,
        logout,
        signIn,
        signUp,
        signInWithGoogle,
        demoLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
