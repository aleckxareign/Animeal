import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { isLoggedIn, login } = useAuth()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from ?? '/meal-tracker'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isLoggedIn) return <Navigate to={from} replace />

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login()
  }

  return (
    <section className="bg-brand-cream">
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="font-display text-3xl text-brand-dark">Welcome back</h1>
          <p className="mt-2 text-gray-600">
            Log in to use Meal Tracker, Food Library, Food Scanner, Pet Wellness,
            and Ask Mealie.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-dark"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-dark"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-dark px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}