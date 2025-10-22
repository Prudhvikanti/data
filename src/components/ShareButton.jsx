import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { shareContent, copyToClipboard, isShareSupported } from '../utils/shareUtils'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function ShareButton({ 
  title = 'Share',
  text = 'Check this out!',
  url = window.location.href,
  className = '',
  variant = 'default' // 'default', 'icon', 'minimal'
}) {
  const [copied, setCopied] = useState(false)
  const shareSupported = isShareSupported()

  const handleShare = async () => {
    hapticFeedback('light')
    
    try {
      await shareContent({ title, text, url })
      
      // Show copied state briefly if using clipboard
      if (!shareSupported) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  // Icon only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
        title={shareSupported ? 'Share' : 'Copy link'}
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : shareSupported ? (
          <Share2 className="w-5 h-5 text-gray-600" />
        ) : (
          <Copy className="w-5 h-5 text-gray-600" />
        )}
      </button>
    )
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Copied!</span>
          </>
        ) : shareSupported ? (
          <>
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    )
  }

  // Default button variant
  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all active:scale-95 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-medium">Copied!</span>
        </>
      ) : shareSupported ? (
        <>
          <Share2 className="w-4 h-4" />
          <span className="font-medium">Share</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span className="font-medium">Copy Link</span>
        </>
      )}
    </button>
  )
}



