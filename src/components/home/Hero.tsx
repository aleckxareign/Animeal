import { Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react'
import Button from '../ui/button'
import { Badge } from '../ui/badge'

export default function Hero({ className = '' }: { className?: string }) {
  return (
    <section className={`bg-background py-8 sm:py-10 lg:py-12 landing-wide:pt-3 landing-wide:pb-6 flex-1 flex flex-col justify-center ${className}`}>
      <div className="mx-auto grid w-full max-w-[98.5rem] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 lg:px-10 landing-wide:gap-12">

        {/* Left Column (Hero Content) */}
        <div className="min-w-0 landing-wide:pt-6">
          <Badge
            variant="outline"
            className="mb-5 h-auto max-w-full gap-2.5 rounded-full border-brand-sage/30 bg-brand-sage/10 px-3 py-1 text-xs font-semibold whitespace-normal text-brand-accent sm:text-sm landing-wide:px-4 landing-wide:text-base landing-wide:leading-none"
          >
            <Sparkles aria-hidden="true" className="shrink-0" />
            AI-Powered Pet Nutrition & Care Platform
          </Badge>

          <h1 className="font-display text-[clamp(2.375rem,4vw,4.375rem)] leading-[1.08] font-extrabold tracking-[-0.02em] text-foreground">
            <span className="block text-brand-accent/85">Better meals.</span>
            <span className="block text-foreground">Happier Tails.</span>
          </h1>

          <p className="mt-5 max-w-[44rem] text-base leading-relaxed text-foreground/80 sm:text-lg landing-wide:mt-5 landing-wide:text-[1.3125rem] landing-wide:leading-[1.6]">
            Make everyday pet care effortless. Estimate scientific calorie budgets with Resting Energy Requirements (RER), compare local Filipino pet food prices, scan packaging labels, and chat with Mealie — all in one synchronized dashboard.
          </p>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center landing-wide:mt-6 landing-wide:gap-4">
            <Button to="/meal-tracker" size="lg" className="font-semibold landing-wide:h-13 landing-wide:gap-3 landing-wide:rounded-[1.25rem] landing-wide:px-6 landing-wide:text-lg">
              <span>Get Started Free</span>
              <ArrowRight className="size-5" />
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-foreground/75 landing-wide:mt-5 landing-wide:text-base">
            <div className="flex items-center gap-2 landing-wide:text-base">
              <ShieldCheck className="size-5 shrink-0 text-brand-accent" />
              <span>Zero setup fees • Offline ready</span>
            </div>
            <div className="flex items-center gap-2 landing-wide:text-base">
              <Heart className="size-5 shrink-0 text-destructive fill-brand-alert" />
              <span>Dedicated to Pinoy pet parents</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="relative mx-auto grid w-full min-w-0 max-w-2xl gap-4 sm:grid-cols-2 lg:max-w-none lg:grid-cols-1 xl:grid-cols-2 landing-wide:min-h-[clamp(34rem,33vw,40rem)] landing-wide:place-items-center">
          <div className="relative mx-auto flex aspect-[5/4] w-full max-w-lg items-center justify-center sm:col-span-2 lg:col-span-1 xl:col-span-2 landing-wide:aspect-square landing-wide:max-w-[35rem] landing-wide:translate-y-3">

            {/* Organic Background Blob */}
            <div
              className="absolute inset-0 bg-brand-sage/70"
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
              fetchPriority="high"
              className="relative h-[86%] w-[94%] object-cover landing-wide:object-contain"
              style={{
                maskImage: "url('/images/hero-photo-mask.svg')",
                maskSize: '100% 100%',
                maskRepeat: 'no-repeat',
                WebkitMaskImage: "url('/images/hero-photo-mask.svg')",
                WebkitMaskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Floating Live Metric Card (Floats on wide screens) */}
          <div className="min-w-0 rounded-2xl bg-card p-4 shadow-md landing-wide:absolute landing-wide:bottom-0 landing-wide:left-5 landing-wide:z-10 landing-wide:w-[23rem] landing-wide:rounded-[1.75rem] landing-wide:px-5 landing-wide:py-5 landing-wide:shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-sm landing-wide:text-base">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center landing-wide:size-10 justify-center rounded-full bg-amber-100 dark:bg-amber-500/15 text-base">
                  🐕
                </span>
                <div>
                  <p className="font-bold text-foreground leading-none">Bruno's Plate</p>
                  <p className="text-xs text-foreground/75 landing-wide:text-sm mt-0.5">Golden Retriever • 12 kg</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Target Met
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 font-mono text-sm font-bold text-foreground landing-wide:mt-5 landing-wide:text-base">
              <span className="font-sans text-xs font-medium text-foreground/75 landing-wide:text-sm">Calories Today</span>
              <span>540 / 720 kcal</span>
            </div>
            <div className="mt-2 h-2.5 landing-wide:h-3 w-full rounded-full bg-brand-dark/10 overflow-hidden">
              <div className="h-full rounded-full bg-brand-sage" style={{ width: '75%' }} />
            </div>
            <p className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2 text-xs text-foreground/75 landing-wide:text-sm">
              <span>Hydration: 450ml / 600ml</span>
              <span className="text-brand-accent font-bold">Healthy Range ✓</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
