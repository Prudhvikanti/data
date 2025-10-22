import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus, ChevronDown, Check, Map, Home, Building, Trash2, Star } from 'lucide-react'
import { useLocationStore } from '../store/locationStore'
import { useAddressStore } from '../store/addressStore'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function LocationDropdown() {
  const navigate = useNavigate()
  const { location, isServiceAvailable, serviceArea, clearLocation, setLocation, setServiceAvailable } = useLocationStore()
  const { addresses, setCurrentAddress, deleteAddress, setDefaultAddress } = useAddressStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationClick = () => {
    hapticFeedback('light')
    setIsOpen(!isOpen)
  }

  const handleSelectLocation = () => {
    hapticFeedback('light')
    setIsOpen(false)
    navigate('/select-location')
  }

  const handleAddNewAddress = () => {
    hapticFeedback('light')
    setIsOpen(false)
    navigate('/select-location')
  }

  const handleClearLocation = () => {
    hapticFeedback('medium')
    clearLocation()
    setIsOpen(false)
  }

  const handleSelectSavedAddress = (savedAddress) => {
    hapticFeedback('light')
    
    // Update location store with saved address
    setLocation({
      latitude: savedAddress.latitude,
      longitude: savedAddress.longitude,
      formattedAddress: savedAddress.formattedAddress,
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      available: savedAddress.isServiceAvailable
    })
    
    setServiceAvailable(savedAddress.isServiceAvailable)
    setCurrentAddress(savedAddress)
    setIsOpen(false)
  }

  const handleDeleteAddress = (addressId, e) => {
    e.stopPropagation()
    hapticFeedback('medium')
    deleteAddress(addressId)
  }

  const handleSetDefault = (addressId, e) => {
    e.stopPropagation()
    hapticFeedback('light')
    setDefaultAddress(addressId)
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

  const getDisplayText = () => {
    if (location?.formattedAddress) {
      return location.formattedAddress.split(',')[0]
    }
    if (location?.city) {
      return location.city
    }
    if (serviceArea?.name) {
      return serviceArea.name
    }
    return 'Select Location'
  }

  const getSubText = () => {
    if (location?.formattedAddress) {
      const parts = location.formattedAddress.split(',')
      return parts.length > 1 ? parts.slice(1).join(', ').trim() : ''
    }
    if (location?.city && location?.state) {
      return location.state
    }
    return ''
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Deliver to Button */}
      <button
        onClick={handleLocationClick}
        className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors group"
      >
        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <MapPin className="w-4 h-4 text-primary-600" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-600">Delivery to</p>
          <p className="text-sm font-medium text-gray-900 line-clamp-1">
            {getDisplayText()}
          </p>
          {getSubText() && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {getSubText()}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 max-h-96 overflow-y-auto">
          {/* Current Location */}
          {location && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Current Location</p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {location.formattedAddress || `${location.city}, ${location.state}`}
                  </p>
                  {location.pincode && (
                    <p className="text-xs text-primary-600 mt-1">
                      Pincode: {location.pincode}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClearLocation}
                  className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 mb-2 px-1">SAVED ADDRESSES</p>
              <div className="space-y-1">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => handleSelectSavedAddress(address)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                      {getAddressIcon(address.type)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{address.name}</p>
                        {address.isDefault && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {address.formattedAddress || `${address.city}, ${address.state}`}
                      </p>
                      {address.pincode && (
                        <p className="text-xs text-primary-600">
                          {address.pincode}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!address.isDefault && (
                        <button
                          onClick={(e) => handleSetDefault(address.id, e)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Set as default"
                        >
                          <Star className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteAddress(address.id, e)}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete address"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-1 p-2">
            <button
              onClick={handleSelectLocation}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {location ? 'Change Location' : 'Select Location'}
                </p>
                <p className="text-xs text-gray-600">
                  Use map to pin your exact location
                </p>
              </div>
            </button>

            <button
              onClick={handleAddNewAddress}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Add New Address</p>
                <p className="text-xs text-gray-600">
                  Save multiple delivery addresses
                </p>
              </div>
            </button>
          </div>

          {/* Service Status */}
          {isServiceAvailable !== null && (
            <div className="mt-2 p-2 rounded-lg bg-gray-50 mx-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-xs text-gray-600">
                  {isServiceAvailable ? 'Service available at this location' : 'Service not available'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
