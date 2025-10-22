import { useEffect, useState } from 'react'
import { MapPin, X, RefreshCw, AlertCircle, Navigation, ChevronDown, ChevronUp } from 'lucide-react'
import { useLocationStore } from '../store/locationStore'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from './Toast'

export default function LocationBanner() {
  const {
    location,
    loading,
    error,
    isServiceAvailable,
    serviceArea,
    initializeLocation,
    retryLocation,
    clearLocation
  } = useLocationStore()
  
  const [dismissed, setDismissed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Auto-detect location on component mount with a small delay
    const timer = setTimeout(() => {
      initializeLocation().catch(err => {
        console.error('Location detection:', err)
        toast.error('Failed to detect location')
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    hapticFeedback('light')
  }

  const handleRetry = () => {
    hapticFeedback('light')
    retryLocation().catch(err => {
      console.error('Location retry:', err)
      toast.error('Failed to detect location')
    })
  }

  const handleToggleDetails = () => {
    setShowDetails(!showDetails)
    hapticFeedback('light')
  }

  // Don't show if dismissed or no location data yet
  if (dismissed || (!loading && !location && !error)) {
    return null
  }

  // Don't show banner (now handled in Navbar)
  if (isServiceAvailable === true) {
    return null
  }

  // Don't show banner if service is unavailable (handled by redirect)
  if (isServiceAvailable === false) {
    return null
  }

  // Show error banner
  if (error && !dismissed) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 animate-fade-in">
        <div className="container-custom py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  {error}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button
                    onClick={handleRetry}
                    className="text-xs text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-1.5 group"
                  >
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    Try Again
                  </button>
                  <button
                    onClick={handleToggleDetails}
                    className="text-xs text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-1.5"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show Details
                      </>
                    )}
                  </button>
                </div>
                {showDetails && (
                  <div className="mt-2 text-xs text-yellow-600 space-y-1">
                    <p>• Make sure location services are enabled in your device settings</p>
                    <p>• Allow location access when prompted by your browser</p>
                    <p>• Try refreshing the page if the issue persists</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-yellow-100 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-yellow-600" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 animate-fade-in">
        <div className="container-custom py-3">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Navigation className="w-4 h-4 text-gray-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-700 font-medium">
                  Detecting your location...
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                This helps us check if we deliver to your area
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

