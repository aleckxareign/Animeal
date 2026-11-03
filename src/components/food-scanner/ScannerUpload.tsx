import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import {
  Camera,
  UploadCloud,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import type { Species, FoodCategory, ScanResult } from '../../types'

export type ScannedFoodData = ScanResult & {
  species: Species
  category: FoodCategory
  imageUrl?: string
  sampleLabel?: string
}

export const SAMPLE_PRESETS: {
  id: string
  title: string
  badge: string
  species: Species
  category: FoodCategory
  highlight: string
  data: ScannedFoodData
}[] = [
  {
    id: 'sample-pedigree',
    title: 'Pedigree Adult Dog (Dry)',
    badge: 'Dog • Adult',
    species: 'dog',
    category: 'dry',
    highlight: '21% Protein • 10% Fat • ₱155',
    data: {
      productName: 'Adult Chicken & Vegetables Dry Dog Food',
      brand: 'Pedigree',
      species: 'dog',
      category: 'dry',
      calories: 345,
      protein: 21,
      fat: 10,
      fiber: 5,
      moisture: 12,
      packageWeight: 1500,
      price: 155,
      confidence: 'high',
      sampleLabel: 'Pedigree Adult Chicken & Vegetables Recipe',
    },
  },
  {
    id: 'sample-whiskas',
    title: 'Whiskas Mackerel Cat (Dry)',
    badge: 'Cat • Adult',
    species: 'cat',
    category: 'dry',
    highlight: '30% Protein • 10% Fat • ₱210',
    data: {
      productName: 'Mackerel Flavor Adult Cat Dry Food',
      brand: 'Whiskas',
      species: 'cat',
      category: 'dry',
      calories: 350,
      protein: 30,
      fat: 10,
      fiber: 5,
      moisture: 12,
      packageWeight: 1200,
      price: 210,
      confidence: 'high',
      sampleLabel: 'Whiskas Ocean Mackerel Premium Dry Formula',
    },
  },
  {
    id: 'sample-budget',
    title: 'Budget Dog Food (Low protein, high fiber)',
    badge: 'Dog • Economy',
    species: 'dog',
    category: 'dry',
    highlight: '15% Protein • 8.5% Fiber • ₱85',
    data: {
      productName: 'Economy Maintenance Formula Dog Kibble',
      brand: 'BudgetBites',
      species: 'dog',
      category: 'dry',
      calories: 290,
      protein: 15,
      fat: 6,
      fiber: 8.5,
      moisture: 14,
      packageWeight: 1500,
      price: 85,
      confidence: 'medium',
      sampleLabel: 'BudgetBites Standard Maintenance Blend',
    },
  },
]

type ScannerUploadProps = {
  onStartScan: (data: ScannedFoodData, previewUrl?: string) => void
}

export default function ScannerUpload({ onStartScan }: ScannerUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please choose a smaller photo.')
      return
    }

    setUploadError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string

      // Simulated OCR extraction from uploaded image
      const simulatedData: ScannedFoodData = {
        productName: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Scanned Pet Food',
        brand: 'Detected Brand',
        species: 'dog',
        category: 'dry',
        calories: 360,
        protein: 24,
        fat: 12,
        fiber: 4,
        moisture: 10,
        packageWeight: 1000,
        price: 280,
        confidence: 'high',
        imageUrl: dataUrl,
      }

      onStartScan(simulatedData, dataUrl)
    }
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleSampleClick = (sample: typeof SAMPLE_PRESETS[0]) => {
    setUploadError(null)
    onStartScan(sample.data)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-sage/10 px-4 py-1.5 text-xs font-semibold text-brand-sage">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Powered Nutrition Intelligence • Suriin ang pet food</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl md:text-5xl">
          AI Food Label Scanner
        </h1>
        <p className="mx-auto max-w-2xl text-base text-brand-dark/75 sm:text-lg">
          Scan or upload a photo of your pet food packaging to analyze nutritional info, suitability, and value.
        </p>
      </div>

      {uploadError && (
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-brand-alert/20 bg-brand-alert/10 p-4 text-sm text-brand-alert">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{uploadError}</span>
        </div>
      )}

      {/* Main Upload Area */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Mode A: Camera Capture */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-brand-dark/10 bg-white p-6 shadow-sm transition-all hover:border-brand-sage/50 hover:shadow-md">
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-sage/15 text-brand-sage">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark">Take a Photo</h2>
              <p className="mt-1 text-sm text-brand-dark/70">
                Snap the Guaranteed Analysis table and Net Weight on the back of your pet food packaging.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-brand-dark/60">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" />
                <span>Instant camera capture on mobile & tablet</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" />
                <span>Auto-focus on nutrient numbers & percentage</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-sage px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-sage/90 active:scale-[0.99]"
            >
              <Camera className="h-4 w-4" />
              <span>Open Camera</span>
            </button>
          </div>
        </div>

        {/* Mode B: Drag & Drop / File Picker */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col justify-between rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? 'border-brand-sage bg-brand-sage/5 shadow-md scale-[1.01]'
              : 'border-brand-dark/20 bg-white hover:border-brand-sage/60 hover:bg-brand-cream/30 hover:shadow-sm'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-dark/5 text-brand-dark transition group-hover:scale-105 group-hover:bg-brand-sage/10 group-hover:text-brand-sage">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark">Upload Label Image</h2>
              <p className="mt-1 text-sm text-brand-dark/70">
                Drag & drop your food label photo here, or browse files
              </p>
            </div>
            <p className="text-xs text-brand-dark/50">
              Supports JPG, PNG, WebP up to 15MB
            </p>
          </div>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-dark/20 bg-brand-cream/50 px-4 py-2.5 text-xs font-semibold text-brand-dark group-hover:border-brand-sage group-hover:bg-brand-sage group-hover:text-white transition">
              <span>Browse Photo Library</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Test Presets */}
      <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-dark/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-sage" />
              <span>Try with a Sample Pet Food Label</span>
            </h2>
            <p className="text-xs text-brand-dark/60 mt-0.5">
              Click any sample below to instantly simulate the AI OCR scanner and review the nutritional suitability.
            </p>
          </div>
          <span className="text-xs font-medium text-brand-sage bg-brand-sage/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
            1-Click Demo
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SAMPLE_PRESETS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleClick(sample)}
              className="group relative flex flex-col justify-between text-left rounded-xl border border-brand-dark/10 bg-brand-cream/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-sage hover:bg-white hover:shadow-md active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="rounded-md bg-brand-dark/10 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
                    {sample.badge}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-dark/40 transition-transform group-hover:translate-x-1 group-hover:text-brand-sage" />
                </div>
                <h3 className="font-semibold text-brand-dark text-sm leading-snug line-clamp-2">
                  {sample.title}
                </h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-brand-dark/10">
                <p className="text-xs font-medium text-brand-sage">
                  {sample.highlight}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Photography Tips & Guidelines */}
      <div className="rounded-xl border border-brand-dark/10 bg-brand-sage/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-brand-sage/15 p-2 text-brand-sage">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-brand-dark">
              Tips for Best Nutritional Scanning Accuracy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-brand-dark/70">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sage shrink-0" />
                <span>Flatten label under bright, indirect light</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sage shrink-0" />
                <span>Include Guaranteed Analysis (% numbers)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sage shrink-0" />
                <span>Keep Net Weight (g/kg) clearly visible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
