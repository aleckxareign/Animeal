import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ThumbsUp,
  Activity,
} from 'lucide-react'
import type { Pet, FoodVerdict } from '../../types'
import type { ScannedFoodData } from './ScannerUpload'

type VerdictCardProps = {
  data: ScannedFoodData
  activePet?: Pet | null
}

export type VerdictDetails = {
  verdict: FoodVerdict
  label: string
  sublabel: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  icon: typeof CheckCircle
  score: number // 100-scale score
  positives: string[]
  cautions: string[]
  speciesNotice: string
}

export function computeVerdict(
  data: ScannedFoodData,
  activePet?: Pet | null,
): VerdictDetails {
  const { species } = data
  const p = data.protein ?? data.crudeProteinPct ?? 0
  const f = data.fat ?? data.crudeFatPct ?? 0
  const fib = data.fiber ?? data.crudeFiberPct ?? 0

  const positives: string[] = []
  const cautions: string[] = []
  let verdict: FoodVerdict = 'good'
  let score = 88

  if (species === 'dog') {
    // Dog standards (AAFCO: Min 18% adult, 22.5% growth)
    if (p >= 25) {
      positives.push(
        `High Crude Protein (${p}%): Well above the 18% adult minimum, excellent for lean muscle and active energy.`,
      )
      score += 5
    } else if (p >= 20) {
      positives.push(
        `Balanced Protein (${p}%): Meets standard AAFCO adult maintenance guidelines (>18% DM).`,
      )
    } else if (p >= 18) {
      cautions.push(
        `Borderline Protein (${p}%): Barely satisfies the minimum 18% adult requirement; may be insufficient for active or growing dogs.`,
      )
      score -= 15
      if (verdict === 'good') verdict = 'okay'
    } else {
      cautions.push(
        `Low Protein Warning (${p}%): Falls below the 18% standard for dogs. Can cause muscle loss or nutritional deficiency over time.`,
      )
      score -= 35
      verdict = 'review'
    }

    // Dog Fat (AAFCO: Min 5.5% adult, 8.5% growth)
    if (f >= 10 && f <= 18) {
      positives.push(
        `Optimal Fat Ratio (${f}%): Provides healthy essential fatty acids (Omega 3 & 6) without excessive calorie overload.`,
      )
    } else if (f > 22) {
      cautions.push(
        `High Fat Content (${f}%): Keep portions controlled to prevent unwanted weight gain or digestive sensitivity.`,
      )
      score -= 10
      if (verdict === 'good') verdict = 'okay'
    } else if (f < 8) {
      cautions.push(
        `Low Fat Ratio (${f}%): Palatability might be reduced and dog may require supplementary fatty acids for skin and coat vitality.`,
      )
      score -= 10
      if (verdict === 'good') verdict = 'okay'
    }

    // Dog Fiber (Standard 2-5%)
    if (fib <= 4.5) {
      positives.push(
        `Healthy Digestible Fiber (${fib}%): Optimal fiber level ensures firm stools and smooth gastrointestinal transit.`,
      )
    } else if (fib <= 6) {
      cautions.push(
        `Moderate Fiber (${fib}%): Slightly elevated; monitor stool consistency during diet transition.`,
      )
      score -= 5
      if (verdict === 'good') verdict = 'okay'
    } else {
      cautions.push(
        `Elevated Fiber Warning (${fib}%): High crude fiber (>6%) often indicates plant fillers or grain byproducts which reduce nutrient density.`,
      )
      score -= 25
      verdict = 'review'
    }
  } else {
    // Cat standards (Obligate Carnivore: AAFCO Min 26% adult, 30% kitten)
    if (p >= 32) {
      positives.push(
        `Excellent Carnivore Protein (${p}%): Generous animal-derived protein fitting obligate feline carnivorous physiology.`,
      )
      score += 8
    } else if (p >= 28) {
      positives.push(
        `Adequate Protein (${p}%): Meets the daily feline baseline (>26% dry matter minimum).`,
      )
    } else if (p >= 25) {
      cautions.push(
        `Sub-optimal Feline Protein (${p}%): Below recommended levels (>28%) for prime feline metabolic health.`,
      )
      score -= 20
      if (verdict === 'good') verdict = 'okay'
    } else {
      cautions.push(
        `Deficient Feline Protein (${p}%): Well below required obligate carnivore maintenance (min 26%). Unsuitable as sole feline diet.`,
      )
      score -= 40
      verdict = 'review'
    }

    // Cat Fat
    if (f >= 10 && f <= 20) {
      positives.push(
        `Healthy Feline Lipids (${f}%): Essential for fat-soluble vitamins and taurine assimilation.`,
      )
    } else if (f > 24) {
      cautions.push(
        `Rich Fat Density (${f}%): High calorie density; track portions carefully if indoor or neutered.`,
      )
      score -= 8
      if (verdict === 'good') verdict = 'okay'
    } else if (f < 9) {
      cautions.push(
        `Low Lipids (${f}%): Cats require ample dietary fats to maintain kidney and coat health.`,
      )
      score -= 15
      if (verdict === 'good') verdict = 'okay'
    }

    // Cat Fiber
    if (fib <= 4) {
      positives.push(
        `Low Fiber Ratio (${fib}%): Felines possess a short colon; low fiber maximizes nutrient bioavailability.`,
      )
    } else if (fib <= 5.5) {
      cautions.push(
        `Moderate Fiber (${fib}%): Helps reduce hairballs, though higher than wild feline diet.`,
      )
    } else {
      cautions.push(
        `Excessive Fiber for Cats (${fib}%): Feline biology struggles with fiber >6%, risking loose stool and poor absorption.`,
      )
      score -= 25
      verdict = 'review'
    }
  }

  // 1. Species toxicity check
  const targetSpecies = activePet?.species || species
  const toxicDog = ['chocolate', 'cacao', 'cocoa', 'xylitol', 'grape', 'raisin', 'onion', 'garlic', 'macadamia', 'avocado', 'caffeine', 'alcohol']
  const toxicCat = [...toxicDog, 'lily', 'lilies', 'raw fish']
  const toxicList = targetSpecies === 'cat' ? toxicCat : toxicDog

  const allText = [
    data.productName || '',
    data.product || '',
    data.brand || '',
    ...(data.ingredients || []),
    data.sampleLabel || '',
  ].join(' ').toLowerCase()

  const detectedToxic = toxicList.find((toxic) => allText.includes(toxic))
  if (detectedToxic) {
    cautions.unshift(
      `🚨 Toxic Ingredient Warning: Detected "${detectedToxic}", which is dangerous for ${targetSpecies}s! Do NOT feed this to your pet.`,
    )
    verdict = 'review'
    score = Math.min(score, 20)
  }

  // 2. AI Scanner Vision notes
  if (data.suitability === 'unsafe') {
    cautions.unshift(`AI Safety Alert: ${data.suitabilityNote || 'Potentially unsafe or toxic ingredients detected.'}`)
    verdict = 'review'
    score = Math.min(score, 20)
  } else if (data.suitability === 'caution') {
    cautions.push(`AI Formulation Note: ${data.suitabilityNote || 'Use caution or control portion sizes.'}`)
    if (verdict === 'good') verdict = 'okay'
    score -= 10
  } else if (data.suitability === 'safe' && data.suitabilityNote) {
    positives.push(`AI Analysis: ${data.suitabilityNote}`)
  }

  // 3. Active pet profile customization & dietary preferences
  let speciesNotice = `Evaluated against standard adult ${species} nutritional requirements.`
  if (activePet) {
    if (activePet.species !== species) {
      cautions.unshift(
        `Pet Species Mismatch: Scanned formula is formulated for a ${species}, but your active pet ${activePet.name} is a ${activePet.species}!`,
      )
      verdict = 'review'
      score -= 30
      speciesNotice = `Warning: Designed for a ${species}, but ${activePet.name} is a ${activePet.species}.`
    } else {
      speciesNotice = `Nutritional assessment customized for ${activePet.name} (${activePet.breed || activePet.species}, ${activePet.lifeStage}).`
      if (activePet.lifeStage === 'puppy' || activePet.lifeStage === 'kitten') {
        if (p < (species === 'dog' ? 24 : 30)) {
          cautions.push(
            `Growth Stage Caution: ${activePet.name} is in a growing stage (${activePet.lifeStage}) requiring higher protein than adult formulas.`,
          )
          if (verdict === 'good') verdict = 'okay'
          score -= 15
        }
      }
    }

    // Dietary preference checks
    if (activePet.dietaryPreference && activePet.dietaryPreference !== 'any') {
      const pref = activePet.dietaryPreference
      const cat = data.category
      if (pref === 'wet_only' && cat === 'dry') {
        cautions.push(
          `Diet Preference Note: ${activePet.name} prefers wet food only, but this is a dry food product.`,
        )
        if (verdict === 'good') verdict = 'okay'
        score -= 10
      } else if (pref === 'dry_only' && cat === 'wet') {
        cautions.push(
          `Diet Preference Note: ${activePet.name} prefers dry food only, but this is a wet food product.`,
        )
        if (verdict === 'good') verdict = 'okay'
        score -= 10
      } else if (pref === 'picky') {
        cautions.push(
          `Picky Eater Note: ${activePet.name} is a picky eater. We recommend introducing this in small mixed portions first.`,
        )
      } else if (pref === 'home_cooked') {
        positives.push(
          `Diet Context: Can be used to complement or rotate with ${activePet.name}'s home-cooked meals.`,
        )
      }
    }

    // Preferred foods match
    if (activePet.preferredFoods && activePet.preferredFoods.length > 0) {
      for (const prefFood of activePet.preferredFoods) {
        if (allText.includes(prefFood.toLowerCase().trim())) {
          positives.push(
            `Favorite Food Match: Contains "${prefFood}", which is one of ${activePet.name}'s favorite foods!`,
          )
          score += 5
        }
      }
    }

    // Avoided foods check
    if (activePet.avoidedFoods && activePet.avoidedFoods.length > 0) {
      for (const avoided of activePet.avoidedFoods) {
        if (allText.includes(avoided.toLowerCase().trim())) {
          cautions.unshift(
            `Avoided Ingredient Warning: Contains "${avoided}", which is in ${activePet.name}'s avoided foods list!`,
          )
          if (verdict === 'good') verdict = 'okay'
          score -= 20
        }
      }
    }
  } else {
    cautions.push(
      'General Safety Assessment: Register your pet profile to enable personalized life-stage, calorie, and food preference checks.',
    )
  }

  score = Math.max(15, Math.min(98, score))

  if (verdict === 'good') {
    return {
      verdict: 'good',
      label: 'Good Choice',
      sublabel: `Balanced & nutrient-dense for adult ${species}s`,
      badgeBg: 'bg-emerald-500',
      badgeText: 'text-white',
      badgeBorder: 'border-emerald-600',
      icon: CheckCircle,
      score,
      positives,
      cautions,
      speciesNotice,
    }
  }

  if (verdict === 'okay') {
    return {
      verdict: 'okay',
      label: 'Okay / Moderate',
      sublabel: `Meets minimum standards with average nutrient density`,
      badgeBg: 'bg-amber-500',
      badgeText: 'text-white',
      badgeBorder: 'border-amber-600',
      icon: AlertTriangle,
      score,
      positives,
      cautions,
      speciesNotice,
    }
  }

  return {
    verdict: 'review',
    label: 'Review Needed',
    sublabel: `Nutrient ratios fall below standard guidelines or contain dietary watchouts`,
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    badgeBorder: 'border-rose-700',
    icon: AlertCircle,
    score,
    positives,
    cautions,
    speciesNotice,
  }
}

