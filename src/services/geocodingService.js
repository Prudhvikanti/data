// Geocoding service for converting coordinates to address and pincode
import { SERVICE_AREAS } from './locationService'

// Cache for geocoding results
const geocodeCache = new Map()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Rate limiting
const rateLimitWindow = 1000 // 1 second
const maxRequestsPerWindow = 1
let lastRequestTime = 0
let requestCount = 0

/**
 * Rate limiter function
 */
async function rateLimit() {
  const now = Date.now()
  if (now - lastRequestTime >= rateLimitWindow) {
    // Reset counter for new window
    requestCount = 0
    lastRequestTime = now
  }

  if (requestCount >= maxRequestsPerWindow) {
    const waitTime = rateLimitWindow - (now - lastRequestTime)
    await new Promise(resolve => setTimeout(resolve, waitTime))
    return rateLimit()
  }

  requestCount++
  lastRequestTime = now
}

/**
 * Cache management functions
 */
function getCachedResult(key) {
  const cached = geocodeCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCacheResult(key, data) {
  geocodeCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Get address details from coordinates using Nominatim (OpenStreetMap)
 * Free and doesn't require API key
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    // Check cache first
    const cacheKey = `reverse_${latitude}_${longitude}`
    const cached = getCachedResult(cacheKey)
    if (cached) return cached

    // Apply rate limiting
    await rateLimit()

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
      {
        headers: {
          'User-Agent': 'QuickCommerce/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extract address components
    const address = data.address || {}
    
    const result = {
      formattedAddress: data.display_name,
      pincode: address.postcode || null,
      city: address.city || address.town || address.village || address.suburb || null,
      state: address.state || null,
      country: address.country || null,
      district: address.state_district || null,
      suburb: address.suburb || null,
      road: address.road || null,
      houseNumber: address.house_number || null,
      coordinates: {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon)
      },
      rawData: data // Keep raw data for debugging
    }

    // Cache the result
    setCacheResult(cacheKey, result)
    
    return result
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    throw new Error('Failed to get address details. Please try again.')
  }
}

/**
 * Search for location by address/pincode
 * Returns coordinates and details
 */
export async function forwardGeocode(query) {
  try {
    // Clean and validate query
    query = query.trim()
    if (!query) throw new Error('Search query is required')

    // Check cache
    const cacheKey = `forward_${query}`
    const cached = getCachedResult(cacheKey)
    if (cached) return cached

    // Apply rate limiting
    await rateLimit()

    // Add region bias for better results
    const regionBias = 'Andhra Pradesh, India'
    const searchQuery = `${query}, ${regionBias}`

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'QuickCommerce/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data || data.length === 0) {
      return []
    }
    
    // Format and filter results
    const results = data
      .map(item => ({
        formattedAddress: item.display_name,
        pincode: item.address?.postcode || null,
        city: item.address?.city || item.address?.town || item.address?.village || null,
        state: item.address?.state || null,
        country: item.address?.country || null,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        },
        boundingBox: item.boundingbox,
        type: item.type,
        importance: item.importance
      }))
      .filter(item => item.country === 'India') // Ensure results are from India
      .sort((a, b) => b.importance - a.importance) // Sort by relevance

    // Cache results
    setCacheResult(cacheKey, results)
    
    return results
  } catch (error) {
    console.error('Forward geocoding error:', error)
    throw new Error('Failed to search location. Please try a different search term.')
  }
}

/**
 * Get address from pincode
 * Useful for Indian pincodes
 */
export async function getPincodeDetails(pincode) {
  try {
    if (!isValidIndianPincode(pincode)) {
      throw new Error('Invalid pincode format')
    }

    // Check cache
    const cacheKey = `pincode_${pincode}`
    const cached = getCachedResult(cacheKey)
    if (cached) return cached

    // Search for pincode in India
    const query = `${pincode}, India`
    const results = await forwardGeocode(query)
    
    if (results.length > 0) {
      const result = results[0]
      setCacheResult(cacheKey, result)
      return result
    }
    
    throw new Error('Pincode not found')
  } catch (error) {
    console.error('Pincode lookup error:', error)
    throw error
  }
}

/**
 * Calculate service availability with pincode and distance
 */
export async function checkServiceWithPincode(latitude, longitude) {
  try {
    const addressData = await reverseGeocode(latitude, longitude)
    
    // Check if coordinates are within any service area
    let nearestArea = null
    let shortestDistance = Infinity

    for (const area of SERVICE_AREAS) {
      const distance = calculateDistance(
        latitude,
        longitude,
        area.center.lat,
        area.center.lng
      )

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestArea = area
      }

      if (distance <= area.radius) {
        return {
          ...addressData,
          isServiceAvailable: true,
          matchedArea: area.name,
          distance: Math.round(distance / 1000), // Convert to km
          pincode: addressData.pincode || area.pincode
        }
      }
    }
    
    // If not in any service area, return nearest area info
    return {
      ...addressData,
      isServiceAvailable: false,
      nearestArea: nearestArea.name,
      distance: Math.round(shortestDistance / 1000), // Convert to km
      message: `We currently don't deliver to this location. Nearest service area is ${nearestArea.name} (${Math.round(shortestDistance / 1000)} km away)`
    }
  } catch (error) {
    console.error('Service check error:', error)
    return {
      isServiceAvailable: false,
      error: error.message
    }
  }
}

/**
 * Validate Indian pincode format
 */
export function isValidIndianPincode(pincode) {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

/**
 * Get nearby service areas with distance calculation
 */
export function getNearbyServiceAreas(latitude, longitude) {
  return SERVICE_AREAS.map(area => {
    const distance = calculateDistance(
      latitude,
      longitude,
      area.center.lat,
      area.center.lng
    )
    
    return {
      ...area,
      distance: Math.round(distance / 1000), // Convert to km
      isInRange: distance <= area.radius
    }
  }).sort((a, b) => a.distance - b.distance)
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

