import { useEffect, useState } from 'react'
import { Loader2, ShoppingBag, Truck, MapPin } from 'lucide-react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showTip, setShowTip] = useState(false)

  const loadingSteps = [
    {
      icon: ShoppingBag,
      text: 'Loading products...',
      duration: 1500
    },
    {
      icon: MapPin,
      text: 'Checking your location...',
      duration: 1000
    },
    {
      icon: Truck,
      text: 'Getting ready for delivery...',
      duration: 1000
    }
  ]

  const loadingTips = [
    'Free delivery on your first order!',
    'Save items to your wishlist for later',
    'Check out our daily deals',
    'Express delivery available in select areas',
    'Track your order in real-time',
    'Easy returns within 7 days'
  ]

  useEffect(() => {
    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 30)

    // Step animation
    let stepTimeout
    const animateSteps = () => {
      stepTimeout = setTimeout(() => {
        setCurrentStep(prev => {
          const next = prev + 1
          if (next < loadingSteps.length) {
            animateSteps()
          }
          return next < loadingSteps.length ? next : prev
        })
      }, loadingSteps[currentStep].duration)
    }
    animateSteps()

    // Show random tip after delay
    const tipTimeout = setTimeout(() => {
      setShowTip(true)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(stepTimeout)
      clearTimeout(tipTimeout)
    }
  }, [currentStep])

  const CurrentIcon = loadingSteps[currentStep]?.icon || Loader2

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center z-50">
      <div className="w-full max-w-sm mx-4 space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center animate-bounce">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <CurrentIcon className="w-5 h-5 text-primary-600 animate-spin" />
            <p className="text-sm font-medium text-gray-700">
              {loadingSteps[currentStep]?.text || 'Loading...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading Tip */}
          {showTip && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 animate-fade-in">
              <p className="text-xs text-primary-700 text-center">
                💡 {loadingTips[Math.floor(Math.random() * loadingTips.length)]}
              </p>
            </div>
          )}
        </div>

        {/* Loading Steps */}
        <div className="flex justify-center gap-2">
          {loadingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentStep
                  ? 'bg-primary-600'
                  : index < currentStep
                  ? 'bg-primary-200'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

