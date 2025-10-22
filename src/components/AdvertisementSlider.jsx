import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ADVERTISEMENTS = [
  {
    id: 1,
    title: "🎉 Grand Opening Sale!",
    subtitle: "Get 30% OFF on your first order",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    bgColor: "from-purple-500 to-pink-500",
    buttonText: "Shop Now",
    buttonLink: "/products"
  },
  {
    id: 2,
    title: "⚡ 10-Minute Delivery",
    subtitle: "Lightning fast delivery to your doorstep",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&h=400&fit=crop",
    bgColor: "from-primary-500 to-primary-600",
    buttonText: "Order Now",
    buttonLink: "/products"
  },
  {
    id: 3,
    title: "🍎 Fresh Produce Daily",
    subtitle: "Farm-fresh fruits & vegetables",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=400&fit=crop",
    bgColor: "from-green-500 to-emerald-600",
    buttonText: "Browse",
    buttonLink: "/products?category=fruits"
  },
  {
    id: 4,
    title: "🎁 Free Delivery",
    subtitle: "On orders above $20 - Limited time!",
    image: "https://images.unsplash.com/photo-1603252109360-909baaf261c7?w=1200&h=400&fit=crop",
    bgColor: "from-blue-500 to-cyan-600",
    buttonText: "Shop Now",
    buttonLink: "/products"
  }
]

export default function AdvertisementSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ADVERTISEMENTS.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ADVERTISEMENTS.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ADVERTISEMENTS.length) % ADVERTISEMENTS.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentAd = ADVERTISEMENTS[currentSlide]

  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg group">
      {/* Slides */}
      <div className="relative h-48 md:h-64 lg:h-80">
        {ADVERTISEMENTS.map((ad, index) => (
          <div
            key={ad.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <div className={`relative h-full bg-gradient-to-r ${ad.bgColor} overflow-hidden`}>
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${ad.image})` }}
              />
              
              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="container-custom">
                  <div className="max-w-xl text-white">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 animate-fade-in">
                      {ad.title}
                    </h2>
                    <p className="text-base md:text-xl lg:text-2xl mb-4 md:mb-6 text-white/90">
                      {ad.subtitle}
                    </p>
                    <a
                      href={ad.buttonLink}
                      className="inline-block bg-white text-gray-900 px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl active:scale-95"
                    >
                      {ad.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile, shown on hover on desktop */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-900" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {ADVERTISEMENTS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">Auto</span>
          </div>
        </div>
      )}
    </div>
  )
}

