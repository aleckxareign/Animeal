import { Link } from 'react-router-dom'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarDays,
  BookOpen,
  ScanLine,
  HeartPulse,
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { Card } from '../ui/Card'
import { AppProvider } from '../../context/AppContext'
import MealTrackerPage from '../../pages/MealTrackerPage'
import FoodLibraryPage from '../../pages/FoodLibraryPage'
import FoodScannerPage from '../../pages/FoodScannerPage'
import PetWellnessPage from '../../pages/PetWellnessPage'

const cardClassName = 'flex flex-col justify-between gap-0 p-0 border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md'
const linkClassName = 'group mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-brand-accent transition-colors hover:text-foreground text-sm'

function FeatureScreenPreview({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const observer = new ResizeObserver(() => setScale(frame.clientWidth / 1280))
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={frameRef} aria-hidden="true" inert className="relative aspect-[1280/850] min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-inner">
      <div className="absolute left-0 top-0 h-[850px] w-[1280px] origin-top-left" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

export default function FeatureCards() {
  return (
    <section className="bg-card py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Explore Animeal"
          title="A closer look at smarter pet care."
          subtitle="Discover the tools that help you plan meals, understand pet food, and keep track of your pet's health with modern precision."
        />

        <AppProvider preview>
          <div className="mt-8 grid gap-5 lg:gap-6 md:grid-cols-2">
          <Card className={cardClassName}>
            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-accent">
                    <CalendarDays className="size-4.5" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">Meal Tracker</h3>
                </div>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                  Log meals, record portions, and see how much of your pet's daily calorie target remains.
                </p>
                <Link to="/meal-tracker" className={linkClassName}>
                  Log a meal <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <FeatureScreenPreview><MealTrackerPage /></FeatureScreenPreview>
            </div>
          </Card>

          <Card className={cardClassName}>
            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-accent">
                    <BookOpen className="size-4.5" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">Food Library</h3>
                </div>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                  Explore local pet foods and compare nutrition, ingredients, and cost per calorie.
                </p>
                <Link to="/food-library" className={linkClassName}>
                  Explore pet foods <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <FeatureScreenPreview><FoodLibraryPage /></FeatureScreenPreview>
            </div>
          </Card>

          <Card className={cardClassName}>
            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-accent">
                    <ScanLine className="size-4.5" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">Food Scanner</h3>
                </div>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                  Scan or upload a food label to understand its nutrition and suitability.
                </p>
                <Link to="/food-scanner" className={linkClassName}>
                  Scan a food label <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <FeatureScreenPreview><FoodScannerPage /></FeatureScreenPreview>
            </div>
          </Card>

          <Card className={cardClassName}>
            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-accent">
                    <HeartPulse className="size-4.5" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">Pet Wellness</h3>
                </div>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                  Track weight, hydration, health records, and care reminders.
                </p>
                <Link to="/pet-wellness" className={linkClassName}>
                  View wellness records <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <FeatureScreenPreview><PetWellnessPage /></FeatureScreenPreview>
            </div>
          </Card>
          </div>
        </AppProvider>
      </div>
    </section>
  )
}
