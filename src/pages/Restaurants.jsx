import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { useRestaurantStore } from '../store/restaurantStore'
import { getCurrentLocation, hapticFeedback } from '../utils/nativeFeatures'
import { toast } from '../components/Toast'
import RestaurantCard from '../components/RestaurantCard'

export default function Restaurants() {
  const { restaurants, getRestaurantsByFilter, setUserLocation, calculateDistance, userLocation } = useRestaurantStore()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('rating') // rating, distance, deliveryTime

  useEffect(() => {
    // Try to get user location
    const fetchLocation = async () => {
      setLoading(true)
      try {
        const location = await getCurrentLocation(false)
        setUserLocation(location)
        toast.success('Location detected!', 'Showing nearby restaurants')
      } catch (error) {
        console.log('Location not available:', error)
        toast.info('Using default location')
      } finally {
        setLoading(false)
      }
    }
    
    if (!userLocation) {
      fetchLocation()
    }
  }, [setUserLocation, userLocation])

  // Memoized filtering and sorting for better performance
  const filteredRestaurants = useMemo(() => {
    let filtered = getRestaurantsByFilter(filter)
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query)
      )
    }
    
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating
      } else if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance)
      } else if (sortBy === 'deliveryTime') {
        return parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
      }
      return 0
    })
    
    return sorted
  }, [filter, searchQuery, sortBy, getRestaurantsByFilter])

  // Debounced search handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
    hapticFeedback('light')
  }, [])

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort)
    hapticFeedback('light')
  }, [])

  const filters = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'nearby', label: 'Nearby', icon: '📍' },
    { id: 'open', label: 'Open Now', icon: '🟢' },
    { id: 'offers', label: 'Offers', icon: '🎁' },
    { id: 'Indian', label: 'Indian', icon: '🍛' },
    { id: 'Italian', label: 'Italian', icon: '🍕' },
    { id: 'Chinese', label: 'Chinese', icon: '🥡' },
    { id: 'American', label: 'American', icon: '🍔' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 py-4 md:py-6 animate-fade-in">
      <div className="container-custom">
        {/* Enhanced Header */}
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">
                Restaurants Near You
              </h1>
              <p className="text-orange-100 text-sm md:text-base">
                {filteredRestaurants.length} restaurants • Fast delivery in 10-30 min
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar & Sort */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search restaurants, cuisines, dishes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white shadow-sm transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white shadow-sm appearance-none cursor-pointer transition-all font-medium"
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="distance">📍 Nearest First</option>
              <option value="deliveryTime">⚡ Fastest Delivery</option>
            </select>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                    filter === f.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  <span className="text-base">{f.icon}</span>
                  <span>{f.label}</span>
                  {filter === f.id && (
                    <span className="ml-1 bg-white/30 px-2 py-0.5 rounded-full text-xs">
                      {filteredRestaurants.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-video skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded skeleton w-3/4" />
                  <div className="h-4 bg-gray-200 rounded skeleton w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded skeleton w-20" />
                    <div className="h-8 bg-gray-200 rounded skeleton w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Restaurants Grid */}
        {!loading && filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 mb-4">
              Try changing your filters or search query
            </p>
            <button
              onClick={() => {
                setFilter('all')
                setSearchQuery('')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Bottom Info */}
        {!loading && filteredRestaurants.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

