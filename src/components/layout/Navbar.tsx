import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  Calendar,
  Users,
  User as UserIcon,
  Settings as SettingsIcon,
  Moon,
  Sun,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import Button from '../ui/button'
import { Badge } from '../ui/badge'
import ProfileModal from '../profile/ProfileModal'
import SettingsModal from '../profile/SettingsModal'
import HelpCenterModal from '../profile/HelpCenterModal'

const exploreLinks = [
  { to: '/meal-tracker', label: 'Meal Tracker & RER', icon: '🍲', desc: 'Log meals & calories' },
  { to: '/care-schedule', label: 'Care Schedule & Reminders', icon: '📅', desc: 'Scheduling & task alerts' },
  { to: '/household', label: 'Shared Household', icon: '👨‍👩‍👧‍👦', desc: 'Collaborative pet care' },
  { to: '/food-library', label: 'Food Library', icon: '📖', desc: 'Compare local brands & prices' },
  { to: '/food-scanner', label: 'AI Food Scanner', icon: '📷', desc: 'OCR guaranteed analysis' },
  { to: '/pet-wellness', label: 'Pet Wellness & Hydration', icon: '💧', desc: 'Weight, water & reminders' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Profile Action Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  const { isLoggedIn, user, logout } = useAuth()
  const { activePet } = useApp()
  const { theme, toggleTheme } = useTheme()

  const closeAll = () => {
    setOpen(false)
    setMobileOpen(false)
    setProfileMenuOpen(false)
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-border/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closeAll()
          }
        }}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4">
          {/* Brand Logo */}
          <Link to="/" onClick={closeAll} className="shrink-0 flex items-center group py-0.5">
            <img
              src="/images/logo.svg"
              alt="AniMeal"
              className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden items-center gap-6 xl:gap-8 text-sm xl:text-base font-semibold text-brand-dark dark:text-white lg:flex">
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

            {/* Care Schedule Direct Link */}
            <li>
              <NavLink
                to="/care-schedule"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-colors hover:text-brand-sage ${
                    isActive ? 'text-brand-sage font-bold' : ''
                  }`
                }
              >
                <Calendar className="size-4 text-brand-sage" />
                <span>Care Schedule</span>
              </NavLink>
            </li>

            {/* Household Direct Link */}
            <li>
              <NavLink
                to="/household"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-colors hover:text-brand-sage ${
                    isActive ? 'text-brand-sage font-bold' : ''
                  }`
                }
              >
                <Users className="size-4 text-brand-sage" />
                <span>Household</span>
              </NavLink>
            </li>

            {/* Explore Tools Dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button
                id="explore-trigger"
                className="flex items-center gap-1.5 transition-colors hover:text-brand-sage focus:outline-none cursor-pointer"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                <span>Explore Tools</span>
                <ChevronDown className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div
                  id="explore-panel"
                  className="absolute left-1/2 top-full z-50 mt-2 w-84 -translate-x-1/2 rounded-2xl border border-border/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl ring-1 ring-black/5 animate-scale-in"
                >
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark/50 dark:text-slate-400">
                    Care & Nutrition Modules
                  </div>
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeAll}
                      className="flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-colors hover:bg-brand-cream/60 dark:hover:bg-slate-800"
                    >
                      <span className="text-2xl shrink-0">{link.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-brand-dark dark:text-white">{link.label}</p>
                        <p className="text-xs text-brand-dark/65 dark:text-slate-400">{link.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
          <div className="hidden items-center gap-3 lg:flex">
            {/* Active Pet Pill */}
            {activePet && (
              <Link
                to="/meal-tracker"
                className="flex items-center gap-2 rounded-full border border-border/80 dark:border-slate-700 bg-brand-cream/60 dark:bg-slate-800 px-3.5 py-1.5 text-sm font-medium text-brand-dark dark:text-white shadow-2xs transition hover:bg-white dark:hover:bg-slate-700 hover:border-brand-sage/40"
                title={`Active Pet: ${activePet.name}`}
              >
                <span className="text-base">{activePet.avatarEmoji}</span>
                <span className="max-w-[120px] truncate font-bold">{activePet.name}</span>
                <span className="shrink-0 text-xs text-brand-dark/60 dark:text-slate-400">({activePet.weight} kg)</span>
              </Link>
            )}

            {isLoggedIn ? (
              /* ── User Profile Circle Nav ── */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="group relative flex size-10 items-center justify-center rounded-full ring-2 ring-brand-sage/40 hover:ring-brand-sage transition transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
                  title="Profile Menu & Settings"
                  aria-expanded={profileMenuOpen}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'User'}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-full rounded-full bg-brand-sage text-white font-bold text-sm flex items-center justify-center">
                      {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </button>

                {/* Profile Nav Dropdown Menu */}
                {profileMenuOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2.5 w-64 rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl ring-1 ring-black/5 animate-scale-in"
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    {/* Header info */}
                    <div className="px-3.5 py-2.5 border-b border-stone-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-brand-dark dark:text-white truncate">
                        {user?.fullName || 'Pinoy Pet Parent'}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400 truncate">
                        {user?.email || 'user@animeal.ph'}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1 space-y-0.5">
                      {/* 1. My Profile */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setIsProfileModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-slate-200 hover:bg-brand-cream/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <UserIcon className="size-4 text-brand-sage" />
                        <span>My Profile</span>
                      </button>

                      {/* 2. Settings */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setIsSettingsModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-slate-200 hover:bg-brand-cream/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <SettingsIcon className="size-4 text-brand-sage" />
                        <span>Settings</span>
                      </button>

                      {/* 3. Dark mode / Light mode */}
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-slate-200 hover:bg-brand-cream/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {theme === 'dark' ? (
                            <Sun className="size-4 text-amber-400" />
                          ) : (
                            <Moon className="size-4 text-indigo-500" />
                          )}
                          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
                          {theme === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      </button>

                      {/* 4. Help center */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setIsHelpModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-slate-200 hover:bg-brand-cream/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <HelpCircle className="size-4 text-brand-sage" />
                        <span>Help Center</span>
                      </button>
                    </div>

                    {/* 5. Logout */}
                    <div className="pt-1 border-t border-stone-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button to="/login" variant="ghost" size="sm" className="font-bold text-brand-dark text-sm sm:text-base px-3.5 py-2">
                  Sign In
                </Button>
                <Button to="/login" size="sm" className="font-bold shadow-xs text-sm sm:text-base px-4 py-2">
                  <span>Get Started</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <button
            id="mobile-menu-trigger"
            className="flex size-11 items-center justify-center rounded-xl border border-border/80 text-brand-dark dark:text-white lg:hidden hover:bg-brand-cream/50 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </nav>

        {/* Mobile menu dropdown drawer */}
        {mobileOpen && (
          <div className="border-t border-border/60 bg-white/95 dark:bg-slate-900/95 px-6 pb-8 pt-4 backdrop-blur-md lg:hidden animate-slide-up">
            {activePet && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-cream dark:bg-slate-800 p-3.5 text-sm">
                <div className="flex items-center gap-2 font-bold text-brand-dark dark:text-white">
                  <span className="text-xl">{activePet.avatarEmoji}</span>
                  <span>{activePet.name} ({activePet.breed})</span>
                </div>
                <Link to="/meal-tracker" onClick={closeAll} className="font-bold text-brand-sage hover:underline">
                  View Tracker →
                </Link>
              </div>
            )}

            <ul className="space-y-1.5 font-semibold text-brand-dark dark:text-white text-base">
              <li>
                <Link to="/" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-brand-cream/60 dark:hover:bg-slate-800">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/care-schedule" onClick={closeAll} className="flex items-center gap-2 rounded-lg px-3.5 py-3 hover:bg-brand-cream/60 dark:hover:bg-slate-800">
                  <Calendar className="size-5 text-brand-sage" />
                  <span>Care Schedule & Reminders</span>
                </Link>
              </li>

              <li>
                <Link to="/household" onClick={closeAll} className="flex items-center gap-2 rounded-lg px-3.5 py-3 hover:bg-brand-cream/60 dark:hover:bg-slate-800">
                  <Users className="size-5 text-brand-sage" />
                  <span>Shared Household</span>
                </Link>
              </li>

              <li className="pt-2">
                <p className="px-3.5 text-xs font-bold uppercase tracking-wider text-brand-dark/50 dark:text-slate-400">
                  Explore Tools
                </p>
                <div className="mt-1 space-y-1">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeAll}
                      className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm hover:bg-brand-cream/60 dark:hover:bg-slate-800"
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium text-brand-dark dark:text-white">{link.label}</span>
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
                <Link to="/#nearby-vets" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-brand-cream/60 dark:hover:bg-slate-800">
                  Find Vets
                </Link>
              </li>
            </ul>

            {/* Mobile Profile / Settings Links */}
            {isLoggedIn ? (
              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    closeAll()
                    setIsProfileModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-brand-dark dark:text-white hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  <UserIcon className="size-4 text-brand-sage" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeAll()
                    setIsSettingsModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-brand-dark dark:text-white hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  <SettingsIcon className="size-4 text-brand-sage" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-brand-dark dark:text-white hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-500" />}
                    <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeAll()
                    setIsHelpModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-brand-dark dark:text-white hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  <HelpCircle className="size-4 text-brand-sage" />
                  <span>Help Center</span>
                </button>

                <button
                  onClick={() => { logout(); closeAll() }}
                  className="w-full mt-2 rounded-xl border border-red-200 dark:border-red-900 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-border flex gap-3">
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
              </div>
            )}
          </div>
        )}
      </header>

      {/* Profile Modals */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <HelpCenterModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </>
  )
}
