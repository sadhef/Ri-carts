'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: 'Contemporary Essentials',
    subtitle: 'NEW COLLECTION',
    description: 'Discover timeless pieces crafted for the modern wardrobe.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1400&h=700&fit=crop&crop=center',
    cta: 'SHOP NOW',
    link: '/products',
    position: 'left'
  },
  {
    id: 2,
    title: 'Elevated Basics',
    subtitle: 'PREMIUM QUALITY',
    description: 'Sophisticated designs that seamlessly blend comfort with style.',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1400&h=700&fit=crop&crop=center',
    cta: 'EXPLORE',
    link: '/products',
    position: 'right'
  },
  {
    id: 3,
    title: 'Urban Sophistication',
    subtitle: 'STATEMENT PIECES',
    description: 'Contemporary fashion for the discerning individual.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&h=700&fit=crop&crop=center',
    cta: 'DISCOVER',
    link: '/products',
    position: 'center'
  }
]

export function SimpleSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [isPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden" style={{ backgroundColor: 'var(--rr-light-bg)' }}>
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="min-w-full relative rr-image-overlay">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div 
              className="absolute inset-0" 
              style={{
                background: slide.position === 'left' 
                  ? 'linear-gradient(to right, rgba(248, 247, 244, 0.95) 0%, rgba(248, 247, 244, 0.3) 50%, transparent 100%)'
                  : slide.position === 'right'
                  ? 'linear-gradient(to left, rgba(248, 247, 244, 0.95) 0%, rgba(248, 247, 244, 0.3) 50%, transparent 100%)'
                  : 'linear-gradient(to bottom, transparent 0%, rgba(248, 247, 244, 0.9) 100%)'
              }}
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="rr-container w-full">
                <div className={`max-w-xl ${
                  slide.position === 'right' ? 'ml-auto text-right' : 
                  slide.position === 'center' ? 'mx-auto text-center' : ''
                } ${index === currentSlide ? 'slide-content-enter' : ''}`}>
                  <p className="rr-label mb-4" style={{ color: 'var(--rr-dark-text)' }}>
                    {slide.subtitle}
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-6xl font-light mb-6 tracking-tight leading-tight" style={{ color: 'var(--rr-pure-black)' }}>
                    {slide.title}
                  </h2>
                  <p className="rr-body-lg mb-8 max-w-md leading-relaxed" style={{ 
                    color: 'var(--rr-dark-text)',
                    margin: slide.position === 'right' ? '0 0 2rem auto' : 
                           slide.position === 'center' ? '0 auto 2rem auto' : '0 0 2rem 0'
                  }}>
                    {slide.description}
                  </p>
                  <div className={`${index === currentSlide ? 'slide-content-enter-delayed' : ''}`}>
                    <Link href={slide.link}>
                      <button className="rr-button-primary">
                        {slide.cta}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-all duration-300 z-10"
        style={{ 
          backgroundColor: 'rgba(248, 247, 244, 0.9)', 
          color: 'var(--rr-pure-black)',
          backdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--rr-pure-black)'
          e.currentTarget.style.color = 'var(--rr-light-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(248, 247, 244, 0.9)'
          e.currentTarget.style.color = 'var(--rr-pure-black)'
        }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-all duration-300 z-10"
        style={{ 
          backgroundColor: 'rgba(248, 247, 244, 0.9)', 
          color: 'var(--rr-pure-black)',
          backdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--rr-pure-black)'
          e.currentTarget.style.color = 'var(--rr-light-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(248, 247, 244, 0.9)'
          e.currentTarget.style.color = 'var(--rr-pure-black)'
        }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6">
        {/* Slide Indicators */}
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="transition-all duration-300"
              style={{
                width: index === currentSlide ? '24px' : '8px',
                height: '2px',
                backgroundColor: index === currentSlide ? 'var(--rr-pure-black)' : 'var(--rr-medium-gray)'
              }}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={toggleAutoPlay}
          className="w-10 h-10 flex items-center justify-center transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(248, 247, 244, 0.9)', 
            color: 'var(--rr-pure-black)',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--rr-pure-black)'
            e.currentTarget.style.color = 'var(--rr-light-bg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(248, 247, 244, 0.9)'
            e.currentTarget.style.color = 'var(--rr-pure-black)'
          }}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'rgba(231, 230, 228, 0.5)' }}>
          <div 
            className="h-full animate-[slideProgress_5s_linear_infinite]"
            style={{ backgroundColor: 'var(--rr-pure-black)' }}
          />
        </div>
      )}
    </div>
  )
}