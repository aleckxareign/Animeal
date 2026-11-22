import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  MapPin,
  Phone,
  AlertCircle,
  Search,
  Navigation,
  Compass,
  List,
  Map as MapIcon,
  Loader2,
  Sparkles,
  Clock,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
} from 'lucide-react'
import { vets as fallbackVets } from '../../data/vets'
import type { Vet } from '../../types'
import { isSupabaseConfigured } from '../../lib/supabase'
import { supabaseDb } from '../../services/supabase-db'
import {
  calculateDistanceKm,
  formatDistanceString,
  getGoogleMapsRoutingUrl,
  reverseGeocodeCoords,
  geocodeLocationName,
  fetchLiveNearbyVetsFromApi,
  autocompleteLocation,
  type UserCoords,
  type MapBounds,
  type LocationSuggestion,
} from '../../services/vet-proximity'

const INITIAL_COUNT = 3

/**
 * Calculates adaptive bounding box for map canvas from active clinics and user coordinates.
 */
function computeMapBounds(
  vets: Vet[],
  userCoords?: { latitude: number; longitude: number }
): MapBounds {
  const lats: number[] = []
  const lons: number[] = []

  vets.forEach((v) => {
    if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
      lats.push(v.latitude)
      lons.push(v.longitude)
    }
  })

  if (userCoords) {
    lats.push(userCoords.latitude)
    lons.push(userCoords.longitude)
  }

  if (lats.length === 0) {
    return { minLat: 14.40, maxLat: 14.72, minLon: 120.95, maxLon: 121.15 }
  }

  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)

  const latPad = (maxLat - minLat) * 0.12 || 0.03
  const lonPad = (maxLon - minLon) * 0.12 || 0.03

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLon: minLon - lonPad,
    maxLon: maxLon + lonPad,
  }
}

/**
 * Projects real GPS latitude and longitude onto the interactive stylized map canvas.
 */
function getMapCoordinates(
  lat?: number,
  lon?: number,
  bounds?: MapBounds
): { left: string; top: string } {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return { left: '50%', top: '50%' }
  }
  const minLat = bounds?.minLat ?? 14.40
  const maxLat = bounds?.maxLat ?? 14.72
  const minLon = bounds?.minLon ?? 120.95
  const maxLon = bounds?.maxLon ?? 121.15

  const spanLat = maxLat - minLat || 0.05
  const spanLon = maxLon - minLon || 0.05

  const clampedLat = Math.max(minLat, Math.min(maxLat, lat))
  const clampedLon = Math.max(minLon, Math.min(maxLon, lon))

  const x = ((clampedLon - minLon) / spanLon) * 78 + 11 // 11% to 89% width
  const y = 100 - (((clampedLat - minLat) / spanLat) * 68 + 16) // inverted Y

  return { left: `${x.toFixed(1)}%`, top: `${y.toFixed(1)}%` }
}

const LOCATION_STORAGE_KEY = 'animeal_user_location'

/** Save user location to localStorage for persistence across sessions */
function saveLocationToStorage(coords: UserCoords) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
      latitude: coords.latitude,
      longitude: coords.longitude,
      city: coords.city,
      displayName: coords.displayName,
      source: coords.source,
      savedAt: Date.now(),
    }))
  } catch { /* storage full or private mode */ }
}

/** Load persisted user location from localStorage (expires after 24h) */
function loadLocationFromStorage(): UserCoords | null {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    // Expire after 24 hours
    if (Date.now() - (data.savedAt || 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(LOCATION_STORAGE_KEY)
      return null
    }
    return data as UserCoords
  } catch {
    return null
  }
}

