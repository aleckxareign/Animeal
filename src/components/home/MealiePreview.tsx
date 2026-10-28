import { Link } from 'react-router-dom'
import { ArrowRight, Send } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'

const suggestions = [
  "What's a good diet for my cat?",
  'Is this food safe for my dog?',
  'How often should I feed my pet?',
  "How do I choose food for my pet's life stage?",
]

export default function MealiePreview() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Ask Mealie"
            title="Pet care questions? Start here."
            subtitle="Get helpful, AI-powered guidance on pet nutrition, food ingredients, feeding habits, and everyday care, all through a simple conversation with Animeal."
          />
          <Button to="/ask-mealie">
            Start a new chat <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>

        {/* PLACEHOLDER: this static card becomes the real chat interface later */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
            <img src="/images/logo.png" alt="" className="h-8" />
            <span className="font-bold text-brand-dark">Ask Mealie</span>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold">AI</span>
          </div>

          <div className="space-y-4 p-5">
            <p className="inline-block rounded-2xl bg-brand-cream px-4 py-3 text-brand-dark">
              Hi! I'm Mealie, your pet nutrition assistant. How can I help you today?
            </p>

            <div className="flex flex-wrap gap-3">
              {suggestions.map((s) => (
                <Link
                  key={s}
                  to="/ask-mealie"
                  className="rounded-full border border-gray-200 bg-brand-cream px-4 py-2 text-sm text-brand-dark hover:border-brand-dark"
                >
                  {s}
                </Link>
              ))}
            </div>

            <div className="flex items-center rounded-lg border border-gray-200 px-4 py-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
                readOnly
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-white">
                <Send size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}