
import { Link } from 'react-router-dom'
import { ArrowRight, Send } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/badge'

const suggestions = [
  "Is chocolate safe for dogs?",
  "How much food should I give my puppy?",
  "What's a good diet for a picky cat?",
  "Pwede ba ang sibuyas sa aso?",
]

// Reusable Mealie logo avatar
function MealieAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sizes = {
    sm: 'size-9',
    md: 'size-[52px]',
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand-sage/20 bg-brand-sage/10 p-1.5 ${sizes[size]}`}
    >
      <img
        src="/images/logo-only.svg"
        alt="Mealie Assistant"
        className="h-full w-full object-contain"
      />
    </div>
  )
}

export default function MealiePreview() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-10">

        {/* Left Content */}
        <div>
          <SectionHeading
            eyebrow="Ask Mealie"
            title="Pet care questions? Start here."
            subtitle="Get helpful, AI-powered guidance on pet nutrition, toxic ingredients, feeding habits, and everyday care, with bilingual English & Taglish responses."
          />

          <div className="mt-6 flex flex-col items-start gap-3">
            <Button
              to="/ask-mealie"
              size="lg"
              className="h-auto min-h-12 whitespace-normal rounded-xl px-5 py-3 text-sm sm:text-base font-semibold shadow-sm"
            >
              <span>Start a conversation with Mealie</span>
              <ArrowRight className="size-5" />
            </Button>

            <span className="text-sm font-semibold text-brand-dark/70">
              Free • Instant answers • AI-powered pet care information
            </span>
          </div>
        </div>

        {/* Live Chat Mockup Card */}
        <div className="mx-auto w-full max-w-xl lg:max-w-none">
          <Card className="overflow-hidden rounded-3xl border border-border/80 bg-white shadow-xl ring-1 ring-black/5">

            {/* Chat Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-brand-cream/40 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3.5">

                {/* Mealie Logo + Online Indicator */}
                <div className="relative">
                  <MealieAvatar size="md" />

                  <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Assistant Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-brand-dark sm:text-lg">
                      Mealie Assistant
                    </h4>

                    <Badge
                      variant="secondary"
                      className="bg-brand-sage/15 px-2 py-0.5 text-xs font-bold text-brand-sage"
                    >
                      AI Guide
                    </Badge>
                  </div>

                  <p className="text-xs text-brand-dark/65 sm:text-sm">
                    English & Taglish • Online
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                Ready to help
              </span>
            </div>

            {/* Conversation Body */}
            <div className="space-y-5 bg-brand-cream/15 p-4 sm:p-5">

              {/* Assistant Welcome Message */}
              <div className="flex items-start gap-3.5">

                {/* Mealie Logo */}
                <MealieAvatar size="sm" />

                {/* Message Bubble */}
                <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-white p-3 sm:p-4 text-sm leading-relaxed text-brand-dark shadow-sm sm:text-base">
                  Kamusta! I'm <strong>Mealie</strong>, your pet
                  nutrition and wellness assistant. Ask me anything
                  about what's safe to feed, portion sizes, or
                  common symptoms! 🐾
                </div>
              </div>

              {/* Popular Questions */}
              <div className="pt-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-dark/60 sm:text-sm">
                  Popular Questions:
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {suggestions.map((s) => (
                    <Link
                      key={s}
                      to={`/ask-mealie?q=${encodeURIComponent(s)}`}
                      className="min-h-11 inline-flex items-center rounded-2xl border border-border/80 bg-white px-4 py-2 text-xs font-semibold text-brand-dark shadow-2xs transition-all hover:border-brand-sage hover:bg-brand-sage/5 hover:text-brand-sage sm:text-sm"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Simulated Chat Input */}
              <Link
                to="/ask-mealie"
                className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-white gap-3 px-4 py-3 shadow-xs transition-colors hover:border-brand-sage"
              >
                <span className="min-w-0 text-sm font-medium text-brand-dark/60">
                  Ask Mealie anything... (e.g. 'Pwede ba ang saging sa aso?')
                </span>

                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-sage text-white">
                  <Send className="size-4" />
                </div>
              </Link>

            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
