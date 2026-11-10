
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
    <footer className="relative overflow-hidden bg-brand-dark text-white">

      {/* Decorative Footer Watermark */}
      <img
        src="/images/footer-logo.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-2 w-64 select-none opacity-50 sm:w-80 lg:w-[375px]"
      />

      {/* Main Footer Content */}
      <div className="relative z-9 mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:px-10">

        {/* Brand and Social Links */}
        <div>
          <Link to="/" className="group inline-flex items-center py-0.5">
            <img
              src="/images/logo-white.svg"
              alt="AniMeal"
              className="h-14 w-auto transition-transform group-hover:scale-[1.02] sm:h-16"
            />
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
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

        {/* Explore Links */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-cream sm:text-sm">
            Explore
          </h3>

          <ul className="space-y-2 text-sm text-white/80">
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
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-cream sm:text-sm">
            More
          </h3>

          <ul className="space-y-2 text-sm text-white/80">
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

      {/* Copyright */}
      <div className="relative z-10 border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-white/70 sm:px-8 lg:px-10">
          <p>
            © {new Date().getFullYear()} Animeal. All Rights Reserved
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
