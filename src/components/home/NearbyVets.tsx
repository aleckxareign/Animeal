import { useState } from 'react'
import {
  MapPin,
  Phone,
  AlertCircle,
  Search,
  Navigation,
  Compass,
  Filter,
  List,
  Map as MapIcon,
} from 'lucide-react'
import { vets } from '../../data/vets'
import type { Vet } from '../../types'

const INITIAL_COUNT = 3
const mapPinPositions = [
  { left: '18%', top: '54%' },
  { left: '34%', top: '34%' },
  { left: '52%', top: '60%' },
  { left: '69%', top: '38%' },
  { left: '84%', top: '58%' },
]

const parseKm = (distance: string) => {
  const value = Number.parseFloat(distance)
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value
}

const getDirectionsUrl = (vet: Vet, location?: GeolocationCoordinates) => {
  const params = new URLSearchParams({
    api: '1',
    destination: `${vet.name}, ${vet.address}, ${vet.city}`,
  })
  if (location) params.set('origin', `${location.latitude},${location.longitude}`)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export default function NearbyVets() {
  const [selectedCity, setSelectedCity] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEmergency, setFilterEmergency] = useState(false)
  const [filterOpenNow, setFilterOpenNow] = useState(false)
  const [selectedVet, setSelectedVet] = useState<Vet | null>(vets[0] ?? null)
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | undefined>()
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list')
  const [expanded, setExpanded] = useState(false)

  const cities = ['All', 'Quezon City', 'Pasig', 'Mandaluyong', 'Makati', 'Cainta', 'Las Piñas']

  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserLocation(coords),
      () => setUserLocation(undefined),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const filteredVets = vets.filter((vet) => {
    if (selectedCity !== 'All' && vet.city !== selectedCity) return false
    if (filterEmergency && !vet.emergency) return false
    if (filterOpenNow && !vet.openNow) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (![vet.name, vet.address, vet.city].some((value) => value.toLowerCase().includes(query))) return false
    }
    return true
  })

  const sortedVets = [...filteredVets].sort((a, b) => parseKm(a.distance) - parseKm(b.distance))
  const visibleVets = expanded ? sortedVets : sortedVets.slice(0, INITIAL_COUNT)
  const activeVet = sortedVets.find((vet) => vet.id === selectedVet?.id) ?? sortedVets[0] ?? null

  const selectVet = (vet: Vet) => {
    setSelectedVet(vet)
    if (window.innerWidth < 1024) setMobileTab('map')
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCity('All')
    setFilterEmergency(false)
    setFilterOpenNow(false)
    setExpanded(false)
  }

  return (
    <section id="nearby-vets" className="bg-brand-cream/60 py-12 sm:py-16 lg:py-20">
      <div className="@container mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-8 @3xl:grid-cols-12 @3xl:gap-10">
          <div className="@3xl:col-span-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-sage/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-sage">
              <Compass className="size-4" /> Vet finder
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl">
              Find a vet near you.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-dark/75 sm:text-base">
              Browse veterinary clinics in Metro Manila and nearby areas.
            </p>

            <div className="mt-5 space-y-3">
              <label className="relative block">
                <span className="sr-only">Search clinics or areas</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-dark/40" />
                <input
                  type="search"
                  placeholder="Clinic, city, or address"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-brand-dark/15 bg-white py-2.5 pl-10 pr-3.5 text-sm text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                />
              </label>

              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <label>
                  <span className="sr-only">Filter by city</span>
                  <select
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-brand-dark/15 bg-white px-3.5 text-sm font-medium text-brand-dark focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city === 'All' ? 'All nearby areas' : city}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-bold transition-colors ${
                    userLocation
                      ? 'bg-emerald-700 text-white'
                      : 'bg-brand-dark text-white hover:bg-brand-sage'
                  }`}
                  aria-label={userLocation ? 'Location enabled for directions' : 'Use my location for directions'}
                >
                  <Navigation className="size-4" />
                  <span className="hidden sm:inline">{userLocation ? 'Location on' : 'Near me'}</span>
                </button>
              </div>
              {userLocation && (
                <p className="text-xs text-brand-dark/60">Your location will be used when opening directions.</p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark/65">
                <Filter className="size-3.5" /> Filter
              </span>
              <button
                type="button"
                aria-pressed={filterEmergency}
                onClick={() => setFilterEmergency((value) => !value)}
                className={`min-h-11 rounded-full px-3.5 text-xs font-bold transition-colors ${filterEmergency ? 'bg-brand-alert text-white' : 'border border-brand-dark/15 bg-white text-brand-dark/75 hover:bg-brand-cream'}`}
              >
                24/7 emergency
              </button>
              <button
                type="button"
                aria-pressed={filterOpenNow}
                onClick={() => setFilterOpenNow((value) => !value)}
                className={`min-h-11 rounded-full px-3.5 text-xs font-bold transition-colors ${filterOpenNow ? 'bg-emerald-700 text-white' : 'border border-brand-dark/15 bg-white text-brand-dark/75 hover:bg-brand-cream'}`}
              >
                Open now
              </button>
            </div>

            <p className="mt-4 text-xs font-medium text-brand-dark/60">
              Showing <span className="font-bold text-brand-dark">{visibleVets.length}</span>
              {visibleVets.length < filteredVets.length && ` of ${filteredVets.length}`} {filteredVets.length === 1 ? 'clinic' : 'clinics'}
            </p>
          </div>

          <div className="min-w-0 @3xl:col-span-8">
            <div className="mb-3 flex rounded-xl border border-border/60 bg-white p-1 @3xl:hidden">
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                aria-pressed={mobileTab === 'list'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold ${mobileTab === 'list' ? 'bg-brand-sage text-white' : 'text-brand-dark/65'}`}
              >
                <List className="size-4" /> Clinics ({filteredVets.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                aria-pressed={mobileTab === 'map'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold ${mobileTab === 'map' ? 'bg-brand-sage text-white' : 'text-brand-dark/65'}`}
              >
                <MapIcon className="size-4" /> Map
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
              <div className={`relative h-56 overflow-hidden bg-[#e7ecdf] sm:h-60 ${mobileTab === 'map' ? 'block' : 'hidden @3xl:block'}`}>
                <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 720 280" preserveAspectRatio="none">
                  <path d="M-20 224 C 105 170 135 178 242 125 S 412 99 502 66 S 647 52 750 12" fill="none" stroke="#cbdccf" strokeWidth="38" />
                  <path d="M-20 224 C 105 170 135 178 242 125 S 412 99 502 66 S 647 52 750 12" fill="none" stroke="#fff" strokeWidth="5" />
                  <path d="M50 -20 C 100 48 155 90 198 156 S 238 240 260 300" fill="none" stroke="#fff" strokeWidth="12" />
                  <path d="M365 -20 C 340 44 362 105 398 149 S 490 220 528 300" fill="none" stroke="#fff" strokeWidth="9" />
                  <path d="M620 -20 C 564 57 581 109 624 165 S 688 232 725 295" fill="none" stroke="#fff" strokeWidth="13" />
                  <path d="M0 72 L720 180 M0 268 L720 96" fill="none" stroke="#fff" strokeWidth="4" />
                  <path d="M286 0 L328 280 M548 0 L445 280" fill="none" stroke="#fff" strokeWidth="3" />
                  <path d="M18 15 h112 v42 H18z M458 187 h91 v53 h-91z M210 23 h72 v34 h-72z" fill="#d6e4cf" opacity=".9" />
                </svg>

                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-dark/70 shadow-sm">
                  Metro Manila & Rizal · illustrative area guide
                </div>

                {sortedVets.slice(0, 5).map((vet, index) => (
                  <button
                    key={vet.id}
                    type="button"
                    onClick={() => setSelectedVet(vet)}
                    className={`absolute z-10 -translate-x-1/2 -translate-y-full rounded-full p-1.5 shadow-md ring-2 ring-white transition-transform hover:scale-110 ${activeVet?.id === vet.id ? 'bg-brand-alert text-white' : 'bg-brand-dark text-white'}`}
                    style={mapPinPositions[index % mapPinPositions.length]}
                    aria-label={`Select ${vet.name} in ${vet.city}`}
                    title={`${vet.name} · ${vet.city}`}
                  >
                    <MapPin className="size-4" />
                  </button>
                ))}

                {activeVet ? (
                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-sage">Selected clinic</p>
                      <p className="truncate text-sm font-bold text-brand-dark">{activeVet.name}</p>
                      <p className="truncate text-xs text-brand-dark/65">{activeVet.city} · {activeVet.distance}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <a
                        href={`tel:${activeVet.phone.replace(/[^0-9+]/g, '')}`}
                        aria-label={`Call ${activeVet.name}`}
                        className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-dark text-white hover:bg-brand-sage"
                      >
                        <Phone className="size-4" />
                      </a>
                      <a
                        href={getDirectionsUrl(activeVet, userLocation)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Directions to ${activeVet.name}`}
                        className="inline-flex size-11 items-center justify-center rounded-lg border border-brand-dark/15 bg-brand-cream/50 text-brand-dark hover:bg-brand-cream"
                      >
                        <Navigation className="size-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3 text-sm font-semibold text-brand-dark/70 shadow-sm">
                    No clinics match these filters.
                  </div>
                )}
              </div>

              <div className={`divide-y divide-border/60 ${mobileTab === 'list' ? 'block' : 'hidden @3xl:block'}`}>
                {visibleVets.length === 0 ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="mx-auto size-8 text-brand-dark/30" />
                    <h3 className="mt-3 font-bold text-brand-dark">No clinics found</h3>
                    <p className="mt-1 text-sm text-brand-dark/65">Try another search or clear the filters.</p>
                    <button type="button" onClick={resetFilters} className="mt-3 min-h-11 rounded-lg px-4 text-sm font-bold text-brand-sage hover:bg-brand-cream">
                      Reset filters
                    </button>
                  </div>
                ) : (
                  visibleVets.map((vet) => (
                    <div key={vet.id} className={`flex items-center gap-2 p-3 sm:gap-3 sm:px-4 ${activeVet?.id === vet.id ? 'bg-brand-sage/5' : ''}`}>
                      <button
                        type="button"
                        onClick={() => selectVet(vet)}
                        aria-pressed={activeVet?.id === vet.id}
                        className="min-h-11 min-w-0 flex-1 rounded-lg px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage"
                      >
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-bold text-sm text-brand-dark sm:text-base">{vet.name}</span>
                          {vet.emergency && <span className="rounded-full bg-brand-alert/10 px-2 py-0.5 text-[10px] font-bold text-brand-alert">24/7 emergency</span>}
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${vet.openNow ? 'text-emerald-700' : 'text-brand-dark/50'}`}>
                            <span className={`size-1.5 rounded-full ${vet.openNow ? 'bg-emerald-500' : 'bg-brand-dark/30'}`} />
                            {vet.openNow ? 'Open now' : 'Closed'}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-brand-dark/65">{vet.city} · {vet.address}</span>
                      </button>
                      <span className="hidden shrink-0 text-xs font-bold text-brand-dark/65 sm:block">{vet.distance}</span>
                      <a
                        href={`tel:${vet.phone.replace(/[^0-9+]/g, '')}`}
                        aria-label={`Call ${vet.name}`}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-brand-sage hover:bg-brand-sage/10"
                      >
                        <Phone className="size-4" />
                      </a>
                      <a
                        href={getDirectionsUrl(vet, userLocation)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Directions to ${vet.name}`}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-brand-dark hover:bg-brand-cream"
                      >
                        <Navigation className="size-4" />
                      </a>
                    </div>
                  ))
                )}

                {filteredVets.length > INITIAL_COUNT && (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="min-h-11 w-full px-4 text-sm font-bold text-brand-sage hover:bg-brand-cream/60"
                  >
                    {expanded ? 'Show fewer clinics' : `Show ${filteredVets.length - INITIAL_COUNT} more clinics`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
