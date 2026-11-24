import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-sage/10 text-5xl">
          🐾
        </div>
        
        <span className="mt-6 inline-block rounded-full bg-brand-alert/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive">
          404 — Page Not Found
        </span>
        
        <h1 className="font-display mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          Uh-oh! Looks like this tail went off track.
        </h1>
        
        <p className="mt-3 text-sm text-foreground/70 sm:text-base">
          The page you are looking for doesn't exist or has moved. Let's get you and your pet back to familiar ground!
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-sage px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-sage/90"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/meal-tracker"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-foreground/20 bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background/60"
          >
            <Compass className="h-4 w-4" />
            Go to Meal Tracker
          </Link>
        </div>

        <div className="mt-10 border-t border-foreground/10 pt-6">
          <p className="text-xs text-foreground/50">
            Looking for something specific?{' '}
            <Link to="/food-library" className="font-medium text-brand-accent hover:underline">
              Search Food Library
            </Link>{' '}
            or{' '}
            <Link to="/ask-mealie" className="font-medium text-brand-accent hover:underline">
              Ask Mealie
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
