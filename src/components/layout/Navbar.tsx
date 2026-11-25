import { useState, useRef, useEffect } from 'react'
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
  Compass,
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

  // Explore Tools 3-second grace period timer & outside click detection
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exploreDropdownRef = useRef<HTMLLIElement | null>(null)

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleExploreMouseEnter = () => {
    clearCloseTimeout()
    setOpen(true)
  }

  const handleExploreMouseLeave = () => {
    clearCloseTimeout()
    // Keep dropdown open for 0.25 seconds after mo use leaves before closing
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 250)
  }

  const handleExploreToggle = () => {
    clearCloseTimeout()
    setOpen((prev) => !prev)
  }

  // Profile Action Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  const { isLoggedIn, user, logout } = useAuth()
  const { activePet } = useApp()
  const { theme, toggleTheme } = useTheme()

  const closeAll = () => {
    clearCloseTimeout()
    setOpen(false)
    setMobileOpen(false)
    setProfileMenuOpen(false)
  }

  // Close Explore Tools if user clicks anywhere outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(e.target as Node)) {
        clearCloseTimeout()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      clearCloseTimeout()
    }
  }, [])

  return (
    <>
      <header
        className="sticky top-0 z-40 shrink-0 border-b border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md transition-all"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closeAll()
          }
        }}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4">
          {/* Brand Logo */}
          <Link to="/" onClick={closeAll} className="shrink-0 flex items-center group py-0.5">
            <img
              src={theme === 'dark' ? '/images/logo-white.svg' : '/images/logo.svg'}
              alt="Animeal"
              className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden shrink-0 whitespace-nowrap items-center gap-4 2xl:gap-8 text-sm xl:text-base font-semibold text-foreground dark:text-white xl:flex">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition-colors hover:text-brand-accent ${isActive ? 'text-brand-accent font-bold' : ''
                  }`
                }
              >
                Home
              </NavLink>
            </li>

            {/* Care Schedule Direct Link */}
            <li id="tour-care-schedule">
              <NavLink
                to="/care-schedule"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-colors hover:text-brand-accent ${isActive ? 'text-brand-accent font-bold' : ''
                  }`
                }
              >
                <Calendar className="size-4 text-brand-accent" />
                <span>Care Schedule</span>
              </NavLink>
            </li>

            {/* Household Direct Link */}
            <li id="tour-household">
              <NavLink
                to="/household"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-colors hover:text-brand-accent ${isActive ? 'text-brand-accent font-bold' : ''
                  }`
                }
              >
                <Users className="size-4 text-brand-accent" />
                <span>Household</span>
              </NavLink>
            </li>

            {/* Explore Tools Dropdown with 3-second grace timer & hover bridge */}
            <li
              id="tour-explore-tools"
              ref={exploreDropdownRef}
              className="relative py-1"
              onMouseEnter={handleExploreMouseEnter}
              onMouseLeave={handleExploreMouseLeave}
            >
              <button
                id="explore-trigger"
                className="flex items-center gap-1.5 transition-colors hover:text-brand-accent focus:outline-none cursor-pointer py-1 px-1 rounded-md"
                onClick={handleExploreToggle}
                aria-expanded={open}
                aria-haspopup="true"
              >
                <span>Explore Tools</span>
                <ChevronDown className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div
                  id="explore-panel"
                  className="absolute left-1/2 top-full z-50 mt-2 w-84 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto -translate-x-1/2 rounded-2xl border border-border/70 dark:border-border bg-card dark:bg-card p-3 shadow-xl ring-1 ring-black/5 animate-scale-in before:absolute before:-top-3 before:inset-x-0 before:h-3 before:content-['']"
                  onMouseEnter={handleExploreMouseEnter}
                  onMouseLeave={handleExploreMouseLeave}
                >
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground/50 dark:text-muted-foreground">
                    Care & Nutrition Modules
                  </div>
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeAll}
                      className="flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-colors hover:bg-background/60 dark:hover:bg-slate-800"
                    >
                      <span className="text-2xl shrink-0">{link.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground dark:text-white">{link.label}</p>
                        <p className="text-xs text-foreground/65 dark:text-muted-foreground">{link.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            <li>
              <Link to="/#nearby-vets" className="transition-colors hover:text-brand-accent">
                Find Vets
              </Link>
            </li>

            <li id="tour-ask-mealie">
              <NavLink
                to="/ask-mealie"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full bg-brand-sage/10 px-4 py-1.5 text-sm font-bold text-brand-accent transition hover:bg-brand-sage/20 ${isActive ? 'ring-2 ring-brand-sage/40' : ''
                  }`
                }
              >
                <img src="/images/logo-only.svg" alt="" className="size-6 shrink-0 rounded-full bg-brand-cream p-0.5 object-contain" />
                <span>Ask Mealie</span>
                <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] bg-brand-sage text-white font-bold">
                  AI
                </Badge>
              </NavLink>
            </li>
          </ul>

          {/* Right Action Area */}
          <div className="hidden items-center gap-3 shrink-0 xl:flex">
            {/* Active Pet Pill */}
            {activePet && (
              <Link
                to="/meal-tracker"
                className="flex items-center gap-2 rounded-full border border-border/80 dark:border-border bg-background/60 dark:bg-card px-3.5 py-1.5 text-sm font-medium text-foreground dark:text-white shadow-2xs transition hover:bg-card dark:hover:bg-slate-700 hover:border-brand-sage/40"
                title={`Active Pet: ${activePet.name}`}
              >
                <span className="text-base">{activePet.avatarEmoji}</span>
                <span className="max-w-[120px] truncate font-bold">{activePet.name}</span>
                <span className="shrink-0 text-xs text-foreground/60 dark:text-muted-foreground">({activePet.weight} kg)</span>
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
                    className="absolute right-0 top-full z-50 mt-2.5 w-64 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-border/90 dark:border-border bg-card dark:bg-card p-2 shadow-2xl ring-1 ring-black/5 animate-scale-in"
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    {/* Header info */}
                    <div className="px-3.5 py-2.5 border-b border-border dark:border-border">
                      <p className="text-xs font-bold text-foreground dark:text-white truncate">
                        {user?.fullName || 'Pinoy Pet Parent'}
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-muted-foreground truncate">
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground dark:text-slate-200 hover:bg-background/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <UserIcon className="size-4 text-brand-accent" />
                        <span>My Profile</span>
                      </button>

                      {/* 2. Settings */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setIsSettingsModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground dark:text-slate-200 hover:bg-background/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <SettingsIcon className="size-4 text-brand-accent" />
                        <span>Settings</span>
                      </button>

                      {/* 3. Dark mode / Light mode */}
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground dark:text-slate-200 hover:bg-background/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {theme === 'dark' ? (
                            <Sun className="size-4 text-amber-400" />
                          ) : (
                            <Moon className="size-4 text-indigo-500" />
                          )}
                          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                          {theme === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      </button>

                      {/* 4. Help center */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setIsHelpModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground dark:text-slate-200 hover:bg-background/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <HelpCircle className="size-4 text-brand-accent" />
                        <span>Help Center</span>
                      </button>

                      {/* 5. App Tour & Guide */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          window.dispatchEvent(new CustomEvent('open-animeal-tour'))
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground dark:text-slate-200 hover:bg-background/60 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <Compass className="size-4 text-brand-accent" />
                        <span>App Tour &amp; Guide</span>
                      </button>
                    </div>

                    {/* 6. Logout */}
                    <div className="pt-1 border-t border-border dark:border-border">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-300 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left cursor-pointer"
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
                <Button to="/login" variant="ghost" size="sm" className="font-bold text-foreground text-sm sm:text-base px-3.5 py-2">
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
            className="flex size-11 items-center justify-center rounded-xl border border-border/80 text-foreground dark:text-white xl:hidden hover:bg-background/50 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </nav>

        {/* Mobile menu dropdown drawer */}
        {mobileOpen && (
          <div className="border-t border-border/60 bg-card/95 dark:bg-card/95 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain px-6 pb-8 pt-4 backdrop-blur-md xl:hidden animate-slide-up">
            {activePet && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background dark:bg-card p-3.5 text-sm">
                <div className="flex items-center gap-2 font-bold text-foreground dark:text-white">
                  <span className="text-xl">{activePet.avatarEmoji}</span>
                  <span>{activePet.name} ({activePet.breed})</span>
                </div>
                <Link to="/meal-tracker" onClick={closeAll} className="font-bold text-brand-accent hover:underline">
                  View Tracker →
                </Link>
              </div>
            )}

            <ul className="space-y-1.5 font-semibold text-foreground dark:text-white text-base">
              <li>
                <Link to="/" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-background/60 dark:hover:bg-slate-800">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/care-schedule" onClick={closeAll} className="flex items-center gap-2 rounded-lg px-3.5 py-3 hover:bg-background/60 dark:hover:bg-slate-800">
                  <Calendar className="size-5 text-brand-accent" />
                  <span>Care Schedule & Reminders</span>
                </Link>
              </li>

              <li>
                <Link to="/household" onClick={closeAll} className="flex items-center gap-2 rounded-lg px-3.5 py-3 hover:bg-background/60 dark:hover:bg-slate-800">
                  <Users className="size-5 text-brand-accent" />
                  <span>Shared Household</span>
                </Link>
              </li>

              <li className="pt-2">
                <p className="px-3.5 text-xs font-bold uppercase tracking-wider text-foreground/50 dark:text-muted-foreground">
                  Explore Tools
                </p>
                <div className="mt-1 space-y-1">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeAll}
                      className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm hover:bg-background/60 dark:hover:bg-slate-800"
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium text-foreground dark:text-white">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </li>

              <li className="pt-2">
                <Link to="/ask-mealie" onClick={closeAll} className="flex items-center justify-between rounded-xl bg-brand-sage/10 px-4 py-3 hover:bg-brand-sage/20 text-brand-accent font-bold">
                  <span className="flex min-w-0 items-center gap-2"><img src="/images/logo-only.svg" alt="" className="size-6 shrink-0 rounded-full bg-brand-cream p-0.5 object-contain" />Ask Mealie (AI Assistant)</span>
                  <Badge variant="secondary" className="text-xs bg-brand-sage text-white font-bold">AI</Badge>
                </Link>
              </li>

              <li>
                <Link to="/#nearby-vets" onClick={closeAll} className="block rounded-lg px-3.5 py-3 hover:bg-background/60 dark:hover:bg-slate-800">
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
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-foreground dark:text-white hover:bg-muted dark:hover:bg-slate-800"
                >
                  <UserIcon className="size-4 text-brand-accent" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeAll()
                    setIsSettingsModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-foreground dark:text-white hover:bg-muted dark:hover:bg-slate-800"
                >
                  <SettingsIcon className="size-4 text-brand-accent" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-foreground dark:text-white hover:bg-muted dark:hover:bg-slate-800"
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
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-foreground dark:text-white hover:bg-muted dark:hover:bg-slate-800"
                >
                  <HelpCircle className="size-4 text-brand-accent" />
                  <span>Help Center</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeAll()
                    window.dispatchEvent(new CustomEvent('open-animeal-tour'))
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-bold text-foreground dark:text-white hover:bg-muted dark:hover:bg-slate-800"
                >
                  <Compass className="size-4 text-brand-accent" />
                  <span>App Tour &amp; Guide</span>
                </button>

                <button
                  onClick={() => { logout(); closeAll() }}
                  className="w-full mt-2 rounded-xl border border-red-200 dark:border-red-400/30 dark:border-red-900 py-3 text-sm font-bold text-red-600 dark:text-red-300 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-border flex gap-3">
                <Link
                  to="/login"
                  onClick={closeAll}
                  className="flex-1 rounded-xl border border-border/80 bg-card py-3 text-center text-sm font-bold text-foreground"
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
