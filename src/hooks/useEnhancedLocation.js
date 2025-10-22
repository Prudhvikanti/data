// Enhanced Location Detection Hook
// Provides improved location detection with better accuracy and error handling

import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserLocation, checkLocationPermission, getCachedLocation, cacheLocation } from '../services/locationService'
import { useLocationStore } from '../store/locationStore'
import { toast } from '../components/Toast'

export function useEnhancedLocation(options = {}) {
  const {
    autoDetect = false,
    showToasts = true,
    cacheResults = true,
    retryAttempts = 2,
    timeout = 10000
  } = options

  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState(null)
  const [locationData, setLocationData] = useState(null)
  const attemptsRef = useRef(0)
  
  const { setLocation } = useLocationStore()

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const permission = await checkLocationPermission()
      setPermissionStatus(permission.status)
      return permission
    } catch (error) {
      console.error('Error checking permission:', error)
      return { supported: false, status: 'unknown' }
    }
  }, [])

  // Detect location with enhanced error handling
  const detectLocation = useCallback(async () => {
    setDetecting(true)
    setError(null)
    attemptsRef.current = 0

    try {
      // First check permission
      const permission = await checkPermission()
      
      if (permission.status === 'denied') {
        throw new Error('Location permission denied. Please enable location access in your browser settings.')
      }

      // Try to get cached location first
      if (cacheResults) {
        const cached = getCachedLocation()
        if (cached && !cached.isDefault) {
          setLocationData(cached)
          setLocation(cached)
          if (showToasts) {
            toast.success('Using cached location')
          }
          setDetecting(false)
          return cached
        }
      }

      // Get fresh location
      const location = await getUserLocation()
      
      setLocationData(location)
      setLocation(location)
      
      if (cacheResults) {
        cacheLocation(location)
      }

      if (showToasts) {
        if (location.available) {
          toast.success(`Location detected: ${location.city || location.area || 'Service available'}`)
        } else {
          toast.error('Service not available in your area')
        }
      }

      setDetecting(false)
      return location
      
    } catch (error) {
      console.error('Location detection error:', error)
      setError(error.message)
      
      // Retry logic
      if (attemptsRef.current < retryAttempts) {
        attemptsRef.current++
        if (showToasts) {
          toast.info(`Retrying location detection... (${attemptsRef.current}/${retryAttempts})`)
        }
        setTimeout(() => detectLocation(), 2000)
      } else {
        if (showToasts) {
          toast.error(error.message || 'Failed to detect location')
        }
        setDetecting(false)
      }
      
      throw error
    }
  }, [checkPermission, setLocation, cacheResults, showToasts, retryAttempts])

  // Request location with permission prompt
  const requestLocation = useCallback(async () => {
    try {
      const location = await detectLocation()
      return location
    } catch (error) {
      console.error('Request location error:', error)
      throw error
    }
  }, [detectLocation])

  // Refresh location
  const refreshLocation = useCallback(async () => {
    // Clear cache and detect again
    localStorage.removeItem('user_location')
    return await detectLocation()
  }, [detectLocation])

  // Auto-detect on mount if enabled
  useEffect(() => {
    if (autoDetect) {
      detectLocation().catch(console.error)
    }
  }, [autoDetect, detectLocation])

  // Check permission status on mount
  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    detecting,
    error,
    permissionStatus,
    locationData,
    detectLocation,
    requestLocation,
    refreshLocation,
    checkPermission
  }
}

export default useEnhancedLocation
