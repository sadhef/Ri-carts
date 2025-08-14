'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setIsSubscribing(true)
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (response.ok) {
        toast.success('Successfully subscribed to our newsletter!')
        setEmail('')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className='border-t border-black/5 bg-white'>
      <div className='rr-container rr-section-spacing'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16'>
          {/* Shop */}
          <div>
            <h3 className='rr-label text-black mb-8'>SHOP</h3>
            <ul className='space-y-4'>
              <li>
                <Link
                  href='/products'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href='/products?sort=newest'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href='/products?sort=trending'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='rr-label text-black mb-8'>SUPPORT</h3>
            <ul className='space-y-4'>
              <li>
                <Link
                  href='/dashboard/orders'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  Order Status
                </Link>
              </li>
              <li>
                <Link
                  href='/dashboard/profile'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href='/'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className='rr-label text-black mb-8'>COMPANY</h3>
            <ul className='space-y-4'>
              <li>
                <Link
                  href='/'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href='/'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href='/'
                  className='rr-body text-black/60 hover:text-black transition-colors duration-300'
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className='sm:col-span-2 lg:col-span-1'>
            <h3 className='rr-label text-black mb-8'>NEWSLETTER</h3>
            <p className='rr-body text-black/60 mb-6 leading-relaxed'>
              Subscribe to get updates on new collections and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className='space-y-4'>
              <div className='flex flex-col gap-3'>
                <input
                  type='email'
                  placeholder='Enter your email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  className='w-full px-0 py-3 border-0 border-b border-black/20 rr-body focus:outline-none focus:border-black disabled:opacity-50 bg-transparent'
                />
                <button 
                  type='submit' 
                  disabled={isSubscribing}
                  className='bg-black text-white px-6 py-3 rr-label hover:bg-black/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed self-start rounded-sm'
                >
                  {isSubscribing ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className='mt-20 pt-12 border-t border-black/5'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <p className='rr-body-sm text-black/60'>
              © {new Date().getFullYear()} RI-CART. All rights reserved.
            </p>
            <div className='flex space-x-8'>
              <Link href='/' className='rr-body-sm text-black/60 hover:text-black transition-colors duration-300'>
                Privacy Policy
              </Link>
              <Link href='/' className='rr-body-sm text-black/60 hover:text-black transition-colors duration-300'>
                Terms of Service
              </Link>
              <Link href='/' className='rr-body-sm text-black/60 hover:text-black transition-colors duration-300'>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
