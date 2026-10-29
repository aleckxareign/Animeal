import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import PhoneFrame from '../ui/PhoneFrame'

const steps = [
  {
    number: '01',
    title: "Create Your Pet's Profile",
    description: "Add your pet's details to personalize their Animeal experience.",
  },
  {
    number: '02',
    title: 'Explore the Tools',
    description: 'Discover food, scan labels, log meals, and get AI-powered nutrition guidance.',
  },
  {
    number: '03',
    title: 'Track their Well-being',
    description:
      'Review meal history, monitor wellness, and stay on top of care reminders.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_2.2fr]">
        <SectionHeading
          eyebrow="How it works"
          title="Three simple steps to better pet care."
          subtitle="Get started with Animeal by setting up your pet's profile, exploring the tools you need, and keeping track of their overall nutrition and wellness."
        />

        <div className="flex items-start justify-center gap-4">
          {steps.map((step, index) => (
            <Fragment key={step.number}>
              <div className="w-40 text-center sm:w-48">
                <div className="relative">
                  <span className="absolute -left-2 -top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-brand-sage/40 text-lg font-bold text-brand-dark">
                    {step.number}
                  </span>
                  {/* PLACEHOLDER: put the real app screen inside PhoneFrame */}
                  <PhoneFrame />
                </div>
                <h3 className="mt-5 font-bold text-brand-dark">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="mt-28 hidden shrink-0 text-brand-dark sm:block" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}