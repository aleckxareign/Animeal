import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, Sparkles, LogOut, Heart, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Button from '../ui/button'
import { Badge } from '../ui/badge'

const exploreLinks = [
  { to: '/meal-tracker', label: 'Meal Tracker & RER', icon: '🍲', desc: 'Log meals & calories' },
  { to: '/food-library', label: 'Food Library', icon: '📖', desc: 'Compare local brands & prices' },
  { to: '/food-scanner', label: 'AI Food Scanner', icon: '📷', desc: 'OCR guaranteed analysis' },
  { to: '/pet-wellness', label: 'Pet Wellness & Hydration', icon: '💧', desc: 'Weight, water & reminders' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const { activePet } = useApp()
  const location = useLocation()

  const closeAll = () => {
    setOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur-md transition-all">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12 py-4">
        {/* Original Logo (Full unclipped with paw + AniMeal) */}
        <Link to="/" onClick={closeAll} className="shrink-0 flex items-center group py-0.5">
          <img
            src="/images/logo.svg"
            alt="AniMeal"
            className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-8 text-base font-semibold text-brand-dark lg:flex">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors hover:text-brand-sage ${
                  isActive ? 'text-brand-sage font-bold' : ''
                }`
              }
            >
              Home
            </NavLink>
          </li>

          {/* Explore Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              className="flex items-center gap-1.5 transition-colors hover:text-brand-sage focus:outline-none"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <span>Explore Tools</span>
              <ChevronDown className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute left-1/2 top-full z-50 mt-2 w-84 -translate-x-1/2 rounded-2xl border border-border/70 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-scale-in">
                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark/50">
                  Care Modules
                </div>
                {exploreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className="flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-colors hover:bg-brand-cream/60"
                  >
                    <span className="text-2xl shrink-0">{link.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-brand-dark">{link.label}</p>
                      <p className="text-xs text-brand-dark/65">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li>
            <Link to="/#how-it-works" className="transition-colors hover:text-brand-sage">
              How It Works
            </Link>
          </li>

          <li>
            <Link to="/#nearby-vets" className="transition-colors hover:text-brand-sage">
              Find Vets
            </Link>
          </li>

          <li>
            <NavLink
              to="/ask-mealie"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full bg-brand-sage/10 px-4 py-1.5 text-sm font-bold text-brand-sage transition hover:bg-brand-sage/20 ${
                  isActive ? 'ring-2 ring-brand-sage/40' : ''
                }`
              }
            >
              <span>🐾 Ask Mealie</span>
              <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] bg-brand-sage text-white font-bold">
                AI
              </Badge>
            </NavLink>
          </li>
        </ul>

        {/* Right Action Area */}
        <div className="hidden items-center gap-3 sm:flex">
          {/* Active Pet Pill if exists */}
          {activePet && (
            <Link
              to="/meal-tracker"
              className="flex items-center gap-2 rounded-full border border-border/80 bg-brand-cream/50 px-3.5 py-1.5 text-sm font-medium text-brand-dark shadow-2xs transition hover:bg-white"
            >
              <span className="text-base">{activePet.avatarEmoji}</span>
              <span className="font-bold">{activePet.name}</span>
              <span className="text-xs text-brand-dark/60">({activePet.weight} kg)</span>
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-brand-dark transition hover:bg-brand-alert/10 hover:text-brand-alert hover:border-brand-alert/30"
            >
              <LogOut className="size-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button to="/login" variant="ghost" size="sm" className="font-bold text-brand-dark text-sm sm:text-base px-4 py-2">
                Sign In
              </Button>
              <Button to="/login" size="sm" className="font-bold shadow-xs text-sm sm:text-base px-5 py-2">
                <span>Get Started</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <button
          className="flex size-10 items-center justify-center rounded-xl border border-border/80 text-brand-dark lg:hidden hover:bg-brand-cream/50"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile menu dropdown drawer */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-white/95 px-6 pb-8 pt-4 backdrop-blur-md lg:hidden animate-slide-up">
          {activePet && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-cream p-3.5 text-sm">
              <div className="flex items-center gap-2 font-bold text-brand-dark">
                <span className="text-xl">{activePet.avatarEmoji}</span>
                <span>{activePet.name} ({activePet.breed})</span>
              </div>
              <Link to="/meal-tracker" onClick={closeAll} className="font-bold text-brand-sage hover:underline">
                View Tracker →
              </Link>
            </div>
          )}

          <ul className="space-y-1.5 font-semibold text-brand-dark text-base">
            <li>
              <Link to="/" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-brand-cream/60">
                Home
              </Link>
            </li>
            <li className="pt-2">
              <p className="px-3.5 text-xs font-bold uppercase tracking-wider text-brand-dark/50">
                Explore Tools
              </p>
              <div className="mt-1 space-y-1">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm hover:bg-brand-cream/60"
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-medium text-brand-dark">{link.label}</span>
                  </Link>
                ))}
              </div>
            </li>
            <li className="pt-2">
              <Link to="/ask-mealie" onClick={closeAll} className="flex items-center justify-between rounded-xl bg-brand-sage/10 px-4 py-3 hover:bg-brand-sage/20 text-brand-sage font-bold">
                <span>🐾 Ask Mealie (AI Assistant)</span>
                <Badge variant="secondary" className="text-xs bg-brand-sage text-white font-bold">AI</Badge>
              </Link>
            </li>
            <li>
              <Link to="/#how-it-works" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-brand-cream/60">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/#nearby-vets" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-brand-cream/60">
                Find Vets
              </Link>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-border flex gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); closeAll() }}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-brand-dark hover:bg-brand-cream"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeAll}
                  className="flex-1 rounded-xl border border-border/80 bg-white py-3 text-center text-sm font-bold text-brand-dark"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  onClick={closeAll}
                  className="flex-1 rounded-xl bg-brand-sage py-3 text-center text-sm font-bold text-white shadow-xs"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
