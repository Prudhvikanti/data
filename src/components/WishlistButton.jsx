import { Heart } from 'lucide-react'
import { useWishlistStore } from '../store/wishlistStore'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from './Toast'
import { useState } from 'react'

export default function WishlistButton({ product, className = '', size = 'md' }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const [isAnimating, setIsAnimating] = useState(false)
  const isFavorite = isInWishlist(product.id)

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const added = toggleWishlist(product)
    
    // Animate
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
    
    // Haptic feedback
    hapticFeedback(added ? 'success' : 'light')
    
    // Toast notification
    if (added) {
      toast.success('Added to wishlist!', product.name)
    } else {
      toast.info('Removed from wishlist', product.name)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizes[size]} ${className} flex items-center justify-center rounded-full transition-all ${
        isFavorite 
          ? 'bg-red-500 hover:bg-red-600 shadow-lg' 
          : 'bg-white/90 hover:bg-white shadow-md'
      } ${isAnimating ? 'animate-bounce' : ''}`}
      title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          isFavorite 
            ? 'text-white fill-current' 
            : 'text-gray-700'
        } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      />
    </button>
  )
}