export default function NearbyVets() {
  const [allVets, setAllVets] = useState<Vet[]>(fallbackVets)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [filterEmergency, setFilterEmergency] = useState(false)
  const [filterOpenNow, setFilterOpenNow] = useState(false)
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null)
  const [userLocation, setUserLocation] = useState<UserCoords | undefined>()
  const [isLocating, setIsLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'denied' | 'unsupported'>('idle')
  const [locationSubtitle, setLocationSubtitle] = useState('Tap to sort clinics by your location')
  const [currentRegionName, setCurrentRegionName] = useState('Metro Manila & Rizal area directory')
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list')
  const [expanded, setExpanded] = useState(false)
  const [expandedClinicId, setExpandedClinicId] = useState<number | string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAutoRequestedLocation = useRef(false)
  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 1. Initial Load: Load initial directory from Supabase if available or use fallback
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabaseDb
        .getVets()
        .then((cloudVets) => {
          if (cloudVets && cloudVets.length > 0) {
            setAllVets(cloudVets)
            setSelectedVet(cloudVets[0] ?? null)
          } else {
            setSelectedVet(fallbackVets[0] ?? null)
          }
        })
        .catch(() => {
          setSelectedVet(fallbackVets[0] ?? null)
        })
    } else {
      setSelectedVet(fallbackVets[0] ?? null)
    }
  }, [])

  // Helper: After getting coordinates, fetch live vets and merge with fallback
  const fetchAndMergeVets = useCallback(async (lat: number, lon: number) => {
    try {
      // Start with 50 km radius
      let liveVets = await fetchLiveNearbyVetsFromApi(lat, lon, 50)
      // If fewer than 5 results, expand to 100 km
      if (liveVets.length < 5) {
        const widerVets = await fetchLiveNearbyVetsFromApi(lat, lon, 100)
        if (widerVets.length > liveVets.length) {
          liveVets = widerVets
        }
      }
      // Merge: live results take priority, then add fallback clinics not already found
      const liveIds = new Set(liveVets.map((v) => v.name.toLowerCase()))
      const uniqueFallbacks = fallbackVets.filter(
        (fb) => !liveIds.has(fb.name.toLowerCase())
      )
      const merged = [...liveVets, ...uniqueFallbacks]
      setAllVets(merged)
      setSelectedVet(merged[0] ?? null)
    } catch (apiErr) {
      console.warn('Could not fetch live OSM clinics:', apiErr)
      // Keep fallback data visible
    }
  }, [])

  // 2. One-Tap Live GPS Location Detection (Asks User for Permission)
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported')
      return
    }

    setIsLocating(true)
    setLocationStatus('idle')

    // Triggers the browser's native location permission prompt
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const userCoords: UserCoords = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          source: 'gps',
        }
        setUserLocation(userCoords)
        setIsLocating(false)
        setLocationStatus('success')

        // Reverse-geocode coordinates to identify the user's actual city and barangay
        const geoInfo = await reverseGeocodeCoords(coords.latitude, coords.longitude)
        const areaLabel = geoInfo?.district
          ? `${geoInfo.district}, ${geoInfo.city}`
          : geoInfo?.city || 'Your Location'

        // Update the userCoords with resolved city info
        const enrichedCoords: UserCoords = {
          ...userCoords,
          city: geoInfo?.city,
          displayName: areaLabel,
        }
        setUserLocation(enrichedCoords)
        saveLocationToStorage(enrichedCoords)

        setLocationSubtitle(`Clinics near ${areaLabel}`)
        setCurrentRegionName(`Clinics near ${areaLabel}`)

        // Fetch real live veterinary clinics and animal hospitals near the user's coordinates
        await fetchAndMergeVets(coords.latitude, coords.longitude)
      },
      (err) => {
        console.warn('Browser geolocation permission denied or failed:', err.message)
        setIsLocating(false)
        setLocationStatus('denied')
        setLocationSubtitle('Location access blocked. You can search your city below.')
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0, // Force fresh live reading
      }
    )
  }, [fetchAndMergeVets])

  // 2b. Auto-request location on first visit; restore from localStorage if saved
  useEffect(() => {
    if (hasAutoRequestedLocation.current) return
    hasAutoRequestedLocation.current = true

    // Try to restore from localStorage first
    const saved = loadLocationFromStorage()
    if (saved) {
      setUserLocation(saved)
      setLocationStatus('success')
      setLocationSubtitle(
        saved.source === 'gps'
          ? `Clinics near ${saved.displayName || saved.city || 'Your Location'}`
          : `Clinics in ${saved.city || 'your area'}`
      )
      setCurrentRegionName(
        `Clinics near ${saved.displayName || saved.city || 'Your Location'}`
      )
      // Fetch clinics based on saved location
      fetchAndMergeVets(saved.latitude, saved.longitude)
    }

    // Auto-request fresh GPS (will update saved location)
    if (navigator.geolocation) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        handleRequestLocation()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [handleRequestLocation, fetchAndMergeVets])

  // 3. Debounced autocomplete: query Nominatim as user types
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(true)

    // Cancel any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = value.trim()
    if (trimmed.length < 2) {
      setLocationSuggestions([])
      setIsFetchingSuggestions(false)
      return
    }

    setIsFetchingSuggestions(true)
    debounceRef.current = setTimeout(async () => {
      const suggestions = await autocompleteLocation(trimmed, 6)
      setLocationSuggestions(suggestions)
      setIsFetchingSuggestions(false)
    }, 300)
  }

  // 3b. Search Location Feature: Geocodes location query & fetches live clinics in that area
  const handleLocationSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault()
    const query = (customQuery ?? searchQuery).trim()
    if (!query) return

    setShowSuggestions(false)
    setIsSearchingLocation(true)
    try {
      const geo = await geocodeLocationName(query)
      if (geo) {
        // Update reference location for distance calculations
        const refLocation: UserCoords = {
          latitude: geo.lat,
          longitude: geo.lon,
          city: geo.city,
          displayName: geo.displayName,
          source: 'search',
        }

        // If user hasn't enabled GPS, use searched location center as reference
        if (!userLocation || userLocation.source === 'search') {
          setUserLocation(refLocation)
          setLocationSubtitle(`Clinics in ${geo.city}`)
          setLocationStatus('success')
          saveLocationToStorage(refLocation)
        }

        setCurrentRegionName(`Clinics in ${geo.city}`)

        // Fetch real veterinary clinics and animal hospitals
        await fetchAndMergeVets(geo.lat, geo.lon)
      }
    } catch (err) {
      console.warn('Location search error:', err)
    } finally {
      setIsSearchingLocation(false)
    }
  }

  // Handle selecting a suggested location from the autocomplete dropdown
  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.shortName)
    setShowSuggestions(false)
    setLocationSuggestions([])

    // Directly use the suggestion's coordinates - no need to re-geocode
    const refLocation: UserCoords = {
      latitude: suggestion.lat,
      longitude: suggestion.lon,
      city: suggestion.shortName,
      displayName: suggestion.displayName,
      source: 'search',
    }

    if (!userLocation || userLocation.source === 'search') {
      setUserLocation(refLocation)
      setLocationSubtitle(`Clinics in ${suggestion.shortName}`)
      setLocationStatus('success')
      saveLocationToStorage(refLocation)
    }

    setCurrentRegionName(`Clinics in ${suggestion.shortName}`)
    setIsSearchingLocation(true)
    fetchAndMergeVets(suggestion.lat, suggestion.lon).finally(() => {
      setIsSearchingLocation(false)
    })
  }

  // Handle selecting a suggested clinic
  const handleSelectClinic = (clinic: Vet) => {
    setSearchQuery(clinic.name)
    setShowSuggestions(false)
    setLocationSuggestions([])
    setSelectedVet(clinic)
    setExpandedClinicId(clinic.id)
  }

  // 4. Reset all filters and search query
  const handleResetFilters = () => {
    setSearchQuery('')
    setShowSuggestions(false)
    setLocationSuggestions([])
    setFilterEmergency(false)
    setFilterOpenNow(false)
    setExpanded(false)
    setCurrentRegionName(userLocation ? 'Sorted by your live GPS coordinates' : 'Metro Manila & Rizal area directory')
  }

  // Computed matching clinics from local data for autocomplete
  const trimmedQuery = searchQuery.trim().toLowerCase()

  const matchingClinics = useMemo(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) return []
    return allVets
      .filter(
        (vet) =>
          vet.name.toLowerCase().includes(trimmedQuery) ||
          vet.address.toLowerCase().includes(trimmedQuery) ||
          vet.city.toLowerCase().includes(trimmedQuery)
      )
      .slice(0, 4)
  }, [trimmedQuery, allVets])

  // Dynamic distance calculation via Haversine formula relative to user location (or searched center)
  const vetsWithLiveDistance = useMemo(() => {
    return allVets.map((vet) => {
      let computedKm = 999
      let formattedDistance = vet.distance

      if (userLocation && typeof vet.latitude === 'number' && typeof vet.longitude === 'number') {
        computedKm = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          vet.latitude,
          vet.longitude
        )
        formattedDistance = formatDistanceString(computedKm)
      }

      return {
        ...vet,
        computedKm,
        formattedDistance,
      }
    })
  }, [allVets, userLocation])

  // Filter by 24/7 emergency and open status (search query no longer filters the list inline —
  // it triggers a geocode + live fetch instead)
  const filteredVets = useMemo(() => {
    return vetsWithLiveDistance.filter((vet) => {
      if (filterEmergency && !vet.emergency) return false
      if (filterOpenNow && !vet.openNow) return false
      return true
    })
  }, [vetsWithLiveDistance, filterEmergency, filterOpenNow])

  // Sort closest clinics first
  const sortedVets = useMemo(() => {
    return [...filteredVets].sort((a, b) => a.computedKm - b.computedKm)
  }, [filteredVets])

  const visibleVets = expanded ? sortedVets : sortedVets.slice(0, INITIAL_COUNT)
  const activeVet = sortedVets.find((vet) => vet.id === selectedVet?.id) ?? sortedVets[0] ?? null
  const nearestVet = sortedVets[0] ?? null

  // Compute adaptive map boundaries
  const mapBounds = useMemo(() => {
    return computeMapBounds(sortedVets.slice(0, 10), userLocation)
  }, [sortedVets, userLocation])

  const selectVet = (vet: Vet) => {
    setSelectedVet(vet)
    setExpandedClinicId((prev) => (prev === vet.id ? null : vet.id))
    if (window.innerWidth < 1024) setMobileTab('map')
  }

  return (
    <section id="nearby-vets" className="bg-brand-cream/60 dark:bg-[#0d1717] py-12 sm:py-16 lg:py-20 transition-colors duration-300">
      <div className="@container mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-8 @3xl:grid-cols-12 @3xl:gap-10">
          
          {/* ── Left Column: Search & Location Controls ── */}
          <div className="@3xl:col-span-4 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-sage/10 dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-sage dark:text-emerald-400">
              <Compass className="size-4" /> NEAREST VET FINDER
            </span>
            
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white sm:text-4xl">
              Find the nearest vet.
            </h2>
            
            <p className="text-sm leading-relaxed text-brand-dark/75 dark:text-slate-300 sm:text-base">
              Instant distance and directions to verified veterinary clinics and 24/7 animal hospitals near you.
            </p>

            {/* ── User Location & Proximity Status Card ── */}
            <div className="rounded-2xl border border-brand-sage/20 dark:border-slate-800 bg-white dark:bg-[#132525] p-4 shadow-xs transition-all space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      userLocation
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-brand-sage/10 dark:bg-slate-800 text-brand-sage dark:text-emerald-400'
                    }`}
                  >
                    {isLocating ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <MapPin className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-slate-400">
                        {userLocation?.source === 'gps'
                          ? 'Live GPS Location'
                          : userLocation?.source === 'search'
                          ? 'Searched Location'
                          : 'Proximity'}
                      </span>
                      {userLocation?.source === 'gps' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-extrabold text-brand-dark dark:text-white truncate mt-0.5">
                      {userLocation
                        ? userLocation.displayName || userLocation.city || 'Coordinates Acquired'
                        : 'Location Not Set'}
                    </p>
                    <p className="text-xs text-brand-dark/60 dark:text-slate-400 truncate mt-0.5">
                      {locationSubtitle}
                    </p>
                  </div>
                </div>

                {/* Location Action Button */}
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-xs ${
                    userLocation?.source === 'gps'
                      ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-brand-dark hover:bg-brand-sage text-white'
                  }`}
                  title={userLocation?.source === 'gps' ? 'Refresh live GPS location' : 'Use your current location'}
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : userLocation?.source === 'gps' ? (
                    <>
                      <RotateCcw className="size-3.5" />
                      <span>Refresh</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="size-3.5" />
                      <span>Use My Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Permission Denied Alert */}
              {locationStatus === 'denied' && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="size-3.5 text-amber-600 shrink-0" />
                    Location access blocked
                  </p>
                  <p className="mt-0.5 text-amber-800/90 dark:text-amber-300">
                    Enable location access in your browser or type any Philippine city/neighborhood in the search bar below.
                  </p>
                </div>
              )}

              {/* Nearest Clinic Highlight Badge */}
              {userLocation && nearestVet && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  <Sparkles className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">
                    Closest: <strong>{nearestVet.name}</strong> ({nearestVet.formattedDistance})
                  </span>
                </div>
              )}
            </div>

            {/* ── Search Input with Live Autocomplete ── */}
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleLocationSearch} className="relative">
                <span className="sr-only">Search city, neighborhood, or clinic</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-dark/40 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city, neighborhood, or clinic name..."
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-brand-dark/15 dark:border-slate-700 bg-white dark:bg-[#132525] py-2.5 pl-10 pr-24 text-sm text-brand-dark dark:text-white placeholder:text-brand-dark/40 dark:placeholder:text-slate-500 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/20 transition-all shadow-xs"
                />
                
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setShowSuggestions(false)
                        setLocationSuggestions([])
                      }}
                      className="p-1 rounded-md text-brand-dark/40 hover:text-brand-dark dark:text-slate-400 dark:hover:text-white hover:bg-black/5 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSearchingLocation}
                    className="rounded-lg bg-brand-sage dark:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold hover:bg-brand-sage/90 transition-colors cursor-pointer disabled:opacity-50"
                    title="Search location via geocoding"
                  >
                    {isSearchingLocation ? <Loader2 className="size-3.5 animate-spin" /> : 'Search'}
                  </button>
                </div>
              </form>

              {/* Live Suggestions Popup Dropdown */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-brand-sage/20 dark:border-slate-700 bg-white dark:bg-[#132525] shadow-xl overflow-hidden py-1.5 max-h-80 overflow-y-auto">
                  
                  {/* Loading indicator */}
                  {isFetchingSuggestions && (
                    <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-brand-dark/50 dark:text-slate-400">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Searching places...</span>
                    </div>
                  )}

                  {/* Live Location Suggestions from Nominatim */}
                  {locationSuggestions.length > 0 && (
                    <div className="p-1">
                      <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-dark/45 dark:text-slate-400">
                        Locations & Areas
                      </p>
                      {locationSuggestions.map((suggestion, idx) => (
                        <button
                          key={`${suggestion.lat}-${suggestion.lon}-${idx}`}
                          type="button"
                          onClick={() => handleSelectLocation(suggestion)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl hover:bg-brand-sage/10 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                        >
                          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/80 transition-colors">
                            <MapPin className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-brand-dark dark:text-white truncate">
                              {suggestion.shortName}
                            </p>
                            <p className="text-[10px] text-brand-dark/45 dark:text-slate-400 truncate leading-tight">
                              {suggestion.displayName}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] text-brand-dark/35 dark:text-slate-500 capitalize">
                            {suggestion.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Clinics from local data */}
                  {matchingClinics.length > 0 && (
                    <div className={`p-1 ${locationSuggestions.length > 0 ? 'border-t border-brand-dark/5 dark:border-slate-800' : ''}`}>
                      <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-dark/45 dark:text-slate-400">
                        Veterinary Clinics
                      </p>
                      {matchingClinics.map((clinic) => (
                        <button
                          key={clinic.id}
                          type="button"
                          onClick={() => handleSelectClinic(clinic)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-xl hover:bg-brand-sage/10 dark:hover:bg-slate-800/80 transition-colors text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 shrink-0">
                              <Building2 className="size-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-brand-dark dark:text-white truncate">
                                {clinic.name}
                              </p>
                              <p className="text-[10px] text-brand-dark/50 dark:text-slate-400 truncate">
                                {clinic.city || clinic.address}
                              </p>
                            </div>
                          </div>
                          {clinic.distance && (
                            <span className="shrink-0 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              {clinic.distance}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!isFetchingSuggestions && locationSuggestions.length === 0 && matchingClinics.length === 0 && (
                    <div className="px-4 py-3 text-center text-xs text-brand-dark/60 dark:text-slate-400">
                      Press <kbd className="font-bold text-brand-dark dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Enter</kbd> or tap Search to look up "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Filter Controls Row ── */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* All Clinics Pill */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterEmergency(false)
                    setFilterOpenNow(false)
                  }}
                  className={`min-h-9 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                    !filterEmergency && !filterOpenNow
                      ? 'bg-brand-sage text-white shadow-xs'
                      : 'border border-brand-dark/15 dark:border-slate-700 bg-white dark:bg-[#132525] text-brand-dark/75 dark:text-slate-300 hover:bg-brand-cream dark:hover:bg-[#1a3333]'
                  }`}
                >
                  All ({vetsWithLiveDistance.length})
                </button>

                {/* Emergency 24/7 Filter */}
                <button
                  type="button"
                  aria-pressed={filterEmergency}
                  onClick={() => setFilterEmergency((value) => !value)}
                  className={`min-h-9 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                    filterEmergency
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                      : 'border border-brand-dark/15 dark:border-slate-700 bg-white dark:bg-[#132525] text-brand-dark/75 dark:text-slate-300 hover:bg-brand-cream dark:hover:bg-[#1a3333]'
                  }`}
                >
                  🚨 24/7 Emergency
                </button>

                {/* Open Now Filter */}
                <button
                  type="button"
                  aria-pressed={filterOpenNow}
                  onClick={() => setFilterOpenNow((value) => !value)}
                  className={`min-h-9 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                    filterOpenNow
                      ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/30'
                      : 'border border-brand-dark/15 dark:border-slate-700 bg-white dark:bg-[#132525] text-brand-dark/75 dark:text-slate-300 hover:bg-brand-cream dark:hover:bg-[#1a3333]'
                  }`}
                >
                  🟢 Open Now
                </button>

                {/* Reset button (visible when query or filters active) */}
                {(filterEmergency || filterOpenNow || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex min-h-9 items-center gap-1 rounded-full border border-brand-dark/15 dark:border-slate-700 bg-white dark:bg-[#132525] px-3 text-xs font-bold text-brand-dark/70 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors cursor-pointer ml-auto"
                    title="Reset filters and search"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Clinic Count & Proximity Status */}
              <div className="flex items-center justify-between text-xs font-medium text-brand-dark/60 dark:text-slate-400 pt-0.5">
                <p>
                  Showing <span className="font-bold text-brand-dark dark:text-white">{visibleVets.length}</span>
                  {visibleVets.length < filteredVets.length && ` of ${filteredVets.length}`} {filteredVets.length === 1 ? 'clinic' : 'clinics'}
                  {userLocation && <span className="ml-1 text-emerald-700 dark:text-emerald-400 font-semibold">(nearest first)</span>}
                </p>
                {searchQuery && (
                  <span className="text-[11px] text-brand-dark/50 dark:text-slate-400 truncate max-w-[140px]">
                    for "{searchQuery}"
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Map & Distance-Ranked List ── */}
          <div className="min-w-0 @3xl:col-span-8">
            
            {/* Mobile Tab Toggle */}
            <div className="mb-3 flex rounded-xl border border-border/60 dark:border-slate-800 bg-white dark:bg-[#132525] p-1 @3xl:hidden">
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                aria-pressed={mobileTab === 'list'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold ${
                  mobileTab === 'list' ? 'bg-brand-sage text-white' : 'text-brand-dark/65 dark:text-slate-400'
                }`}
              >
                <List className="size-4" /> Clinics ({filteredVets.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                aria-pressed={mobileTab === 'map'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold ${
                  mobileTab === 'map' ? 'bg-brand-sage text-white' : 'text-brand-dark/65 dark:text-slate-400'
                }`}
              >
                <MapIcon className="size-4" /> Map View
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border/70 dark:border-slate-800 bg-white dark:bg-[#132525] shadow-sm transition-all">
              
              {/* ── Stylized Interactive Area Map ── */}
              <div className={`relative h-72 sm:h-80 overflow-hidden bg-[#e4ede1] dark:bg-[#0c1a1a] ${mobileTab === 'map' ? 'block' : 'hidden @3xl:block'}`}>
                
                {/* SVG Road Network Background */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full opacity-90 dark:opacity-40"
                  viewBox="0 0 720 320"
                  preserveAspectRatio="none"
                >
                  <path d="M-20 240 C 105 180 135 190 242 135 S 412 110 502 75 S 647 60 750 15" fill="none" stroke="#c8dcce" strokeWidth="40" />
                  <path d="M-20 240 C 105 180 135 190 242 135 S 412 110 502 75 S 647 60 750 15" fill="none" stroke="#ffffff" strokeWidth="5" />
                  <path d="M50 -20 C 100 55 155 100 198 175 S 238 270 260 340" fill="none" stroke="#ffffff" strokeWidth="14" />
                  <path d="M365 -20 C 340 50 362 120 398 170 S 490 250 528 340" fill="none" stroke="#ffffff" strokeWidth="10" />
                  <path d="M620 -20 C 564 65 581 125 624 190 S 688 265 725 340" fill="none" stroke="#ffffff" strokeWidth="14" />
                  <path d="M0 80 L720 200 M0 300 L720 110" fill="none" stroke="#ffffff" strokeWidth="4" />
                  <path d="M286 0 L328 320 M548 0 L445 320" fill="none" stroke="#ffffff" strokeWidth="3" />
                  <path d="M18 15 h112 v48 H18z M458 210 h91 v60 h-91z M210 25 h72 v38 h-72z" fill="#d2e3cb" opacity=".85" />
                </svg>

                {/* Top Badge on Map */}
                <div className="absolute left-3.5 top-3.5 z-20 flex items-center gap-2 rounded-full bg-white/95 dark:bg-[#132525]/95 px-3.5 py-1.5 text-[11px] font-semibold text-brand-dark dark:text-slate-200 shadow-sm backdrop-blur-sm border border-black/5 dark:border-white/10">
                  <span className={`size-2 rounded-full ${userLocation ? 'bg-emerald-500 animate-pulse' : 'bg-brand-sage'}`} />
                  <span>• {currentRegionName}</span>
                </div>

                {/* User's Current Live Location Pin on Map */}
                {userLocation && (
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
                    style={getMapCoordinates(userLocation.latitude, userLocation.longitude, mapBounds)}
                    title="Your location"
                  >
                    <span className="relative flex size-5 items-center justify-center">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75" />
                      <span className="relative inline-flex size-3.5 rounded-full bg-blue-600 ring-2 ring-white shadow-md" />
                    </span>
                  </div>
                )}

                {/* Interactive Clinic Map Pins */}
                {sortedVets.slice(0, 10).map((vet, index) => {
                  const isTopNearest = index === 0 && Boolean(userLocation)
                  const isSelected = activeVet?.id === vet.id
                  const pos = getMapCoordinates(vet.latitude, vet.longitude, mapBounds)

                  return (
                    <button
                      key={vet.id}
                      type="button"
                      onClick={() => setSelectedVet(vet)}
                      className={`absolute z-20 -translate-x-1/2 -translate-y-full rounded-full p-2 shadow-lg ring-2 ring-white dark:ring-slate-900 transition-all transform hover:scale-125 cursor-pointer ${
                        isSelected
                          ? 'bg-[#c2410c] text-white scale-125 z-30 ring-amber-300'
                          : isTopNearest
                          ? 'bg-emerald-700 text-white scale-110'
                          : vet.emergency
                          ? 'bg-rose-700 text-white'
                          : 'bg-[#1b4332] text-white'
                      }`}
                      style={pos}
                      aria-label={`Select ${vet.name} in ${vet.city}`}
                      title={`${vet.name} · ${vet.formattedDistance}`}
                    >
                      <MapPin className="size-4" />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 ring-1 ring-white animate-pulse" />
                      )}
                    </button>
                  )
                })}

                {/* ── Selected Clinic Floating Preview Card ── */}
                {activeVet ? (
                  <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-col gap-2 rounded-2xl border border-white/80 dark:border-slate-800 bg-white/95 dark:bg-[#132525]/95 p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        {/* Header Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sage dark:text-emerald-400">
                            SELECTED CLINIC
                          </span>
                          {activeVet.emergency && (
                            <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                              24/7 Emergency
                            </span>
                          )}
                          {userLocation && sortedVets[0]?.id === activeVet.id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                              <Sparkles className="size-2.5" /> Nearest to you
                            </span>
                          )}
                        </div>
                        
                        {/* Title */}
                        <p className="truncate text-base sm:text-lg font-black text-brand-dark dark:text-white mt-0.5">
                          {activeVet.name}
                        </p>
                        
                        {/* City, Distance, Hours */}
                        <p className="truncate text-xs text-brand-dark/75 dark:text-slate-300">
                          {activeVet.city} • <strong className="text-brand-dark dark:text-white font-bold">{activeVet.formattedDistance}</strong>
                          {activeVet.hours && ` • ${activeVet.hours}`}
                        </p>
                      </div>

                      {/* Quick Circular Action Buttons (Dark Call + Light Navigation) */}
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={`tel:${activeVet.phone.replace(/[^0-9+]/g, '')}`}
                          aria-label={`Call ${activeVet.name}`}
                          className="inline-flex size-10 items-center justify-center rounded-full bg-[#163832] dark:bg-[#1a423a] text-white hover:bg-brand-sage transition-all shadow-sm active:scale-95 cursor-pointer"
                          title={`Call ${activeVet.phone}`}
                        >
                          <Phone className="size-4" />
                        </a>
                        <a
                          href={getGoogleMapsRoutingUrl(activeVet, userLocation)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Turn-by-turn directions to ${activeVet.name}`}
                          className="inline-flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#163832] dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-pointer"
                          title="Open Google Maps Turn-by-Turn GPS Directions"
                        >
                          <Navigation className="size-4" />
                        </a>
                      </div>
                    </div>

                    {/* Services Line */}
                    {activeVet.services && activeVet.services.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40 dark:border-slate-800 text-[11px] text-brand-dark/75 dark:text-slate-400">
                        <span className="font-semibold text-brand-dark/60 dark:text-slate-400">Services:</span>
                        {activeVet.services.map((service) => (
                          <span
                            key={service}
                            className="text-brand-dark dark:text-slate-200 font-medium mr-1.5"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 dark:bg-[#132525]/95 p-3 text-sm font-semibold text-brand-dark/70 dark:text-slate-300 shadow-sm">
                    No clinics match these filters.
                  </div>
                )}
              </div>

              {/* ── Distance-Ranked Clinic List ── */}
              <div className={`divide-y divide-border/60 dark:divide-slate-800 ${mobileTab === 'list' ? 'block' : 'hidden @3xl:block'}`}>
                {visibleVets.length === 0 ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="mx-auto size-8 text-brand-dark/30 dark:text-slate-600" />
                    <h3 className="mt-3 font-bold text-brand-dark dark:text-white">No clinics found</h3>
                    <p className="mt-1 text-sm text-brand-dark/65 dark:text-slate-400">Try searching another city or reset filters.</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 min-h-11 rounded-xl px-4 text-sm font-bold text-brand-sage dark:text-emerald-400 hover:bg-brand-cream dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  visibleVets.map((vet, idx) => {
                    const isTopNearest = idx === 0 && Boolean(userLocation)
                    const isSelected = activeVet?.id === vet.id
                    const isAccordionExpanded = expandedClinicId === vet.id

                    return (
                      <div
                        key={vet.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-brand-sage/5 dark:bg-emerald-950/20'
                            : isTopNearest
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30'
                            : 'hover:bg-brand-cream/30 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 p-3.5 sm:gap-4 sm:px-5">
                          {/* Main Row Info */}
                          <button
                            type="button"
                            onClick={() => selectVet(vet)}
                            aria-pressed={isSelected}
                            className="min-h-11 min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage cursor-pointer"
                          >
                            {/* Top Line: Name & Badges */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-bold text-sm sm:text-base text-brand-dark dark:text-white">
                                {vet.name}
                              </span>

                              {isTopNearest && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                  <Sparkles className="size-2.5" /> Nearest
                                </span>
                              )}

                              {vet.emergency && (
                                <span className="rounded-full bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                                  24/7 emergency
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                  vet.openNow ? 'text-emerald-700 dark:text-emerald-400' : 'text-brand-dark/50 dark:text-slate-400'
                                }`}
                              >
                                <span className={`size-1.5 rounded-full ${vet.openNow ? 'bg-emerald-500' : 'bg-brand-dark/30 dark:bg-slate-600'}`} />
                                {vet.openNow ? 'Open now' : 'Closed'}
                              </span>
                            </div>

                            {/* Second Line: City · Address */}
                            <div className="mt-1 flex items-center gap-1 text-xs text-brand-dark/65 dark:text-slate-400 truncate">
                              <span>{vet.city}</span>
                              <span>·</span>
                              <span className="truncate">{vet.address}</span>
                            </div>
                          </button>

                          {/* Distance Display */}
                          <div className="shrink-0 text-right pr-1">
                            <span
                              className={`block text-xs sm:text-sm font-bold ${
                                isTopNearest ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-brand-dark dark:text-white'
                              }`}
                            >
                              {vet.formattedDistance}
                            </span>
                            <span className="text-[10px] text-brand-dark/50 dark:text-slate-400">
                              {userLocation ? 'from you' : 'approx.'}
                            </span>
                          </div>

                          {/* Action Buttons: Phone, Directions, Accordion Toggle */}
                          <div className="flex shrink-0 items-center gap-1">
                            <a
                              href={`tel:${vet.phone.replace(/[^0-9+]/g, '')}`}
                              aria-label={`Call ${vet.name}`}
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-brand-sage dark:text-emerald-400 hover:bg-brand-sage/10 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title={`Call ${vet.phone}`}
                            >
                              <Phone className="size-4" />
                            </a>

                            <a
                              href={getGoogleMapsRoutingUrl(vet, userLocation)}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Turn-by-turn directions to ${vet.name}`}
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-cream/60 dark:bg-slate-800 text-brand-dark dark:text-white hover:bg-brand-sage hover:text-white transition-colors cursor-pointer"
                              title="Open Google Maps Turn-by-Turn GPS Directions"
                            >
                              <Navigation className="size-4" />
                            </a>

                            <button
                              type="button"
                              onClick={() => setExpandedClinicId((prev) => (prev === vet.id ? null : vet.id))}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-brand-dark/40 hover:text-brand-dark dark:text-slate-500 dark:hover:text-white transition-colors cursor-pointer"
                              title={isAccordionExpanded ? 'Hide details' : 'View clinic details'}
                            >
                              {isAccordionExpanded ? (
                                <ChevronUp className="size-4" />
                              ) : (
                                <ChevronDown className="size-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Clinic Accordion Panel */}
                        {isAccordionExpanded && (
                          <div className="px-5 pb-4 pt-1 border-t border-border/30 dark:border-slate-800/60 bg-brand-cream/20 dark:bg-slate-900/40 text-xs space-y-2.5 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-brand-dark/80 dark:text-slate-300">
                              {vet.hours && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="size-3.5 text-brand-sage dark:text-emerald-400" />
                                  <span>Hours: <strong>{vet.hours}</strong></span>
                                </div>
                              )}
                              {typeof vet.latitude === 'number' && typeof vet.longitude === 'number' && (
                                <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/60 dark:text-slate-400">
                                  <MapPin className="size-3.5 text-brand-sage dark:text-emerald-400" />
                                  <span>GPS: {vet.latitude.toFixed(4)}, {vet.longitude.toFixed(4)}</span>
                                </div>
                              )}
                            </div>

                            {vet.services && vet.services.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="font-semibold text-brand-dark/60 dark:text-slate-400">Services:</span>
                                {vet.services.map((svc) => (
                                  <span
                                    key={svc}
                                    className="rounded-full bg-white dark:bg-slate-800 border border-brand-dark/10 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-brand-dark dark:text-slate-200"
                                  >
                                    {svc}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-3 pt-1">
                              <a
                                href={`tel:${vet.phone.replace(/[^0-9+]/g, '')}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-dark dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-sage transition-colors cursor-pointer"
                              >
                                <Phone className="size-3" />
                                <span>Call {vet.phone}</span>
                              </a>
                              <a
                                href={getGoogleMapsRoutingUrl(vet, userLocation)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-sage px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-sage/90 transition-colors cursor-pointer"
                              >
                                <Navigation className="size-3" />
                                <span>Get Directions (Google Maps)</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}

                {/* Show more / fewer clinics button */}
                {filteredVets.length > INITIAL_COUNT && (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="min-h-12 w-full px-4 text-sm font-bold text-brand-sage dark:text-emerald-400 hover:bg-brand-cream/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-center"
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
