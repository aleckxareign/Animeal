import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TOUR_STORAGE_PREFIX = 'animeal_tour_completed_'

interface TourStep {
  stepNumber: number
  targetId: string
  title: string
  description: string
  primaryButtonText: string
  bannerColor: string // Left block color
  bannerBg: string    // Right container bg
  renderHeaderGraphic: () => React.ReactNode
}

const TOUR_STEPS: TourStep[] = [
  // ── Step 1: Explore Tools ──
  {
    stepNumber: 1,
    targetId: 'tour-explore-tools',
    title: 'Meet Explore Tools, your pet care suite',
    description:
      'All our scientific nutrition calculators in one place. Estimate daily calorie budgets with RER, scan food packaging labels, and compare local brands by cost-per-calorie.',
    primaryButtonText: 'Show Me Around',
    bannerColor: 'bg-[#1b4332]',
    bannerBg: 'bg-[#f0fdf4]',
    renderHeaderGraphic: () => (
      <div className="flex h-full w-full items-stretch">
        {/* Left colored pillar (like Slack's sidebar aesthetic) */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 bg-[#1b4332] p-3 text-white">
          <div className="flex size-7 items-center justify-center rounded-lg bg-card/20 text-sm shadow-2xs">
            🍲
          </div>
          <div className="flex size-7 items-center justify-center rounded-lg bg-card/20 text-sm shadow-2xs">
            📷
          </div>
          <div className="flex size-7 items-center justify-center rounded-lg bg-card/20 text-sm shadow-2xs">
            📖
          </div>
        </div>
        {/* Right mockup snippet */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-3.5 text-left text-xs text-foreground">
          <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-300">
            <span className="text-emerald-700 dark:text-emerald-300">✓</span> Meal Tracker &amp; RER
          </div>
          <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-300">
            <span className="text-emerald-700 dark:text-emerald-300">✓</span> AI Food Label Scanner
          </div>
          <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-300">
            <span className="text-emerald-700 dark:text-emerald-300">✓</span> Philippine Food Library
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 2: Ask Mealie AI ──
  {
    stepNumber: 2,
    targetId: 'tour-ask-mealie',
    title: 'Meet Ask Mealie, your AI pet assistant',
    description:
      'Have questions about toxic human foods, puppy feeding amounts, or sensitive stomachs? Chat 24/7 with Mealie for instant, bilingual English & Taglish guidance.',
    primaryButtonText: 'Next',
    bannerColor: 'bg-[#4a154b]', // Classic Slack plum / purple
    bannerBg: 'bg-[#faf5ff]',
    renderHeaderGraphic: () => (
      <div className="flex h-full w-full items-stretch">
        {/* Left colored pillar */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 bg-[#4a154b] p-3 text-white">
          <div className="flex size-8 items-center justify-center rounded-full bg-card/20 text-base">
            🐾
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-purple-200">AI Care</span>
        </div>
        {/* Right chat snippet */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-3.5 text-left text-xs">
          <div className="rounded-lg bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-2xs border border-purple-100 dark:border-purple-400/30">
            &quot;Pwede ba ang sibuyas sa aso?&quot;
          </div>
          <div className="rounded-lg bg-purple-100/80 dark:bg-purple-500/15 px-2.5 py-1 text-[11px] font-bold text-purple-950 dark:text-purple-300">
            Mealie: Never! All alliums are toxic.
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 3: Care Schedule ──
  {
    stepNumber: 3,
    targetId: 'tour-care-schedule',
    title: 'Meet Care Schedule, your shared pet calendar',
    description:
      'Keep track of daily feeding times, upcoming veterinary checkups, vaccination boosters, and deworming schedules all in one synchronized calendar.',
    primaryButtonText: 'Next',
    bannerColor: 'bg-[#92400e]',
    bannerBg: 'bg-[#fffbeb]',
    renderHeaderGraphic: () => (
      <div className="flex h-full w-full items-stretch">
        {/* Left colored pillar */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 bg-[#92400e] p-3 text-white">
          <div className="flex size-8 items-center justify-center rounded-lg bg-card/20 text-base">
            📅
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200">Alerts</span>
        </div>
        {/* Right calendar snippet */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-3.5 text-left text-xs text-amber-950 dark:text-amber-300">
          <div className="flex items-center justify-between rounded-lg bg-card px-2.5 py-1 shadow-2xs border border-amber-200/60 dark:border-amber-400/30">
            <span className="font-bold">⏰ 7:30 AM: Bruno&apos;s Breakfast</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Done ✓</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-amber-100/70 dark:bg-amber-500/15 px-2.5 py-1">
            <span className="font-semibold">💊 Dec 5: NexGard / Deworming</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">5 days left</span>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 4: Shared Household ──
  {
    stepNumber: 4,
    targetId: 'tour-household',
    title: 'Meet Shared Household, collaborative pet care',
    description:
      'Prevent duplicate feedings! Invite family members or pet sitters to your household. One-tap "Napakain ako" logs instantly update everyone in real-time.',
    primaryButtonText: 'Got It!',
    bannerColor: 'bg-[#164040]',
    bannerBg: 'bg-[#f4f7f6]',
    renderHeaderGraphic: () => (
      <div className="flex h-full w-full items-stretch">
        {/* Left colored pillar */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 bg-[#164040] p-3 text-white">
          <div className="flex size-8 items-center justify-center rounded-lg bg-card/20 text-base">
            👨‍👩‍👧‍👦
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-teal-200">Household</span>
        </div>
        {/* Right household snippet */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-3.5 text-left text-xs text-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-[10px] text-emerald-800 dark:text-emerald-300">
              ✓
            </span>
            Mommy fed Bruno at 7:30 AM
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-400/30">
            🔔 Live household sync: No double breakfast!
          </div>
        </div>
      </div>
    ),
  },
]

export default function NewUserTourModal() {
  const { isLoggedIn, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Target element geometry for positioning and spotlight
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1536 : true)
  const cardRef = useRef<HTMLDivElement>(null)

  // Recalculate target position
  const updateTargetGeometry = useCallback(() => {
    const desktopMode = window.innerWidth >= 1536
    setIsDesktop(desktopMode)

    const step = TOUR_STEPS[currentStepIndex]
    if (!step) return

    const targetEl = document.getElementById(step.targetId)
    if (targetEl) {
      setTargetRect(targetEl.getBoundingClientRect())
    } else {
      setTargetRect(null)
    }
  }, [currentStepIndex])

  // Check if tour should auto-open for this user
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return

    const storageKey = `${TOUR_STORAGE_PREFIX}${user.id}`
    const hasSeenTour = localStorage.getItem(storageKey)

    if (hasSeenTour !== 'true') {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setCurrentStepIndex(0)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, user?.id])

  // Support manual trigger from Navbar / Profile
  useEffect(() => {
    function handleOpenTour() {
      setCurrentStepIndex(0)
      setIsOpen(true)
    }

    window.addEventListener('open-animeal-tour', handleOpenTour)
    return () => window.removeEventListener('open-animeal-tour', handleOpenTour)
  }, [])

  // Window resize & scroll listener to keep spotlight & popover aligned
  useEffect(() => {
    if (!isOpen) return

    updateTargetGeometry()

    window.addEventListener('resize', updateTargetGeometry)
    window.addEventListener('scroll', updateTargetGeometry, true)

    return () => {
      window.removeEventListener('resize', updateTargetGeometry)
      window.removeEventListener('scroll', updateTargetGeometry, true)
    }
  }, [isOpen, updateTargetGeometry])

  const markTourCompleted = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(`${TOUR_STORAGE_PREFIX}${user.id}`, 'true')
    }
    localStorage.setItem('animeal_tour_completed', 'true')
    setIsOpen(false)
  }, [user?.id])

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      markTourCompleted()
    }
  }

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStepIndex]
  const cardWidth = 400

  // Calculate popover coordinates on desktop
  let popoverLeft = 24
  let popoverTop = 90
  let arrowOffsetLeft = 40

  if (isDesktop && targetRect) {
    // Center card under target element
    const targetCenterX = targetRect.left + targetRect.width / 2
    const idealLeft = targetCenterX - cardWidth / 2

    // Clamp within viewport margins
    const minLeft = 20
    const maxLeft = window.innerWidth - cardWidth - 20
    popoverLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft))

    // Position vertically directly underneath the navbar target with 14px gap
    popoverTop = targetRect.bottom + 14

    // Arrow position relative to the card's left edge
    arrowOffsetLeft = Math.max(24, Math.min(targetCenterX - popoverLeft, cardWidth - 24))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slack-tour-title"
      className="fixed inset-0 z-90 font-sans animate-fade-in"
    >
      {/* ── 1. Semi-transparent Dimmed Backdrop ── */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={markTourCompleted}
        aria-hidden="true"
      />

      {/* ── 2. Target Spotlight Glow (Desktop only when element is visible) ── */}
      {isDesktop && targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - 5,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 10,
          }}
          className="pointer-events-none z-95 rounded-xl border-2 border-emerald-400 bg-card/20 shadow-[0_0_24px_rgba(52,211,153,0.7)] ring-4 ring-emerald-500/30 transition-all duration-300"
        />
      )}

      {/* ── 3. Popover Card (Slack-Style) ── */}
      <div
        ref={cardRef}
        style={
          isDesktop && targetRect
            ? {
                position: 'fixed',
                top: `${popoverTop}px`,
                left: `${popoverLeft}px`,
                width: `${cardWidth}px`,
              }
            : undefined
        }
        className={`z-100 max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-2xl border border-border/90 dark:border-border bg-card dark:bg-card shadow-2xl ring-1 ring-black/10 animate-scale-in ${
          !isDesktop || !targetRect
            ? 'fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[92vw] w-[400px]'
            : ''
        }`}
      >
        {/* Directional Beak / Arrow (pointing UP to target) */}
        {isDesktop && targetRect && (
          <div
            style={{ left: `${arrowOffsetLeft}px` }}
            className="absolute -top-2 size-4 -translate-x-1/2 rotate-45 border-t border-l border-border/90 bg-card dark:border-border dark:bg-card"
          />
        )}

        {/* ── Top Graphic Header Banner ── */}
        <div className={`relative h-28 w-full border-b border-border dark:border-border ${step.bannerBg}`}>
          {/* Close X button on top right of the banner */}
          <button
            type="button"
            onClick={markTourCompleted}
            className="absolute top-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-muted-foreground dark:text-muted-foreground transition cursor-pointer"
            title="Close Tour"
            aria-label="Close Tour"
          >
            <X className="size-4" />
          </button>

          {step.renderHeaderGraphic()}
        </div>

        {/* ── Content Body ── */}
        <div className="p-5 sm:p-6 text-left">
          <h3
            id="slack-tour-title"
            className="font-display text-lg font-bold text-foreground dark:text-white tracking-tight leading-snug"
          >
            {step.title}
          </h3>

          <p className="mt-2 text-xs sm:text-[13px] text-muted-foreground dark:text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {/* ── Action Footer ── */}
          <div className="mt-5 flex items-center justify-between border-t border-border dark:border-border pt-4">
            {/* Left: Maybe Later / Skip */}
            <button
              type="button"
              onClick={markTourCompleted}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white transition cursor-pointer"
            >
              Maybe Later
            </button>

            {/* Right Group: Primary CTA + Step counter */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-muted-foreground dark:text-muted-foreground">
                {step.stepNumber} of {TOUR_STEPS.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-brand-sage hover:bg-brand-sage/90 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
              >
                {step.primaryButtonText}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
