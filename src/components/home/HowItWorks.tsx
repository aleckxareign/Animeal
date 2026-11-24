import { CheckCircle2, Droplets } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import PhoneFrame from '../ui/PhoneFrame'

const steps = [
  {
    number: '01',
    title: 'Set up your pet',
    description: "Add your pet's details to get a personalized daily calorie target.",
    renderScreen: () => (
      <div className="flex h-full flex-col bg-background/40 p-3 text-left text-xs">
        <div className="rounded-xl bg-card p-3 text-center shadow-xs">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15 text-2xl">
            🐕
          </div>
          <p className="mt-1.5 font-bold text-foreground text-sm">Bruno</p>
          <p className="text-[11px] text-foreground/60">Golden Retriever • 12 kg</p>
        </div>

        <div className="mt-2.5 rounded-xl bg-brand-dark p-2.5 text-white">
          <p className="text-[9px] text-brand-cream/70 font-semibold uppercase tracking-wider">Daily RER Target</p>
          <p className="text-sm font-bold text-brand-cream font-mono mt-0.5">720 kcal/day</p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-card/20">
            <div className="h-1.5 w-2/3 rounded-full bg-brand-sage" />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
          <span>Kapon / Neutered</span>
          <span className="font-bold">✓ Yes</span>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Choose food and log a meal',
    description: 'Compare pet food or scan a label, then record what your pet ate.',
    renderScreen: () => (
      <div className="flex h-full flex-col bg-background/40 p-3 text-left text-xs">
        <div className="flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-[10px] text-foreground/60 shadow-xs border border-border/40">
          <span>🔍</span> Search food...
        </div>

        <div className="mt-2.5 rounded-xl bg-card p-2.5 shadow-xs border border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs">Pedigree Adult</span>
            <span className="rounded bg-brand-sage/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-accent">345 kcal</span>
          </div>
          <p className="text-[10px] text-foreground/60 mt-0.5">₱155 • 1.5 kg bag</p>
          <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-1.5 text-[10px]">
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">₱3.00 / 100 kcal</span>
            <span className="text-foreground/60">21% Prot</span>
          </div>
        </div>

        <div className="mt-2.5 rounded-xl bg-brand-sage p-2.5 text-center text-white shadow-xs">
          <p className="font-bold text-xs">+ Napakain ako</p>
          <p className="text-[10px] text-white/80">Quick log meal</p>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Stay on top of their care',
    description: 'Review feeding history, track hydration and weight, and share care reminders.',
    renderScreen: () => (
      <div className="flex h-full flex-col bg-background/40 p-3 text-left text-xs">
        <div className="flex items-center justify-between rounded-xl bg-card p-2.5 shadow-xs border border-border/40">
          <div className="flex items-center gap-2">
            <Droplets className="size-4 text-cyan-600 dark:text-cyan-300" />
            <span className="font-bold text-foreground text-xs">Water Intake</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-cyan-800 dark:text-cyan-300">450 / 600 ml</span>
        </div>

        <div className="mt-2.5 rounded-xl bg-card p-2.5 shadow-xs border border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs">Recent Feeding</span>
            <span className="text-[10px] text-foreground/50 font-mono">8:30 AM</span>
          </div>
          <p className="mt-1 text-[11px] text-brand-accent font-medium flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" /> Maria fed Bruno
          </p>
        </div>

        <div className="mt-2.5 rounded-xl border border-rose-200 dark:border-rose-400/30 bg-rose-50/90 dark:bg-rose-500/15 p-2 text-rose-800 dark:text-rose-300">
          <p className="font-bold text-[10px] uppercase tracking-wider">Next Reminder</p>
          <p className="text-xs font-semibold text-rose-900 dark:text-rose-300 mt-0.5">Deworming in 3 days</p>
        </div>
      </div>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <SectionHeading
            eyebrow="How it works"
            title="A healthier routine starts with one meal."
            subtitle="Set up your pet, log what they eat, and keep their care on track."
          />
        </div>

        <div className="relative grid grid-cols-1 gap-10 justify-items-center lg:grid-cols-3 lg:gap-8">
          <div aria-hidden="true" className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-5 hidden h-px bg-brand-sage/25 lg:block" />
          {steps.map((step, index) => (
            <div key={step.number} className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full h-12 w-px -translate-x-1/2 bg-brand-sage/25 lg:hidden" />
              )}
              <div className="relative">
                <span className="absolute left-1/2 -top-3 z-30 flex size-10 -translate-x-1/2 items-center justify-center rounded-2xl bg-brand-sage text-base font-extrabold text-white shadow-lg ring-4 ring-brand-cream font-mono">
                  {step.number}
                </span>
                <PhoneFrame>{step.renderScreen()}</PhoneFrame>
              </div>

              <h3 className="mt-6 font-bold text-foreground text-lg sm:text-xl tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-base text-foreground/75 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
