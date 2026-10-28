import { PawPrint, Users } from 'lucide-react'

const items = [
  { icon: <PawPrint size={28} />, text: 'Designed for cats and dogs.' },
  { icon: <Users size={28} />, text: 'Made for Filipino pet parents.' },
  {
    icon: <span className="text-2xl font-bold">₱</span>,
    text: 'Local pet information and Philippine peso-based comparisons.',
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-brand-dark text-white">
      <ul className="mx-auto grid max-w-7xl gap-6 px-6 py-6 md:grid-cols-3 md:divide-x md:divide-white/30">
        {items.map((item) => (
          <li key={item.text} className="flex items-center justify-center gap-3 px-4 text-sm">
            {item.icon}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}