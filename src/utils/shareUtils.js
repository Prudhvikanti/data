// Share Utilities - Web Share API and Fallbacks

import { toast } from '../components/Toast'
import { hapticFeedback } from './nativeFeatures'

/**
 * Share content using Web Share API with fallback
 */
export async function shareContent(options = {}) {
  const {
    title = 'Check this out!',
    text = 'I found something interesting',
    url = window.location.href
  } = options

  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      hapticFeedback('medium')
      await navigator.share({
        title,
        text,
        url
      })
      console.log('✅ Content shared successfully')
      toast.success('Shared successfully!')
      return true
    } else {
      // Fallback: Copy to clipboard
      return await copyToClipboard(url, 'Link copied to clipboard! Share it anywhere.')
    }
  } catch (error) {
    // User cancelled or error occurred
    if (error.name === 'AbortError') {
      console.log('Share cancelled by user')
      return false
    }
    
    console.error('Share error:', error)
    // Fallback to clipboard
    return await copyToClipboard(url, 'Link copied! Share it with your friends.')
  }
}

/**
 * Share a product
 */
export async function shareProduct(product) {
  return await shareContent({
    title: product.name,
    text: `Check out ${product.name} - Only $${product.price}!`,
    url: `${window.location.origin}/products/${product.id}`
  })
}

/**
 * Share the app
 */
export async function shareApp() {
  return await shareContent({
    title: 'QuickCommerce - Fast Delivery App',
    text: 'Shop groceries with 10-minute delivery! Download the app now.',
    url: window.location.origin
  })
}

/**
 * Share a restaurant
 */
export async function shareRestaurant(restaurant) {
  return await shareContent({
    title: restaurant.name,
    text: `Order delicious food from ${restaurant.name}!`,
    url: `${window.location.origin}/restaurants/${restaurant.id}`
  })
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      hapticFeedback('success')
      toast.success(successMessage)
      return true
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      textArea.remove()
      
      if (successful) {
        hapticFeedback('success')
        toast.success(successMessage)
        return true
      } else {
        throw new Error('Copy command failed')
      }
    } catch (err) {
      textArea.remove()
      throw err
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    toast.error('Failed to copy. Please copy manually.')
    return false
  }
}

/**
 * Check if share is supported
 */
export function isShareSupported() {
  return typeof navigator.share === 'function'
}

/**
 * Get share button text
 */
export function getShareButtonText() {
  return isShareSupported() ? 'Share' : 'Copy Link'
}

export default {
  shareContent,
  shareProduct,
  shareApp,
  shareRestaurant,
  copyToClipboard,
  isShareSupported,
  getShareButtonText
}



