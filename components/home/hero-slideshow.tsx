'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface Slide {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  featured?: boolean
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Summer Collection',
    subtitle: 'New Arrivals 2024',
    description: 'Discover our latest collection of premium products designed for modern living.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop&crop=center',
    buttonText: 'Shop Collection',
    buttonLink: '/products',
    featured: true
  },
  {
    id: '2',
    title: 'Premium Quality',
    subtitle: 'Handcrafted Excellence',
    description: 'Experience the finest materials and craftsmanship in every product we offer.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop&crop=center',
    buttonText: 'Explore Quality',
    buttonLink: '/products',
  },
  {
    id: '3',
    title: 'Limited Edition',
    subtitle: 'Exclusive Deals',
    description: 'Get exclusive access to limited-time offers and special edition products.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&crop=center',
    buttonText: 'Shop Deals',
    buttonLink: '/products',
  },
  {
    id: '4',
    title: 'Free Shipping',
    subtitle: 'On Orders Over $50',
    description: 'Enjoy complimentary shipping on all orders above $50. Fast and reliable delivery.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=600&fit=crop&crop=center',
    buttonText: 'Start Shopping',
    buttonLink: '/products',
  }
]

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const current = slides[currentSlide]

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-black/5">
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="mx-auto px-4 lg:px-8 w-full">
          <div className="max-w-4xl">
            <div className="text-white space-y-6">
              {current.featured && (
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-sm font-medium">Featured</span>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-lg opacity-90">{current.subtitle}</p>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  {current.title}
                </h1>
              </div>
              
              <p className="text-lg opacity-90 max-w-2xl leading-relaxed">
                {current.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="bg-white text-black hover:bg-white/90 px-8 py-3 text-base">
                  <Link href={current.buttonLink}>
                    {current.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-base"
                >
                  <Link href="/products">
                    Browse All
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play pause indicator */}
      {!isAutoPlaying && (
        <div className="absolute top-4 right-4">
          <div className="bg-white/10 backdrop-blur-sm rounded px-3 py-1 text-white text-sm">
            Auto-play paused
          </div>
        </div>
      )}
    </section>
  )
}