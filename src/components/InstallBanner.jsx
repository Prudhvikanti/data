import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { canInstall, promptInstall, isPWA } from '../utils/nativeFeatures'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)

      // Show tooltip after a delay
      setTimeout(() => setShowTooltip(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    hapticFeedback('medium')
    setIsInstalling(true)

    try {
      const result = await deferredPrompt.prompt()
      
      if (result.outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsVisible(false)
      }
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    hapticFeedback('light')
    setIsVisible(false)
    setShowTooltip(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 p-4 z-50 animate-slide-up">
      <div className="relative max-w-md mx-auto">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-bounce">
            Install for a better experience! 🚀
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}

        {/* Banner */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4">
          {/* App Icon */}
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download
              className={`w-6 h-6 text-white ${isInstalling ? 'animate-bounce' : ''}`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Install DoIt App
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2">
              Get the best shopping experience with our app. Fast, convenient, and works offline!
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className={`px-4 py-2 text-sm font-medium rounded-lg
                ${
                  isInstalling
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                }
                transition-all duration-200`}
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

