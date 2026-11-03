import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  BookOpen,
  ScanLine,
  HeartPulse,
  CheckCircle2,
  Sparkles,
  Droplets,
  Scale,
  Flame,
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'

export default function FeatureCards() {
  return (
    <section className="bg-brand-cream/50 py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Explore Animeal"
          title="A closer look at smarter pet care."
          subtitle="Discover the tools that help you plan meals, understand pet food, and keep track of your pet's health with modern precision."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* 1. Meal Tracker Feature Card */}
          <Card className="flex flex-col justify-between border-border/60 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-sage/15 text-brand-sage shadow-xs">
                  <CalendarDays className="size-7" />
                </span>
                <Badge variant="outline" className="border-brand-sage/30 bg-brand-sage/10 text-brand-sage font-semibold text-xs sm:text-sm px-3 py-1">
                  Brain 2 System
                </Badge>
              </div>

              <h3 className="font-display mt-6 text-2xl sm:text-3xl font-bold text-brand-dark">
                Meal Tracker & RER Calculator
              </h3>
              <p className="mt-3 text-base sm:text-lg text-brand-dark/75 leading-relaxed">
                Log meals with "+ Napakain ako", record portions with smart units, and monitor consumed calories against scientific Resting Energy Requirement targets.
              </p>

              {/* Live Interactive UI Preview */}
              <div className="mt-7 rounded-2xl border border-border/80 bg-brand-cream/30 p-5 shadow-inner">
                <div className="flex items-center justify-between text-sm font-bold text-brand-dark">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🐕</span>
                    <span>Bruno (Golden Retriever, 12 kg)</span>
                  </div>
                  <span className="font-mono text-brand-sage text-base">540 / 720 kcal</span>
                </div>
                <div className="mt-3">
                  <Progress value={75} className="h-3 bg-brand-dark/10" />
                </div>
                <div className="mt-3.5 flex items-center justify-between text-xs sm:text-sm text-brand-dark/70">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="size-4 text-brand-sage" /> Fed 8:30 AM by Maria
                  </span>
                  <span>180 kcal remaining today</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 bg-brand-cream/20 p-6">
              <Link
                to="/meal-tracker"
                className="group inline-flex items-center gap-2 font-bold text-brand-sage transition-colors hover:text-brand-dark text-base"
              >
                Start tracking meals
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Card>

          {/* 2. Food Library Feature Card */}
          <Card className="flex flex-col justify-between border-border/60 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 shadow-xs">
                  <BookOpen className="size-7" />
                </span>
                <Badge variant="outline" className="border-amber-600/30 bg-amber-500/10 text-amber-800 font-semibold text-xs sm:text-sm px-3 py-1">
                  Philippine Catalog
                </Badge>
              </div>

              <h3 className="font-display mt-6 text-2xl sm:text-3xl font-bold text-brand-dark">
                Pet Food Database & Comparisons
              </h3>
              <p className="mt-3 text-base sm:text-lg text-brand-dark/75 leading-relaxed">
                Compare local brands like Pedigree, Whiskas, and Aozi. Evaluate guaranteed analysis, protein ratios, and price per 100 kcal to maximize your budget.
              </p>

              {/* Live Interactive UI Preview */}
              <div className="mt-7 space-y-3 rounded-2xl border border-border/80 bg-brand-cream/30 p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-dark">Whiskas Adult Mackerel</span>
                    <Badge variant="secondary" className="text-xs py-0.5 px-2 bg-brand-sage/15 text-brand-sage font-bold">
                      Verified
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-brand-dark font-mono">₱130</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-brand-dark/80">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Flame className="size-4 text-amber-600" /> 365 kcal/100g
                  </span>
                  <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    ₱2.97 / 100 kcal (Best Value)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs text-brand-dark/75 font-semibold">
                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">Prot: 30%</div>
                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">Fat: 12%</div>
                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">Fib: 4%</div>
                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">Moist: 12%</div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 bg-brand-cream/20 p-6">
              <Link
                to="/food-library"
                className="group inline-flex items-center gap-2 font-bold text-brand-sage transition-colors hover:text-brand-dark text-base"
              >
                Browse pet food library
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Card>

          {/* 3. Food Scanner Feature Card */}
          <Card className="flex flex-col justify-between border-border/60 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-cyan-600/15 text-cyan-800 shadow-xs">
                  <ScanLine className="size-7" />
                </span>
                <Badge variant="outline" className="border-cyan-600/30 bg-cyan-600/10 text-cyan-800 font-semibold text-xs sm:text-sm px-3 py-1">
                  AI OCR Vision
                </Badge>
              </div>

              <h3 className="font-display mt-6 text-2xl sm:text-3xl font-bold text-brand-dark">
                AI Food Scanner & Verdict
              </h3>
              <p className="mt-3 text-base sm:text-lg text-brand-dark/75 leading-relaxed">
                Snap or upload packaging labels. Our scanner extracts guaranteed analysis values, checks AAFCO suitability, and gives transparent Good / Okay / Review ratings.
              </p>

              {/* Live Interactive UI Preview */}
              <div className="mt-7 rounded-2xl border border-border/80 bg-brand-cream/30 p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-brand-dark">
                    <Sparkles className="size-4 text-cyan-700" /> OCR Label Analysis
                  </span>
                  <Badge className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5">
                    🟢 Good Choice
                  </Badge>
                </div>
                <div className="mt-3 rounded-xl bg-white p-3.5 border border-border/50">
                  <div className="flex items-center justify-between text-sm text-brand-dark">
                    <span className="font-bold">Pedigree Adult Dog (Dry)</span>
                    <span className="text-xs sm:text-sm text-emerald-800 font-bold">21% Protein • High Quality</span>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                    Meets recommended adult canine baseline. Balanced fat and fiber for easy digestion.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 bg-brand-cream/20 p-6">
              <Link
                to="/food-scanner"
                className="group inline-flex items-center gap-2 font-bold text-brand-sage transition-colors hover:text-brand-dark text-base"
              >
                Scan a food label
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Card>

          {/* 4. Pet Wellness Feature Card */}
          <Card className="flex flex-col justify-between border-border/60 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-700 shadow-xs">
                  <HeartPulse className="size-7" />
                </span>
                <Badge variant="outline" className="border-rose-600/30 bg-rose-500/10 text-rose-800 font-semibold text-xs sm:text-sm px-3 py-1">
                  360° Care System
                </Badge>
              </div>

              <h3 className="font-display mt-6 text-2xl sm:text-3xl font-bold text-brand-dark">
                Hydration, Weight & Schedule
              </h3>
              <p className="mt-3 text-base sm:text-lg text-brand-dark/75 leading-relaxed">
                Log daily water bowls, visualize weight change trends with veterinary threshold alerts, and manage shared household reminders so pets never get double-fed.
              </p>

              {/* Live Interactive UI Preview */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/80 bg-white p-3.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-800">
                    <Droplets className="size-4" />
                    <span>Hydration</span>
                  </div>
                  <div className="mt-1.5 text-base sm:text-lg font-bold text-brand-dark font-mono">
                    450 <span className="text-xs font-normal text-brand-dark/60">/ 600 ml</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-800 font-semibold">75% of daily goal</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-white p-3.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-800">
                    <Scale className="size-4" />
                    <span>Weight Trend</span>
                  </div>
                  <div className="mt-1.5 text-base sm:text-lg font-bold text-brand-dark font-mono">
                    12.4 kg
                  </div>
                  <p className="mt-1 text-xs text-emerald-800 font-semibold">+0.2 kg (Healthy range)</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 bg-brand-cream/20 p-6">
              <Link
                to="/pet-wellness"
                className="group inline-flex items-center gap-2 font-bold text-brand-sage transition-colors hover:text-brand-dark text-base"
              >
                View pet wellness records
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
