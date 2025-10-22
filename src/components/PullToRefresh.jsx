import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { hapticFeedback } from '../utils/hapticFeedback'

export default function PullToRefresh({ onRefresh, children }) {
  const containerRef = useRef(null)
  const pullStartY = useRef(0)
  const pullMoveY = useRef(0)
  const distanceRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isRefreshingRef = useRef(false)

  const [distance, setDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const THRESHOLD = 80
  const RESISTANCE = 2.5

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e) => {
      if (isRefreshingRef.current) return

      const { scrollTop } = container
      if (scrollTop > 0) return

      pullStartY.current = e.touches[0].clientY
      isDraggingRef.current = true
      container.style.transition = 'none'
      container.style.willChange = 'transform'
    }

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || isRefreshingRef.current) return

      pullMoveY.current = e.touches[0].clientY
      const touchDelta = (pullMoveY.current - pullStartY.current) / RESISTANCE

      if (touchDelta >= 0) {
        e.preventDefault()
        distanceRef.current = touchDelta
        setDistance(touchDelta)

        // Add haptic feedback at threshold
        if (touchDelta >= THRESHOLD && !isRefreshingRef.current) {
          hapticFeedback('light')
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isDraggingRef.current || isRefreshingRef.current) return

      isDraggingRef.current = false
      container.style.transition = 'transform 0.2s ease-out'
      container.style.willChange = 'auto'

      if (distanceRef.current >= THRESHOLD) {
        isRefreshingRef.current = true
        setIsRefreshing(true)
        setDistance(THRESHOLD)
        hapticFeedback('medium')

        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        }

        // Reset after refresh
        setTimeout(() => {
          isRefreshingRef.current = false
          setIsRefreshing(false)
          setDistance(0)
        }, 300)
      } else {
        setDistance(0)
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [onRefresh])

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-auto"
      style={{
        transform: `translateY(${distance}px)`,
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 -top-16
          transition-opacity duration-200
          ${distance > 0 ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div
          className={`
            w-10 h-10 rounded-full bg-white shadow-lg
            flex items-center justify-center
            transition-transform duration-200
            ${isRefreshing ? 'scale-110' : 'scale-100'}
          `}
        >
          <RefreshCw
            className={`
              w-5 h-5 text-primary-600
              transition-all duration-200
              ${isRefreshing ? 'animate-spin' : ''}
              ${distance >= THRESHOLD ? 'scale-110' : 'scale-100'}
            `}
            style={{
              transform: `rotate(${(distance / THRESHOLD) * 360}deg)`
            }}
          />
        </div>
      </div>

      {children}
    </div>
  )
}

