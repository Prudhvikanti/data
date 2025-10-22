/**
 * Haptic feedback utility
 * Provides vibration feedback for mobile devices
 */

/**
 * Haptic feedback (vibration)
 * @param {string} type - Type of haptic feedback: 'light', 'medium', 'heavy', 'success', 'error', 'warning'
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
