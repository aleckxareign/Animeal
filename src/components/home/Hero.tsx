import { CheckCircle2, Play, Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react'
import Button from '../ui/button'
import { Badge } from '../ui/badge'

const perks = [
  'Personalized RER calorie targets',
  'Philippine pet food price & macro comparisons',
  'AI label scanner with AAFCO verdicts',
  'Daily hydration & weight tracking',
]

export default function Hero() {
  return (
    <section className="relative overflow-x-clip bg-gradient-to-b from-brand-cream via-brand-cream/80 to-brand-cream/40 flex flex-col justify-center py-10 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 grid items-center gap-10 lg:gap-12 lg:grid-cols-12 flex-1">
        
        {/* Left Column (Hero Content) */}
        <div className="min-w-0 lg:col-span-6 z-10">
          <Badge
            variant="outline"
            className="mb-4 inline-flex items-center gap-2.5 rounded-full border-brand-sage/30 bg-brand-sage/10 px-4.5 py-2 text-xs sm:text-sm font-semibold text-brand-sage shadow-2xs"
          >
            <Sparkles className="size-4 text-brand-sage" />
            AI-Powered Pet Nutrition & Care Platform
          </Badge>

          <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.08] font-extrabold text-brand-dark tracking-tight">
            <span className="block text-brand-sage/70">Better meals.</span>
            <span className="block text-brand-dark">Happier Tails.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-brand-dark/80 leading-relaxed sm:text-lg font-normal">
            Make everyday pet care effortless. Estimate scientific calorie budgets with Resting Energy Requirements (RER), compare local Filipino pet food prices, scan packaging labels, and chat with Mealie — all in one synchronized dashboard.
          </p>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button to="/meal-tracker" size="lg" className="rounded-xl px-6 font-semibold shadow-sm h-12 text-base">
              <span>Get Started Free</span>
              <ArrowRight className="size-5" />
            </Button>

            <Button to="/#how-it-works" variant="outline" size="lg" className="rounded-xl px-6 font-semibold h-12 text-base">
              <Play className="size-4.5 fill-current" />
              <span>How It Works</span>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-brand-dark/70 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-brand-sage" />
              <span>Zero setup fees • Offline ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-brand-alert fill-brand-alert" />
              <span>Dedicated to Pinoy pet parents</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="min-w-0 lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square flex items-center justify-center">
            
            {/* Organic Background Blob */}
            <div
              className="absolute inset-0 bg-brand-sage/70 shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
              style={{
                maskImage: "url('/images/hero-blob.svg')",
                maskSize: '100% 100%',
                maskRepeat: 'no-repeat',
                WebkitMaskImage: "url('/images/hero-blob.svg')",
                WebkitMaskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
              }}
            />

            {/* Mascot Image */}
            <img
              src="/images/hero.webp"
              alt="A happy cat and dog resting together"
              className="relative z-10 h-[86%] w-[94%] object-contain drop-shadow-md pointer-events-none"
              style={{
                maskImage: "url('/images/hero-photo-mask.svg')",
                maskSize: '100% 100%',
                maskRepeat: 'no-repeat',
                WebkitMaskImage: "url('/images/hero-photo-mask.svg')",
                WebkitMaskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
              }}
            />

            {/* Floating Perks Card (Shown floating only on xl+ screens where there is ample margin) */}
            <div className="hidden 2xl:block w-76 rounded-2xl border border-white/50 bg-white/95 p-5 shadow-2xl backdrop-blur-md absolute -right-30 -top-12 z-20 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-3.5 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-sage/15 text-brand-sage">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-brand-dark">
                    Complete Pet Care Hub
                  </p>
                  <p className="text-xs text-brand-dark/60">All-in-one nutrition suite</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-brand-dark/80">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-brand-sage mt-0.5" />
                    <span className="leading-snug font-medium">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Floating Live Metric Card (Shown floating only on xl+ screens) */}
            <div className="hidden 2xl:block w-80 rounded-2xl border border-white/50 bg-white/95 p-5 shadow-2xl backdrop-blur-md absolute -bottom-6 -left-4 z-20 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-base">
                    🐕
                  </span>
                  <div>
                    <p className="font-bold text-brand-dark leading-none">Bruno's Plate</p>
                    <p className="text-xs text-brand-dark/60 mt-0.5">Golden Retriever • 12 kg</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  Target Met
                </span>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-sm font-mono font-bold text-brand-dark">
                <span className="font-sans font-medium text-brand-dark/70 text-xs">Calories Today</span>
                <span>540 / 720 kcal</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-brand-dark/10 overflow-hidden">
                <div className="h-full rounded-full bg-brand-sage" style={{ width: '75%' }} />
              </div>
              <p className="mt-2.5 text-xs text-brand-dark/70 flex items-center justify-between">
                <span>Hydration: 450ml / 600ml</span>
                <span className="text-brand-sage font-bold">Healthy Range ✓</span>
              </p>
            </div>
          </div>

          {/* Mobile & Tablet Interactive Cards Showcase (< xl screens: cleanly stacked with zero collision) */}
          <div className="2xl:hidden w-full max-w-md sm:max-w-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 mt-6 z-10">
            {/* Live Metric Card */}
            <div className="rounded-2xl border border-border/70 bg-white/95 p-4.5 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-base">
                    🐕
                  </span>
                  <div>
                    <p className="font-bold text-brand-dark leading-none">Bruno's Plate</p>
                    <p className="text-[11px] text-brand-dark/60 mt-0.5">Golden Retriever • 12 kg</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  Target Met
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-brand-dark">
                <span className="font-sans font-medium text-brand-dark/70">Calories Today</span>
                <span>540 / 720 kcal</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-brand-dark/10 overflow-hidden">
                <div className="h-full rounded-full bg-brand-sage" style={{ width: '75%' }} />
              </div>
              <p className="mt-2 text-[11px] text-brand-dark/70 flex items-center justify-between">
                <span>Hydration: 450ml / 600ml</span>
                <span className="text-brand-sage font-bold">Healthy Range ✓</span>
              </p>
            </div>

            {/* Perks Overview Card */}
            <div className="rounded-2xl border border-border/70 bg-white/95 p-4.5 shadow-md backdrop-blur-md">
              <div className="mb-2.5 flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-sage/15 text-brand-sage">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold leading-tight text-brand-dark">
                    Complete Pet Care Hub
                  </p>
                  <p className="text-[10px] text-brand-dark/60">All-in-one nutrition suite</p>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-brand-dark/80">
                {perks.slice(0, 3).map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 shrink-0 text-brand-sage mt-0.5" />
                    <span className="leading-snug font-medium">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
