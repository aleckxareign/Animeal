import { useState, useRef, useEffect } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import {
  Camera,
  UploadCloud,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  X,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { Species, FoodCategory, ScanResult, Pet } from '../../types'
import { api } from '../../services/api'
import { scanLabel } from '../../services/gemini'
import { supabaseStorage } from '../../services/supabase-storage'
import { useToast } from '../../context/ToastContext'

export type ScannedFoodData = ScanResult & {
  species: Species
  category: FoodCategory
  imageUrl?: string
  sampleLabel?: string
}

type ScannerUploadProps = {
  onStartScan: (data: ScannedFoodData, previewUrl?: string) => void
  activePet?: Pet | null
}

export default function ScannerUpload({ onStartScan, activePet }: ScannerUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { addToast } = useToast()

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  // Start live camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera()
    setCameraError(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser. Please upload a photo instead.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err)
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your browser address bar.'
          : 'Unable to start camera. Please ensure no other app is using your webcam, or upload an image.'
      setCameraError(errorMsg)
    }
  }

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Open camera modal
  const handleOpenCamera = () => {
    setIsCameraOpen(true)
    startCamera(facingMode)
  }

  // Close camera modal
  const handleCloseCamera = () => {
    stopCamera()
    setIsCameraOpen(false)
    setCameraError(null)
  }

  // Switch between front and back cameras
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    startCamera(nextMode)
  }

  // Snap photo from live video feed
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || isCapturing) return

    setIsCapturing(true)
    const video = videoRef.current

    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas context unavailable')
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setUploadError('Failed to capture photo. Please try again.')
            setIsCapturing(false)
            return
          }

          const file = new File([blob], `label-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })

          handleCloseCamera()
          setIsCapturing(false)
          processFile(file)
        },
        'image/jpeg',
        0.92
      )
    } catch (err) {
      console.error('Snapshot capture error:', err)
      setUploadError('Failed to take photo. Please upload directly.')
      setIsCapturing(false)
    }
  }

  // Helper to resize/compress images on an HTML <canvas> (max width 1024px, JPEG quality 0.8)
  const compressImage = (
    file: File | Blob,
    maxWidth = 1024,
    quality = 0.8
  ): Promise<{ base64: string; mimeType: string; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read image file.'))
      reader.onload = (e) => {
        const img = new Image()
        img.onerror = () => reject(new Error('Failed to parse image data.'))
        img.onload = () => {
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable.'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const mimeType = 'image/jpeg'
          const dataUrl = canvas.toDataURL(mimeType, quality)
          const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
          resolve({ base64, mimeType, dataUrl })
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Maps scan result fields from Gemini cleanly to ScannedFoodData
  const mapScanResultToScannedData = (
    scanRes: Partial<ScanResult> & Record<string, unknown>,
    defaultName: string,
    imageUrl: string,
    species: Species = 'dog'
  ): ScannedFoodData => {
    const isFoodItem = scanRes.isFoodItem !== false
    const detectedCat = scanRes.detectedCategory as ScannedFoodData['detectedCategory']

    if (!isFoodItem || detectedCat === 'unrelated_image') {
      return {
        productName: String(scanRes.product || scanRes.productName || 'Not a food item'),
        product: String(scanRes.product || scanRes.productName || 'Not a food item'),
        brand: String(scanRes.brand || 'N/A'),
        species,
        category: 'dry',
        calories: null,
        caloriesPer100g: null,
        protein: null,
        crudeProteinPct: null,
        fat: null,
        crudeFatPct: null,
        fiber: null,
        crudeFiberPct: null,
        moisture: null,
        moisturePct: null,
        packageWeight: null,
        price: null,
        confidence: 'low',
        suitability: 'unknown',
        suitabilityNote: String(
          scanRes.suitabilityNote ||
            'Hindi ito pagkain ng alaga o food product. Mangyaring mag-upload ng malinaw na litrato ng pet food packaging o pagkain.'
        ),
        ingredients: [],
        isFoodItem: false,
        detectedCategory: 'unrelated_image',
        imageUrl,
      }
    }

    const productName = String(scanRes.product || scanRes.productName || defaultName || 'Scanned Pet Food')
    const brand = String(scanRes.brand || 'Detected Brand')
    const calories =
      typeof scanRes.caloriesPer100g === 'number'
        ? scanRes.caloriesPer100g
        : typeof scanRes.calories === 'number'
          ? scanRes.calories
          : null
    const protein =
      typeof scanRes.crudeProteinPct === 'number'
        ? scanRes.crudeProteinPct
        : typeof scanRes.protein === 'number'
          ? scanRes.protein
          : null
    const fat =
      typeof scanRes.crudeFatPct === 'number'
        ? scanRes.crudeFatPct
        : typeof scanRes.fat === 'number'
          ? scanRes.fat
          : null
    const fiber =
      typeof scanRes.crudeFiberPct === 'number'
        ? scanRes.crudeFiberPct
        : typeof scanRes.fiber === 'number'
          ? scanRes.fiber
          : null
    const moisture =
      typeof scanRes.moisturePct === 'number'
        ? scanRes.moisturePct
        : typeof scanRes.moisture === 'number'
          ? scanRes.moisture
          : null
    const packageWeight = typeof scanRes.packageWeight === 'number' ? scanRes.packageWeight : null
    const price = typeof scanRes.price === 'number' ? scanRes.price : null
    const confidence = (scanRes.confidence as 'high' | 'medium' | 'low') || 'high'
    const suitability = scanRes.suitability as 'safe' | 'caution' | 'unsafe' | 'unknown' | undefined
    const suitabilityNote = typeof scanRes.suitabilityNote === 'string' ? scanRes.suitabilityNote : undefined
    const ingredients = Array.isArray(scanRes.ingredients) ? (scanRes.ingredients as string[]) : undefined

    return {
      productName,
      product: productName,
      brand,
      species,
      category: 'dry',
      calories,
      caloriesPer100g: calories,
      protein,
      crudeProteinPct: protein,
      fat,
      crudeFatPct: fat,
      fiber,
      crudeFiberPct: fiber,
      moisture,
      moisturePct: moisture,
      packageWeight,
      price,
      confidence,
      suitability,
      suitabilityNote,
      ingredients,
      isFoodItem: true,
      detectedCategory: detectedCat === 'whole_or_human_food' ? 'whole_or_human_food' : 'pet_food_label',
      imageUrl,
    }
  }

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please choose a smaller photo.')
      return
    }

    setUploadError(null)
    setIsAnalyzing(true)

    try {
      // Compress/resize on canvas (max width 1024px, JPEG quality 0.8) for fast 1-2s vision scans
      const { base64, mimeType, dataUrl } = await compressImage(file, 1024, 0.8)

      // Upload to Supabase Storage in parallel if configured
      const storageUrlPromise = supabaseStorage.uploadImage(file, 'food-labels', 'scans').catch(() => null)

      const petSpecies = activePet?.species || 'dog'
      const fallbackName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Scanned Food'

      let scanRes: Partial<ScanResult> | null = null

      // 1. Try real server-side Gemini AI vision extraction proxy first
      try {
        const proxyRes = await api.scanLabelProxy(base64, mimeType, activePet || undefined)
        if (proxyRes && (proxyRes.brand || proxyRes.product || proxyRes.productName || proxyRes.isFoodItem !== undefined)) {
          scanRes = proxyRes as Partial<ScanResult>
        }
      } catch (proxyErr) {
        console.warn('Server-side scan proxy failed, attempting client-side fallback:', proxyErr)
      }

      // 2. Client-side scanLabel fallback if server proxy fails or returned empty
      if (!scanRes) {
        try {
          const petProfile = activePet
            ? {
                name: activePet.name,
                species: activePet.species,
                breed: activePet.breed || 'Pet',
                ageMonths: (activePet.age || 1) * 12,
                weightKg: activePet.weight || 10,
                lifeStage: activePet.lifeStage,
                neutered: activePet.neutered,
                dailyCalorieTarget: activePet.dailyCalorieTarget,
                dietaryPreference: activePet.dietaryPreference,
                preferredFoods: activePet.preferredFoods,
                avoidedFoods: activePet.avoidedFoods,
              }
            : null

          scanRes = await scanLabel(base64, mimeType, petProfile)
        } catch (clientErr) {
          console.warn('Client-side scanLabel fallback failed:', clientErr)
        }
      }

      // 3. If both server proxy and client direct scan failed, report a real error (no mock/fake data!)
      if (!scanRes) {
        const errorMsg = 'Could not analyze food label. Please ensure the image is clear and well-lit, or try again.'
        setUploadError(errorMsg)
        addToast(errorMsg, 'error')
        setIsAnalyzing(false)
        return
      }

      const cloudUrl = await storageUrlPromise
      const finalUrl = cloudUrl || dataUrl

      const mappedData = mapScanResultToScannedData(scanRes, fallbackName, finalUrl, petSpecies)
      setIsAnalyzing(false)
      onStartScan(mappedData, finalUrl)
    } catch (err: unknown) {
      console.error('Processing image error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to process image.'
      setUploadError(errorMsg)
      addToast(errorMsg, 'error')
      setIsAnalyzing(false)
    }
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

      {isAnalyzing && (
        <div className="animate-fade-in flex items-center justify-center gap-3 rounded-2xl border border-brand-sage/30 bg-brand-sage/10 p-5 text-sm text-brand-dark shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-brand-sage shrink-0" />
          <div>
            <p className="font-bold text-base">Analyzing packaging with Gemini Vision AI...</p>
            <p className="text-xs text-brand-dark/70">Extracting guaranteed analysis & suitability (~1–2s)</p>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-brand-alert/20 bg-brand-alert/10 p-4 text-sm text-brand-alert">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{uploadError}</span>
        </div>
      )}

      {/* Main Upload Area */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Mode A: Real Live Camera Capture */}
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
                <span>Instant camera capture on desktop, mobile & tablet</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" />
                <span>Live viewfinder with auto nutrient alignment guide</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleOpenCamera}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-sage px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-sage/90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Open Camera</span>
            </button>

            {/* Hidden native input fallback for devices where user wants camera roll */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Mode B: Drag & Drop / File Picker */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isAnalyzing) fileInputRef.current?.click()
          }}
          className={`group flex cursor-pointer flex-col justify-between rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isAnalyzing ? 'opacity-50 pointer-events-none' : ''
          } ${
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

      {/* ── LIVE CAMERA VIEWFINDER MODAL ── */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-slate-950 border border-white/10 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-2.5 text-white">
                <Camera className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm sm:text-base">Live Label Scanner</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  title="Switch camera"
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Video Viewfinder Area */}
            <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-8 text-center text-white max-w-md space-y-4">
                  <div className="size-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <AlertCircle className="size-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">{cameraError}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseCamera()
                        fileInputRef.current?.click()
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-sage text-white text-xs font-semibold hover:bg-brand-sage/90 transition"
                    >
                      Upload Image Instead
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />

                  {/* Viewfinder Target Framing Overlay */}
                  <div className="pointer-events-none absolute inset-6 sm:inset-10 flex flex-col items-center justify-between border-2 border-dashed border-emerald-400/70 rounded-2xl p-4">
                    <div className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-xs flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      Align Guaranteed Analysis & Weight
                    </div>

                    <p className="text-[11px] text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs text-center">
                      Hold still for clear nutrient detection
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer with Shutter Action */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-white/10">
              <button
                type="button"
                onClick={handleCloseCamera}
                className="text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>

              {!cameraError && (
                <button
                  type="button"
                  disabled={isCapturing}
                  onClick={handleCaptureSnapshot}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <div className="size-3.5 rounded-full bg-red-600 animate-pulse" />
                  <span>{isCapturing ? 'Processing...' : 'Snap Photo'}</span>
                </button>
              )}

              <div className="w-12 text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                  {facingMode === 'environment' ? 'Rear' : 'Front'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
