import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Truck, Shield, Star, ArrowRight, Utensils } from 'lucide-react'
import { useLocationStore } from '../store/locationStore'
import { useRestaurantStore } from '../store/restaurantStore'
import ProductCard from '../components/ProductCard'
import AdvertisementSlider from '../components/AdvertisementSlider'
import PullToRefresh from '../components/PullToRefresh'
import { useProducts } from '../hooks/useProducts'

export default function Home() {
  const { isServiceAvailable } = useLocationStore()
  const { products: allProducts, categories, loading, refreshProducts } = useProducts()
  const { restaurants } = useRestaurantStore()
  
  // Get featured products (limit 8)
  const featuredProducts = allProducts.filter(p => p.featured).slice(0, 8)
  
  // Get featured restaurants (limit 4)
  const featuredRestaurants = restaurants.filter(r => r.isOpen).slice(0, 4)

  const handleRefresh = async () => {
    await refreshProducts()
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const features = [
    {
      icon: Zap,
      title: '10 Min Delivery',
      description: 'Quick delivery to your doorstep'
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'On orders above $20'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure transactions'
    },
    {
      icon: Star,
      title: 'Best Quality',
      description: 'Fresh products guaranteed'
    }
  ]

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="animate-fade-in">
        {/* Advertisement Slider */}
        <section className="py-4 md:py-6">
          <div className="container-custom">
            <AdvertisementSlider />
          </div>
        </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="container-custom py-10 md:py-16 lg:py-20 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 animate-fade-in">
              Groceries delivered in 10 minutes ⚡
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-primary-50 mb-6 md:mb-8 animate-fade-in">
              Get your daily essentials delivered super fast at your doorstep
            </p>
            {isServiceAvailable === false ? (
              <Link
                to="/service-unavailable"
                className="inline-flex items-center bg-white text-primary-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Check Service Availability
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/products"
                className="inline-flex items-center bg-white text-primary-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-6 md:py-8 bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex flex-col items-center text-center p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2 md:mb-3">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 hidden md:block">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/categories" className="text-primary-600 font-semibold hover:text-primary-700 text-sm md:text-base">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card aspect-square skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
              {/* Restaurant Category - Featured First */}
              <Link
                to="/restaurants"
                className="card text-center hover:shadow-lg transition-all group active:scale-95 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 relative"
              >
                <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  HOT
                </div>
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl md:text-4xl">🍽️</span>
                </div>
                <p className="font-medium text-gray-900 text-xs md:text-sm line-clamp-2">Restaurants</p>
              </Link>

              {/* Regular Categories */}
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="card text-center hover:shadow-lg transition-all group active:scale-95"
                >
                  <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl md:text-4xl">{category.emoji || '📦'}</span>
                  </div>
                  <p className="font-medium text-gray-900 text-xs md:text-sm line-clamp-2">{category.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-orange-600" />
                Popular Restaurants
              </h2>
              <p className="text-sm text-gray-600 mt-1">Order from your favorite restaurants</p>
            </div>
            <Link to="/restaurants" className="text-orange-600 font-semibold hover:text-orange-700 text-sm md:text-base">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}`}
                className="card hover-lift transition-all group overflow-hidden"
              >
                <div className="aspect-video overflow-hidden rounded-lg mb-3 product-image-zoom">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  {restaurant.offers && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {restaurant.offers.split(' ')[0]}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{restaurant.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-green-600 fill-current" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                  <span>{restaurant.deliveryTime}</span>
                  <span>{restaurant.distance}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-primary-600 font-semibold hover:text-primary-700 text-sm md:text-base">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="product-grid product-grid-normal">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card h-72 md:h-80 skeleton" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid product-grid-normal">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-600 mb-4">Please set up your Supabase database first</p>
              <p className="text-sm text-gray-500">See <code className="bg-gray-100 px-2 py-1 rounded">QUICK_START.md</code> for setup instructions</p>
            </div>
          )}
        </div>
      </section>
      </div>
    </PullToRefresh>
  )
}

