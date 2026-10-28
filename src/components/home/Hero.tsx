import { CheckCircle2, Play } from 'lucide-react'
import Button from '../ui/Button'

const perks = ['Personalized nutrition', 'Food comparisons', 'Wellness tracking']

export default function Hero() {
  return (
    <section className="bg-brand-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-dark/70">
            Pet nutrition, made simpler
          </p>
          <h1 className="font-display text-5xl font-semibold leading-tight md:text-6xl">
            <span className="block text-brand-sage">Better meals.</span>
            <span className="block text-brand-dark">Happier Tails.</span>
          </h1>
          <p className="mt-5 max-w-md text-gray-700">
            Make everyday pet nutrition feel less complicated. Track meals, understand food
            labels, monitor your pet's wellness, and get helpful AI-powered guidance, all in one
            friendly place.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/meal-tracker">Get Started Free</Button>
            <Button to="/#how-it-works" variant="outline">
              <Play size={14} className="mr-2" fill="currentColor" />
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="flex h-80 items-center justify-center rounded-[60%_40%_55%_45%/50%_55%_45%_50%] bg-brand-sage text-white md:h-[26rem]">
            Hero photo goes here
          </div>

          <div className="absolute right-0 top-0 w-60 rounded-2xl bg-white p-4 shadow-lg">
            <p className="mb-3 text-sm font-bold text-brand-dark">Everything your pet needs</p>
            <ul className="space-y-2 text-xs text-gray-700">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-brand-sage" />
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