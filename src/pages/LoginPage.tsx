import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { Sparkles, ArrowRight, ShieldCheck, Heart, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { isLoggedIn, signIn, signUp, demoLogin } = useAuth()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from ?? '/meal-tracker'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (isLoggedIn) return <Navigate to={from} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setErrorMessage(error.message || 'Invalid email or password. Please try again.')
        }
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setErrorMessage(error.message || 'Failed to create account. Please try again.')
        } else {
          setSuccessMessage(
            'Account created successfully! Check your email inbox to confirm your account (or sign in if email confirmation is disabled).'
          )
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDemoLogin() {
    demoLogin()
  }

  return (
    <section className="flex min-h-[85vh] items-center bg-brand-cream/40 py-12">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-brand-dark/5">
          {/* Header Banner */}
          <div className="bg-brand-dark p-6 text-white sm:p-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-sage/30 px-3 py-1 text-xs font-semibold text-brand-cream">
              <Sparkles className="h-3 w-3 text-brand-sage" />
              Pet Nutrition Platform
            </div>
            <h1 className="font-display mt-3 text-2xl font-bold sm:text-3xl text-brand-cream">
              {mode === 'signin' ? 'Welcome to AniMeal' : 'Join AniMeal Today'}
            </h1>
            <p className="mt-1.5 text-xs text-brand-cream/70 sm:text-sm">
              {mode === 'signin'
                ? 'Sign in to manage meals, nutrition, health records, and chat with Mealie.'
                : 'Create an account to track your pets’ daily nutrition and veterinary milestones.'}
            </p>

            {/* Mode Toggle Tabs */}
            <div className="mt-5 grid grid-cols-2 rounded-xl bg-white/10 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`rounded-lg py-2 transition ${
                  mode === 'signin'
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-brand-cream/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`rounded-lg py-2 transition ${
                  mode === 'signup'
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-brand-cream/70 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Quick Demo Login Button */}
            <div className="mb-6 rounded-2xl border border-brand-sage/20 bg-brand-sage/5 p-4 text-center">
              <p className="text-xs font-medium text-brand-dark/80">
                Want to test all features immediately without entering credentials?
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-sage px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-sage/90"
              >
                <span>⚡ 1-Click Quick Demo Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative my-6 text-center">
              <hr className="border-brand-dark/10" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium text-brand-dark/40">
                {mode === 'signin' ? 'or sign in with email' : 'or register with email'}
              </span>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-alert/30 bg-brand-alert/10 p-3 text-xs text-brand-alert">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-sage/30 bg-brand-sage/10 p-3 text-xs text-brand-sage">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-brand-dark/70"
                  >
                    Your Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Maria Santos"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-brand-dark/15 bg-brand-cream/20 px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-brand-dark/70"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-brand-dark/15 bg-brand-cream/20 px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-brand-dark/70"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-brand-dark/15 bg-brand-cream/20 px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-dark/90 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-dark/50">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-sage" />
              <span>
                {isSupabaseConfigured
                  ? 'Secured with Supabase Auth & PostgreSQL RLS'
                  : 'Offline-ready browser storage enabled'}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-brand-dark/60">
          Made with <Heart className="inline h-3 w-3 text-brand-alert fill-brand-alert" /> for Filipino pet parents.
        </p>
      </div>
    </section>
  )
}
