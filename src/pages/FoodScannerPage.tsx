import { useState, useRef } from 'react'
import { Upload, ScanLine, Loader2, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'
import { scanLabel } from '../services/gemini'
import type { ScanResult } from '../types'

const SUITABILITY_CONFIG = {
  safe: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Safe for Pets ✅' },
  caution: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Use with Caution ⚠️' },
  unsafe: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Unsafe / Not Recommended 🚫' },
  unknown: { icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Could Not Determine' },
}

export default function FoodScannerPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Max 10 MB.')
      return
    }

    setError(null)
    setResult(null)

    // Preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Extract base64
    const buffer = await file.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
    )

    setIsLoading(true)
    try {
      const scanResult = await scanLabel(base64, file.type)
      setResult(scanResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Try a clearer photo.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleReset() {
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const suit = result ? SUITABILITY_CONFIG[result.suitability] : null

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-brand-dark">Food Scanner</h1>
        <p className="text-gray-500">
          Upload a photo of any pet food package and Mealie will analyze the label for you.
        </p>
      </div>

      {/* Upload zone */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-16 transition hover:border-brand-dark hover:bg-brand-cream/30"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={40} className="mb-4 text-gray-400" />
          <p className="mb-1 text-lg font-semibold text-brand-dark">
            Drop an image here or click to upload
          </p>
          <p className="text-sm text-gray-400">JPG, PNG, or WebP • Max 10 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      )}

      {/* Preview + Results */}
      {preview && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <img
              src={preview}
              alt="Uploaded label"
              className="mx-auto max-h-80 object-contain p-4"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 rounded-xl bg-white py-8 text-brand-dark">
              <Loader2 size={24} className="animate-spin" />
              <span className="font-medium">Scanning label with Mealie AI…</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          {result && suit && (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
              {/* Suitability badge */}
              <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${suit.bg} ${suit.border}`}>
                <suit.icon size={20} className={suit.color} />
                <span className={`font-semibold ${suit.color}`}>{suit.label}</span>
              </div>
              {result.suitabilityNote && (
                <p className="text-sm text-gray-600 italic">{result.suitabilityNote}</p>
              )}

              {/* Brand & Product */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">Brand</p>
                  <p className="font-semibold text-brand-dark">{result.brand}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">Product</p>
                  <p className="font-semibold text-brand-dark">{result.product}</p>
                </div>
              </div>

              {/* Nutrition grid */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-gray-400">Guaranteed Analysis</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: 'Calories', value: result.caloriesPer100g, unit: 'kcal/100g' },
                    { label: 'Protein', value: result.crudeProteinPct, unit: '%' },
                    { label: 'Fat', value: result.crudeFatPct, unit: '%' },
                    { label: 'Fiber', value: result.crudeFiberPct, unit: '%' },
                    { label: 'Moisture', value: result.moisturePct, unit: '%' },
                  ].map((n) => (
                    <div
                      key={n.label}
                      className="rounded-lg bg-brand-cream px-3 py-2 text-center"
                    >
                      <p className="text-xs text-gray-500">{n.label}</p>
                      <p className="text-lg font-bold text-brand-dark">
                        {n.value !== null && n.value !== undefined ? n.value : '—'}
                      </p>
                      <p className="text-xs text-gray-400">{n.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              {result.ingredients.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-gray-400">Ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-brand-dark"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset button */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-dark px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              <ScanLine size={18} />
              Scan Another Label
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
