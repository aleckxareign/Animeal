import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Percent,
} from 'lucide-react'
import type { ScannedFoodData } from './ScannerUpload'

type ScanningAnimationProps = {
  data: ScannedFoodData
  previewUrl?: string
  onComplete: () => void
  onCancel?: () => void
}

export default function ScanningAnimation({
  data,
  previewUrl,
  onComplete,
  onCancel,
}: ScanningAnimationProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [progress, setProgress] = useState<number>(15)

  useEffect(() => {
    // Step 1: Detecting product & brand (0ms - 600ms)
    const t1 = setTimeout(() => {
      setCurrentStep(2)
      setProgress(55)
    }, 600)

    // Step 2: Extracting guaranteed analysis (600ms - 1200ms)
    const t2 = setTimeout(() => {
      setCurrentStep(3)
      setProgress(85)
    }, 1200)

    // Step 3: Calculating nutritional suitability (1200ms - 1750ms)
    const t3 = setTimeout(() => {
      setProgress(100)
    }, 1600)

    const t4 = setTimeout(() => {
      onComplete()
    }, 1850)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete])

  const steps = [
    {
      id: 1,
      label: 'Detecting product & brand...',
      detail: data.brand ? `Found: ${data.brand}` : 'Locating product brand and title',
      icon: Tag,
    },
    {
      id: 2,
      label: 'Extracting guaranteed analysis...',
      detail: 'Reading Crude Protein, Fat, Fiber, & Moisture %',
      icon: Percent,
    },
    {
      id: 3,
      label: 'Calculating nutritional suitability...',
      detail: 'Comparing with AAFCO & veterinary profile guidelines',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-sage/10 px-3.5 py-1 text-xs font-semibold text-brand-accent">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Analyzing Pet Food Label</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Scanning Guaranteed Analysis
        </h2>
        <p className="text-sm text-foreground/70">
          Our AI optical parser is reading the nutrient density and guaranteed ratios.
        </p>
      </div>

      {/* Laser Scanning Viewport */}
      <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border-2 border-foreground/15 bg-brand-dark shadow-xl">
        {/* Background Image / Mock Label */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Scanned Label"
            className="h-full w-full object-cover opacity-80 filter brightness-90"
          />
        ) : (
          /* Simulated Realistic Label graphic if sample or no photo */
          <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#2a3b32] to-[#12241d] p-6 text-white font-mono select-none">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div>
                <span className="text-[10px] tracking-wider uppercase text-emerald-400">
                  {data.species.toUpperCase()} FORMULA • {data.category.toUpperCase()}
                </span>
                <p className="text-lg font-bold text-white tracking-wide">
                  {data.brand || 'PREMIUM PET RECIPE'}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded bg-card/10 px-2 py-0.5 text-[10px] text-white/80">
                  NET WT {data.packageWeight ? `${data.packageWeight}g` : '1.5 kg'}
                </span>
              </div>
            </div>

            {/* Simulated Guaranteed Analysis Box */}
            <div className="my-auto rounded-lg bg-black/40 border border-white/20 p-3 text-xs space-y-1.5 backdrop-blur-sm">
              <div className="flex justify-between font-bold text-emerald-300 border-b border-white/10 pb-1">
                <span>GUARANTEED ANALYSIS</span>
                <span>MIN / MAX</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Crude Protein (min)</span>
                <span className="font-semibold text-emerald-400">{data.protein ?? 22}%</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Crude Fat (min)</span>
                <span className="font-semibold text-emerald-400">{data.fat ?? 10}%</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Crude Fiber (max)</span>
                <span className="font-semibold text-emerald-400">{data.fiber ?? 5}%</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Moisture (max)</span>
                <span className="font-semibold text-emerald-400">{data.moisture ?? 12}%</span>
              </div>
              {data.calories && (
                <div className="flex justify-between text-white/70 pt-1 border-t border-white/10 text-[11px]">
                  <span>Calorie Content (calc)</span>
                  <span>{data.calories} kcal/100g</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span>BARCODE 480001293847</span>
              <span>BATCH #PH-2026-X</span>
            </div>
          </div>
        )}

        {/* Tech Reticle Corners */}
        <div className="pointer-events-none absolute inset-0 p-4">
          {/* Top-Left */}
          <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-emerald-400" />
          {/* Top-Right */}
          <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-emerald-400" />
          {/* Bottom-Left */}
          <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-emerald-400" />
          {/* Bottom-Right */}
          <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-emerald-400" />
        </div>

        {/* Animated Laser Scanning Beam */}
        <div
          className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_6px_rgba(52,211,153,0.7)]"
          style={{
            animation: 'scan-laser 1.8s ease-in-out infinite alternate',
          }}
        />

        {/* Floating Simulated OCR Detection Badges */}
        <div className="pointer-events-none absolute top-4 left-4 right-4 flex flex-wrap gap-2 text-[11px]">
          {currentStep >= 1 && (
            <span className="animate-scale-in rounded-full bg-emerald-500/80 px-2.5 py-0.5 font-medium text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
              <Zap className="h-3 w-3" /> Brand: {data.brand || 'Detected'}
            </span>
          )}
          {currentStep >= 2 && (
            <span className="animate-scale-in rounded-full bg-emerald-500/80 px-2.5 py-0.5 font-medium text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Protein: {data.protein}%
            </span>
          )}
          {currentStep >= 2 && data.calories && (
            <span className="animate-scale-in rounded-full bg-emerald-500/80 px-2.5 py-0.5 font-medium text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {data.calories} kcal/100g
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-foreground">
          <span>Analysis Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-dark/10">
          <div
            className="h-full rounded-full bg-brand-sage transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="rounded-xl border border-foreground/10 bg-card p-4 shadow-sm space-y-3">
        {steps.map((s) => {
          const isDone = currentStep > s.id || progress === 100
          const isActive = currentStep === s.id && progress < 100
          const StepIcon = s.icon

          return (
            <div
              key={s.id}
              className={`flex items-start gap-3 rounded-lg p-2 transition-all ${
                isActive
                  ? 'bg-brand-sage/10 text-foreground font-medium'
                  : isDone
                    ? 'text-foreground'
                    : 'opacity-40 text-foreground/60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-brand-accent animate-spin" />
                ) : (
                  <StepIcon className="h-5 w-5 text-foreground/40" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-foreground/70">{s.detail}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions: Skip or Cancel */}
      <div className="flex items-center justify-between pt-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-foreground/60 hover:text-destructive transition"
          >
            Cancel Scan
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:underline"
        >
          <span>Skip to results</span>
          <span>→</span>
        </button>
      </div>

      {/* Laser Keyframe Style */}
      <style>{`
        @keyframes scan-laser {
          0% { top: 4%; }
          100% { top: 92%; }
        }
      `}</style>
    </div>
  )
}
