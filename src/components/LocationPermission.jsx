import { useState, useEffect } from 'react'
import { MapPin, AlertCircle, CheckCircle, X, Settings, RefreshCw } from 'lucide-react'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from './Toast'

export default function LocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState('unknown')
  const [showPrompt, setShowPrompt] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    checkPermissionStatus()
  }, [])

  const checkPermissionStatus = async () => {
    if (!navigator.geolocation) {
      setPermissionStatus('not-supported')
      return
    }

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setPermissionStatus(result.state)
        
        // Show prompt if permission is denied or prompt
        if (result.state === 'denied' || result.state === 'prompt') {
          setShowPrompt(true)
        }
      } catch (error) {
        console.log('Permission check failed:', error)
        setPermissionStatus('unknown')
        setShowPrompt(true)
      }
    } else {
      // Fallback for browsers that don't support permissions API
      setPermissionStatus('unknown')
      setShowPrompt(true)
    }
  }

  const handleRequestPermission = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device')
      return
    }

    setIsRetrying(true)
    hapticFeedback('light')

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      })

      setPermissionStatus('granted')
      setShowPrompt(false)
      toast.success('Location permission granted!')
      hapticFeedback('success')

    } catch (error) {
      console.error('Location permission error:', error)
      
      let errorMessage = 'Failed to get location permission'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable it in your browser settings.'
          setPermissionStatus('denied')
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please check your GPS settings.'
          setPermissionStatus('unavailable')
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.'
          setPermissionStatus('timeout')
          break
      }
      
      toast.error(errorMessage)
      hapticFeedback('error')
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDismiss = () => {
    hapticFeedback('light')
    setShowPrompt(false)
  }

  const handleOpenSettings = () => {
    hapticFeedback('medium')
    
    // Show detailed instructions based on browser
    const isChrome = /Chrome/.test(navigator.userAgent)
    const isFirefox = /Firefox/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    let instructions = 'Please enable location permission in your browser settings.'
    
    if (isChrome) {
      instructions = 'Chrome: Click the lock icon 🔒 in the address bar → Site settings → Location → Allow'
    } else if (isFirefox) {
      instructions = 'Firefox: Click the lock icon 🔒 → Connection secure → More information → Permissions → Location → Allow'
    } else if (isSafari) {
      instructions = 'Safari: Safari → Settings for This Website → Location → Allow'
    }
    
    toast.info(instructions, 'Enable Location Access')
  }
  
  const handleUseManual = () => {
    hapticFeedback('light')
    setShowPrompt(false)
    // Redirect to manual location selection
    window.location.href = '/select-location'
  }

  // Don't show if permission is granted or not supported
  if (permissionStatus === 'granted' || permissionStatus === 'not-supported' || !showPrompt) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-in-down">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Location Permission</h3>
              <p className="text-sm text-gray-600">We need your location for delivery</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Why do we need your location?</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Check if we deliver to your area</li>
                <li>• Show nearby stores and restaurants</li>
                <li>• Provide accurate delivery estimates</li>
                <li>• Save your delivery addresses</li>
              </ul>
            </div>
          </div>

          {/* Permission Status */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              {permissionStatus === 'denied' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {permissionStatus === 'denied' 
                  ? 'Permission Denied' 
                  : 'Permission Required'}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {permissionStatus === 'denied'
                ? 'Location access is blocked. Please enable it in your browser settings.'
                : 'Click "Allow Location" when prompted by your browser.'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              {permissionStatus === 'denied' ? (
                <>
                  <button
                    onClick={handleOpenSettings}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Open Settings
                  </button>
                  <button
                    onClick={handleUseManual}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Choose on Map
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  disabled={isRetrying}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isRetrying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {isRetrying ? 'Requesting...' : 'Allow Location'}
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {permissionStatus !== 'denied' && (
                <button
                  onClick={handleUseManual}
                  className="flex-1 text-sm px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Choose on Map Instead
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="flex-1 text-sm px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {permissionStatus === 'denied' ? 'Close' : 'Maybe Later'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
