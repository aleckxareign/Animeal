import { Link } from 'react-router-dom'

const explore = [
  { to: '/meal-tracker', label: 'Meal Tracker' },
  { to: '/food-library', label: 'Food Library' },
  { to: '/food-scanner', label: 'Food Scanner' },
  { to: '/pet-wellness', label: 'Pet Wellness' },
]

const more = [
  { to: '/#how-it-works', label: 'How it Works' },
  { to: '/ask-mealie', label: 'Ask Mealie' },
  { to: '/', label: 'Contact Us' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <img src="/images/logo-white.png" alt="Animeal" className="h-12" />
          <p className="mt-3 max-w-xs text-sm text-white/80">
            Helping Filipino pet parents make smarter choices for their pets' nutrition, health,
            and happiness.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {explore.map((l) => (
              <li key={l.label}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">More</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {more.map((l) => (
              <li key={l.label}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs text-white/80">
          <p>© {new Date().getFullYear()} Animeal. All Rights Reserved</p>
          <p>Privacy Policy · Terms of Use · Veterinary Disclaimer</p>
        </div>
      </div>
    </footer>
  )
}