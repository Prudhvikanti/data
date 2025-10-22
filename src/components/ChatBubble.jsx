import { useState } from 'react'
import { MessageCircle, X, Send, Phone, Mail } from 'lucide-react'
import { hapticFeedback } from '../utils/nativeFeatures'

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const toggleChat = () => {
    setIsOpen(!isOpen)
    hapticFeedback('light')
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    
    // Here you would integrate with your chat service
    console.log('Message sent:', message)
    hapticFeedback('success')
    setMessage('')
  }

  const handleQuickAction = (action) => {
    hapticFeedback('light')
    
    switch (action) {
      case 'call':
        window.location.href = 'tel:+911234567890'
        break
      case 'whatsapp':
        window.open('https://wa.me/911234567890', '_blank')
        break
      case 'email':
        window.location.href = 'mailto:support@quickcommerce.com'
        break
      default:
        break
    }
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 animate-slide-in-up border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold">Customer Support</h3>
                <p className="text-xs text-primary-100">Online • Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto bg-gray-50">
            {/* Welcome Message */}
            <div className="mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm inline-block max-w-[80%]">
                <p className="text-sm text-gray-800">
                  Hi there! 👋 How can we help you today?
                </p>
                <p className="text-xs text-gray-500 mt-1">Just now</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold mb-2">Quick Actions:</p>
              <button
                onClick={() => handleQuickAction('whatsapp')}
                className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </button>
              <button
                onClick={() => handleQuickAction('call')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                Call Support
              </button>
              <button
                onClick={() => handleQuickAction('email')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </button>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 animate-bounce-slow"
        title="Chat with us"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-bold">1</span>
            </div>
          </>
        )}
      </button>
    </>
  )
}

