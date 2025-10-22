import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingCart, Search, Leaf, TrendingUp, Award } from 'lucide-react'
import { useRestaurantStore } from '../store/restaurantStore'
import { useCartStore } from '../store/cartStore'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from '../components/Toast'

export default function RestaurantMenu() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { restaurants, getRestaurantMenu, getMenuByCategory, setSelectedRestaurant } = useRestaurantStore()
  const { items, addItem, updateQuantity } = useCartStore()
  
  const restaurant = restaurants.find(r => r.id === id)
  const menuItems = getRestaurantMenu(id)
  const menuByCategory = getMenuByCategory(id)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setSelectedRestaurant(id)
    }
    window.scrollTo(0, 0)
    
    // Scroll listener for sticky header
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [id, restaurant, setSelectedRestaurant])

  // Memoized filtering for better performance
  const filteredItems = useMemo(() => {
    let filtered = menuItems

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [selectedCategory, searchQuery, menuItems])

  // Optimized handlers
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
    hapticFeedback('light')
  }, [])

  const handleAddToCart = (item) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image,
      unit: '1 serving',
      restaurant: restaurant.name,
      isFood: true
    }
    addItem(cartItem)
    hapticFeedback('light')
    toast.success('Added to cart!', item.name)
  }

  const handleIncrement = (item) => {
    const cartItem = items.find(i => i.id === item.id)
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity + 1)
      hapticFeedback('light')
    }
  }

  const handleDecrement = (item) => {
    const cartItem = items.find(i => i.id === item.id)
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity - 1)
      hapticFeedback('light')
    }
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
          <Link to="/restaurants" className="btn-primary mt-4 inline-block">
            ← Back to Restaurants
          </Link>
        </div>
      </div>
    )
  }

  const categories = ['all', ...Object.keys(menuByCategory)]
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 animate-fade-in">
      {/* Enhanced Header - Sticky */}
      <div className={`sticky top-0 z-30 transition-all duration-300 ${
        isSticky ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      } border-b border-gray-200`}>
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/restaurants')}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back</span>
            </button>
            
            {cartItemCount > 0 && (
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cartItemCount})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Restaurant Info */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-b-4 border-orange-600">
        <div className="container-custom py-6 md:py-8">
          <div className="flex items-start gap-4 md:gap-6">
            {/* Restaurant Image */}
            <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {restaurant.name}
              </h1>
              <p className="text-orange-100 text-sm md:text-base mb-3">{restaurant.cuisine}</p>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                  <span className="font-bold">{restaurant.rating}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{restaurant.distance}</span>
                </div>
              </div>

              {restaurant.offers && (
                <div className="mt-3 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 inline-flex items-center gap-2 shadow-lg">
                  <span className="text-xl">🎁</span>
                  <p className="text-sm text-orange-700 font-bold">
                    {restaurant.offers}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-white/95 backdrop-blur-md border-b-2 border-gray-200 sticky top-16 z-20 shadow-md">
        <div className="container-custom py-4">
          {/* Enhanced Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search dishes, ingredients..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-10 py-3.5 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white shadow-sm transition-all font-medium"
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

          {/* Enhanced Category Filter */}
          <div className="overflow-x-auto scrollbar-hide -mx-2">
            <div className="flex gap-2 px-2 min-w-max md:min-w-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  <span>{category === 'all' ? '🍽️ All Items' : `${category}`}</span>
                  {selectedCategory === category && (
                    <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                      {filteredItems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Menu Items - List View */}
      <div className="container-custom py-6">
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const cartItem = items.find(i => i.id === item.id)
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-orange-200 p-4 hover-lift transition-all stagger-item"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex gap-4">
                    {/* Enhanced Item Image */}
                    <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative group/image shadow-md">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Veg/Non-veg indicator on image */}
                      <div className="absolute top-2 left-2">
                        {item.isVeg ? (
                          <div className="w-6 h-6 bg-white rounded border-2 border-green-600 flex items-center justify-center shadow-sm">
                            <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-white rounded border-2 border-red-600 flex items-center justify-center shadow-sm">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base md:text-lg line-clamp-1 mb-1.5">
                            {item.name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg">
                              <Star className="w-3.5 h-3.5 text-green-600 fill-current" />
                              <span className="font-bold text-green-700 text-xs">{item.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Add to Cart Button */}
                    <div className="flex-shrink-0 flex items-center">
                      {cartItem ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-3 py-2 shadow-lg">
                            <button
                              onClick={() => handleDecrement(item)}
                              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-90"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-white font-bold w-10 text-center text-lg">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item)}
                              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-90"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md hover:shadow-lg text-sm md:text-base"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-4">
              Try changing your category or search query
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSearchQuery('')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Floating Cart Button - Mobile */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-30 px-4 md:hidden">
          <Link
            to="/cart"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-2xl font-bold text-center shadow-2xl flex items-center justify-between px-6 animate-pulse-soft active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/80">Cart</p>
                <p className="font-bold">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>View Cart</span>
              <span className="text-xl">→</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

