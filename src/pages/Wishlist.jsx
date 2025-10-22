import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from '../components/Toast'

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const handleRemove = (productId) => {
    removeFromWishlist(productId)
    hapticFeedback('light')
    toast.info('Removed from wishlist')
  }

  const handleAddToCart = (product) => {
    addItem(product)
    hapticFeedback('light')
    toast.success('Added to cart!', product.name)
  }

  const handleClearAll = () => {
    if (window.confirm('Remove all items from wishlist?')) {
      clearWishlist()
      hapticFeedback('medium')
      toast.success('Wishlist cleared')
    }
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-6">
            Save your favorite products here for quick access later!
          </p>
          <Link to="/products" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 animate-fade-in">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        <div className="grid gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover-lift transition-all"
            >
              <div className="flex gap-4">
                {/* Image */}
                <Link to={`/products/${item.id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/200'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.id}`}
                    className="font-semibold text-gray-900 hover:text-primary-600 block mb-1 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    ₹{item.price?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-2 md:p-3 rounded-lg transition-all active:scale-95 shadow-sm"
                    title="Add to cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 md:p-3 rounded-lg transition-all active:scale-95 shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="btn-secondary inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

