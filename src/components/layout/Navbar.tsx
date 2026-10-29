import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'

const exploreLinks = [
  { to: '/meal-tracker', label: 'Meal Tracker' },
  { to: '/food-library', label: 'Food Library' },
  { to: '/food-scanner', label: 'Food Scanner' },
  { to: '/pet-wellness', label: 'Pet Wellness' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false) // desktop Explore dropdown
  const [mobileOpen, setMobileOpen] = useState(false) // mobile menu
  const { isLoggedIn, logout } = useAuth()

  const closeAll = () => {
    setOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" onClick={closeAll} className="shrink-0">
          <img
            src="/images/logo.svg"
            alt="Animeal"
            className="h-10 sm:h-12 w-auto scale-450 origin-left translate-y-2"
          />
        </Link>

        <ul className="hidden translate-x-58 items-center gap-8 font-semibold text-brand-dark md:flex">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `pb-1 ${isActive ? 'border-b-2 border-brand-sage' : 'hover:text-brand-sage'}`
              }
            >
              Home
            </NavLink>
          </li>

          <li
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              className="flex items-center gap-1 hover:text-brand-sage"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              Explore <ChevronDown size={16} />
            </button>

            {open && (
              <ul className="absolute left-0 top-full z-10 w-48 rounded-xl bg-white p-2 shadow-lg">
                {exploreLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={closeAll}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link to="/#how-it-works" className="hover:text-brand-sage">
              How It Works
            </Link>
          </li>

          <li>
            <NavLink to="/ask-mealie" className="hover:text-brand-sage">
              Ask Mealie
            </NavLink>
          </li>
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="rounded-lg border border-brand-dark px-4 py-2 text-sm font-medium text-brand-dark"
            >
              Log Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-brand-dark px-4 py-2 text-sm font-medium text-brand-dark"
              >
                Sign In
              </Link>

              <Link
                to="/login"
                className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold !text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* mobile menu button */}
        <button
          className="rounded-lg p-2 text-brand-dark md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-gray-100 px-6 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col font-semibold text-brand-dark">
            <li><Link to="/" onClick={closeAll} className="block py-3">Home</Link></li>
            <li className="py-1">
              <p className="py-2 text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                Explore
              </p>
              <ul className="ml-2 border-l-2 border-brand-sage/40 pl-4">
                {exploreLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} onClick={closeAll} className="block py-2 text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li><Link to="/#how-it-works" onClick={closeAll} className="block py-3">How It Works</Link></li>
            <li><Link to="/ask-mealie" onClick={closeAll} className="block py-3">Ask Mealie</Link></li>
          </ul>

          <div className="mt-4 flex gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); closeAll() }}
                className="flex-1 rounded-lg border border-brand-dark px-4 py-2.5 text-sm font-medium text-brand-dark"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={closeAll} className="flex-1 rounded-lg border border-brand-dark px-4 py-2.5 text-center text-sm font-medium text-brand-dark">
                  Sign In
                </Link>
                <Link to="/login" onClick={closeAll} className="flex-1 rounded-lg bg-brand-dark px-4 py-2.5 text-center text-sm font-semibold !text-white">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
