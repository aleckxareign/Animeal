import { Link } from 'react-router-dom'
import { ArrowRight, Send, Sparkles } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'

const suggestions = [
  "Is chocolate safe for dogs?",
  "How much food should I give my puppy?",
  "What's a good diet for a picky cat?",
  "Pwede ba ang sibuyas sa aso?",
]

export default function MealiePreview() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1600px] items-center gap-14 px-4 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div>
          <SectionHeading
            eyebrow="Ask Mealie"
            title="Pet care questions? Start here."
            subtitle="Get helpful, AI-powered guidance on pet nutrition, toxic ingredients, feeding habits, and everyday care, with bilingual English & Taglish responses."
          />

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <Button to="/ask-mealie" size="lg" className="rounded-2xl h-14 px-8 font-bold shadow-md text-base sm:text-lg">
              <span>Start a conversation with Mealie</span>
              <ArrowRight className="size-5" />
            </Button>
            <span className="text-sm text-brand-dark/70 font-semibold">
              Free • Instant answers • Safe veterinary guidance
            </span>
          </div>
        </div>

        {/* Live Chat Mockup Card */}
        <div className="w-full max-w-xl mx-auto lg:max-w-none">
          <Card className="overflow-hidden rounded-3xl border border-border/80 bg-white shadow-xl ring-1 ring-black/5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-brand-cream/40 px-6 py-5">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <Avatar className="size-13 border-2 border-brand-sage/20 bg-brand-sage/10 text-2xl flex items-center justify-center">
                    <AvatarFallback className="bg-brand-sage/10 font-bold text-brand-dark">🐾</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-brand-dark text-base sm:text-lg">Mealie Assistant</h4>
                    <Badge variant="secondary" className="bg-brand-sage/15 text-brand-sage text-xs font-bold px-2 py-0.5">
                      AI Guide
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-dark/65">English & Taglish • Online</p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                Ready to help
              </span>
            </div>

            {/* Conversation Body */}
            <div className="space-y-5 p-7 bg-brand-cream/15">
              {/* Assistant message */}
              <div className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-sage/15 text-base">
                  🐾
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-white p-5 shadow-sm border border-border/60 text-sm sm:text-base text-brand-dark leading-relaxed">
                  Kamusta! I'm <strong>Mealie</strong>, your pet nutrition and wellness assistant. Ask me anything about what's safe to feed, portion sizes, or common symptoms! 🐾
                </div>
              </div>

              {/* Quick question chips */}
              <div className="pt-2">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-dark/60 mb-3">
                  Popular Questions:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {suggestions.map((s) => (
                    <Link
                      key={s}
                      to={`/ask-mealie?q=${encodeURIComponent(s)}`}
                      className="rounded-full border border-border/80 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-brand-dark shadow-2xs transition-all hover:border-brand-sage hover:bg-brand-sage/5 hover:text-brand-sage"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Simulated Input Bar */}
              <Link
                to="/ask-mealie"
                className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-3.5 shadow-xs transition-colors hover:border-brand-sage"
              >
                <span className="text-sm sm:text-base text-brand-dark/40 font-medium">
                  Ask Mealie anything... (e.g. 'Pwede ba ang saging sa aso?')
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-brand-sage text-white">
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
