import { PawPrint, Users } from 'lucide-react'

const items = [
  {
    icon: <PawPrint className="size-6 text-white shrink-0" />,
    title: 'Species Optimized',
    desc: 'Calibrated formulas tailored specifically for canine and feline nutrition.',
  },
  {
    icon: <Users className="size-6 text-white shrink-0" />,
    title: 'Shared Pinoy Households',
    desc: 'Prevent duplicate feeding across family members with instant "Napakain ako" logs.',
  },
  {
    icon: <span className="flex size-7 items-center justify-center rounded-lg bg-brand-sage/20 font-bold text-lg text-brand-cream shrink-0 font-mono">₱</span>,
    title: 'Peso-Based Value Metrics',
    desc: 'Compare food options by cost per 100 kcal to stretch your monthly pet-care budget.',
  },
]

export default function TrustStrip({ className = '' }: { className?: string }) {
  return (
    <section className={`bg-brand-dark text-white border-t border-white/10 mt-auto ${className}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-5 sm:py-6">
        <ul className="grid gap-6 lg:grid-cols-3 lg:divide-x lg:divide-white/15">
          {items.map((item, idx) => (
            <li key={item.title} className={`flex items-start gap-3 ${idx > 0 ? 'lg:pl-6' : ''}`}>
              <div className="mt-1 flex size-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15 shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-base text-brand-cream">{item.title}</h4>
                <p className="mt-1 text-sm text-white/75 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
