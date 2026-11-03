import { PawPrint, Users } from 'lucide-react'

const items = [
  {
    icon: <PawPrint className="size-6 text-brand-sage/80 shrink-0" />,
    title: 'Species Optimized',
    desc: 'Calibrated formulas tailored specifically for canine and feline nutrition.',
  },
  {
    icon: <Users className="size-6 text-brand-sage/80 shrink-0" />,
    title: 'Shared Pinoy Households',
    desc: 'Prevent duplicate feeding across family members with instant "Napakain ako" logs.',
  },
  {
    icon: <span className="flex size-7 items-center justify-center rounded-lg bg-brand-sage/20 font-bold text-lg text-brand-cream shrink-0 font-mono">₱</span>,
    title: 'Peso-Based Value Metrics',
    desc: 'Compare food options by cost per 100 kcal to stretch your monthly pet-care budget.',
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-brand-dark text-white border-y border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12 py-10">
        <ul className="grid gap-8 md:grid-cols-3 md:divide-x md:divide-white/15">
          {items.map((item, idx) => (
            <li key={item.title} className={`flex items-start gap-5 ${idx > 0 ? 'md:pl-8' : ''}`}>
              <div className="mt-1 flex size-13 items-center justify-center rounded-2xl bg-white/10 border border-white/15 shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-lg sm:text-xl text-brand-cream">{item.title}</h4>
                <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
