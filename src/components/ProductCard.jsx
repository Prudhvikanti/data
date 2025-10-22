import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Eye, Star, Zap, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import WishlistButton from './WishlistButton'
import QuickViewModal from './QuickViewModal'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function ProductCard({ product, compact = false }) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find(item => item.id === product.id)
  const [showQuickView, setShowQuickView] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    hapticFeedback('medium')
  }

  const handleIncrement = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    hapticFeedback('light')
  }

  const handleDecrement = (e) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, cartItem.quantity - 1)
    hapticFeedback('light')
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
    hapticFeedback('light')
  }

  return (
    <>
      <Link
        to={`/products/${product.id}`}
        className={`group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${
          compact ? 'p-2 md:p-3' : 'p-3 md:p-4'
        } hover:-translate-y-1 active:translate-y-0 active:shadow-md`}
      >
        {/* Badges Container */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {product.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
          {product.original_price > product.price && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{Math.round((1 - product.price / product.original_price) * 100)}% OFF</span>
            </div>
          )}
          {product.fast_delivery && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Express</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <WishlistButton product={product} size="sm" />
          <button
            onClick={handleQuickView}
            className="w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            title="Quick View"
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      
        {/* Image Container */}
        <div 
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ${
            compact ? 'mb-2' : 'mb-3'
          } aspect-square group-hover:scale-105 transition-transform duration-300`}
        >
          {/* Skeleton Loader */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
          )}
          
          <img
            src={product.image_url || 'https://via.placeholder.com/300'}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      
        {/* Content */}
        <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${
            compact ? 'min-h-[2rem] text-xs' : 'min-h-[2.5rem] text-sm md:text-base'
          }`}>
            {product.name}
          </h3>
          
          {!compact && product.unit && (
            <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
              {product.unit}
            </p>
          )}
          
          <div className={`flex items-center justify-between ${compact ? 'pt-1' : 'pt-2'}`}>
            <div>
              <div className="flex items-baseline gap-1.5">
                <p className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
                  ₹{product.price?.toFixed(2) || '0.00'}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-xs text-gray-500 line-through">
                    ₹{product.original_price.toFixed(2)}
                  </p>
                )}
              </div>
              {product.in_stock === false && (
                <p className="text-xs text-red-500 font-medium mt-1">Out of Stock</p>
              )}
            </div>
            
            {product.in_stock !== false && (
              cartItem ? (
                <div className="flex items-center space-x-1 md:space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg px-1.5 md:px-2 py-1 md:py-1.5 shadow-md">
                  <button
                    onClick={handleDecrement}
                    className="p-1 hover:bg-white/10 rounded transition-colors active:scale-90"
                  >
                    <Minus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </button>
                  <span className="text-white font-semibold w-6 md:w-8 text-center text-sm md:text-base">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-1 hover:bg-white/10 rounded transition-colors active:scale-90"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white p-2 md:p-2.5 rounded-lg transition-all active:scale-90 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )
            )}
          </div>
        </div>
      </Link>
      
      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal 
          product={product} 
          onClose={() => setShowQuickView(false)} 
        />
      )}
    </>
  )
}

