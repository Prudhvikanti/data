// Service areas (you can customize these coordinates)
const SERVICE_AREAS = [
  {
    name: "Samalkota",
    pincode: "533434",
    center: { lat: 17.0511, lng: 82.1733 }, // Samalkota, Andhra Pradesh, India
    radius: 15000 // 15km in meters
  },
  {
    name: "Kakinada",
    pincode: "533001",
    center: { lat: 16.9891, lng: 82.2475 }, // Nearby city
    radius: 20000 // 20km in meters
  },
  {
    name: "Rajahmundry",
    pincode: "533101",
    center: { lat: 17.0005, lng: 81.8040 }, // Nearby city
    radius: 20000 // 20km in meters
  }
  // Add more service areas as needed
]

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Check if location is in any service area
function isInServiceArea(userLat, userLng) {
  for (const area of SERVICE_AREAS) {
    const distance = calculateDistance(
      userLat,
      userLng,
      area.center.lat,
      area.center.lng
    )
    if (distance <= area.radius) {
      return { available: true, area: area.name, distance }
    }
  }
  return { available: false }
}

// Get default location (Samalkota - your primary service area)
function getDefaultLocation() {
  return {
    latitude: SERVICE_AREAS[0].center.lat,
    longitude: SERVICE_AREAS[0].center.lng,
    city: SERVICE_AREAS[0].name,
    state: 'Andhra Pradesh',
    pincode: SERVICE_AREAS[0].pincode,
    formattedAddress: `${SERVICE_AREAS[0].name}, Andhra Pradesh`,
    available: true,
    area: SERVICE_AREAS[0].name,
    isDefault: true // Flag to indicate this is a default location
  }
}

// Check location permission status
export async function checkLocationPermission() {
  if (!navigator.geolocation) {
    return { supported: false, status: 'not-supported' }
  }

  if ('permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return { supported: true, status: result.state }
    } catch (error) {
      return { supported: true, status: 'unknown' }
    }
  }

  return { supported: true, status: 'unknown' }
}

// Get user's current location with enhanced accuracy and permission handling
export async function getUserLocation(options = {}) {
  const { 
    allowDefault = true, 
    forceNew = false,
    highAccuracy = true,
    timeout = 15000 
  } = options

  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location')
      if (allowDefault) {
        resolve(getDefaultLocation())
      } else {
        reject(new Error('Geolocation is not supported by this browser'))
      }
      return
    }

    // Try high accuracy first, fallback to lower accuracy if fails
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('✅ Location detected successfully:', position.coords)
          const { latitude, longitude, accuracy } = position.coords
          const serviceCheck = isInServiceArea(latitude, longitude)
          
          // Get address details for better accuracy
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { 'User-Agent': 'QuickCommerce/1.0' } }
            )
            const data = await response.json()
            const addr = data.address || {}
            
            const result = {
              latitude,
              longitude,
              accuracy,
              city: addr.city || addr.town || addr.village || null,
              state: addr.state || null,
              pincode: addr.postcode || null,
              formattedAddress: data.display_name || null,
              ...serviceCheck,
              detectionMethod: 'gps'
            }
            
            console.log('✅ Location with address:', result)
            resolve(result)
          } catch (geocodeError) {
            console.warn('Geocoding failed, returning coordinates only:', geocodeError)
            // Return without address details if geocoding fails
            resolve({
              latitude,
              longitude,
              accuracy,
              ...serviceCheck,
              detectionMethod: 'gps'
            })
          }
        },
        (error) => {
          console.error('❌ High accuracy location failed:', error.message, 'Code:', error.code)
          
          // Handle different error types
          if (error.code === error.PERMISSION_DENIED) {
            console.log('❌ Location permission denied by user')
            if (allowDefault) {
              console.log('✅ Using default location as fallback')
              resolve(getDefaultLocation())
            } else {
              reject(new Error('PERMISSION_DENIED'))
            }
            return
          }
          
          if (error.code === error.TIMEOUT) {
            console.log('⏱️ High accuracy timeout, trying low accuracy...')
            tryLowAccuracy()
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.log('📍 Position unavailable, trying low accuracy...')
            tryLowAccuracy()
          } else {
            console.log('⚠️ Location unavailable, trying low accuracy...')
            tryLowAccuracy()
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: timeout,
          maximumAge: forceNew ? 0 : 60000 // Use 1-min cache unless forced
        }
      )
    }

    const tryLowAccuracy = () => {
      console.log('🔄 Trying low accuracy mode...')
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('✅ Low accuracy location detected:', position.coords)
          const { latitude, longitude, accuracy } = position.coords
          const serviceCheck = isInServiceArea(latitude, longitude)
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { 'User-Agent': 'QuickCommerce/1.0' } }
            )
            const data = await response.json()
            const addr = data.address || {}
            
            const result = {
              latitude,
              longitude,
              accuracy,
              city: addr.city || addr.town || addr.village || null,
              state: addr.state || null,
              pincode: addr.postcode || null,
              formattedAddress: data.display_name || null,
              ...serviceCheck,
              detectionMethod: 'gps-low-accuracy'
            }
            
            console.log('✅ Low accuracy location with address:', result)
            resolve(result)
          } catch (geocodeError) {
            console.warn('Geocoding failed in low accuracy mode:', geocodeError)
            resolve({
              latitude,
              longitude,
              accuracy,
              ...serviceCheck,
              detectionMethod: 'gps-low-accuracy'
            })
          }
        },
        (error) => {
          // Return default location on final failure
          console.error('❌ Low accuracy also failed:', error.message)
          if (allowDefault) {
            console.log('✅ Using default location as final fallback')
            resolve(getDefaultLocation())
          } else {
            reject(new Error('Failed to detect location after multiple attempts'))
          }
        },
        {
          enableHighAccuracy: false,
          timeout: timeout,
          maximumAge: 300000 // Use 5-min cache as fallback
        }
      )
    }

    tryHighAccuracy()
  })
}

// Get location from localStorage if cached
export function getCachedLocation() {
  const cached = localStorage.getItem('user_location')
  if (cached) {
    try {
      const data = JSON.parse(cached)
      const timestamp = data.timestamp
      const now = Date.now()
      
      // Cache valid for 1 hour
      if (now - timestamp < 3600000) {
        return data.location
      }
    } catch (e) {
      console.error('Error reading cached location:', e)
    }
  }
  return null
}

// Save location to localStorage
export function cacheLocation(locationData) {
  try {
    localStorage.setItem('user_location', JSON.stringify({
      location: locationData,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('Error caching location:', e)
  }
}

// Update service areas (for admin functionality)
export function updateServiceAreas(newAreas) {
  SERVICE_AREAS.length = 0
  SERVICE_AREAS.push(...newAreas)
}

export { SERVICE_AREAS, isInServiceArea }

