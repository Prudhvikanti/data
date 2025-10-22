import { useState } from 'react'
import { MapPin, AlertCircle, Mail, Phone, RefreshCw, Map } from 'lucide-react'
import { useLocationStore } from '../store/locationStore'
import { Link } from 'react-router-dom'
import LocationMap from './LocationMap'
import { hapticFeedback } from '../utils/hapticFeedback'

export default function ServiceUnavailable() {
  const { location, retryLocation, loading } = useLocationStore()
  const [showMap, setShowMap] = useState(false)

  const handleMapLocationSelect = (locationData) => {
    // Update location store with map selection
    if (locationData.isServiceAvailable) {
      window.location.href = '/' // Redirect if service becomes available
    }
  }

  const serviceAreas = [
    { name: "Samalkota", pincode: "533434" },
    { name: "Kakinada", pincode: "533001" },
    { name: "Rajahmundry", pincode: "533101" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="card p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Service Currently Unavailable
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We're not operating in your area yet, but we're expanding soon!
          </p>

          {/* Location Details */}
          {location && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 mb-2">Your Location Details:</p>
                  <p className="text-sm text-red-700">
                    Coordinates: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Distance from nearest service area: {(location.distance / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Service Areas */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              We Currently Serve These Areas:
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {serviceAreas.map((area, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-primary-200">
                  <p className="font-semibold text-gray-900">{area.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Pincode: {area.pincode}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          {showMap ? (
            <div className="mb-6">
              <LocationMap onLocationSelect={handleMapLocationSelect} />
              <button
                onClick={() => setShowMap(false)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Hide Map
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMap(true)}
              className="w-full mb-6 btn-secondary flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5" />
              Select Location on Map
            </button>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={retryLocation}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Checking Location...' : 'Retry Auto Detection'}
            </button>

            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="mailto:support@quickcommerce.com"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
              <a
                href="tel:+911234567890"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Want us in your area?</h3>
            <p className="text-sm text-gray-600 mb-4">
              We're rapidly expanding! Drop us your location details and we'll notify you when we launch in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1"
              />
              <button className="btn-primary whitespace-nowrap">
                Notify Me
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6">
            <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Homepage
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Operating Hours: 6:00 AM - 11:00 PM (All Days)
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Delivery Time: 10-15 minutes in service areas
          </p>
        </div>
      </div>
    </div>
  )
}


