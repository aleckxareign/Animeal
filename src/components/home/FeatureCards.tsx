import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { features } from '../../data/features'

export default function FeatureCards() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="Explore Animeal"
          title="A closer look at smarter pet care."
          subtitle="Discover the tools that help you plan meals, understand pet food, and keep track of your pet's health."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="grid gap-6 rounded-lg border-2 border-gray-200 bg-white p-6 sm:grid-cols-2"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sage-light/30 text-brand-dark">
                      <Icon size={22} />
                    </span>
                    <h3 className="font-display text-2xl text-brand-dark">{feature.title}</h3>
                  </div>
                  <p className="mt-4 text-gray-600">{feature.description}</p>
                  <Link
                    to={feature.to}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-sage-light hover:underline sm:mt-auto"
                  >
                    {feature.linkLabel} <ArrowRight size={18} />
                  </Link>
                </div>

                {/* PLACEHOLDER: replace this box with the real {feature.title} interface */}
                <div className="min-h-40 rounded-lg border border-gray-100 bg-white shadow-lg" />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}