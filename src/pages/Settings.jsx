import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useLocationStore } from '../store/locationStore'
import { getUserAddresses, saveAddress, deleteAddress, setDefaultAddress } from '../services/addressService'
import { MapPin, Plus, Trash2, Edit, Home as HomeIcon, Briefcase, MapPinned, Bell, Lock } from 'lucide-react'
import AddressForm from '../components/AddressForm'
import { Link } from 'react-router-dom'

export default function Settings() {
  const { user } = useAuthStore()
  const { location } = useLocationStore()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    loadAddresses()
  }, [user])

  const loadAddresses = async () => {
    try {
      const data = await getUserAddresses(user.id)
      setAddresses(data)
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAddress = async (addressData) => {
    try {
      if (editingAddress) {
        // Update existing
        await saveAddress(user.id, { ...addressData, id: editingAddress.id })
      } else {
        // Create new
        await saveAddress(user.id, addressData)
      }
      
      await loadAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId)
        await loadAddresses()
      } catch (error) {
        console.error('Error deleting address:', error)
        alert('Failed to delete address')
      }
    }
  }

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(user.id, addressId)
      await loadAddresses()
    } catch (error) {
      console.error('Error setting default:', error)
    }
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home': return <HomeIcon className="w-5 h-5" />
      case 'work': return <Briefcase className="w-5 h-5" />
      default: return <MapPinned className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container-custom max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Saved Addresses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                Saved Addresses
              </h2>
              <button
                onClick={() => {
                  setEditingAddress(null)
                  setShowAddressForm(true)
                }}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 skeleton rounded-lg" />
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-primary-600">
                            {getAddressIcon(address.address_type)}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {address.full_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full capitalize">
                            {address.address_type}
                          </span>
                          {address.is_default && (
                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-1">
                          {[address.door_number, address.street_address]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {address.landmark && (
                          <p className="text-sm text-gray-600">
                            Near: {address.landmark}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-sm text-gray-600">
                          📞 {address.phone}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No saved addresses yet</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-primary"
                >
                  Add Your First Address
                </button>
              </div>
            )}
          </div>

          {/* Address Form Modal */}
          {showAddressForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <AddressForm
                  initialData={editingAddress}
                  onSave={handleSaveAddress}
                  onCancel={() => {
                    setShowAddressForm(false)
                    setEditingAddress(null)
                  }}
                />
              </div>
            </div>
          )}

          {/* Current Location */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinned className="w-5 h-5 text-primary-600" />
              Current Location
            </h2>
            {location ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">City:</span> {location.city || 'Unknown'}
                </p>
                {location.pincode && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Pincode:</span> {location.pincode}
                  </p>
                )}
                <p className="text-xs text-gray-600">
                  Coordinates: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                </p>
                <Link
                  to="/select-location"
                  className="inline-block text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
                >
                  Change Location →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">No location detected</p>
                <Link to="/select-location" className="btn-primary text-sm">
                  Select Location
                </Link>
              </div>
            )}
          </div>

          {/* Notifications (Placeholder) */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Order updates</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Promotional offers</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">New arrivals</span>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
              </label>
            </div>
          </div>

          {/* Account Security (Placeholder) */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-600" />
              Account Security
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-600">Update your password</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <p className="text-sm font-medium text-gray-900">Email Preferences</p>
                <p className="text-xs text-gray-600">Manage email notifications</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

