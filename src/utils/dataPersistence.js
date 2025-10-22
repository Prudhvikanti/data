/**
 * Data Persistence Manager
 * Ensures all user data is saved and persists across sessions
 */

import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useRecentlyViewedStore } from '../store/recentlyViewedStore'
import { useLocationStore } from '../store/locationStore'

/**
 * Initialize data persistence listeners
 */
export function initDataPersistence() {
  console.log('📦 Data persistence initialized')

  // Save data when user leaves the page
  window.addEventListener('beforeunload', saveAllData)
  
  // Save data when tab becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveAllData()
    }
  })

  // Save data when app goes to background (mobile)
  window.addEventListener('pagehide', saveAllData)

  // Periodic auto-save every 30 seconds
  const autoSaveInterval = setInterval(saveAllData, 30000)

  // Cleanup
  return () => {
    window.removeEventListener('beforeunload', saveAllData)
    window.removeEventListener('pagehide', saveAllData)
    clearInterval(autoSaveInterval)
  }
}

/**
 * Save all data to storage
 */
function saveAllData() {
  try {
    // Zustand persist middleware handles automatic saving
    // This is a backup save trigger
    const timestamp = Date.now()
    
    // Force sync cart
    useCartStore.getState().syncCart?.()
    
    // Save sync timestamp
    localStorage.setItem('last-sync', timestamp.toString())
    
    console.log('✅ All data saved at', new Date(timestamp).toLocaleTimeString())
  } catch (error) {
    console.error('❌ Error saving data:', error)
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime() {
  const timestamp = localStorage.getItem('last-sync')
  return timestamp ? parseInt(timestamp, 10) : null
}

/**
 * Check if data is fresh (synced within last 5 minutes)
 */
export function isDataFresh() {
  const lastSync = getLastSyncTime()
  if (!lastSync) return false
  
  const age = Date.now() - lastSync
  return age < 5 * 60 * 1000 // 5 minutes
}

/**
 * Force save all stores
 */
export function forceSaveAll() {
  saveAllData()
  return true
}

/**
 * Get storage usage
 */
export async function getStorageInfo() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(2),
      usageMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaMB: (estimate.quota / (1024 * 1024)).toFixed(2)
    }
  }
  return null
}

/**
 * Clear all app data (use with caution!)
 */
export function clearAllAppData() {
  if (window.confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
    // Clear all localStorage
    const keysToKeep = [] // Add any keys you want to keep
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear session storage
    sessionStorage.clear()
    
    // Reload the app
    window.location.reload()
    
    return true
  }
  return false
}

/**
 * Export all user data (for backup or transfer)
 */
export function exportUserData() {
  const data = {
    cart: useCartStore.getState().items,
    wishlist: useWishlistStore.getState().wishlist,
    recentlyViewed: useRecentlyViewedStore.getState().recentlyViewed,
    userProfile: useAuthStore.getState().userProfile,
    location: useLocationStore.getState().location,
    exportedAt: new Date().toISOString()
  }

  // Create blob and download
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quickcommerce-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  return data
}

/**
 * Import user data (restore from backup)
 */
export function importUserData(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

    if (data.cart) {
      useCartStore.setState({ items: data.cart })
    }
    if (data.wishlist) {
      useWishlistStore.setState({ wishlist: data.wishlist })
    }
    if (data.recentlyViewed) {
      useRecentlyViewedStore.setState({ recentlyViewed: data.recentlyViewed })
    }

    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

/**
 * Sync data across tabs
 */
export function initCrossTabSync() {
  window.addEventListener('storage', (e) => {
    // Sync cart across tabs
    if (e.key === 'quickcommerce-cart' && e.newValue) {
      try {
        const newData = JSON.parse(e.newValue)
        useCartStore.setState(newData.state)
      } catch (error) {
        console.error('Error syncing cart across tabs:', error)
      }
    }

    // Sync wishlist across tabs
    if (e.key === 'quickcommerce-wishlist' && e.newValue) {
      try {
        const newData = JSON.parse(e.newValue)
        useWishlistStore.setState(newData.state)
      } catch (error) {
        console.error('Error syncing wishlist across tabs:', error)
      }
    }
  })
}


