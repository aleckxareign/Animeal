import { useState } from 'react'
import { X, HelpCircle, PhoneCall, AlertTriangle, BookOpen, ChevronDown, Mail, ExternalLink, ShieldAlert } from 'lucide-react'

interface HelpCenterModalProps {
  isOpen: boolean
  onClose: () => void
}

const FAQS = [
  {
    q: 'How does Animeal calculate Resting Energy Requirement (RER)?',
    a: 'Animeal uses the veterinary gold-standard formula: RER (kcal/day) = 70 × (Weight in kg)^0.75. We then multiply this by your pet\'s life stage, neuter status, and activity level multiplier to calculate their Daily Energy Requirement (DER).',
  },
  {
    q: 'How does the AI Food Label Scanner work?',
    a: 'Snap or upload a photo of your pet food packaging. Animeal extracts the Guaranteed Analysis (Crude Protein, Crude Fat, Moisture, Crude Fiber) and Net Weight, compares them against AAFCO nutritional standards, and calculates cost-per-calorie in Philippine Pesos (₱).',
  },
  {
    q: 'How does Shared Household work?',
    a: 'You can invite family members, roommates, or pet sitters to your household. Everyone can log feedings ("Napakain ko na!"), check who fed the pet last, and view schedule reminders in real-time to prevent accidental double-feeding.',
  },
  {
    q: 'Are the veterinary recommendations final medical advice?',
    a: 'Animeal and Mealie AI provide evidence-grounded nutritional and wellness guidance, but do not replace professional physical examinations by a licensed veterinarian. For poisoning or medical emergencies, consult a clinic immediately.',
  },
]

const EMERGENCY_HOTLINES = [
  {
    name: 'PAWS Animal Rehabilitation Center (PARC)',
    location: 'Katipunan Valley, Quezon City',
    phone: '(02) 8475-1688',
    hours: 'Monday – Saturday: 10am – 5pm',
    badge: 'Animal Welfare & Rescue',
  },
  {
    name: 'PSPCA Manila Animal Hospital',
    location: 'R. Papa St, Sampaloc, Manila',
    phone: '(02) 8735-7185',
    hours: '24/7 Emergency Veterinary Care',
    badge: '24/7 Emergency Clinic',
  },
  {
    name: 'Biyaya Animal Care Hotline',
    location: 'Mandaluyong & QC Branches',
    phone: '0917-543-3444',
    hours: 'Daily: 8am – 8pm',
    badge: 'Affordable Pet Healthcare',
  },
  {
    name: 'Manila Veterinary Inspection Board',
    location: 'Vitas, Tondo, Manila',
    phone: '(02) 8527-4952',
    hours: 'Monday – Friday: 8am – 5pm',
    badge: 'Anti-Rabies & Public Vet',
  },
]

export default function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-card dark:bg-card border border-border dark:border-border shadow-2xl overflow-hidden flex flex-col max-h-[min(90vh,calc(100dvh-2rem))]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 dark:border-border bg-muted/50 dark:bg-card/40">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-brand-sage/10 text-brand-accent flex items-center justify-center">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground dark:text-white">Help Center & Emergency Guides</h2>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">Veterinary hotlines & platform guides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-muted-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-slate-800 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Emergency Alert Section */}
          <div className="rounded-2xl border border-red-200 dark:border-red-400/30 dark:border-red-900/50 bg-red-50/60 dark:bg-red-500/15 dark:bg-red-950/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 dark:text-red-400 font-bold text-sm">
              <ShieldAlert className="size-5" />
              <span>🚨 Philippine Emergency Veterinary Contacts</span>
            </div>
            <p className="text-xs text-red-800/80 dark:text-red-300 dark:text-red-300 leading-relaxed">
              In cases of chocolate/onion poisoning, heatstroke, or acute physical trauma, reach out to these emergency facilities immediately:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {EMERGENCY_HOTLINES.map((hotline) => (
                <div
                  key={hotline.name}
                  className="rounded-xl border border-red-200/80 dark:border-red-400/30 dark:border-red-900/40 bg-card dark:bg-card p-3 space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-300 dark:text-red-400 bg-red-100 dark:bg-red-500/15 dark:bg-red-950 px-1.5 py-0.5 rounded">
                      {hotline.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground dark:text-white leading-tight">
                    {hotline.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground dark:text-muted-foreground">{hotline.location}</p>
                  <a
                    href={`tel:${hotline.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-accent hover:underline pt-0.5"
                  >
                    <PhoneCall className="size-3" />
                    <span>{hotline.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground dark:text-white">
              <BookOpen className="size-4 text-brand-accent" />
              <span>Frequently Asked Questions</span>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-border dark:border-border overflow-hidden bg-muted/40 dark:bg-card/40 transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs sm:text-sm font-bold text-foreground dark:text-white hover:bg-muted dark:hover:bg-slate-800 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform ${
                          isOpen ? 'rotate-180 text-brand-accent' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed border-t border-border/60 dark:border-border pt-2.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contact Support */}
          <div className="rounded-2xl bg-background/60 dark:bg-card/60 border border-border/80 dark:border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground dark:text-white flex items-center gap-1.5">
                <Mail className="size-3.5 text-brand-accent" />
                <span>Need Personalized Guidance?</span>
              </p>
              <p className="text-[11px] text-muted-foreground dark:text-muted-foreground">
                Contact our Pinoy pet care support team or ask Mealie AI anytime.
              </p>
            </div>
            <a
              href="mailto:hello@animeal.ph"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-sage text-white text-xs font-bold shadow-xs hover:bg-brand-sage/90 transition"
            >
              <span>Email Support</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 dark:border-border flex justify-end bg-muted/50 dark:bg-card/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-muted dark:bg-card text-xs font-bold text-foreground dark:text-white hover:bg-accent transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

