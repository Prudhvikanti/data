import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { create } from 'zustand'
import { hapticFeedback } from '../utils/hapticFeedback'

// Toast store
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
    
    // Auto remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, toast.duration || 3000)
    
    return id
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },
  clearAll: () => set({ toasts: [] })
}))

// Toast component
export default function Toast() {
  const { toasts, removeToast } = useToastStore()
  const [progress, setProgress] = useState({})

  useEffect(() => {
    if (toasts.length > 0) {
      // Provide haptic feedback when a new toast appears
      hapticFeedback('light')
    }
  }, [toasts.length])

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-600'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600'
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600'
    }
  }

  const handleClose = (id) => {
    hapticFeedback('light')
    removeToast(id)
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} rounded-xl shadow-lg backdrop-blur-sm animate-slide-in-right pointer-events-auto transform transition-all duration-300 hover:scale-102 hover:shadow-xl`}
        >
          <div className="relative p-4">
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 animate-progress" style={{
              animationDuration: `${toast.duration || 3000}ms`
            }} />
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-white">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0 text-white">
                {toast.title && (
                  <p className="font-semibold text-sm mb-0.5">{toast.title}</p>
                )}
                <p className="text-sm opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => handleClose(toast.id)}
                className="flex-shrink-0 -mt-1 -mr-1 hover:bg-white/20 rounded-full p-1.5 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper functions to show toasts
export const toast = {
  success: (message, title) => {
    hapticFeedback('light')
    return useToastStore.getState().addToast({
      type: 'success',
      message,
      title,
      duration: 3000
    })
  },
  error: (message, title) => {
    hapticFeedback('medium')
    return useToastStore.getState().addToast({
      type: 'error',
      message,
      title,
      duration: 4000
    })
  },
  warning: (message, title) => {
    hapticFeedback('light')
    return useToastStore.getState().addToast({
      type: 'warning',
      message,
      title,
      duration: 3500
    })
  },
  info: (message, title) => {
    hapticFeedback('light')
    return useToastStore.getState().addToast({
      type: 'info',
      message,
      title,
      duration: 3000
    })
  },
  custom: (options) => {
    hapticFeedback('light')
    return useToastStore.getState().addToast(options)
  }
}



