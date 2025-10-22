import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Menu, Package, Settings, Heart, X, Map } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useLocationStore } from '../store/locationStore'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from './Toast'
import LocationDropdown from './LocationDropdown'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { getWishlistCount } = useWishlistStore()
  const { location, isServiceAvailable, serviceArea, initializeLocation } = useLocationStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleMapClick = () => {
    hapticFeedback('light')
    navigate('/select-location')
    toast.info('Select your delivery location')
  }

  const handleLogout = () => {
    logout()
    hapticFeedback('medium')
    toast.info('Logged out successfully')
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-custom">
        {/* Main Navbar */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                QuickCommerce
              </span>
            </Link>

            {/* Location Dropdown */}
            <LocationDropdown />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Map Button */}
            <button
              onClick={handleMapClick}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors relative"
              title="Select Location"
            >
              <Map className="w-5 h-5 text-gray-700" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors relative"
            >
              <Heart className="w-5 h-5 text-gray-700" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {getWishlistCount()}
                </span>
              )}
            </Link>


            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Menu Content */}
            <div className="mt-12">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <User className="w-5 h-5" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

