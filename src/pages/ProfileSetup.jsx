import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { saveUserProfile, saveDeliveryAddress, getUserProfile } from '../services/profileService'
import { User, Phone, MapPin, Home, Building, Map, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '../components/Toast'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function ProfileSetup() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Profile, 2: Address
  const [error, setError] = useState('')

  const [profileData, setProfileData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: ''
  })

  const [addressData, setAddressData] = useState({
    label: 'Home',
    full_name: user?.user_metadata?.full_name || '',
    phone: '',
    door_number: '',
    street_address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    is_default: true
  })

  // Check if profile already completed
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const profile = await getUserProfile(user.id)
        if (profile?.profile_completed) {
          navigate('/')
        }
      } catch (error) {
        console.log('No existing profile')
      }
    }

    checkProfile()
  }, [user, navigate])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!profileData.phone || profileData.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)

    try {
      await saveUserProfile(user.id, {
        full_name: profileData.full_name,
        phone: profileData.phone,
        profile_completed: false // Will be true after address
      })

      hapticFeedback('success')
      toast.success('Profile saved!', 'Now add your delivery address')
      setAddressData(prev => ({
        ...prev,
        full_name: profileData.full_name,
        phone: profileData.phone
      }))
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to save profile')
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!addressData.pincode || addressData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode')
      return
    }

    setLoading(true)

    try {
      // Save delivery address
      await saveDeliveryAddress(user.id, addressData)

      // Update profile as completed
      await saveUserProfile(user.id, {
        full_name: profileData.full_name,
        phone: profileData.phone,
        profile_completed: true
      })

      hapticFeedback('success')
      toast.success('Profile completed!', 'Welcome to QuickCommerce')

      // Redirect to home
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save address')
      toast.error('Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (window.confirm('You can add delivery address later from your profile. Continue?')) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-white text-primary-600' : 'bg-white/20'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="font-semibold hidden sm:inline">Profile</span>
            </div>
            <div className="w-12 md:w-24 h-1 bg-white/20">
              <div className={`h-full bg-white transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-white text-primary-600' : 'bg-white/20'
              }`}>
                2
              </div>
              <span className="font-semibold hidden sm:inline">Address</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {step === 1 ? (
                <User className="w-8 h-8 text-white" />
              ) : (
                <MapPin className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? 'Complete Your Profile' : 'Add Delivery Address'}
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              {step === 1 
                ? 'We need some details to serve you better'
                : 'Where should we deliver your orders?'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Step 1: Profile Information */}
          {step === 1 && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="John Doe"
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="1234567890"
                    required
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">We'll use this for order updates</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-95 text-base md:text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  'Continue to Address'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Delivery Address */}
          {step === 2 && (
            <form onSubmit={handleAddressSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addressData.full_name}
                      onChange={(e) => setAddressData({ ...addressData, full_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                      placeholder="John Doe"
                      required
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                      placeholder="1234567890"
                      required
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressData({ ...addressData, label })}
                      className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        addressData.label === label
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label === 'Home' ? '🏠' : label === 'Work' ? '🏢' : '📍'} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Door/Flat
                  </label>
                  <input
                    type="text"
                    value={addressData.door_number}
                    onChange={(e) => setAddressData({ ...addressData, door_number: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="123"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressData.street_address}
                    onChange={(e) => setAddressData({ ...addressData, street_address: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="Main Street"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Landmark (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="Near City Mall"
                  />
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="Samalkota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="Andhra Pradesh"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={addressData.pincode}
                    onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="533434"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-xl transition-all active:scale-95"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Complete Setup
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-center text-gray-600 hover:text-primary-600 font-medium py-2 text-sm"
              >
                Skip for now (add address later)
              </button>
            </form>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Your information is secure and will only be used for deliveries
          </p>
        </div>
      </div>
    </div>
  )
}


