import { useState, useMemo } from 'react'
import {
  Scale,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Trash2,
  Info,
  Stethoscope,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Pet, WeightLog } from '../../types'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { formatDate, timeAgo } from '../../utils/formatters'
import LogWeightModal from './LogWeightModal'

interface WeightTrackerProps {
  pet: Pet
}

export default function WeightTracker({ pet }: WeightTrackerProps) {
  const { getWeightHistory, removeWeightLog } = useApp()
  const { addToast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)

  // Retrieve raw history sorted by date ascending
  const rawHistory = getWeightHistory(pet.id)

  // If rawHistory is empty, we include the pet's registered weight as the baseline
  const history: WeightLog[] = useMemo(() => {
    if (rawHistory.length > 0) return rawHistory
    return [
      {
        id: 'initial-baseline',
        petId: pet.id,
        weight: pet.weight,
        date: pet.createdAt || new Date().toISOString(),
        notes: 'Initial profile weight',
      },
    ]
  }, [rawHistory, pet.id, pet.weight, pet.createdAt])

  // Latest log and previous log for delta
  const latestLog = history[history.length - 1]
  const previousLog = history.length > 1 ? history[history.length - 2] : null

  const currentDisplayWeight = latestLog ? latestLog.weight : pet.weight
  const weightDiff = previousLog ? currentDisplayWeight - previousLog.weight : 0
  const weightDiffPct = previousLog && previousLog.weight > 0
    ? (weightDiff / previousLog.weight) * 100
    : 0

  // 10% weight change in a 30-day window check
  const rapidWeightAlert = useMemo(() => {
    if (history.length < 2) return null

    const nowTime = new Date(latestLog.date).getTime()
    const thirtyDaysAgoTime = nowTime - 30 * 24 * 60 * 60 * 1000

    // Find logs within the last 30 days
    const recentLogs = history.filter((l) => new Date(l.date).getTime() >= thirtyDaysAgoTime)
    if (recentLogs.length < 2) return null

    const baselineRecent = recentLogs[0]
    const delta = latestLog.weight - baselineRecent.weight
    const pct = Math.abs(delta / baselineRecent.weight) * 100

    if (pct >= 10) {
      const days = Math.max(
        1,
        Math.round((nowTime - new Date(baselineRecent.date).getTime()) / (24 * 60 * 60 * 1000)),
      )
      return {
        pct: pct.toFixed(1),
        direction: delta > 0 ? 'gain' : 'loss',
        deltaKg: Math.abs(delta).toFixed(1),
        fromKg: baselineRecent.weight.toFixed(1),
        toKg: latestLog.weight.toFixed(1),
        days,
      }
    }
    return null
  }, [history, latestLog])

  const handleDeleteLog = (id: string) => {
    if (id === 'initial-baseline') {
      addToast('Cannot delete the initial profile weight.', 'warning')
      return
    }
    if (window.confirm('Are you sure you want to delete this weight log entry?')) {
      removeWeightLog(id)
      addToast('Weight entry deleted.', 'info')
    }
  }

  // Pure SVG Line Chart Metrics
  const chartConfig = useMemo(() => {
    const svgWidth = 600
    const svgHeight = 240
    const padding = { top: 25, right: 30, bottom: 40, left: 45 }
    const plotWidth = svgWidth - padding.left - padding.right
    const plotHeight = svgHeight - padding.top - padding.bottom

    const weights = history.map((h) => h.weight)
    let minW = Math.min(...weights)
    let maxW = Math.max(...weights)

    // Expand min/max range so line doesn't hit chart bounds
    const span = Math.max(1, maxW - minW)
    minW = Math.max(0, Math.floor((minW - span * 0.2) * 10) / 10)
    maxW = Math.ceil((maxW + span * 0.2) * 10) / 10
    if (minW === maxW) {
      minW = Math.max(0, minW - 1)
      maxW = maxW + 1
    }

    // Normalizing coordinates
    const points = history.map((item, idx) => {
      const x =
        history.length === 1
          ? padding.left + plotWidth / 2
          : padding.left + (idx / (history.length - 1)) * plotWidth
      const y =
        padding.top + plotHeight - ((item.weight - minW) / (maxW - minW)) * plotHeight
      return { x, y, item, idx }
    })

    // SVG path string
    let pathD = ''
    if (points.length === 1) {
      pathD = `M ${padding.left} ${points[0].y} L ${padding.left + plotWidth} ${points[0].y}`
    } else {
      pathD = points.reduce((acc, curr, i) => {
        return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`
      }, '')
    }

    // Area fill path string
    const areaD =
      points.length > 1
        ? `${pathD} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${
            points[0].x
          } ${padding.top + plotHeight} Z`
        : ''

    // Healthy target range band (±5% of pet baseline or latest weight)
    const targetW = pet.weight
    const targetBandLow = targetW * 0.95
    const targetBandHigh = targetW * 1.05
    const targetYHigh =
      padding.top + plotHeight - ((targetBandHigh - minW) / (maxW - minW)) * plotHeight
    const targetYLow =
      padding.top + plotHeight - ((targetBandLow - minW) / (maxW - minW)) * plotHeight
    const bandHeight = Math.max(4, targetYLow - targetYHigh)

    // Y-axis tick values (3-4 ticks)
    const yTicks = [
      minW,
      Math.round(((minW + (maxW - minW) * 0.5) * 10)) / 10,
      maxW,
    ]

    return {
      svgWidth,
      svgHeight,
      padding,
      plotWidth,
      plotHeight,
      minW,
      maxW,
      points,
      pathD,
      areaD,
      targetYHigh,
      bandHeight,
      yTicks,
    }
  }, [history, pet.weight])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Rapid Weight Change Alert (>10% change in 30 days) */}
      {rapidWeightAlert && (
        <div className="bg-red-50 border-2 border-brand-alert/40 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-alert/15 text-brand-alert flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-alert text-white">
                Veterinary Advisory
              </span>
              <h3 className="text-base font-bold text-brand-alert">
                Significant Weight {rapidWeightAlert.direction === 'gain' ? 'Gain' : 'Loss'} Detected ({rapidWeightAlert.pct}%)
              </h3>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {pet.name} has had a <span className="font-bold text-brand-dark">{rapidWeightAlert.direction} of {rapidWeightAlert.deltaKg} kg ({rapidWeightAlert.pct}%)</span> over the past {rapidWeightAlert.days} days ({rapidWeightAlert.fromKg} kg → {rapidWeightAlert.toKg} kg).
              A weight shift of 10% or more in a 30-day window can be an early indicator of thyroid imbalance, diabetes, kidney issues, metabolic shifts, or parasite concerns.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/#nearby-vets"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-dark text-white hover:bg-brand-sage transition-colors shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Find Nearby Vets
              </Link>
              <Link
                to="/ask-mealie"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Ask Mealie AI for Advice
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Weight Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Current Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-sage/10 text-brand-sage flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              {currentDisplayWeight.toFixed(1)}{' '}
              <span className="text-lg font-medium text-stone-500">kg</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {previousLog ? (
                weightDiff === 0 ? (
                  <span className="text-xs font-semibold text-stone-500">
                    ±0.0 kg vs prior weigh-in
                  </span>
                ) : weightDiff > 0 ? (
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{weightDiff.toFixed(1)} kg (+{weightDiffPct.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {weightDiff.toFixed(1)} kg ({weightDiffPct.toFixed(1)}%)
                  </span>
                )
              ) : (
                <span className="text-xs text-stone-400">Baseline registration weight</span>
              )}
            </div>
          </div>
          <div className="text-xs text-stone-400 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span>Last weighed:</span>
            <span className="font-medium text-stone-600">
              {latestLog ? timeAgo(latestLog.date) : 'Today'}
            </span>
          </div>
        </div>

        {/* Target & Ideal Range Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Ideal Target Band
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              {(pet.weight * 0.95).toFixed(1)} - {(pet.weight * 1.05).toFixed(1)}{' '}
              <span className="text-lg font-medium text-stone-500">kg</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              ±5% healthy buffer for {pet.species} ({pet.breed || 'standard breed'})
            </p>
          </div>
          <div className="text-xs text-stone-400 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span>Status:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              In Target Range
            </span>
          </div>
        </div>

        {/* Action Button Card */}
        <div className="bg-linear-to-br from-brand-dark to-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-brand-cream mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Regular Monitoring
            </div>
            <h4 className="text-lg font-bold">Log New Weigh-In</h4>
            <p className="text-xs text-stone-300 mt-1">
              Weigh {pet.name} weekly or monthly to keep track of growth & diet response.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-brand-sage hover:bg-emerald-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Log Weight
          </button>
        </div>
      </div>

      {/* Weight Trend Chart Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-sage" />
              Weight Trend Over Time
            </h3>
            <p className="text-xs text-stone-500">
              Interactive timeline of recorded weights with healthy range shading
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <div className="w-3 h-3 rounded-full bg-brand-sage" />
              <span>Logged Weight</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <div className="w-3 h-3 rounded-xs bg-emerald-500/20 border border-emerald-400" />
              <span>Target Band (±5%)</span>
            </div>
          </div>
        </div>

        {/* Pure SVG Chart */}
        <div className="relative w-full overflow-hidden bg-stone-50/60 rounded-xl p-2 border border-stone-200/60">
          <svg
            viewBox={`0 0 ${chartConfig.svgWidth} ${chartConfig.svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#44632f" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#44632f" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Range Shaded Area */}
            <rect
              x={chartConfig.padding.left}
              y={Math.max(chartConfig.padding.top, chartConfig.targetYHigh)}
              width={chartConfig.plotWidth}
              height={chartConfig.bandHeight}
              fill="#10b981"
              fillOpacity="0.08"
              stroke="#10b981"
              strokeWidth="0.5"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
            />

            {/* Grid Lines & Y-ticks */}
            {chartConfig.yTicks.map((val, idx) => {
              const y =
                chartConfig.padding.top +
                chartConfig.plotHeight -
                ((val - chartConfig.minW) / (chartConfig.maxW - chartConfig.minW)) *
                  chartConfig.plotHeight
              return (
                <g key={idx}>
                  <line
                    x1={chartConfig.padding.left}
                    y1={y}
                    x2={chartConfig.padding.left + chartConfig.plotWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartConfig.padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] fill-stone-400 font-medium"
                  >
                    {val.toFixed(1)}kg
                  </text>
                </g>
              )
            })}

            {/* Shaded Area under Curve */}
            {chartConfig.areaD && (
              <path d={chartConfig.areaD} fill="url(#weightAreaGrad)" />
            )}

            {/* Main Weight Curve Line */}
            <path
              d={chartConfig.pathD}
              fill="none"
              stroke="#44632f"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {chartConfig.points.map((pt, i) => {
              const isHovered = hoveredPointIndex === i
              return (
                <g
                  key={pt.item.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(i)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  onClick={() => setHoveredPointIndex(i)}
                >
                  {/* Invisible hit target for mobile tapping */}
                  <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                  {/* Outer ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 5}
                    fill="#ffffff"
                    stroke="#44632f"
                    strokeWidth={isHovered ? 3 : 2.5}
                    className="transition-all duration-150"
                  />

                  {/* Date Label on X Axis */}
                  <text
                    x={pt.x}
                    y={chartConfig.padding.top + chartConfig.plotHeight + 20}
                    textAnchor="middle"
                    className={`text-[10px] transition-colors ${
                      isHovered ? 'fill-brand-dark font-bold' : 'fill-stone-400 font-medium'
                    }`}
                  >
                    {formatDate(pt.item.date).split(',')[0]}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Floating Tooltip Card */}
          {hoveredPointIndex !== null && chartConfig.points[hoveredPointIndex] && (
            <div
              className="absolute z-10 p-3 bg-brand-dark text-white rounded-xl shadow-lg text-xs pointer-events-none transition-all duration-150"
              style={{
                left: `${(chartConfig.points[hoveredPointIndex].x / chartConfig.svgWidth) * 100}%`,
                top: `${(chartConfig.points[hoveredPointIndex].y / chartConfig.svgHeight) * 100}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <div className="font-bold text-sm text-brand-cream">
                {chartConfig.points[hoveredPointIndex].item.weight.toFixed(1)} kg
              </div>
              <div className="text-stone-300 text-[11px]">
                {formatDate(chartConfig.points[hoveredPointIndex].item.date)}
              </div>
              {chartConfig.points[hoveredPointIndex].item.notes && (
                <div className="mt-1 text-[11px] text-amber-200 border-t border-white/20 pt-1 italic">
                  &ldquo;{chartConfig.points[hoveredPointIndex].item.notes}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weight History Table / List */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              Weight History & Logs
            </h3>
            <p className="text-xs text-stone-500">Comprehensive list of weigh-in measurements</p>
          </div>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
            {history.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Change</th>
                <th className="pb-3">Notes</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[...history].reverse().map((entry, revIdx) => {
                const originalIdx = history.length - 1 - revIdx
                const prev = originalIdx > 0 ? history[originalIdx - 1] : null
                const diff = prev ? entry.weight - prev.weight : 0

                return (
                  <tr key={entry.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-medium text-brand-dark">
                      <div>{formatDate(entry.date)}</div>
                      <div className="text-[11px] text-stone-400 font-normal">
                        {timeAgo(entry.date)}
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-sm text-brand-dark">
                      {entry.weight.toFixed(1)} kg
                    </td>
                    <td className="py-3.5">
                      {prev ? (
                        diff === 0 ? (
                          <span className="text-stone-400">0.0 kg</span>
                        ) : diff > 0 ? (
                          <span className="text-amber-700 font-semibold">
                            +{diff.toFixed(1)} kg
                          </span>
                        ) : (
                          <span className="text-teal-700 font-semibold">
                            {diff.toFixed(1)} kg
                          </span>
                        )
                      ) : (
                        <span className="text-stone-400 italic">Baseline</span>
                      )}
                    </td>
                    <td className="py-3.5 text-stone-600 max-w-xs truncate">
                      {entry.notes || <span className="text-stone-300 italic">—</span>}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      {entry.id !== 'initial-baseline' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(entry.id)}
                          className="p-1.5 text-stone-400 hover:text-brand-alert hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Weight Modal */}
      <LogWeightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={pet.id}
        petName={pet.name}
        currentWeight={currentDisplayWeight}
      />
    </div>
  )
}
