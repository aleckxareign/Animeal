import { Fragment } from 'react'
import { ChevronRight, CheckCircle2, Droplets } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import PhoneFrame from '../ui/PhoneFrame'

const steps = [
  {
    number: '01',
    title: "Create Your Pet's Profile",
    description: "Add your pet's species, breed, age, and weight to calculate their daily calorie needs.",
    renderScreen: () => (
      <div className="flex h-full flex-col bg-brand-cream/40 p-3 text-left text-xs">
        <div className="rounded-xl bg-white p-3 text-center shadow-xs">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-amber-100 text-2xl">
            🐕
          </div>
          <p className="mt-1.5 font-bold text-brand-dark text-sm">Bruno</p>
          <p className="text-[11px] text-brand-dark/60">Golden Retriever • 12 kg</p>
        </div>

        <div className="mt-2.5 rounded-xl bg-brand-dark p-2.5 text-white">
          <p className="text-[9px] text-brand-cream/70 font-semibold uppercase tracking-wider">Daily RER Target</p>
          <p className="text-sm font-bold text-brand-cream font-mono mt-0.5">720 kcal/day</p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/20">
            <div className="h-1.5 w-2/3 rounded-full bg-brand-sage" />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-800">
          <span>Kapon / Neutered</span>
          <span className="font-bold">✓ Yes</span>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Explore the Tools',
    description: 'Discover verified food, scan packaging labels, and log meals with smart portion units.',
    renderScreen: () => (
      <div className="flex h-full flex-col bg-brand-cream/40 p-3 text-left text-xs">
        <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[10px] text-brand-dark/60 shadow-xs border border-border/40">
          <span>🔍</span> Search food...
        </div>

        <div className="mt-2.5 rounded-xl bg-white p-2.5 shadow-xs border border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-dark text-xs">Pedigree Adult</span>
            <span className="rounded bg-brand-sage/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-sage">345 kcal</span>
          </div>
          <p className="text-[10px] text-brand-dark/60 mt-0.5">₱155 • 1.5 kg bag</p>
          <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-1.5 text-[10px]">
            <span className="text-emerald-700 font-bold">₱3.00 / 100 kcal</span>
            <span className="text-brand-dark/60">21% Prot</span>
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
    title: 'Track their Well-being',
    description: 'Review feeding history, monitor hydration and weight, and stay in sync with family.',
    renderScreen: () => (
      <div className="flex h-full flex-col bg-brand-cream/40 p-3 text-left text-xs">
        <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-xs border border-border/40">
          <div className="flex items-center gap-2">
            <Droplets className="size-4 text-cyan-600" />
            <span className="font-bold text-brand-dark text-xs">Water Intake</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-cyan-800">450 / 600 ml</span>
        </div>

        <div className="mt-2.5 rounded-xl bg-white p-2.5 shadow-xs border border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-dark text-xs">Recent Feeding</span>
            <span className="text-[10px] text-brand-dark/50 font-mono">8:30 AM</span>
          </div>
          <p className="mt-1 text-[11px] text-brand-sage font-medium flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" /> Maria fed Bruno
          </p>
        </div>

        <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-2 text-rose-800">
          <p className="font-bold text-[10px] uppercase tracking-wider">Next Reminder</p>
          <p className="text-xs font-semibold text-rose-900 mt-0.5">Deworming in 3 days</p>
        </div>
      </div>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-cream py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12">
        {/* Centered Top Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <SectionHeading
            eyebrow="How it works"
            title="Three simple steps to better pet care."
            subtitle="Get started with Animeal by setting up your pet's profile, exploring the tools you need, and keeping track of their overall nutrition and wellness in one synchronized dashboard."
          />
        </div>

        {/* 3-Column Responsive Interactive Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 justify-items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="w-full max-w-sm flex flex-col items-center text-center">
              <div className="relative">
                <span className="absolute -left-3 -top-3 z-30 flex size-12 items-center justify-center rounded-2xl bg-brand-sage text-xl font-extrabold text-white shadow-lg ring-4 ring-brand-cream font-mono">
                  {step.number}
                </span>
                <PhoneFrame>{step.renderScreen()}</PhoneFrame>
              </div>

              <h3 className="mt-8 font-bold text-brand-dark text-xl sm:text-2xl tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-base sm:text-lg text-brand-dark/75 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
