import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Compass,
  Utensils,
  Heart,
  Lock,
  Mail,
  User as UserIcon,
  Sun,
  Moon,
} from 'lucide-react'

export default function LoginPage() {
  const { isLoggedIn, signIn, signUp, signInWithGoogle } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [forgotModalOpen, setForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  if (isLoggedIn) return <Navigate to={from} replace />

  async function handleGoogleLogin() {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        const msg = error.message || 'Google sign-in error.'
        if (
          msg.toLowerCase().includes('provider is not enabled') ||
          msg.toLowerCase().includes('unsupported provider')
        ) {
          setErrorMessage(
            'Google Sign-In is not enabled yet in your Supabase project. To enable it: Go to Supabase Dashboard -> Authentication -> Providers -> Google, toggle it ON, and add your Google Client ID & Secret.'
          )
        } else {
          setErrorMessage(msg)
        }
        setIsSubmitting(false)
      }
      // On success, Supabase immediately redirects the browser to accounts.google.com
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.'
      setErrorMessage(msg)
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          const msg = error.message || 'Invalid email or password.'
          if (msg.toLowerCase().includes('email not confirmed')) {
            setErrorMessage(
              'Email is not confirmed yet. In Supabase Dashboard -> Auth -> Providers -> Email, turn OFF "Confirm email" to log in immediately without confirmation.'
            )
          } else {
            setErrorMessage(msg)
          }
        }
      } else {
        const { error, needsEmailConfirmation } = await signUp(email, password, fullName)
        if (error) {
          const msg = error.message || 'Failed to create account.'
          if (msg.toLowerCase().includes('rate limit')) {
            setErrorMessage(
              'Supabase Email Rate Limit Exceeded. To fix immediately: In your Supabase Dashboard -> Authentication -> Providers -> Email, toggle OFF "Confirm email", then click Save. This removes the rate limit and lets you register instantly!'
            )
          } else {
            setErrorMessage(msg)
          }
        } else if (needsEmailConfirmation) {
          setSuccessMessage(
            'Account created! A confirmation email was sent. If you want instant sign-in without checking email, disable "Confirm email" in Supabase Auth settings.'
          )
        } else {
          setSuccessMessage('Account created and signed in successfully!')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotSent(true)
    setTimeout(() => {
      setForgotSent(false)
      setForgotModalOpen(false)
      setSuccessMessage('If an account exists for that email, a password reset link has been dispatched.')
    }, 1200)
  }

  return (
    <div className="min-h-screen w-full bg-[#edf2f7] dark:bg-[#071010] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-5xl rounded-[36px] bg-white dark:bg-[#132525] shadow-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 min-h-[640px] transition-colors duration-300">
        
        {/* ── LEFT CARD: Dark Brand Showcase ── */}
        <div className="lg:col-span-5 bg-[#164040] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background ambient glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand-sage/20 blur-3xl" />

          {/* Top header row: Pill badge on left, Dark/Light Mode Toggle Switch on right */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
              Pinoy Pet Care Platform
            </span>

            {/* Dark & Light Mode Toggle Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`group relative inline-flex h-8 w-16 shrink-0 items-center rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 cursor-pointer shadow-md ${
                theme === 'dark'
                  ? 'bg-[#18181b] border border-white/20'
                  : 'bg-[#e2e8f0] border border-slate-300/80'
              }`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {/* Sun icon on left, Moon icon on right */}
              <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
                <Sun
                  className={`size-3.5 transition-all duration-300 ${
                    theme === 'light'
                      ? 'text-slate-800 scale-100 opacity-100'
                      : 'text-slate-500 scale-75 opacity-0'
                  }`}
                />
                <Moon
                  className={`size-3.5 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'text-white scale-100 opacity-100'
                      : 'text-slate-400 scale-75 opacity-0'
                  }`}
                />
              </div>

              {/* Sliding Thumb Knob */}
              <span
                className={`relative z-10 inline-block size-6 transform rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  theme === 'dark'
                    ? 'translate-x-0 bg-white ring-1 ring-black/10'
                    : 'translate-x-8 bg-[#1e293b] ring-1 ring-white/10'
                }`}
              />
            </button>
          </div>

          {/* Center Mascot & Brand Headline */}
          <Link
            to="/"
            className="group relative z-10 my-auto py-10 text-center flex flex-col items-center cursor-pointer transition-transform hover:scale-[1.01]"
            title="Bumalik sa AniMeal Home"
          >
            {/* Mascot Icon Container */}
            <div className="relative mb-6">
              <div className="size-24 sm:size-28 rounded-3xl bg-white keep-white p-3.5 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ring-4 ring-white/10">
                <img
                  src="/images/logo-only.svg"
                  alt="AniMeal Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text logo if SVG fails
                    ;(e.currentTarget as HTMLElement).style.display = 'none'
                  }}
                />
              </div>
              <Sparkles className="absolute -top-2 -right-2 size-5 text-amber-300 animate-bounce" />
              <div className="absolute -bottom-1 -left-1 size-3 rounded-full bg-emerald-400/80 blur-xs" />
            </div>

            {/* Brand Title */}
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white group-hover:text-emerald-100 transition-colors">
              AniMeal
            </h1>

            {/* Tagline */}
            <p className="mt-3 text-sm sm:text-base text-emerald-100/85 max-w-xs font-medium leading-relaxed">
              pampakain, pag-aalaga, at kalusugan ng inyong alagang hayop.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-emerald-200/60 font-semibold tracking-wider uppercase">
              <span>Smart Nutrition</span>
              <span>•</span>
              <span>AI Guidance</span>
              <span>•</span>
              <span>Vet Finder</span>
            </div>
          </Link>

        </div>

        {/* ── RIGHT CARD: Floating Authentication Form ── */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#132525] transition-colors duration-300">
          <div className="w-full max-w-md mx-auto">
            
            {/* Top Segmented Pill Tabs */}
            <div className="mb-6 flex rounded-full bg-slate-100 dark:bg-[#0e1d1d] p-1 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`flex-1 rounded-full py-2.5 transition-all duration-200 text-center cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-[#1a3333] text-slate-900 dark:text-white shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`flex-1 rounded-full py-2.5 transition-all duration-200 text-center cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-[#1a3333] text-slate-900 dark:text-white shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Quick Action Buttons (Google OAuth) */}
            <div className="space-y-2.5">
              {/* Sign in / Sign up with Google (Live Supabase OAuth) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 rounded-full border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-[#1a3333] py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#203f3f] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {/* Standard Google "G" SVG */}
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <hr className="border-slate-200 dark:border-slate-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#132525] px-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
                or
              </span>
            </div>

            {/* Alert Notifications */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pangalan (Full Name)
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0e1d1d] py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-sage focus:bg-white dark:focus:bg-[#0e1d1d] focus:outline-none focus:ring-2 focus:ring-brand-sage/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="ikaw@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0e1d1d] py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-sage focus:bg-white dark:focus:bg-[#0e1d1d] focus:outline-none focus:ring-2 focus:ring-brand-sage/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0e1d1d] py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-sage focus:bg-white dark:focus:bg-[#0e1d1d] focus:outline-none focus:ring-2 focus:ring-brand-sage/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Sub-row: Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-brand-sage focus:ring-brand-sage"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="font-bold text-brand-dark dark:text-emerald-400 hover:text-brand-sage transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white py-3 px-4 text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
                )}
              </button>

              {/* Terms of Service notice */}
              <p className="text-[11px] text-center text-slate-400 leading-normal pt-1">
                By signing in you agree to AniMeal's terms of service, privacy policy, and cookie usage.
              </p>
            </form>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#132525] p-6 shadow-2xl border border-slate-200/60 dark:border-slate-800 transition-colors">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your account email to receive a password reset link.
            </p>
            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                required
                placeholder="ikaw@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0e1d1d] p-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20 transition-all"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a3333] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="rounded-xl bg-brand-sage px-4 py-2 text-xs font-bold text-white hover:bg-brand-sage/90 cursor-pointer disabled:opacity-50"
                >
                  {forgotSent ? 'Sending...' : 'Send link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
