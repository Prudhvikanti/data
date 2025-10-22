import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Clock, XCircle, ArrowRight, Package } from 'lucide-react'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing') // processing, success, failed
  const [countdown, setCountdown] = useState(5)
  
  const orderId = searchParams.get('order_id')
  const cfOrderId = searchParams.get('cf_order_id')
  
  useEffect(() => {
    // Simulate payment verification
    const timer = setTimeout(() => {
      // In real scenario, verify payment status with backend
      setStatus('success')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
    
    if (countdown === 0) {
      navigate('/orders')
    }
  }, [countdown, status, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Processing State */}
        {status === 'processing' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-4">
                <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Payment...
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your payment
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4 animate-scale-in">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Your order has been confirmed
              </p>
              
              {/* Order Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <div className="space-y-3">
                  {orderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {orderId.substring(0, 20)}...
                      </span>
                    </div>
                  )}
                  {cfOrderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {cfOrderId.substring(0, 20)}...
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Order Confirmed!
                    </p>
                    <p className="text-sm text-green-700">
                      You will receive a confirmation email shortly. Track your order status in the Orders section.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Redirect */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to your orders in <span className="font-bold text-primary-600">{countdown}</span> seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${(5 - countdown) * 20}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 btn-secondary"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                View Orders
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn't process your payment. Please try again.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">
                  If amount was deducted, it will be refunded within 5-7 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 btn-secondary"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="flex-1 btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

