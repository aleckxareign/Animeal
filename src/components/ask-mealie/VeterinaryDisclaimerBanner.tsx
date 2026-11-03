import { Link } from 'react-router-dom'
import { AlertTriangle, MapPin, ExternalLink } from 'lucide-react'

export default function VeterinaryDisclaimerBanner() {
  return (
    <div className="border-b border-amber-300/60 bg-amber-50/90 px-4 py-2 sm:px-6">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <p className="text-xs text-amber-950 font-medium leading-relaxed">
            <span className="font-bold">Veterinary Advisory:</span> Mealie is an AI assistant providing general educational info. Not a licensed veterinarian. For emergencies, visit a clinic immediately.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
          <Link
            to="/#nearby-vets"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 transition-colors"
          >
            <MapPin size={12} className="text-amber-800" />
            <span>Find Nearby Clinic</span>
            <ExternalLink size={10} className="opacity-60" />
          </Link>
        </div>
      </div>
    </div>
  )
}
