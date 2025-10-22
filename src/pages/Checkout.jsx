import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useLocationStore } from '../store/locationStore'
import { supabase } from '../lib/supabase'
import { MapPin, Phone, CheckCircle, Plus, CreditCard, Wallet } from 'lucide-react'
import PaymentModal from '../components/PaymentModal'
import AddressForm from '../components/AddressForm'
import { getUserAddresses, saveAddress, setDefaultAddress } from '../services/addressService'
import { createOrder, updatePaymentStatus } from '../services/profileService'
import { useFormAutoSave } from '../hooks/useFormAutoSave'
import { toast } from '../components/Toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { location } = useLocationStore()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: '',
    door_number: '',
    street_address: '',
    landmark: '',
    city: location?.city || 'Samalkota',
    state: location?.state || 'Andhra Pradesh',
    pincode: location?.pincode || '533434'
  })

  const [paymentType, setPaymentType] = useState('cod') // cod, online, upi, card, wallet
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  // Auto-save form data
  const { loadSavedData, clearSavedData } = useFormAutoSave('checkout-form', formData, 2000)

  // Load saved form data on mount
  useEffect(() => {
    if (!selectedAddressId) {
      const saved = loadSavedData()
      if (saved) {
        setFormData(prev => ({ ...prev, ...saved }))
      }
    }
  }, [])

  useEffect(() => {
    loadSavedAddresses()
  }, [user])

  const loadSavedAddresses = async () => {
    try {
      const addresses = await getUserAddresses(user.id)
      setSavedAddresses(addresses)
      
      // Auto-select default address
      const defaultAddr = addresses.find(addr => addr.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        setFormData({
          full_name: defaultAddr.full_name,
          phone: defaultAddr.phone,
          door_number: defaultAddr.door_number || '',
          street_address: defaultAddr.street_address,
          landmark: defaultAddr.landmark || '',
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode
        })
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id)
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      door_number: address.door_number || '',
      street_address: address.street_address,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode
    })
    setShowAddressForm(false)
  }

  const handleSaveNewAddress = async (addressData) => {
    try {
      const newAddress = await saveAddress(user.id, addressData)
      await loadSavedAddresses()
      handleAddressSelect(newAddress)
      setShowAddressForm(false)
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address')
    }
  }

  const total = getTotal()
  const deliveryFee = total >= 20 ? 0 : 2.99
  const finalTotal = total + deliveryFee

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create order with full details
      const deliveryAddress = [
        formData.door_number,
        formData.street_address,
        formData.landmark,
        formData.city,
        formData.state,
        formData.pincode
      ].filter(Boolean).join(', ')

      // Calculate estimated delivery time (10-15 minutes from now)
      const estimatedDelivery = new Date()
      estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 12)

      const order = await createOrder(user.id, {
        total_amount: finalTotal,
        delivery_fee: deliveryFee,
        delivery_address: deliveryAddress,
        delivery_address_id: selectedAddressId,
        phone: formData.phone,
        payment_method: 'pending',
        payment_type: paymentType,
        payment_status: 'pending',
        delivery_instructions: deliveryInstructions || null,
        estimated_delivery_time: estimatedDelivery.toISOString()
      })

      // Create order items with simplified data (name and quantity only)
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        product_description: item.description,
        product_image_url: item.image_url,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        price: item.price * item.quantity,
        unit: item.unit || 'unit'
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear form auto-save
      clearSavedData()

      // If COD, complete immediately
      if (paymentType === 'cod') {
        await updatePaymentStatus(order.id, 'pending', null)
        
        // Update order status
        await supabase
          .from('orders')
          .update({
            payment_method: 'cod',
            status: 'confirmed'
          })
          .eq('id', order.id)

        setOrderPlaced(true)
        clearCart()
        toast.success('Order placed successfully!', 'COD - Pay on delivery')
        
        setTimeout(() => {
          navigate('/orders')
        }, 2000)
      } else {
        // Store order and show payment modal
        setPendingOrder({
          orderId: order.id,
          amount: finalTotal,
          customerId: user.id,
          customerEmail: user.email,
          customerPhone: formData.phone,
          customerName: user.user_metadata?.full_name || 'Customer',
          userId: user.id,
          paymentType: paymentType
        })
        
        setShowPaymentModal(true)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      console.error('Error details:', error.message)
      console.error('Error code:', error.code)
      
      // Show detailed error message
      let errorMessage = 'Failed to create order. '
      if (error.message) {
        errorMessage += error.message
      }
      if (error.code === 'PGRST301') {
        errorMessage = 'Database not configured. Please run Supabase SQL setup first.'
      }
      if (error.message?.includes('JWT')) {
        errorMessage = 'Please login again and try.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Update payment status
      await updatePaymentStatus(
        pendingOrder.orderId, 
        'completed', 
        paymentData.paymentId || null
      )

      // Update order with payment details
      await supabase
        .from('orders')
        .update({
          payment_method: paymentData.method || paymentType,
          payment_type: paymentType,
          status: 'confirmed'
        })
        .eq('id', pendingOrder.orderId)

      setOrderPlaced(true)
      clearCart()
      clearSavedData()
      toast.success('Payment successful!', 'Order confirmed')
      
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Payment update failed')
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been successfully placed
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to orders page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container-custom max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showAddressForm && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    Saved Addresses
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressId === address.id}
                        onChange={() => handleAddressSelect(address)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{address.full_name}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full capitalize">
                              {address.address_type === 'home' && '🏠'}
                              {address.address_type === 'work' && '💼'}
                              {address.address_type === 'other' && '📍'}
                              {address.address_type}
                            </span>
                            {address.is_default && (
                              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {[address.door_number, address.street_address, address.landmark]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-gray-600">
                            📞 {address.phone}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* New Address Form */}
            {(showAddressForm || savedAddresses.length === 0) && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    {savedAddresses.length === 0 ? 'Delivery Address' : 'Add New Address'}
                  </h2>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <AddressForm
                  onSave={handleSaveNewAddress}
                  onCancel={savedAddresses.length > 0 ? () => setShowAddressForm(false) : null}
                />
              </div>
            )}

            {/* Payment Info */}
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary-900 mb-1">Multiple Payment Options</h3>
                  <p className="text-sm text-primary-700">
                    Choose from COD, UPI, Cards, Net Banking, and Wallets at the next step.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="card sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              {/* Payment Type Selection */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                    { id: 'online', label: 'Online Payment', icon: '💳', desc: 'Pay now securely' },
                    { id: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
                    { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard' },
                    { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm, Amazon Pay' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentType(option.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        paymentType === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.desc}</p>
                        </div>
                        {paymentType === option.id && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base resize-none"
                  rows="2"
                  placeholder="E.g., Ring the bell twice, Leave at door..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Place Order - ₹{finalTotal.toFixed(2)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      {pendingOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={pendingOrder}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

