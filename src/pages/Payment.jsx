import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import CashfreePaymentButton from '../components/CashfreePaymentButton'
import PaymentErrorBoundary from '../components/PaymentErrorBoundary'

export default function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Get order details from URL params
  const orderId = searchParams.get('order_id')
  const amount = searchParams.get('amount') || '0'

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result)
    setPaymentSuccess(true)

    // Redirect to success page after a short delay
    setTimeout(() => {
      navigate(`/payment-success?order_id=${orderId}&cf_order_id=${result.paymentId}&amount=${amount}`)
    }, 2000)
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    setError(error.message || 'Payment failed. Please try again.')
  }

  const handleRetry = () => {
    setError(null)
    setPaymentSuccess(false)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to order confirmation...
          </p>
        </div>
      </div>
    )
  }

  return (
    <PaymentErrorBoundary onRetry={handleRetry}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Payment</h1>
                <p className="text-sm text-gray-600">Complete your order payment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Amount to pay</p>
              <p className="text-2xl font-bold text-primary-600">₹{parseFloat(amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Summary */}
        {orderId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-xl text-primary-600">₹{parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Payment Error</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">🔒 Secure Payment:</span> Your payment is processed securely through Cashfree Payment Gateway.
            All transactions are encrypted and protected.
          </p>
        </div>

        {/* Payment Button */}
        <div className="text-center">
          <CashfreePaymentButton
            amount={parseFloat(amount)}
            orderId={orderId}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />

          <p className="text-sm text-gray-500 mt-4">
            By proceeding, you agree to our terms and conditions
          </p>
        </div>

        {/* Payment Security Info */}
        <div className="mt-8 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">🏦 Payment powered by Cashfree</span><br/>
              Your payment is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </PaymentErrorBoundary>
  )
}
