import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, MapPin, Percent, ArrowRight, Heart, Award, Zap } from 'lucide-react'
import { hapticFeedback } from '../utils/nativeFeatures'
import { useWishlistStore } from '../store/wishlistStore'
import { toast } from './Toast'

export default function RestaurantCard({ restaurant }) {
  const [isHovered, setIsHovered] = useState(false)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(restaurant.id))

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    hapticFeedback('medium')

    if (isWishlisted) {
      removeFromWishlist(restaurant.id)
      setIsWishlisted(false)
      toast.success('Removed from favorites')
    } else {
      addToWishlist(restaurant)
      setIsWishlisted(true)
      toast.success('Added to favorites')
    }
  }

  const getBadges = () => {
    const badges = []
    
    if (restaurant.rating >= 4.5) {
      badges.push({
        icon: <Award className="w-4 h-4" />,
        text: 'Top Rated',
        color: 'bg-yellow-100 text-yellow-800'
      })
    }
    
    if (restaurant.deliveryTime <= 20) {
      badges.push({
        icon: <Zap className="w-4 h-4" />,
        text: 'Fast Delivery',
        color: 'bg-blue-100 text-blue-800'
      })
    }
    
    if (restaurant.discount > 0) {
      badges.push({
        icon: <Percent className="w-4 h-4" />,
        text: `${restaurant.discount}% OFF`,
        color: 'bg-green-100 text-green-800'
      })
    }

    return badges
  }

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Restaurant Image */}
      <div className="relative h-48 rounded-t-2xl overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? 'bg-red-100 text-red-600'
              : 'bg-white/70 text-gray-600 hover:bg-white/90'
          }`}
        >
          <Heart
            className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
          />
        </button>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {getBadges().map((badge, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md ${badge.color}`}
            >
              {badge.icon}
              <span className="text-xs font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
            <Star className="w-4 h-4 text-green-600 fill-current" />
            <span className="text-sm font-medium text-green-800">
              {restaurant.rating}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {restaurant.cuisine.join(', ')}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.distance} km</span>
          </div>
        </div>

        {/* View Menu Button */}
        <div className={`mt-4 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="flex items-center justify-center gap-2 w-full bg-primary-50 text-primary-600 py-2 px-4 rounded-xl font-medium hover:bg-primary-100 active:scale-[0.98] transition-all duration-200">
            View Menu
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}