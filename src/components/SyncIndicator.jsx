import { useEffect, useState } from 'react'
import { RefreshCw, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { hapticFeedback } from '../utils/nativeFeatures'
import { toast } from './Toast'

export default function SyncIndicator() {
  const [status, setStatus] = useState('idle') // idle, syncing, success, error
  const [online, setOnline] = useState(navigator.onLine)
  const [showTooltip, setShowTooltip] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true)
      hapticFeedback('light')
      toast.success('Back online!')
    }

    const handleOffline = () => {
      setOnline(false)
      hapticFeedback('light')
      toast.info('You are offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for sync events
    const handleSync = () => {
      setStatus('syncing')
      hapticFeedback('light')
    }

    const handleSyncSuccess = () => {
      setStatus('success')
      setLastSynced(new Date())
      hapticFeedback('light')
    }

    const handleSyncError = () => {
      setStatus('error')
      hapticFeedback('medium')
      toast.error('Sync failed')
    }

    window.addEventListener('sync', handleSync)
    window.addEventListener('sync-success', handleSyncSuccess)
    window.addEventListener('sync-error', handleSyncError)

    // Reset success/error status after delay
    let resetTimer
    if (status === 'success' || status === 'error') {
      resetTimer = setTimeout(() => {
        setStatus('idle')
      }, 3000)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('sync', handleSync)
      window.removeEventListener('sync-success', handleSyncSuccess)
      window.removeEventListener('sync-error', handleSyncError)
      clearTimeout(resetTimer)
    }
  }, [status])

  const handleClick = () => {
    if (status === 'syncing') return
    
    hapticFeedback('light')
    setStatus('syncing')
    
    // Simulate sync for demo
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate
      if (success) {
        setStatus('success')
        setLastSynced(new Date())
        hapticFeedback('light')
      } else {
        setStatus('error')
        hapticFeedback('medium')
        toast.error('Sync failed')
      }
    }, 2000)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'success':
        return <Check className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return online ? 'text-gray-600' : 'text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...'
      case 'success':
        return 'Synced!'
      case 'error':
        return 'Sync failed'
      default:
        return online ? 'Online' : 'Offline'
    }
  }

  const getTooltipText = () => {
    if (!online) {
      return 'You are currently offline'
    }
    if (status === 'syncing') {
      return 'Syncing your data...'
    }
    if (lastSynced) {
      const timeAgo = Math.round((new Date() - lastSynced) / 1000)
      if (timeAgo < 60) {
        return `Last synced ${timeAgo} seconds ago`
      }
      const minutes = Math.round(timeAgo / 60)
      return `Last synced ${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }
    return 'Click to sync'
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40">
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={status === 'syncing' || !online}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`
            p-3 rounded-xl shadow-lg backdrop-blur-lg transition-all duration-300
            ${online ? 'hover:scale-110 active:scale-95' : 'cursor-not-allowed opacity-75'}
            ${status === 'syncing' ? 'bg-blue-50 border border-blue-200' :
              status === 'success' ? 'bg-green-50 border border-green-200' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-white/90 border border-gray-200'}
          `}
        >
          <div className={`${getStatusColor()} transition-colors duration-300`}>
            {getStatusIcon()}
          </div>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 w-48 animate-fade-in">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3">
              <p>{getStatusText()}</p>
              <p className="text-gray-300 mt-0.5">{getTooltipText()}</p>
            </div>
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
          </div>
        )}
      </div>
    </div>
  )
}


