import { useEffect, useRef } from 'react'

/**
 * Auto-save form data to localStorage
 * @param {string} formId - Unique identifier for the form
 * @param {object} formData - Form data object to save
 * @param {number} debounceMs - Debounce delay in milliseconds (default 1000)
 */
export function useFormAutoSave(formId, formData, debounceMs = 1000) {
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the save operation
    timeoutRef.current = setTimeout(() => {
      if (formData && Object.keys(formData).length > 0) {
        const key = `form-autosave-${formId}`
        localStorage.setItem(key, JSON.stringify({
          data: formData,
          savedAt: Date.now()
        }))
        console.log(`Form ${formId} auto-saved`)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [formId, formData, debounceMs])

  // Function to load saved form data
  const loadSavedData = () => {
    const key = `form-autosave-${formId}`
    const saved = localStorage.getItem(key)
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const age = Date.now() - parsed.savedAt
        
        // Only load if saved within last hour
        if (age < 60 * 60 * 1000) {
          return parsed.data
        } else {
          // Clear old data
          localStorage.removeItem(key)
        }
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }
    
    return null
  }

  // Function to clear saved data
  const clearSavedData = () => {
    const key = `form-autosave-${formId}`
    localStorage.removeItem(key)
  }

  return { loadSavedData, clearSavedData }
}

/**
 * Save data when user leaves the page or tab
 */
export function useBeforeUnload(callback) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      callback()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        callback()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [callback])
}

/**
 * Persist scroll position
 */
export function useScrollRestore(key) {
  useEffect(() => {
    // Restore scroll position
    const savedPosition = sessionStorage.getItem(`scroll-${key}`)
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10))
    }

    // Save scroll position
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [key])
}


