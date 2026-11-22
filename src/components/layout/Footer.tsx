import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'
import { SiTiktok } from 'react-icons/si'

const explore = [
  { to: '/meal-tracker', label: 'Meal Tracker & RER' },
  { to: '/care-schedule', label: 'Care Schedule & Reminders' },
  { to: '/household', label: 'Shared Household' },
  { to: '/food-library', label: 'Food Library' },
  { to: '/food-scanner', label: 'AI Food Scanner' },
  { to: '/pet-wellness', label: 'Pet Wellness & Hydration' },
]

const more = [
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#nearby-vets', label: 'Find Nearby Vets' },
  { to: '/ask-mealie', label: 'Ask Mealie (AI Assistant)' },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-dark text-white">
      {/* Decorative Footer Watermark */}
      <img
        src="/images/footer-logo.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-4 w-64 select-none opacity-25 sm:w-80 lg:w-[380px] z-0"
      />

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto grid max-w-[1600px] gap-10 sm:gap-12 px-4 sm:px-8 lg:px-12 py-14 lg:py-16 sm:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1fr]">
        {/* Brand and Social Links */}
        <div>
          <Link to="/" className="group inline-flex items-center py-0.5">
            <img
              src="/images/logo-white.svg"
              alt="AniMeal"
              className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-white/80">
            Helping Filipino pet parents make smarter choices for their pets'
            nutrition, health, and happiness with localized veterinary data and smart AI guidance.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <SiTiktok size={17} />
            </a>

            <a
              href="mailto:hello@animeal.ph"
              aria-label="Email AniMeal"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-cream">
            Explore Tools
          </h3>

          <ul className="space-y-2.5 text-sm sm:text-base text-white/80">
            {explore.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="transition hover:text-white hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-cream">
            Resources
          </h3>

          <ul className="space-y-2.5 text-sm sm:text-base text-white/80">
            {more.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="transition hover:text-white hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="relative z-10 border-t border-white/15">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 py-5 text-sm text-white/70">
          <p>
            © {new Date().getFullYear()} AniMeal. All Rights Reserved.
          </p>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Use</span>
            <span>•</span>
            <span>Veterinary Disclaimer</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
