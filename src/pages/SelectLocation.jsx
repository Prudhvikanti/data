import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, Plus, Save, Home, Building, X, CheckCircle, AlertCircle, Star, Trash2 } from 'lucide-react'
import LocationMap from '../components/LocationMap'
import { useLocationStore } from '../store/locationStore'
import { useAddressStore } from '../store/addressStore'
import { toast } from '../components/Toast'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function SelectLocation() {
  const navigate = useNavigate()
  const { location: currentLocation } = useLocationStore()
  const { addAddress, addresses, deleteAddress, setDefaultAddress } = useAddressStore()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showSaveAddress, setShowSaveAddress] = useState(false)
  const [addressName, setAddressName] = useState('')
  const [addressType, setAddressType] = useState('home')
  const [showSavedAddresses, setShowSavedAddresses] = useState(false)
  const [addressDetails, setAddressDetails] = useState({
    floor: '',
    landmark: '',
    instructions: ''
  })

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData)
    setShowSaveAddress(false) // Hide save form when new location is selected
    hapticFeedback('light')
  }

  const handleSaveAddress = () => {
    if (!selectedLocation) {
      toast.error('Please select a location first')
      return
    }

    if (!addressName.trim()) {
      toast.error('Please enter a name for this address')
      return
    }

    const addressData = {
      name: addressName.trim(),
      type: addressType,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      formattedAddress: selectedLocation.formattedAddress,
      city: selectedLocation.city,
      state: selectedLocation.state,
      pincode: selectedLocation.pincode,
      isServiceAvailable: selectedLocation.isServiceAvailable,
      floor: addressDetails.floor,
      landmark: addressDetails.landmark,
      instructions: addressDetails.instructions
    }

    addAddress(addressData)
    toast.success(`Address "${addressName}" saved successfully!`)
    hapticFeedback('success')
    
    // Reset form
    setAddressName('')
    setAddressType('home')
    setAddressDetails({ floor: '', landmark: '', instructions: '' })
    setShowSaveAddress(false)
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      // Update location store
      const { setLocation, setServiceAvailable } = useLocationStore.getState()
      
      setLocation({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        available: selectedLocation.isServiceAvailable,
        area: selectedLocation.city,
        pincode: selectedLocation.pincode,
        address: selectedLocation.formattedAddress,
        formattedAddress: selectedLocation.formattedAddress,
        city: selectedLocation.city,
        state: selectedLocation.state
      })
      
      setServiceAvailable(selectedLocation.isServiceAvailable)
      hapticFeedback('medium')

      // Redirect based on availability
      if (selectedLocation.isServiceAvailable) {
        navigate('/')
      } else {
        navigate('/service-unavailable')
      }
    }
  }

  const handleUseSavedAddress = (address) => {
    setSelectedLocation(address)
    setShowSavedAddresses(false)
    toast.success(`Using ${address.name}`)
    hapticFeedback('light')
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />
      case 'work':
        return <Building className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-50 py-6 md:py-10">
      <div className="container-custom max-w-5xl">
        {/* Enhanced Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
            <MapPin className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
            Select Your Delivery Location
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Pin your exact location on the map for accurate delivery estimates
          </p>
        </div>

        {/* Saved Addresses Section */}
        {addresses.length > 0 && (
          <div className="card p-4 md:p-6 mb-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Saved Addresses ({addresses.length})
              </h3>
              <button
                onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showSavedAddresses ? 'Hide' : 'Show'}
              </button>
            </div>

            {showSavedAddresses && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => handleUseSavedAddress(address)}
                    className="w-full text-left p-3 md:p-4 bg-white border-2 border-gray-200 hover:border-primary-300 rounded-xl transition-all hover:shadow-md group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        {getAddressIcon(address.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{address.name}</h4>
                          {address.isDefault && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                          {address.formattedAddress}
                        </p>
                        {address.pincode && (
                          <p className="text-xs text-primary-600 mt-1">{address.pincode}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDefaultAddress(address.id)
                            toast.success('Default address updated')
                          }}
                          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Set as default"
                        >
                          <Star className={`w-4 h-4 ${address.isDefault ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAddress(address.id)
                            toast.success('Address deleted')
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Component with Enhanced Styling */}
        <div className="card p-4 md:p-6 mb-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Location on Map</h2>
            <p className="text-sm text-gray-600">Tap on the map or drag the marker to set your location</p>
          </div>
          <LocationMap onLocationSelect={handleLocationSelect} />
        </div>

        {/* Save Address Form - Enhanced UI */}
        {selectedLocation && showSaveAddress && (
          <div className="card p-6 mb-6 shadow-lg border-2 border-primary-200 animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Save className="w-6 h-6 text-primary-600" />
                Save This Address
              </h3>
              <button
                onClick={() => setShowSaveAddress(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Address Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Name *
                </label>
                <input
                  type="text"
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                  placeholder="e.g., Home, Office, Mom's House"
                  className="input-field text-base"
                />
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    addressType === 'home' 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={addressType === 'home'}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="sr-only"
                    />
                    <Home className={`w-6 h-6 ${addressType === 'home' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${addressType === 'home' ? 'text-primary-700' : 'text-gray-600'}`}>
                      Home
                    </span>
                  </label>
                  
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    addressType === 'work' 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="work"
                      checked={addressType === 'work'}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="sr-only"
                    />
                    <Building className={`w-6 h-6 ${addressType === 'work' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${addressType === 'work' ? 'text-primary-700' : 'text-gray-600'}`}>
                      Work
                    </span>
                  </label>
                  
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    addressType === 'other' 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="other"
                      checked={addressType === 'other'}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="sr-only"
                    />
                    <MapPin className={`w-6 h-6 ${addressType === 'other' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${addressType === 'other' ? 'text-primary-700' : 'text-gray-600'}`}>
                      Other
                    </span>
                  </label>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor / Apartment (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressDetails.floor}
                    onChange={(e) => setAddressDetails({...addressDetails, floor: e.target.value})}
                    placeholder="e.g., 3rd Floor, Apt 301"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressDetails.landmark}
                    onChange={(e) => setAddressDetails({...addressDetails, landmark: e.target.value})}
                    placeholder="e.g., Near City Mall"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={addressDetails.instructions}
                  onChange={(e) => setAddressDetails({...addressDetails, instructions: e.target.value})}
                  placeholder="e.g., Ring the doorbell twice, Call before arriving"
                  rows={3}
                  className="input-field text-sm resize-none"
                />
              </div>

              {/* Address Preview */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  {selectedLocation.isServiceAvailable ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 mb-1">ADDRESS PREVIEW</p>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {selectedLocation.formattedAddress}
                    </p>
                    {selectedLocation.pincode && (
                      <p className="text-xs text-primary-600 font-medium">
                        PIN: {selectedLocation.pincode}
                      </p>
                    )}
                    <p className={`text-xs mt-2 font-medium ${
                      selectedLocation.isServiceAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedLocation.isServiceAvailable ? '✓ Delivery Available' : '✗ Service Unavailable'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveAddress(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Enhanced */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t-2 border-gray-200 p-4 -mx-4 md:mx-0 md:relative md:bg-transparent md:backdrop-blur-none md:border-0 md:p-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex-1 order-2 sm:order-1"
            >
              Cancel
            </button>
            
            {selectedLocation && !showSaveAddress && (
              <button
                onClick={() => setShowSaveAddress(true)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 order-3 sm:order-2"
              >
                <Plus className="w-4 h-4" />
                Save Address
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="btn-primary flex-1 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl order-1 sm:order-3"
            >
              Confirm Location
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        {selectedLocation && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>
                {selectedLocation.latitude?.toFixed(6)}, {selectedLocation.longitude?.toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
