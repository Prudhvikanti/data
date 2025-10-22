import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useRecentlyViewedStore } from '../store/recentlyViewedStore'
import { useProducts } from '../hooks/useProducts'
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Zap, Tag, Package, Share2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import WishlistButton from '../components/WishlistButton'
import { hapticFeedback, shareContent } from '../utils/nativeFeatures'
import { toast } from '../components/Toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, addItem, updateQuantity } = useCartStore()
  const { addToRecentlyViewed } = useRecentlyViewedStore()
  const { products, categories } = useProducts()

  // Find product
  const product = products.find(p => p.id === id)
  const cartItem = product ? items.find(item => item.id === product.id) : null
  
  // Get related products
  const relatedProducts = product 
    ? products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 8)
    : []
  
  // Get category
  const categoryInfo = product 
    ? categories.find(c => c.id === product.category_id)
    : null
  
  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product)
    }
  }, [product, addToRecentlyViewed])
  
  // Swipe navigation
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const minSwipeDistance = 50
  
  const onTouchStart = (e) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance
    if (isRightSwipe) {
      navigate(-1)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Handlers
  const handleAddToCart = (e) => {
    if (e) e.preventDefault()
    if (product) {
      addItem(product)
      hapticFeedback('light')
      toast.success('Added to cart!', product.name)
    }
  }

  const handleBuyNow = (e) => {
    if (e) e.preventDefault()
    if (product) {
      addItem(product)
      hapticFeedback('medium')
      toast.success('Added to cart! Taking you to checkout...', product.name)
      setTimeout(() => navigate('/cart'), 100)
    }
  }

  const handleIncrement = (e) => {
    if (e) e.preventDefault()
    if (product && cartItem) {
      updateQuantity(product.id, cartItem.quantity + 1)
      hapticFeedback('light')
    }
  }

  const handleDecrement = (e) => {
    if (e) e.preventDefault()
    if (product && cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1)
      hapticFeedback('light')
    }
  }

  const handleShare = async () => {
    const shared = await shareContent({
      title: product.name,
      text: `Check out ${product.name} - Only ₹${product.price.toFixed(2)}!`,
      url: window.location.href
    })
    if (shared) {
      hapticFeedback('success')
      toast.success('Shared successfully!')
    } else {
      // Fallback for browsers that don't support share
      toast.info('Share link copied to clipboard!')
    }
  }

  // Loading state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/products" className="btn-primary mt-4 inline-block">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Back Button & Share - Sticky */}
      <div className="sticky top-0 bg-white z-30 border-b border-gray-200 shadow-sm">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <WishlistButton product={product} size="md" />
              <button
                type="button"
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                title="Share product"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container-custom py-4 md:py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Product Image */}
            <div className="md:sticky md:top-24 md:self-start">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md mb-4">
                <img
                  src={product.image_url || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              
              {/* Category Badge */}
              {categoryInfo && (
                <button
                  type="button"
                  onClick={() => navigate(`/products?category=${categoryInfo.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group border border-primary-200"
                >
                  <span className="text-3xl">{categoryInfo.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="text-xs text-primary-600 font-medium">View Category</p>
                    <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-800">
                      {categoryInfo.name} →
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.featured && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-sm">
                    ⭐ Featured
                  </span>
                )}
                {product.original_price && product.original_price > product.price && (
                  <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-sm">
                    {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </span>
                )}
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  ✅ In Stock
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">4.0 (250+ reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-xl md:text-2xl text-gray-500 line-through">
                      ₹{product.original_price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-gray-600 font-medium">{product.unit}</p>
                  {product.original_price > product.price && (
                    <p className="text-green-600 font-semibold">
                      You save ₹{(product.original_price - product.price).toFixed(2)}!
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-primary-600" />
                  <span>10-min delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-primary-600" />
                  <span>Fresh & quality</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Tag className="w-4 h-4 text-primary-600" />
                  <span>Best prices</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <ShoppingCart className="w-4 h-4 text-primary-600" />
                  <span>Easy returns</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Product Details</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'Fresh and high-quality product delivered to your doorstep.'}
                </p>
              </div>

              {/* Action Buttons - Fixed Position on Mobile */}
              <div className="mt-6 md:mt-auto">
                {cartItem ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        className="p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm active:scale-95 border border-gray-200"
                      >
                        <Minus className="w-6 h-6 text-gray-700" />
                      </button>
                      <span className="text-gray-900 font-bold text-2xl w-20 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrement}
                        className="p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm active:scale-95 border border-gray-200"
                      >
                        <Plus className="w-6 h-6 text-gray-700" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="btn-secondary text-center py-4 text-base font-semibold"
                      >
                        View Cart ({cartItem.quantity})
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/checkout')}
                        className="btn-primary text-center py-4 text-base font-semibold flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        Checkout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={handleAddToCart} 
                      className="btn-secondary py-4 text-base font-semibold flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button 
                      type="button"
                      onClick={handleBuyNow}
                      className="btn-primary py-4 text-base font-semibold flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Zap className="w-5 h-5" />
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    More from {categoryInfo?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {categoryInfo?.emoji} Explore similar products you might like
                  </p>
                </div>
                {categoryInfo && (
                  <button
                    type="button"
                    onClick={() => navigate(`/products?category=${categoryInfo.id}`)}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm md:text-base whitespace-nowrap"
                  >
                    View All →
                  </button>
                )}
              </div>

              <div className="product-grid product-grid-normal">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