export default function VerdictCard({ data, activePet }: VerdictCardProps) {
  if (data.isFoodItem === false) {
    return null
  }

  const details = computeVerdict(data, activePet)
  const IconComponent = details.icon

  // Estimated Nitrogen-Free Extract (Carbohydrates)
  const proteinVal = data.protein ?? data.crudeProteinPct ?? 0
  const fatVal = data.fat ?? data.crudeFatPct ?? 0
  const fiberVal = data.fiber ?? data.crudeFiberPct ?? 0
  const moistureVal = data.moisture ?? data.moisturePct ?? 10
  const estimatedAsh = 7 // Standard commercial pet food mineral ash ~7%
  const estimatedCarbs = Math.max(
    0,
    100 - (proteinVal + fatVal + fiberVal + moistureVal + estimatedAsh),
  )

  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-white p-5 sm:p-6 shadow-sm space-y-6">
      {/* Top Verdict Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-dark/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm text-white ${details.badgeBg}`}
          >
            <IconComponent className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                  details.verdict === 'good'
                    ? 'bg-emerald-100 text-emerald-800'
                    : details.verdict === 'okay'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                }`}
              >
                Suitability Verdict
              </span>
              <span className="text-xs text-brand-dark/50">
                Score: <strong className="text-brand-dark">{details.score}/100</strong>
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-brand-dark">
              {details.label}
            </h2>
            <p className="text-xs text-brand-dark/70 sm:text-sm">
              {details.sublabel}
            </p>
          </div>
        </div>

        {activePet && (
          <div className="flex items-center gap-2 rounded-xl bg-brand-cream/60 border border-brand-dark/10 px-3 py-2 self-start sm:self-auto">
            <span className="text-xl">{activePet.avatarEmoji || '🐾'}</span>
            <div className="text-xs">
              <p className="font-bold text-brand-dark">{activePet.name}</p>
              <p className="text-brand-dark/60 capitalize">
                {activePet.species} • {activePet.lifeStage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Species & Context Notice */}
      <div className="flex items-center gap-2 rounded-xl bg-brand-dark/5 px-3.5 py-2 text-xs font-medium text-brand-dark/80">
        <Activity className="h-4 w-4 text-brand-sage shrink-0" />
        <span>{details.speciesNotice}</span>
      </div>

      {/* Macronutrient Distribution Bar */}
      <div className="space-y-2 rounded-xl border border-brand-dark/10 bg-brand-cream/20 p-4">
        <div className="flex justify-between items-center text-xs font-bold text-brand-dark">
          <span>Macronutrient Breakdown (As Fed)</span>
          <span className="text-brand-dark/50 font-normal">Approximate profile</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-brand-dark/10">
          <div
            style={{ width: `${proteinVal}%` }}
            className="bg-brand-sage transition-all"
            title={`Protein: ${proteinVal}%`}
          />
          <div
            style={{ width: `${fatVal}%` }}
            className="bg-amber-500 transition-all"
            title={`Fat: ${fatVal}%`}
          />
          <div
            style={{ width: `${fiberVal}%` }}
            className="bg-amber-700 transition-all"
            title={`Fiber: ${fiberVal}%`}
          />
          <div
            style={{ width: `${moistureVal}%` }}
            className="bg-sky-400 transition-all"
            title={`Moisture: ${moistureVal}%`}
          />
          <div
            style={{ width: `${estimatedCarbs}%` }}
            className="bg-slate-300 transition-all"
            title={`Est. Carbs/Minerals: ${estimatedCarbs.toFixed(0)}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] text-brand-dark/70">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-sage" />
            <span>Protein ({proteinVal}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Fat ({fatVal}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-700" />
            <span>Fiber ({fiberVal}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>Moisture ({moistureVal}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span>Carbs/Ash (~{estimatedCarbs.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Detailed Nutritional Explanation */}
      <div className="space-y-4">
        {/* Positive Points */}
        {details.positives.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
              <span>Nutritional Highlights</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-brand-dark/80">
              {details.positives.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 p-3"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Caution Points */}
        {details.cautions.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Watchouts & Dietary Considerations</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-brand-dark/80">
              {details.cautions.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 p-3"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                    !
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Veterinary Disclaimer */}
      <div className="rounded-xl border border-brand-dark/15 bg-brand-cream/60 p-3.5 text-xs text-brand-dark/70">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-brand-dark/60 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-brand-dark">Nutritional Disclaimer:</strong>{' '}
            This automated verdict is based on standard guaranteed analysis and general AAFCO pet nutrition guidelines. It is not veterinary advice. Always consult your licensed veterinarian for pets with allergies, medical conditions, or specialized therapeutic diets.
          </p>
        </div>
      </div>
    </div>
  )
}
