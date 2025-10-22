import { X, Plus, Minus, ShoppingCart, Zap, Star, Share2, Heart, Tag, Truck } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { hapticFeedback, shareContent } from '../utils/nativeFeatures'
import { toast } from './Toast'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useWishlistStore } from '../store/wishlistStore'

export default function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate()
  const { addToCart, updateQuantity, getItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const cartItem = getItem(product.id)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleAddToCart = () => {
    addToCart(product)
    hapticFeedback('medium')
    toast.success('Added to cart!', product.name)
  }

  const handleQuantityChange = (change) => {
    updateQuantity(product.id, (cartItem?.quantity || 0) + change)
    hapticFeedback('light')
  }

  const handleShare = async () => {
    try {
      await shareContent({
        title: product.name,
        text: `Check out ${product.name} on QuickCommerce!`,
        url: window.location.href
      })
      hapticFeedback('light')
    } catch (error) {
      console.log('Share failed:', error)
    }
  }

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.info('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist!')
    }
    hapticFeedback('light')
  }

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`)
    onClose()
  }

  // Product images array (assuming multiple images)
  const images = [
    product.image_url,
    ...(product.additional_images || [])
  ].filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="relative aspect-square">
            {/* Skeleton Loader */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
            )}
            
            {/* Main Image */}
            <img
              src={images[selectedImage]}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImageLoaded(true)}
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage === index
                        ? 'bg-white w-6'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col max-h-[60vh] md:max-h-[90vh] overflow-y-auto">
          {/* Title & Rating */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h2>
            <p className="text-sm text-gray-600 mb-3">{product.unit}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.0 (250+ reviews)</span>
            </div>
          </div>

          {/* Price & Badges */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </span>
              {product.original_price > product.price && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.original_price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2">
              {product.express_delivery && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Express Delivery
                </div>
              )}
              {product.featured && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Featured
                </div>
              )}
              {product.offers && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Offers Available
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">About this item</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Delivery Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                <p className="text-xs text-gray-600">Get it by tomorrow</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Best Price</p>
                <p className="text-xs text-gray-600">Price matched guaranteed</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-3">
            {cartItem ? (
              <>
                <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-xl p-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={cartItem.quantity <= 1}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-medium text-gray-900 w-12 text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            )}

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleWishlist}
                className={`btn-secondary flex items-center justify-center gap-2 ${
                  isInWishlist(product.id) ? 'text-red-600' : ''
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-current' : ''
                  }`}
                />
                Wishlist
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={handleViewDetails}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

