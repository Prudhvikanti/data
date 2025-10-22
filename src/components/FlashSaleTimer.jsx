import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

export default function FlashSaleTimer({ endTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = new Date(endTime) - new Date()
    
    if (difference <= 0) {
      return { expired: true }
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      if (newTimeLeft.expired && onExpire) {
        onExpire()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onExpire])

  if (timeLeft.expired) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 text-center">
        <p className="text-gray-600 font-semibold">Sale Ended</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 text-white shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Zap className="w-5 h-5 animate-pulse" />
        <h3 className="font-bold text-lg">Flash Sale Ends In</h3>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <span className="text-2xl font-bold">:</span>
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <span className="text-2xl font-bold">:</span>
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
        <span className="text-2xl md:text-3xl font-bold">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs mt-1 opacity-90">{label}</span>
    </div>
  )
}

// Compact version for product cards
export function CompactFlashTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = new Date(endTime) - new Date()
    
    if (difference <= 0) {
      return { expired: true }
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (timeLeft.expired) return null

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
      <Zap className="w-3 h-3" />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

