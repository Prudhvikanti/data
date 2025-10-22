import { useState, useEffect } from 'react'
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react'

export default function CashfreePaymentButton({ amount, orderId, onPaymentSuccess, onPaymentError }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('idle') // idle, processing, success, error

  // Load Cashfree SDK
  useEffect(() => {
    const loadCashfreeSDK = () => {
      return new Promise((resolve, reject) => {
        if (window.Cashfree) {
          resolve(window.Cashfree)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
        script.onload = () => resolve(window.Cashfree)
        script.onerror = () => reject(new Error('Failed to load Cashfree SDK'))
        document.head.appendChild(script)
      })
    }

    loadCashfreeSDK().catch(err => {
      console.error('Failed to load Cashfree SDK:', err)
      setError('Payment gateway unavailable. Please try again.')
    })
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    setPaymentStatus('processing')

    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Create payment session
      const paymentData = await createPaymentSession({
        orderId: orderId || `ORDER_${Date.now()}`,
        amount: amount * 100, // Convert to paise
        currency: 'INR'
      })

      // Initialize Cashfree payment
      if (window.Cashfree) {
        const cashfree = new window.Cashfree({
          mode: 'sandbox' // Change to 'production' for live payments
        })

        const checkoutOptions = {
          paymentSessionId: paymentData.paymentSessionId,
          returnUrl: `${window.location.origin}/payment-success?order_id=${orderId}`,
          onSuccess: (result) => {
            setPaymentStatus('success')
            onPaymentSuccess({
              success: true,
              method: 'cashfree',
              amount: amount,
              paymentId: result.paymentId,
              orderId: orderId,
              status: 'COMPLETED',
              message: 'Payment processed successfully via Cashfree'
            })
          },
          onFailure: (result) => {
            setPaymentStatus('error')
            setError(result.message || 'Payment failed')
            onPaymentError(new Error(result.message || 'Payment failed'))
          }
        }

        cashfree.checkout(checkoutOptions)
      } else {
        throw new Error('Payment gateway not loaded')
      }

    } catch (error) {
      console.error('Payment error:', error)
      setLoading(false)
      setPaymentStatus('error')
      setError(error.message)
      onPaymentError(error)
    }
  }

  // Simulate payment session creation (replace with actual API call)
  const createPaymentSession = async (data) => {
    // This should be replaced with actual API call to your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional failures for testing
        if (Math.random() < 0.1) {
          reject(new Error('Payment session creation failed'))
          return
        }
        resolve({
          paymentSessionId: `session_${Date.now()}`,
          orderId: data.orderId,
          amount: data.amount
        })
      }, 1000)
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || paymentStatus === 'processing'}
        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
          paymentStatus === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : paymentStatus === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : loading || paymentStatus === 'processing'
            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          {paymentStatus === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : paymentStatus === 'error' ? (
            <AlertCircle className="w-6 h-6" />
          ) : loading || paymentStatus === 'processing' ? (
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <CreditCard className="w-6 h-6" />
          )}
          
          <div className="text-center">
            <div className="font-semibold text-lg">
              {paymentStatus === 'success'
                ? 'Payment Successful!'
                : paymentStatus === 'error'
                ? 'Payment Failed'
                : loading || paymentStatus === 'processing'
                ? 'Processing Payment...'
                : `Pay ₹${amount.toFixed(2)}`}
            </div>
            {paymentStatus === 'idle' && (
              <div className="text-sm opacity-90 flex items-center gap-1 mt-1">
                <Shield className="w-4 h-4" />
                <span>Secure payment by Cashfree</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Payment Info */}
      {paymentStatus === 'idle' && (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Multiple Payment Options</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
