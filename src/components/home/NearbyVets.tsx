import { useState } from 'react'
import {
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  Search,
  Navigation,
  Compass,
  CheckCircle2,
  Filter,
  List,
  Map as MapIcon,
} from 'lucide-react'
import { vets } from '../../data/vets'
import type { Vet } from '../../types'

export default function NearbyVets() {
  const [selectedCity, setSelectedCity] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEmergency, setFilterEmergency] = useState(false)
  const [filterOpenNow, setFilterOpenNow] = useState(false)
  const [selectedVet, setSelectedVet] = useState<Vet | null>(vets[0])
  const [userLocationGranted, setUserLocationGranted] = useState(false)
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list')

  const cities = ['All', 'Quezon City', 'Pasig', 'Mandaluyong', 'Makati', 'Cainta', 'Las Piñas']

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setUserLocationGranted(true)
        },
        () => {
          setUserLocationGranted(false)
        },
      )
    }
  }

  const handleSelectVet = (vet: Vet) => {
    setSelectedVet(vet)
    // On small screens, smoothly switch to the map & details view so user sees it right away
    if (window.innerWidth < 1024) {
      setMobileTab('map')
    }
  }

  const filteredVets = vets.filter((v) => {
    if (selectedCity !== 'All' && v.city !== selectedCity) return false
    if (filterEmergency && !v.emergency) return false
    if (filterOpenNow && !v.openNow) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesName = v.name.toLowerCase().includes(q)
      const matchesAddress = v.address.toLowerCase().includes(q)
      const matchesCity = v.city.toLowerCase().includes(q)
      if (!matchesName && !matchesAddress && !matchesCity) return false
    }
    return true
  })

  return (
    <section id="nearby-vets" className="bg-brand-cream/60 py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-sage/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-brand-sage">
            <Compass className="size-4" />
            Veterinary Care Discovery
          </span>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-dark">
            Find Trusted Vets Near You
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg lg:text-xl text-brand-dark/75 leading-relaxed">
            Discover verified veterinary clinics in Metro Manila and nearby areas.
            Filter by 24/7 emergency services, open hours, and location.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-10 rounded-3xl bg-white p-5 shadow-sm sm:p-7 border border-border/60">
          <div className="grid gap-4 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-dark/40" />
              <input
                type="text"
                placeholder="Search by clinic name, address, or barangay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-brand-dark/15 bg-brand-cream/30 py-3.5 pl-11 pr-4 text-base text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
              />
            </div>

            {/* City Selector */}
            <div className="md:col-span-4">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-2xl border border-brand-dark/15 bg-brand-cream/30 px-4 py-3.5 text-base text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20 font-medium"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Locations (Metro Manila & Rizal)' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Geolocation Trigger */}
            <div className="md:col-span-3">
              <button
                onClick={handleUseLocation}
                className={`flex h-full w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-bold transition-all shadow-xs ${
                  userLocationGranted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-sage/10 text-brand-sage hover:bg-brand-sage/20'
                }`}
              >
                <Navigation className="size-4.5" />
                <span>{userLocationGranted ? 'Location Detected ✓' : 'Near My Location'}</span>
              </button>
            </div>
          </div>

          {/* Quick Filters Strip */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-brand-dark/70 flex items-center gap-1.5">
                <Filter className="size-4" /> Filters:
              </span>

              <button
                onClick={() => setFilterEmergency((v) => !v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  filterEmergency
                    ? 'bg-brand-alert text-white shadow-xs'
                    : 'border border-border/70 bg-brand-cream/40 text-brand-dark/80 hover:bg-brand-cream'
                }`}
              >
                🚨 24/7 Emergency Only
              </button>

              <button
                onClick={() => setFilterOpenNow((v) => !v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  filterOpenNow
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'border border-border/70 bg-brand-cream/40 text-brand-dark/80 hover:bg-brand-cream'
                }`}
              >
                🟢 Open Now
              </button>
            </div>

            <p className="text-sm font-semibold text-brand-dark/65">
              Showing <span className="font-bold text-brand-dark">{filteredVets.length}</span> verified{' '}
              {filteredVets.length === 1 ? 'clinic' : 'clinics'}
            </p>
          </div>
        </div>

        {/* Mobile View Toggle Tabs (Visible on < lg screens) */}
        <div className="mt-8 flex rounded-2xl bg-white p-1.5 shadow-sm border border-border/60 lg:hidden">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all ${
              mobileTab === 'list'
                ? 'bg-brand-sage text-white shadow-xs'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`}
          >
            <List className="size-5" />
            <span>Clinic List ({filteredVets.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all ${
              mobileTab === 'map'
                ? 'bg-brand-sage text-white shadow-xs'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`}
          >
            <MapIcon className="size-5" />
            <span>Map & Active Clinic</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          {/* Clinic List Column */}
          <div className={`space-y-4 lg:col-span-7 ${mobileTab === 'list' ? 'block' : 'hidden lg:block'}`}>
            {filteredVets.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-border/60">
                <AlertCircle className="mx-auto size-12 text-brand-dark/30" />
                <h3 className="mt-4 text-xl font-bold text-brand-dark">No clinics found</h3>
                <p className="mt-2 text-base text-brand-dark/65 max-w-md mx-auto">
                  Try adjusting your search query, city filter, or toggle off the emergency/open filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCity('All')
                    setFilterEmergency(false)
                    setFilterOpenNow(false)
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-sage px-5 py-3 text-base font-bold text-white shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredVets.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleSelectVet(v)}
                  className={`group cursor-pointer rounded-2xl border p-5 sm:p-6 transition-all ${
                    selectedVet?.id === v.id
                      ? 'border-brand-sage bg-white shadow-md ring-2 ring-brand-sage/20'
                      : 'border-transparent bg-white shadow-sm hover:border-brand-dark/15 hover:shadow'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-bold text-lg sm:text-xl text-brand-dark group-hover:text-brand-sage">
                          {v.name}
                        </h3>
                        {v.emergency && (
                          <span className="rounded-full bg-brand-alert/10 px-3 py-0.5 text-xs font-bold text-brand-alert">
                            24/7 Emergency
                          </span>
                        )}
                        {v.openNow ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Open Now
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-brand-dark/50">
                            <span className="size-2 rounded-full bg-brand-dark/30" />
                            Closed
                          </span>
                        )}
                      </div>

                      <p className="mt-2 flex items-center gap-2 text-sm sm:text-base text-brand-dark/75">
                        <MapPin className="size-4.5 shrink-0 text-brand-sage" />
                        {v.address}, {v.city}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-brand-dark/70 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-4" />
                          {v.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4" />
                          {v.hours ?? 'Regular hours'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="rounded-xl bg-brand-cream px-3.5 py-1.5 text-xs sm:text-sm font-bold text-brand-dark font-mono">
                        {v.distance}
                      </span>
                      {v.rating && (
                        <div className="mt-2 text-xs sm:text-sm font-bold text-amber-600">
                          ★ {v.rating}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Interactive Map & Selected Vet Preview Column */}
          <div className={`space-y-5 lg:col-span-5 sticky top-28 ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
            {/* Map Canvas Card */}
            <div className="relative h-72 sm:h-80 overflow-hidden rounded-3xl border border-brand-dark/10 bg-brand-dark shadow-sm">
              <div className="absolute inset-0 opacity-40">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#44632f" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="#164040" />
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Metro Manila Landmarks */}
              <div className="absolute left-6 top-6 text-xs font-mono font-bold text-brand-cream/60">
                METRO MANILA REGIONAL VET NETWORK
              </div>

              {/* Pin markers */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center">
                  <div className="animate-bounce flex size-12 items-center justify-center rounded-full bg-brand-alert text-white shadow-xl ring-4 ring-white">
                    <MapPin className="size-6" />
                  </div>
                  <div className="mt-2 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-brand-dark shadow-lg backdrop-blur-sm">
                    {selectedVet?.name || 'Selected Clinic'}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                GPS Verified Clinic Coordinates
              </div>
            </div>

            {/* Selected Clinic Details Card */}
            {selectedVet && (
              <div className="rounded-3xl border border-border/80 bg-white p-6 sm:p-7 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-brand-sage/10 px-3 py-1 text-xs font-bold text-brand-sage">
                      Selected Clinic Details
                    </span>
                    <h3 className="mt-2.5 text-xl sm:text-2xl font-bold text-brand-dark">
                      {selectedVet.name}
                    </h3>
                  </div>

                  {selectedVet.emergency && (
                    <span className="rounded-full bg-brand-alert/10 px-3 py-1 text-xs font-bold text-brand-alert shrink-0">
                      24/7 Emergency
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-3.5 border-y border-border/60 py-4 text-sm sm:text-base text-brand-dark/80">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 shrink-0 text-brand-sage mt-0.5" />
                    <span>
                      {selectedVet.address}, {selectedVet.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="size-5 shrink-0 text-brand-sage" />
                    <span className="font-mono font-bold">{selectedVet.phone}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="size-5 shrink-0 text-brand-sage" />
                    <span>{selectedVet.hours ?? 'Regular operating hours'}</span>
                  </div>

                  {selectedVet.services && (
                    <div className="flex items-start gap-3 pt-1">
                      <CheckCircle2 className="size-5 shrink-0 text-brand-sage mt-0.5" />
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVet.services.map((s) => (
                          <span
                            key={s}
                            className="rounded-lg bg-brand-cream/80 px-2 py-0.5 text-xs font-semibold text-brand-dark"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${selectedVet.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-sage py-3.5 text-base font-bold text-white shadow-xs transition-transform active:scale-[0.98]"
                  >
                    <Phone className="size-4.5" />
                    <span>Call Clinic</span>
                  </a>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${selectedVet.name} ${selectedVet.address} ${selectedVet.city}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-dark/20 bg-brand-cream/40 py-3.5 text-base font-bold text-brand-dark transition-all hover:bg-brand-cream"
                  >
                    <Navigation className="size-4.5" />
                    <span>Get Directions</span>
                  </a>
                </div>

                {/* Back to list on mobile */}
                <button
                  onClick={() => setMobileTab('list')}
                  className="mt-4 w-full text-center text-sm font-semibold text-brand-sage hover:underline lg:hidden"
                >
                  ← Back to full clinic list
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
