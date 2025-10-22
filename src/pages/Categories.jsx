import { Link } from 'react-router-dom'
import { ArrowRight, Package, Utensils, Search, TrendingUp, Sparkles, Filter } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useRestaurantStore } from '../store/restaurantStore'
import { useState } from 'react'

export default function Categories() {
  const { products, categories, loading } = useProducts()
  const { restaurants } = useRestaurantStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'popular', 'new'

  // Calculate product count for each category
  const categoriesWithCount = categories.map(category => {
    const categoryProducts = products.filter(p => p.category_id === category.id)
    return {
      ...category,
      productCount: categoryProducts.length,
      trending: categoryProducts.filter(p => p.featured).length > 0
    }
  })

  // Filter categories based on search and filter type
  let filteredCategories = categoriesWithCount

  if (searchTerm) {
    filteredCategories = filteredCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (filterType === 'popular') {
    filteredCategories = filteredCategories.sort((a, b) => b.productCount - a.productCount)
  } else if (filterType === 'new') {
    filteredCategories = [...filteredCategories].reverse()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-50 py-6 md:py-10 animate-fade-in">
      <div className="container-custom">
        {/* Enhanced Header with Search */}
        <div className="mb-6 md:mb-10 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Browse by Category
                </h1>
                <p className="text-primary-100 text-sm md:text-lg mt-1">
                  Explore {categoriesWithCount.length + 1} categories • {restaurants.length} restaurants
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full px-5 py-3 md:py-4 pl-12 md:pl-14 pr-4 rounded-xl md:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg text-base md:text-lg"
              />
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setFilterType('popular')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  filterType === 'popular'
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setFilterType('new')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  filterType === 'new'
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                New
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded skeleton w-3/4" />
                  <div className="h-4 bg-gray-200 rounded skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            {searchTerm && (
              <div className="mb-4 text-sm text-gray-600">
                Found {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {/* Restaurant Category - Featured */}
              <Link
                to="/restaurants"
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 p-4 md:p-6 group stagger-item active:scale-95"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-red-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40 group-hover:scale-150 transition-transform duration-500" />
                
                {/* Hot Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse-soft shadow-lg">
                  HOT 🔥
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-6xl md:text-7xl">🍽️</span>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1.5 md:mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                    Restaurants
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 flex-1">
                    {restaurants.length} nearby
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-bold text-xs md:text-sm">Order Food</span>
                    <div className="bg-orange-500 text-white p-1.5 md:p-2 rounded-lg group-hover:translate-x-1 transition-transform shadow-sm">
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Regular Product Categories */}
              {filteredCategories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden border border-gray-200 hover:border-primary-300 p-4 md:p-6 group stagger-item active:scale-95"
                  style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                >
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40 group-hover:scale-150 transition-transform duration-500" />
                  
                  {/* Trending Badge */}
                  {category.trending && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                      🔥 Trending
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <div className="w-full aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <span className="text-6xl md:text-7xl">{category.emoji}</span>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1.5 md:mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {category.name}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 flex-1">
                      {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold text-xs md:text-sm">Browse</span>
                      <div className="bg-primary-600 text-white p-1.5 md:p-2 rounded-lg group-hover:translate-x-1 transition-transform shadow-sm">
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {searchTerm && filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-4">Try searching with different keywords</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-primary"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}

        {/* Enhanced All Products Link */}
        <div className="mt-8 md:mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base md:text-lg font-bold px-8 md:px-12 py-4 md:py-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all active:scale-95"
          >
            <Package className="w-5 h-5 md:w-6 md:h-6" />
            View All {products.length} Products
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
        </div>
      </div>
    </div>
  )
}
