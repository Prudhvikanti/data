import { useState, useEffect } from 'react'
import { MapPin, User, Phone, Home, Navigation, Building, MapPinned, AlertCircle } from 'lucide-react'
import { useLocationStore } from '../store/locationStore'
import { useAuthStore } from '../store/authStore'
import { toast } from './Toast'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function AddressForm({ initialData, onSave, onCancel }) {
  const { user } = useAuthStore()
  const { location } = useLocationStore()
  
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || user?.user_metadata?.full_name || '',
    phone: initialData?.phone || '',
    door_number: initialData?.door_number || '',
    street_address: initialData?.street_address || '',
    landmark: initialData?.landmark || '',
    city: initialData?.city || location?.city || '',
    state: initialData?.state || location?.state || '',
    pincode: initialData?.pincode || location?.pincode || '',
    address_type: initialData?.address_type || 'home',
    is_default: initialData?.is_default || false,
    latitude: initialData?.latitude || location?.latitude || null,
    longitude: initialData?.longitude || location?.longitude || null
  })

  const [autoFilling, setAutoFilling] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'full_name':
        return !value.trim() ? 'Full name is required' : value.length < 3 ? 'Name is too short' : ''
      case 'phone':
        return !value.trim() ? 'Phone number is required' : !/^[6-9]\d{9}$/.test(value) ? 'Invalid Indian phone number' : ''
      case 'street_address':
        return !value.trim() ? 'Street address is required' : value.length < 5 ? 'Address is too short' : ''
      case 'pincode':
        return !value.trim() ? 'Pincode is required' : !/^[1-9][0-9]{5}$/.test(value) ? 'Invalid Indian pincode' : ''
      case 'city':
        return !value.trim() ? 'City is required' : ''
      case 'state':
        return !value.trim() ? 'State is required' : ''
      default:
        return ''
    }
  }

  // Auto-fill from detected location
  useEffect(() => {
    if (location && !initialData) {
      setFormData(prev => ({
        ...prev,
        city: location.city || prev.city,
        state: location.state || prev.state,
        pincode: location.pincode || prev.pincode,
        latitude: location.latitude,
        longitude: location.longitude
      }))
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Validate on change if field was touched
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, newValue)
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }))
  }

  const handleAutoFill = async () => {
    setAutoFilling(true)
    hapticFeedback('medium')
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              {
                headers: { 'User-Agent': 'QuickCommerce/1.0' }
              }
            )
            
            const data = await response.json()
            const addr = data.address || {}
            
            setFormData(prev => ({
              ...prev,
              street_address: addr.road || prev.street_address,
              city: addr.city || addr.town || addr.village || prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
              latitude,
              longitude
            }))
            
            setAutoFilling(false)
            toast.success('Location detected successfully')
            hapticFeedback('success')
          },
          (error) => {
            console.error('Geolocation error:', error)
            setAutoFilling(false)
            toast.error('Could not detect location. Please enter manually.')
            hapticFeedback('error')
          }
        )
      }
    } catch (error) {
      console.error('Auto-fill error:', error)
      setAutoFilling(false)
      toast.error('Failed to get location. Please try again.')
      hapticFeedback('error')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    hapticFeedback('light')

    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      toast.error('Please fix the errors in the form')
      return
    }

    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-fill Card */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-primary-900">Quick Fill</h3>
              <p className="text-sm text-primary-700">Auto-detect your current location</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={autoFilling}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Navigation className={`w-4 h-4 ${autoFilling ? 'animate-spin' : ''}`} />
            <span>{autoFilling ? 'Detecting...' : 'Auto-fill'}</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="form-label" htmlFor="full_name">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field pl-10 ${errors.full_name ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="John Doe"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {errors.full_name && touched.full_name && (
              <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.full_name}
              </div>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="form-label" htmlFor="phone">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="+91 98765 43210"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {errors.phone && touched.phone && (
              <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone}
              </div>
            )}
          </div>
        </div>

        {/* Address Type */}
        <div>
          <label className="form-label">Address Type</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'home', icon: Home, label: 'Home' },
              { type: 'work', icon: Building, label: 'Work' },
              { type: 'other', icon: MapPinned, label: 'Other' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, address_type: type }))
                  hapticFeedback('light')
                }}
                className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.address_type === type
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Door/Flat Number */}
        <div>
          <label className="form-label" htmlFor="door_number">
            Flat/Door Number
          </label>
          <input
            type="text"
            id="door_number"
            name="door_number"
            value={formData.door_number}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 123, Flat 4B"
          />
        </div>

        {/* Street Address */}
        <div>
          <label className="form-label" htmlFor="street_address">
            Street Address
          </label>
          <input
            type="text"
            id="street_address"
            name="street_address"
            value={formData.street_address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field ${errors.street_address ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder="Street name, Area"
          />
          {errors.street_address && touched.street_address && (
            <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.street_address}
            </div>
          )}
        </div>

        {/* Landmark */}
        <div>
          <label className="form-label" htmlFor="landmark">
            Landmark (Optional)
          </label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            className="input-field"
            placeholder="Near park, temple, etc."
          />
        </div>

        {/* City, State, and Pincode */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label" htmlFor="city">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.city ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="City name"
            />
            {errors.city && touched.city && (
              <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.city}
              </div>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="state">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.state ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="State name"
            />
            {errors.state && touched.state && (
              <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.state}
              </div>
            )}
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="form-label" htmlFor="pincode">
              Pincode
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.pincode ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="6-digit pincode"
              maxLength={6}
            />
            {errors.pincode && touched.pincode && (
              <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.pincode}
              </div>
            )}
          </div>
        </div>

        {/* Default Address Checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="is_default"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="is_default" className="text-sm text-gray-700">
            Set as default address
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Save Address
        </button>
      </div>
    </form>
  )
}

