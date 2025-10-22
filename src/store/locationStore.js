import { create } from 'zustand'
import { getUserLocation, getCachedLocation, cacheLocation } from '../services/locationService'

export const useLocationStore = create((set, get) => ({
  location: null,
  loading: false,
  error: null,
  isServiceAvailable: null,
  serviceArea: null,
  
  // Set location directly
  setLocation: (locationData) => set({ location: locationData }),
  setServiceAvailable: (available) => set({ isServiceAvailable: available }),
  
  // Initialize location (check cache first, then request)
  initializeLocation: async () => {
    // Check cache first
    const cached = getCachedLocation()
    if (cached) {
      set({
        location: cached,
        isServiceAvailable: cached.available,
        serviceArea: cached.area
      })
      return cached
    }
    
    // Request new location
    return get().requestLocation()
  },
  
  // Request user's current location
  requestLocation: async () => {
    set({ loading: true, error: null })
    
    try {
      console.log('🔍 Requesting location from store...')
      const locationData = await getUserLocation({ allowDefault: true })
      
      console.log('✅ Location received in store:', locationData)
      
      set({
        location: {
          ...locationData,
          formattedAddress: locationData.formattedAddress || locationData.address,
          city: locationData.city,
          state: locationData.state
        },
        isServiceAvailable: locationData.available !== undefined ? locationData.available : true,
        serviceArea: locationData.area || null,
        loading: false,
        error: null
      })
      
      // Cache the location
      cacheLocation(locationData)
      
      console.log('✅ Location stored successfully')
      return locationData
    } catch (error) {
      console.error('❌ Location request failed:', error)
      set({
        loading: false,
        error: error.message,
        isServiceAvailable: null
      })
      throw error
    }
  },
  
  // Clear location data
  clearLocation: () => {
    localStorage.removeItem('user_location')
    set({
      location: null,
      isServiceAvailable: null,
      serviceArea: null,
      error: null
    })
  },
  
  // Retry location request
  retryLocation: () => {
    return get().requestLocation()
  }
}))

