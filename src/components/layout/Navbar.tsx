
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const exploreLinks = [
  { to: '/meal-tracker', label: 'Meal Tracker' },
  { to: '/food-library', label: 'Food Library' },
  { to: '/food-scanner', label: 'Food Scanner' },
  { to: '/pet-wellness', label: 'Pet Wellness' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/">
          <img src="/images/logo.png" alt="Animeal" className="h-12" />
        </Link>

        <ul className="hidden items-center gap-8 font-semibold text-brand-dark md:flex">
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
            <button className="flex items-center gap-1 hover:text-brand-sage">
              Explore <ChevronDown size={16} />
            </button>

            {open && (
              <ul className="absolute left-0 top-full z-10 w-48 rounded-xl bg-white p-2 shadow-lg">
                {exploreLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
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
                className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
