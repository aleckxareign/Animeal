
import { CheckCircle2, Play, Sparkles } from 'lucide-react'
import Button from '../ui/Button'

const perks = [
  'Personalized nutrition',
  'Food comparisons',
  'Wellness tracking',
]

export default function Hero() {
  return (
    <section className="bg-brand-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 py-8 md:grid-cols-2 md:py-10">

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-dark/70">
            Pet nutrition, made simpler
          </p>

          <h1 className="font-display text-5xl leading-tight md:text-6xl">
            <span className="block text-brand-sage">Better meals.</span>
            <span className="block text-brand-dark">Happier Tails.</span>
          </h1>

          <p className="mt-5 max-w-md text-gray-700">
            Make everyday pet nutrition feel less complicated. Track meals, understand food
            labels, monitor your pet's wellness, and get helpful AI-powered guidance, all in one
            friendly place.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/meal-tracker">
              <span className="text-white">Get Started Free</span>
            </Button>

            <Button to="/#how-it-works" variant="outline">
              <Play size={14} className="mr-2" fill="currentColor" />
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="relative aspect-square w-full">
          {/* Enlarged green blob */}
          <div
            className="absolute inset-0 bg-brand-sage"
            style={{
              maskImage: "url('/images/hero-blob.svg')",
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: "url('/images/hero-blob.svg')",
              WebkitMaskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              transform: 'scale(1.20)',
            }}
          />

          <img
            src="/images/hero.webp"
            alt="A cat and a dog resting together"
            className="absolute left-[2%] top-[8%] h-[81%] w-[94%] object-contain"
            style={{
              maskImage: "url('/images/hero-photo-mask.svg')",
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: "url('/images/hero-photo-mask.svg')",
              WebkitMaskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              transform: 'scale(1.12)',
            }}
          />

          {/* Floating perks card */}
          <div className="absolute right-0 top-0 z-10 w-60 rounded-2xl bg-white p-4 shadow-lg">
            {/* Circular icon and heading */}
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage/30">
                <Sparkles size={20} className="text-brand-dark" />
              </div>

              <p className="text-sm font-bold leading-snug text-brand-dark">
                Everything your pet needs
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-2 text-xs text-gray-700">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-brand-sage"
                  />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}
