
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'
import { SiTiktok } from 'react-icons/si'

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
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 sm:px-8 lg:px-12 py-16 md:grid-cols-[2.5fr_1fr_1fr]">
        {/* Brand and social links */}
        <div>
          <Link to="/" className="inline-flex items-center group py-0.5">
            <img
              src="/images/logo-white.svg"
              alt="AniMeal"
              className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <p className="mt-4 max-w-md text-base text-white/80 leading-relaxed">
            Helping Filipino pet parents make smarter choices for their pets'
            nutrition, health, and happiness.
          </p>

          <div className="mt-6 flex items-center gap-3.5">
            <a
              href="#"
              aria-label="Facebook"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FaFacebookF size={20} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FaInstagram size={20} />
            </a>

            <a
              href="#"
              aria-label="TikTok"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <SiTiktok size={19} />
            </a>

            <a
              href="mailto:hello@animeal.com"
              aria-label="Email Animeal"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Explore links */}
        <div>
          <h3 className="mb-4 font-bold text-base sm:text-lg text-brand-cream uppercase tracking-wider">Explore</h3>
          <ul className="space-y-3 text-base text-white/80">
            {explore.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More links */}
        <div>
          <h3 className="mb-4 font-bold text-base sm:text-lg text-brand-cream uppercase tracking-wider">More</h3>
          <ul className="space-y-3 text-base text-white/80">
            {more.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 py-5 text-sm text-white/70">
          <p>© {new Date().getFullYear()} Animeal. All Rights Reserved</p>
          <p className="flex items-center gap-3">
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
