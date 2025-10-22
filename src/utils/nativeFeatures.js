/**
 * Native-like features for better mobile experience
 */

/**
 * Haptic feedback (vibration)
 */
export function hapticFeedback(type = 'light') {
  if (!navigator.vibrate) return

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [20, 100, 20],
    warning: [15, 50, 15]
  }

  navigator.vibrate(patterns[type] || patterns.light)
}

/**
 * Share functionality (native share)
 */
export async function shareContent(data) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title || 'QuickCommerce',
        text: data.text || 'Check out this amazing product!',
        url: data.url || window.location.href
      })
      return true
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
      return false
    }
  }
  return false
}

/**
 * Add to home screen prompt
 */
export function showInstallPrompt() {
  let deferredPrompt = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })

  return async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      return outcome === 'accepted'
    }
    return false
  }
}

/**
 * Check if app is running as PWA
 */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Show notification
 */
export function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    })
  }
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    hapticFeedback('success')
    return true
  } catch (error) {
    console.error('Copy failed:', error)
    return false
  }
}

/**
 * Network status detection
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Device detection
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent

  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    isIOS: /iPad|iPhone|iPod/.test(ua) && !window.MSStream,
    isAndroid: /Android/.test(ua),
    isSafari: /^((?!chrome|android).)*safari/i.test(ua),
    isChrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor)
  }
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(elementId, offset = 0) {
  const element = document.getElementById(elementId)
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }
}

/**
 * Lock scroll (for modals)
 */
export function lockScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = '0px'
}

export function unlockScroll() {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

/**
 * Wake lock (keep screen on)
 */
export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      return wakeLock
    } catch (error) {
      console.error('Wake lock error:', error)
    }
  }
  return null
}

/**
 * Battery status
 */
export async function getBatteryStatus() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery()
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging
      }
    } catch (error) {
      console.error('Battery API error:', error)
    }
  }
  return null
}

/**
 * Voice search using Web Speech API
 */
export function useVoiceSearch(onResult, onError) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
    hapticFeedback('success')
  }

  recognition.onerror = (event) => {
    if (onError) onError(event.error)
    hapticFeedback('error')
  }

  return {
    start: () => {
      recognition.start()
      hapticFeedback('light')
    },
    stop: () => recognition.stop(),
    abort: () => recognition.abort()
  }
}

/**
 * Barcode scanner using device camera
 */
export async function scanBarcode() {
  if (!('BarcodeDetector' in window)) {
    console.log('Barcode Detector not supported')
    return null
  }

  try {
    const barcodeDetector = new window.BarcodeDetector()
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    
    return { barcodeDetector, stream }
  } catch (error) {
    console.error('Camera access error:', error)
    return null
  }
}

/**
 * Add to home screen (Install PWA)
 */
let deferredPrompt = null

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })
}

export async function promptInstall() {
  if (!deferredPrompt) {
    return { outcome: 'not-available' }
  }

  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice
  deferredPrompt = null
  hapticFeedback('success')
  
  return result
}

export function canInstall() {
  return deferredPrompt !== null
}

/**
 * Offline mode detection
 */
export function isOffline() {
  return !navigator.onLine
}

export function onNetworkChange(callback) {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Quick actions (for PWA)
 */
export function setQuickActions() {
  if ('setAppBadge' in navigator) {
    // Set badge for notifications
    navigator.setAppBadge(0).catch(() => {})
  }
}

export function setBadgeCount(count) {
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {})
    } else {
      navigator.clearAppBadge().catch(() => {})
    }
  }
}

/**
 * Geolocation with high accuracy
 */
export async function getCurrentLocation(highAccuracy = false) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => reject(error),
      {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Image optimization and lazy loading
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Check if running in standalone mode (installed PWA)
 */
export function isPWA() {
  return isStandalone()
}

/**
 * Request persistent storage (for offline data)
 */
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist()
    return isPersisted
  }
  return false
}

/**
 * Get storage quota
 */
export async function getStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: (estimate.usage / estimate.quota * 100).toFixed(2)
    }
  }
  return null
}

/**
 * Performance monitoring
 */
export function measurePageLoad() {
  if ('performance' in window) {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    return {
      pageLoad: pageLoadTime,
      domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      firstByte: perfData.responseStart - perfData.navigationStart
    }
  }
  return null
}

/**
 * Fullscreen mode
 */
export async function enterFullscreen() {
  const elem = document.documentElement
  if (elem.requestFullscreen) {
    await elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    await elem.webkitRequestFullscreen()
  }
}

export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  }
}

/**
 * Add to favorites animation
 */
export function animateHeart(element) {
  if (!element) return
  
  element.classList.add('scale-125')
  hapticFeedback('light')
  
  setTimeout(() => {
    element.classList.remove('scale-125')
  }, 200)
}

