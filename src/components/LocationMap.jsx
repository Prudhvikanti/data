import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, Loader2, MapPinned, Navigation, AlertCircle, X, ChevronDown, ChevronUp, Compass } from 'lucide-react'
import { reverseGeocode, forwardGeocode, checkServiceWithPincode } from '../services/geocodingService'
import { useLocationStore } from '../store/locationStore'
import { SERVICE_AREAS } from '../services/locationService'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from './Toast'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

export default function LocationMap({ onLocationSelect, showSearch = true }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const accuracyCircleRef = useRef(null)
  const serviceAreasRef = useRef([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [addressDetails, setAddressDetails] = useState(null)
  const [error, setError] = useState(null)
  const [showServiceAreas, setShowServiceAreas] = useState(false)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  
  const { location } = useLocationStore()

  useEffect(() => {
    let L
    const initializeMap = async () => {
      try {
        L = await import('leaflet')
        
        // Set custom marker icons
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        })

        // Initialize map if not already initialized
        if (!mapInstanceRef.current && mapRef.current) {
          // Create map instance
          mapInstanceRef.current = L.map(mapRef.current).setView([17.0511, 82.1733], 13)

          // Add tile layer with retina support
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            detectRetina: true
          }).addTo(mapInstanceRef.current)

          // Add marker
          markerRef.current = L.marker([17.0511, 82.1733], {
            draggable: true,
            autoPan: true
          }).addTo(mapInstanceRef.current)

          // Add service areas
          SERVICE_AREAS.forEach(area => {
            const circle = L.circle([area.center.lat, area.center.lng], {
              radius: area.radius, // Already in meters
              color: '#4F46E5',
              fillColor: '#4F46E5',
              fillOpacity: 0.1,
              weight: 1
            }).addTo(mapInstanceRef.current)
            serviceAreasRef.current.push(circle)
          })

          // Event listeners
          mapInstanceRef.current.on('click', async (e) => {
            const { lat, lng } = e.latlng
            markerRef.current.setLatLng([lat, lng])
            await handleLocationSelect(lat, lng)
            hapticFeedback('light')
          })

          markerRef.current.on('dragend', async () => {
            const { lat, lng } = markerRef.current.getLatLng()
            await handleLocationSelect(lat, lng)
            hapticFeedback('light')
          })

          // Get initial address if location exists
          if (location) {
            await handleLocationSelect(location.latitude, location.longitude)
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error)
        setError('Failed to initialize map. Please refresh the page.')
        toast.error('Failed to initialize map')
      }
    }

    initializeMap()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || searching) return

    try {
      setSearching(true)
      hapticFeedback('light')
      const results = await forwardGeocode(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search location')
    } finally {
      setSearching(false)
    }
  }

  const handleSearchResultClick = async (result) => {
    if (mapInstanceRef.current && markerRef.current) {
      const { lat, lng } = result.coordinates
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true })
      markerRef.current.setLatLng([lat, lng])
      await handleLocationSelect(lat, lng)
      setSearchResults([])
      setSearchQuery('')
      hapticFeedback('light')
    }
  }

  const handleLocationSelect = async (latitude, longitude) => {
    try {
      setLoading(true)
      setError(null)

      // Get address details
      const address = await reverseGeocode(latitude, longitude)
      
      // Check service availability
      const serviceCheck = await checkServiceWithPincode(latitude, longitude)

      setAddressDetails({
        ...address,
        ...serviceCheck,
        latitude,
        longitude
      })

      // Notify parent component
      if (onLocationSelect) {
        onLocationSelect({
          latitude,
          longitude,
          ...address,
          ...serviceCheck
        })
      }

      if (serviceCheck.isServiceAvailable) {
        hapticFeedback('medium')
        toast.success('Service is available at this location!')
      } else {
        hapticFeedback('light')
        toast.info('Service is not available at this location')
      }
    } catch (error) {
      console.error('Location select error:', error)
      setError('Failed to get address details')
      toast.error('Failed to get address details')
    } finally {
      setLoading(false)
    }
  }

  const handleCurrentLocation = async () => {
    try {
      setLoading(true)
      hapticFeedback('light')

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        })
      })

      const { latitude, longitude, accuracy } = position.coords
      setLocationAccuracy(accuracy)

      // Update map and marker
      mapInstanceRef.current.setView([latitude, longitude], 15, { animate: true })
      markerRef.current.setLatLng([latitude, longitude])

      // Show accuracy circle
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove()
      }
      accuracyCircleRef.current = L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#4F46E5',
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(mapInstanceRef.current)

      // Get address
      await handleLocationSelect(latitude, longitude)
      toast.success('Location detected successfully!')
    } catch (error) {
      console.error('Current location error:', error)
      
      let errorMessage = 'Failed to get current location'
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
        toast.error('Location permission denied. Please enable location access.')
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information is unavailable. Please check your GPS settings.'
        toast.error('Location unavailable. Please check your GPS settings.')
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out. Please try again.'
        toast.error('Location request timed out. Please try again.')
      } else {
        toast.error('Failed to get current location')
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceAreas = () => {
    setShowServiceAreas(!showServiceAreas)
    serviceAreasRef.current.forEach(circle => {
      circle.setStyle({ opacity: showServiceAreas ? 0 : 1, fillOpacity: showServiceAreas ? 0 : 0.1 })
    })
    hapticFeedback('light')
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address, area, or pincode..."
              className="w-full pl-10 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {result.city || 'Unknown'}
                        {result.pincode && (
                          <span className="ml-2 text-primary-600">({result.pincode})</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {result.formattedAddress}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
        <div ref={mapRef} className="h-96 md:h-[500px] w-full" />
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          {/* Service Areas Toggle */}
          <button
            onClick={toggleServiceAreas}
            className="bg-white hover:bg-gray-50 p-3 rounded-xl shadow-lg border border-gray-200 transition-colors z-[1000] group"
            title={showServiceAreas ? 'Hide service areas' : 'Show service areas'}
          >
            {showServiceAreas ? (
              <ChevronDown className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            ) : (
              <ChevronUp className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            )}
          </button>

          {/* Current Location */}
          <button
            onClick={handleCurrentLocation}
            className="bg-white hover:bg-gray-50 p-3 rounded-xl shadow-lg border border-gray-200 transition-colors z-[1000] group"
            title="Use my current location"
          >
            <Compass className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
          </button>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              <span className="text-sm font-medium text-gray-900">Getting address...</span>
            </div>
          </div>
        )}
      </div>

      {/* Address Details */}
      {addressDetails && (
        <div className={`rounded-xl p-4 border-2 ${addressDetails.isServiceAvailable ? 'border-primary-200 bg-primary-50' : 'border-red-200 bg-red-50'} animate-fade-in`}>
          <div className="flex items-start gap-3">
            <MapPinned className={`w-5 h-5 flex-shrink-0 mt-0.5 ${addressDetails.isServiceAvailable ? 'text-primary-600' : 'text-red-600'}`} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-semibold ${addressDetails.isServiceAvailable ? 'text-primary-900' : 'text-red-900'}`}>
                  {addressDetails.isServiceAvailable ? '✅ Service Available' : '❌ Service Unavailable'}
                </h3>
                {addressDetails.pincode && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${addressDetails.isServiceAvailable ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'}`}>
                    {addressDetails.pincode}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {addressDetails.formattedAddress}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {addressDetails.city && (
                  <span className="text-xs text-gray-600">{addressDetails.city}</span>
                )}
                {addressDetails.state && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">{addressDetails.state}</span>
                  </>
                )}
                {locationAccuracy && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                      Accuracy: {Math.round(locationAccuracy)}m
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

