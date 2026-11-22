import {
  ScanLine,
  Utensils,
  BookOpen,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  CalendarCheck,
  Heart,
  Scale,
  Award,
  Zap,
} from 'lucide-react'
import Button from '../ui/button'
import { Badge } from '../ui/badge'

export default function ToolShowcase() {
  return (
    <div id="how-it-works" className="relative scroll-mt-20">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: AI FOOD LABEL SCANNER (Flagship Feature)
          Background: White
      ───────────────────────────────────────────────────────────── */}
      <section id="ai-scanner" className="bg-white py-16 sm:py-20 lg:py-24 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left: Text & Features */}
            <div className="order-2 lg:order-1">
              <Badge
                variant="outline"
                className="mb-4 gap-1.5 rounded-full border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800"
              >
                <ScanLine className="size-3.5 shrink-0" />
                AI-Powered Label Scanner
              </Badge>

              <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18] text-balance">
                Snap a photo. <br />
                <span className="text-brand-sage">Decode ingredients instantly.</span>
              </h2>

              <p className="mt-4 text-base leading-relaxed text-brand-dark/80 sm:text-lg">
                Don&apos;t get misled by confusing marketing jargon. AniMeal&apos;s AI reads any pet food packaging label, verifies AAFCO nutritional adequacy, detects harmful additives, and calculates true cost-per-calorie in Philippine Pesos.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm sm:text-base text-brand-dark/85">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Instant OCR Extraction:</strong>{' '}
                    Extracts guaranteed protein, crude fat, fiber, and moisture directly off the bag.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">AAFCO Adequacy Verdict:</strong>{' '}
                    Identifies if recipes are Complete &amp; Balanced for Growth, Adult Maintenance, or All Life Stages.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Philippine Peso Value:</strong>{' '}
                    Calculates true cost per 100 kcal (₱) so you never overpay for cheap fillers.
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button to="/food-scanner" size="lg" className="bg-brand-sage hover:bg-brand-sage/90 font-semibold gap-2 shadow-sm">
                  <span>Try AI Food Scanner</span>
                  <ArrowRight className="size-4.5" />
                </Button>
                <span className="text-xs sm:text-sm font-medium text-brand-dark/65">
                  ✓ Supports photos &amp; live camera
                </span>
              </div>
            </div>

            {/* Right: High-Fidelity Interactive Mockup */}
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-lg rounded-3xl border border-emerald-900/10 bg-linear-to-b from-[#F2F7F2] to-white p-5 sm:p-7 shadow-xl">
                
                {/* Scanner Frame Viewport */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/90 p-4 text-white shadow-inner">
                  {/* Glowing Corner Guides */}
                  <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-emerald-400" />

                  {/* Animated Laser Beam line */}
                  <div className="relative my-2 h-0.5 w-full bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]" />

                  {/* Scanned Bag Preview Card */}
                  <div className="flex items-center gap-3.5 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-2xl">
                      🥩
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-bold text-emerald-100">Aozi Pure Natural Dog Kibble</p>
                        <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          98% MATCH
                        </span>
                      </div>
                      <p className="text-xs text-white/70">1.5 kg bag • Adult Formula • Salmon &amp; Beef</p>
                    </div>
                  </div>
                </div>

                {/* Instant Verification Verdict */}
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-900">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-sm text-emerald-950">
                      <ShieldCheck className="size-4.5 text-emerald-600" />
                      AAFCO Complete &amp; Balanced
                    </span>
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                      Approved
                    </span>
                  </div>
                  <p className="mt-1 text-emerald-800/80">
                    Meets full nutrient profiles for Adult Canine Maintenance. No synthetic dyes detected.
                  </p>
                </div>

                {/* Macro Breakdown Pills */}
                <div className="mt-3.5 grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
                  <div className="rounded-xl border border-border/60 bg-white p-2.5 shadow-2xs">
                    <p className="font-sans text-[11px] font-medium text-brand-dark/70">Crude Protein</p>
                    <p className="mt-1 font-bold text-brand-dark text-sm">26.0%</p>
                    <span className="text-[10px] font-semibold text-emerald-600">Optimal ✓</span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-white p-2.5 shadow-2xs">
                    <p className="font-sans text-[11px] font-medium text-brand-dark/70">Crude Fat</p>
                    <p className="mt-1 font-bold text-brand-dark text-sm">14.0%</p>
                    <span className="text-[10px] font-semibold text-emerald-600">Balanced</span>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 shadow-2xs">
                    <p className="font-sans text-[11px] font-medium text-emerald-900">Cost / 100 kcal</p>
                    <p className="mt-1 font-bold text-emerald-700 text-sm">₱2.75</p>
                    <span className="text-[10px] font-bold text-emerald-800">Best Value ★</span>
                  </div>
                </div>

                {/* Toxic Ingredient Checker */}
                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-brand-cream/80 px-3.5 py-2 text-xs text-brand-dark">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="size-3.5 text-brand-sage" />
                    Zero toxic preservatives (No BHA, BHT, or Ethoxyquin)
                  </span>
                  <span className="font-bold text-emerald-700">100% Safe</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: MEAL TRACKER & RER CALORIE BUDGETS
          Background: Warm Brand Cream
      ───────────────────────────────────────────────────────────── */}
      <section id="meal-tracker" className="bg-brand-cream/50 py-16 sm:py-20 lg:py-24 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left: High-Fidelity Interactive Mockup */}
            <div className="order-1">
              <div className="relative mx-auto max-w-lg rounded-3xl border border-amber-900/10 bg-white p-5 sm:p-7 shadow-xl">
                
                {/* Pet Profile Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-xs">
                      🐕
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark text-base">Bruno&apos;s Daily Plate</h4>
                      <p className="text-xs text-brand-dark/70">Golden Retriever • 12 kg • Neutered</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900 font-bold text-xs">
                    Target Met ✓
                  </Badge>
                </div>

                {/* Calorie Gauge */}
                <div className="mt-5 rounded-2xl bg-brand-dark p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Scientific RER Target
                    </span>
                    <span className="font-mono text-sm font-bold text-amber-300">
                      540 / 720 kcal
                    </span>
                  </div>

                  {/* Segmented Progress Bar */}
                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-amber-400 to-emerald-400 transition-all"
                      style={{ width: '75%' }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/75">
                    <span>Breakfast &amp; Lunch logged</span>
                    <span className="font-semibold text-emerald-300">180 kcal remaining for Dinner</span>
                  </div>
                </div>

                {/* Feeding Timeline Log */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-brand-cream/60 px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-800">
                        🌅
                      </span>
                      <div>
                        <p className="font-bold text-brand-dark">Morning Kibble (110g)</p>
                        <p className="text-[11px] text-brand-dark/65">7:30 AM • Logged by Mommy Maria</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-brand-dark">360 kcal</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-brand-cream/60 px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-800">
                        🍗
                      </span>
                      <div>
                        <p className="font-bold text-brand-dark">Boiled Chicken &amp; Pumpkin</p>
                        <p className="text-[11px] text-brand-dark/65">12:45 PM • Logged by Kuya Josh</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-brand-dark">180 kcal</span>
                  </div>
                </div>

                {/* Household Anti-Double Feeding Alert */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950">
                  <span className="text-base">👨‍👩‍👧‍👦</span>
                  <p className="leading-snug">
                    <strong>Shared Pinoy Household:</strong> Live sync prevents accidental duplicate feeding between family members.
                  </p>
                </div>

              </div>
            </div>

            {/* Right: Text & Features */}
            <div className="order-2">
              <Badge
                variant="outline"
                className="mb-4 gap-1.5 rounded-full border-amber-300 bg-amber-100/80 px-3.5 py-1 text-xs font-semibold text-amber-950"
              >
                <Utensils className="size-3.5 shrink-0" />
                Scientific Daily Nutrition
              </Badge>

              <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18] text-balance">
                Precision RER calorie targets. <br />
                <span className="text-brand-sage">No more feeding guesswork.</span>
              </h2>

              <p className="mt-4 text-base leading-relaxed text-brand-dark/80 sm:text-lg">
                Overfeeding and underfeeding lead to joint problems, lethargy, and diabetes. AniMeal calculates your pet&apos;s Resting Energy Requirements (RER) with clinical veterinary formulas and helps multi-caregiver families stay in sync.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm sm:text-base text-brand-dark/85">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Veterinary RER Formula:</strong>{' '}
                    Calibrated specifically for species metabolism, age stage, and spayed/neutered life status.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">&quot;Napakain ako&quot; Household Sync:</strong>{' '}
                    Instant shared log alerts your family the moment anyone feeds your pet.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Portion Scale Calculator:</strong>{' '}
                    Get gram-accurate portion sizes for dry kibble, raw toppers, or wet pouches.
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button to="/meal-tracker" size="lg" className="bg-brand-dark hover:bg-brand-dark/90 font-semibold gap-2 shadow-sm">
                  <span>Open Meal Tracker</span>
                  <ArrowRight className="size-4.5" />
                </Button>
                <span className="text-xs sm:text-sm font-medium text-brand-dark/65">
                  ✓ Instant pet profile setup
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: PHILIPPINE PET FOOD LIBRARY
          Background: White
      ───────────────────────────────────────────────────────────── */}
      <section id="food-library" className="bg-white py-16 sm:py-20 lg:py-24 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left: Text & Features */}
            <div className="order-2 lg:order-1">
              <Badge
                variant="outline"
                className="mb-4 gap-1.5 rounded-full border-brand-sage/30 bg-brand-sage/10 px-3.5 py-1 text-xs font-semibold text-brand-sage"
              >
                <BookOpen className="size-3.5 shrink-0" />
                Philippine Food Library
              </Badge>

              <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18] text-balance">
                Compare local pet food brands. <br />
                <span className="text-brand-sage">Shop smart with real numbers.</span>
              </h2>

              <p className="mt-4 text-base leading-relaxed text-brand-dark/80 sm:text-lg">
                Bag weight can be deceiving—cheaper brands often require feeding double the quantity due to low caloric density. Compare dozens of foods available in Philippine supermarkets and vet clinics by cost per 100 kcal and guaranteed nutrition.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm sm:text-base text-brand-dark/85">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-sage">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Cost Per 100 kcal Benchmark:</strong>{' '}
                    Discover the real value of Aozi, Special Dog, Royal Canin, Pedigree, and Vitality.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-sage">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Side-by-Side Macronutrients:</strong>{' '}
                    Evaluate crude protein and fat ratios side by side without marketing spin.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-sage/20 text-brand-sage">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Filter for Local Concerns:</strong>{' '}
                    Filter recipes for sensitive stomachs, hypoallergenic coats, shedding control, or puppies.
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button to="/food-library" size="lg" className="bg-brand-sage hover:bg-brand-sage/90 font-semibold gap-2 shadow-sm">
                  <span>Explore Food Library</span>
                  <ArrowRight className="size-4.5" />
                </Button>
                <span className="text-xs sm:text-sm font-medium text-brand-dark/65">
                  ✓ Over 50+ Philippine brands indexed
                </span>
              </div>
            </div>

            {/* Right: High-Fidelity Comparison Mockup */}
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-lg rounded-3xl border border-brand-sage/15 bg-linear-to-b from-brand-cream/60 to-white p-5 sm:p-7 shadow-xl">
                
                {/* Search / Filter Snippet */}
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-white px-3.5 py-2.5 text-xs text-brand-dark/60 shadow-2xs">
                  <span>🔍</span>
                  <span className="font-medium">Filter by brand, life stage, or budget...</span>
                </div>

                <div className="mt-3 flex gap-1.5 overflow-x-auto text-[11px] font-semibold text-brand-dark">
                  <span className="rounded-full bg-brand-sage text-white px-3 py-1">All Dogs</span>
                  <span className="rounded-full bg-brand-cream px-3 py-1">Kibble</span>
                  <span className="rounded-full bg-brand-cream px-3 py-1">High Protein</span>
                  <span className="rounded-full bg-brand-cream px-3 py-1">Under ₱3/100kcal</span>
                </div>

                {/* Comparison Card 1: Best Value Pick */}
                <div className="mt-4 rounded-2xl border border-emerald-300 bg-white p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 rounded-bl-xl bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    ★ Top Value Pick
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm sm:text-base">Aozi Pure Natural Organic</h4>
                      <p className="text-xs text-brand-dark/65">Adult Dog • 1.5 kg (₱195)</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-brand-dark/60">Nutrient Value</p>
                      <p className="font-mono text-base font-bold text-emerald-700">₱2.75 <span className="text-[11px] font-normal text-brand-dark/70">/ 100 kcal</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-semibold text-brand-dark/60">Guaranteed Protein</p>
                      <p className="font-mono text-base font-bold text-brand-dark">26.0%</p>
                    </div>
                  </div>
                </div>

                {/* Comparison Card 2: Standard Brand */}
                <div className="mt-3 rounded-2xl border border-border/80 bg-white/90 p-4 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm">Commercial Standard Kibble</h4>
                      <p className="text-xs text-brand-dark/65">Adult Dog • 1.5 kg (₱165)</p>
                    </div>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                      Standard
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-brand-dark/60">Nutrient Value</p>
                      <p className="font-mono text-sm font-bold text-amber-700">₱3.85 <span className="text-[11px] font-normal text-brand-dark/70">/ 100 kcal</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-semibold text-brand-dark/60">Guaranteed Protein</p>
                      <p className="font-mono text-sm font-bold text-brand-dark">18.0%</p>
                    </div>
                  </div>
                </div>

                {/* Savings Callout */}
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-medium">💡 Higher nutrient density saves up to:</span>
                  <span className="font-bold text-emerald-800 font-mono">₱450 / month</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: PET WELLNESS & HYDRATION TRACKING
          Background: Warm Brand Cream
      ───────────────────────────────────────────────────────────── */}
      <section id="pet-wellness" className="bg-brand-cream/50 py-16 sm:py-20 lg:py-24 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left: High-Fidelity Hydration & Wellness Mockup */}
            <div className="order-1">
              <div className="relative mx-auto max-w-lg rounded-3xl border border-sky-900/10 bg-white p-5 sm:p-7 shadow-xl">
                
                {/* Hydration Tracker Card */}
                <div className="rounded-2xl border border-sky-200 bg-linear-to-b from-sky-50/70 to-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700">
                        <Droplets className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-dark text-sm sm:text-base">Daily Hydration Target</h4>
                        <p className="text-xs text-brand-dark/70">Tropical Climate Kidney Protection</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-sky-300 bg-sky-100 text-sky-900 font-bold text-xs">
                      Optimal ✓
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-extrabold text-brand-dark">450 ml</span>
                    <span className="font-mono text-sm text-brand-dark/60">Target: 600 ml</span>
                  </div>

                  {/* Water Level Bar */}
                  <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-sky-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-sky-400 to-sky-600 shadow-xs"
                      style={{ width: '75%' }}
                    />
                  </div>

                  {/* Quick Water Logging Actions */}
                  <div className="mt-3.5 flex items-center justify-between text-xs">
                    <span className="text-brand-dark/70">Quick log:</span>
                    <div className="flex gap-2">
                      <span className="rounded-lg border border-sky-300 bg-white px-2.5 py-1 font-semibold text-sky-800 shadow-2xs hover:bg-sky-50 cursor-pointer">
                        +50 ml
                      </span>
                      <span className="rounded-lg border border-sky-300 bg-white px-2.5 py-1 font-semibold text-sky-800 shadow-2xs hover:bg-sky-50 cursor-pointer">
                        +150 ml (Bowl)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Weight Trend Metric Card */}
                <div className="mt-3.5 rounded-2xl border border-border/70 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-brand-dark/70">Weight Trend (Last 60 Days)</p>
                      <p className="font-mono text-lg font-bold text-brand-dark mt-0.5">12.0 kg <span className="text-xs font-normal text-emerald-600 font-sans">(-0.5kg healthy target)</span></p>
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <TrendingDown className="size-5" />
                    </div>
                  </div>

                  {/* Simulated Sparkline Trend Curve */}
                  <div className="mt-3 flex items-end justify-between gap-2 h-10 px-2 pt-2 border-b border-border/40">
                    <div className="w-1/4 bg-amber-200/80 rounded-t h-8" title="Month 1: 12.5 kg" />
                    <div className="w-1/4 bg-amber-300/80 rounded-t h-7" title="Month 2: 12.3 kg" />
                    <div className="w-1/4 bg-emerald-400 rounded-t h-6" title="Month 3: 12.0 kg" />
                    <div className="w-1/4 bg-emerald-500 rounded-t h-6" title="Current: 12.0 kg" />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-brand-dark/60 font-mono">
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span className="font-bold text-emerald-700">Goal Met</span>
                  </div>
                </div>

                {/* Upcoming Care Reminder Badge */}
                <div className="mt-3.5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="size-4 text-amber-700 shrink-0" />
                    <span>NexGard Spectra &amp; Deworming due in <strong>5 days</strong></span>
                  </div>
                  <span className="font-semibold text-amber-900 underline cursor-pointer">View</span>
                </div>

              </div>
            </div>

            {/* Right: Text & Features */}
            <div className="order-2">
              <Badge
                variant="outline"
                className="mb-4 gap-1.5 rounded-full border-sky-300 bg-sky-100 text-xs font-semibold text-sky-950"
              >
                <Droplets className="size-3.5 shrink-0" />
                Lifelong Wellness &amp; Hydration
              </Badge>

              <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18] text-balance">
                Protect kidney health. <br />
                <span className="text-brand-sage">Monitor weight milestones.</span>
              </h2>

              <p className="mt-4 text-base leading-relaxed text-brand-dark/80 sm:text-lg">
                Dehydration is one of the most common causes of feline urinary tract issues and canine kidney stress in warm climates. AniMeal keeps water targets clear, records weigh-in trends, and manages preventative medication schedules.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm sm:text-base text-brand-dark/85">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-sky-900">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Climate-Calibrated Hydration:</strong>{' '}
                    Calculates recommended ml based on whether your pet eats moisture-heavy wet food or dry kibble.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-sky-900">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Weight Milestone Curves:</strong>{' '}
                    Catch subtle weight gain or loss patterns early before they turn into veterinary emergencies.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-sky-900">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-brand-dark">Preventative Care Alerts:</strong>{' '}
                    Reminders for 5-in-1, anti-rabies, tick/flea treatments, and scheduled vet checkups.
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button to="/pet-wellness" size="lg" className="bg-brand-dark hover:bg-brand-dark/90 font-semibold gap-2 shadow-sm">
                  <span>Track Pet Wellness</span>
                  <ArrowRight className="size-4.5" />
                </Button>
                <span className="text-xs sm:text-sm font-medium text-brand-dark/65">
                  ✓ Simple 1-tap hydration logs
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
