import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ScanLine,
  BookmarkPlus,
  Utensils,
  RotateCcw,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import type { FoodItem } from '../types'
import ScannerUpload, {
  type ScannedFoodData,
} from '../components/food-scanner/ScannerUpload'
import ScanningAnimation from '../components/food-scanner/ScanningAnimation'
import ExtractedDataEditor from '../components/food-scanner/ExtractedDataEditor'
import VerdictCard from '../components/food-scanner/VerdictCard'
import AlternativeSuggestions from '../components/food-scanner/AlternativeSuggestions'
import { pricePerCalorie } from '../utils/calories'

type ScannerMode = 'upload' | 'scanning' | 'results'

export default function FoodScannerPage() {
  const navigate = useNavigate()
  const { activePet, pets, setActivePet, addCustomFood } = useApp()
  const { addToast } = useToast()

  const [mode, setMode] = useState<ScannerMode>('upload')
  const [scannedData, setScannedData] = useState<ScannedFoodData | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [isSavedToLibrary, setIsSavedToLibrary] = useState<boolean>(false)

  // Start scanning
  const handleStartScan = (data: ScannedFoodData, url?: string) => {
    // If activePet exists, adapt default species to activePet species
    const adaptedData: ScannedFoodData = {
      ...data,
      species: activePet ? activePet.species : data.species,
    }
    setScannedData(adaptedData)
    setPreviewUrl(url)
    setIsSavedToLibrary(false)
    setMode('scanning')
  }

  // Scanning animation complete
  const handleScanComplete = () => {
    setMode('results')
    addToast('Food label analyzed successfully!', 'success')
  }

  // Cancel scanning
  const handleCancelScan = () => {
    setMode('upload')
  }

  // Reset to scan another label
  const handleReset = () => {
    setScannedData(null)
    setPreviewUrl(undefined)
    setIsSavedToLibrary(false)
    setMode('upload')
  }

  // Update extracted values
  const handleUpdateData = (updated: ScannedFoodData) => {
    setScannedData(updated)
    setIsSavedToLibrary(false)
    addToast('Nutrition values updated.', 'info')
  }

  // Save to Food Library
  const handleSaveToLibrary = () => {
    if (!scannedData) return

    const price = scannedData.price ?? 0
    const packageWeight = scannedData.packageWeight ?? 1000
    const caloriesPer100g = scannedData.calories ?? 350

    const calcPricePerCal = pricePerCalorie(price, packageWeight, caloriesPer100g) ?? undefined

    const newFood: Omit<FoodItem, 'id' | 'verified' | 'isCustom'> = {
      name: scannedData.productName || 'Scanned Pet Food',
      brand: scannedData.brand || 'Custom Brand',
      species: [scannedData.species],
      category: scannedData.category,
      lifeStageSuitability: ['adult'],
      caloriesPer100g,
      protein: scannedData.protein ?? 20,
      fat: scannedData.fat ?? 10,
      fiber: scannedData.fiber ?? 4,
      moisture: scannedData.moisture ?? 10,
      servingSize: 100,
      servingUnit: 'g',
      price,
      packageSize: packageWeight,
      pricePerCalorie: calcPricePerCal,
    }

    addCustomFood(newFood)
    setIsSavedToLibrary(true)
    addToast(`"${newFood.name}" saved to your Food Library!`, 'success')
  }

  // Log as Meal Now -> redirect to /meal-tracker with prefilled food state
  const handleLogMeal = () => {
    if (!scannedData) return

    // Auto-save to custom food first if not yet saved
    if (!isSavedToLibrary) {
      handleSaveToLibrary()
    }

    const prefillFood = {
      name: scannedData.productName,
      brand: scannedData.brand,
      caloriesPer100g: scannedData.calories ?? 350,
      protein: scannedData.protein ?? 20,
      fat: scannedData.fat ?? 10,
      fiber: scannedData.fiber ?? 4,
      portion: 100,
      unit: 'g' as const,
      species: scannedData.species,
      category: scannedData.category,
    }

    navigate('/meal-tracker', {
      state: { prefillFood },
    })
    addToast(`Ready to log "${scannedData.productName}" for your pet!`, 'info')
  }

  // Select an alternative food
  const handleSelectAlternative = (alt: FoodItem) => {
    if (!scannedData) return

    setScannedData({
      ...scannedData,
      productName: alt.name,
      brand: alt.brand,
      species: alt.species[0] || 'dog',
      category: alt.category,
      calories: alt.caloriesPer100g,
      protein: alt.protein,
      fat: alt.fat,
      fiber: alt.fiber,
      moisture: alt.moisture,
      packageWeight: alt.packageSize,
      price: alt.price,
      confidence: 'high',
    })
    setIsSavedToLibrary(true)
    addToast(`Switched comparison to ${alt.name}`, 'info')
  }

  return (
    <div className="min-h-screen bg-brand-cream/30 pb-20 pt-8 sm:pt-12 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        {/* Top Navigation & Pet Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/10 pb-4">
          <div className="flex items-center gap-2">
            {mode === 'results' ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-dark/15 bg-white px-3 py-2 text-xs font-semibold text-brand-dark shadow-xs hover:bg-brand-cream/50 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Scan Another Label</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-brand-dark/60">
                <ScanLine className="h-4 w-4 text-brand-sage" />
                <span className="font-semibold text-brand-dark">Nutrition Scanner</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{mode === 'upload' ? 'Upload Label' : 'Analyzing'}</span>
              </div>
            )}
          </div>

          {/* Active Pet Selector */}
          {pets.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-brand-dark/10 bg-white px-3.5 py-1.5 shadow-xs">
              <span className="text-xs font-medium text-brand-dark/60">Scanning for:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{activePet?.avatarEmoji || '🐾'}</span>
                <select
                  value={activePet?.id || ''}
                  onChange={(e) => setActivePet(e.target.value)}
                  className="rounded-lg bg-transparent text-xs font-bold text-brand-dark focus:outline-none cursor-pointer"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species === 'dog' ? 'Dog' : 'Cat'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* MODE 1: Upload View */}
        {mode === 'upload' && (
          <div className="animate-fade-in">
            <ScannerUpload onStartScan={handleStartScan} />
          </div>
        )}

        {/* MODE 2: Scanning View */}
        {mode === 'scanning' && scannedData && (
          <div className="animate-fade-in py-8">
            <ScanningAnimation
              data={scannedData}
              previewUrl={previewUrl}
              onComplete={handleScanComplete}
              onCancel={handleCancelScan}
            />
          </div>
        )}

        {/* MODE 3: Results View */}
        {mode === 'results' && scannedData && (
          <div className="animate-slide-up space-y-8">
            {/* Action Bar Header */}
            <div className="rounded-2xl border border-brand-dark/10 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage/10 px-2.5 py-0.5 text-xs font-bold text-brand-sage">
                      <Sparkles className="h-3.5 w-3.5" />
                      Analysis Completed
                    </span>
                    <span className="text-xs text-brand-dark/50">
                      ID: #{Math.abs(scannedData.productName.length * 4829).toString().slice(0, 5)}
                    </span>
                  </div>
                  <h1 className="font-display mt-1 text-xl font-bold text-brand-dark sm:text-2xl">
                    {scannedData.productName}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    disabled={isSavedToLibrary}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-xs ${
                      isSavedToLibrary
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'border border-brand-dark/20 bg-white text-brand-dark hover:border-brand-sage hover:bg-brand-cream/50'
                    }`}
                  >
                    {isSavedToLibrary ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-700" />
                        <span>Saved in Library</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4 text-brand-sage" />
                        <span>Save to Food Library</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogMeal}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-sage transition active:scale-[0.98]"
                  >
                    <Utensils className="h-4 w-4 text-amber-300" />
                    <span>Log as Meal Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-dark/15 bg-white p-2.5 text-xs font-medium text-brand-dark hover:bg-brand-cream/60 transition"
                    title="Scan another label"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column (5 Cols): Extracted Data Editor & Thumbnail Preview */}
              <div className="space-y-6 lg:col-span-5">
                {/* Photo Thumbnail / Label Snapshot Card */}
                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-brand-dark/10 bg-white shadow-sm">
                    <div className="border-b border-brand-dark/10 px-4 py-2.5 text-xs font-bold text-brand-dark flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-brand-sage" />
                        Scanned Packaging Snapshot
                      </span>
                      <span className="text-[11px] text-brand-dark/50 font-normal">
                        Original Photo
                      </span>
                    </div>
                    <div className="aspect-[16/10] w-full overflow-hidden bg-brand-dark/5">
                      <img
                        src={previewUrl}
                        alt="Scanned Food Label"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-brand-dark/10 bg-gradient-to-r from-brand-sage/15 to-brand-dark/5 p-4 text-xs text-brand-dark flex items-center gap-3">
                    <div className="rounded-xl bg-brand-sage/20 p-2 text-brand-sage">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Sample Preset Loaded</p>
                      <p className="text-brand-dark/70">
                        {scannedData.sampleLabel || 'Pre-verified nutritional package profile'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Extracted Data Editor Panel */}
                <ExtractedDataEditor
                  data={scannedData}
                  onUpdate={handleUpdateData}
                />

                {/* Helpful Philippine Tip */}
                <div className="rounded-2xl border border-brand-dark/10 bg-white p-4 text-xs text-brand-dark/70 flex items-start gap-2.5 shadow-xs">
                  <Info className="h-4 w-4 text-brand-sage shrink-0 mt-0.5" />
                  <p>
                    <strong>Tip sa pagpapakain:</strong> You can edit any value in the form above if your package has different numbers. Your verdict and price per calorie recalculate in real-time.
                  </p>
                </div>
              </div>

              {/* Right Column (7 Cols): Verdict Card & Alternative Suggestions */}
              <div className="space-y-6 lg:col-span-7">
                {/* Suitability Verdict Card */}
                <VerdictCard data={scannedData} activePet={activePet} />

                {/* Value & Budget Comparison + Smart Alternatives */}
                <AlternativeSuggestions
                  data={scannedData}
                  onSelectAlternative={handleSelectAlternative}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
