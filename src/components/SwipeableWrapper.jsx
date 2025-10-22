import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SwipeableWrapper({ children, className = '' }) {
  const navigate = useNavigate()
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [swiping, setSwiping] = useState(false)

  const minSwipeDistance = 80 // Minimum distance for a swipe

  const onTouchStart = (e) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
    setSwiping(false)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
    const distance = e.targetTouches[0].clientX - touchStart
    if (distance > 20) {
      setSwiping(true)
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isRightSwipe && touchStart < 50) {
      // Only trigger if swipe started from left edge
      navigate(-1)
    }
    
    setSwiping(false)
  }

  return (
    <div
      className={`${className} ${swiping ? 'transition-transform' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: swiping && touchEnd > touchStart ? `translateX(${Math.min((touchEnd - touchStart) / 4, 50)}px)` : 'none'
      }}
    >
      {children}
    </div>
  )
}

