'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Display */}
        <div className="space-y-4">
          <div className="text-6xl font-bold text-black/20">404</div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Page Not Found
          </h1>
          <p className="text-black/60">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full bg-black text-white hover:bg-black/90">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full border-black/20 text-black hover:bg-black hover:text-white">
            <Link href="/products">
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </Button>

          <Button variant="ghost" onClick={() => window.history.back()} className="w-full text-black hover:bg-black/5">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Links */}
        <div className="border-t border-black/10 pt-6">
          <p className="text-xs text-black/60 mb-2">
            Popular pages
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/products" className="text-black hover:underline p-2 rounded hover:bg-black/5">
              Products
            </Link>
            <Link href="/cart" className="text-black hover:underline p-2 rounded hover:bg-black/5">
              Cart
            </Link>
            <Link href="/dashboard" className="text-black hover:underline p-2 rounded hover:bg-black/5">
              Account
            </Link>
            <Link href="/contact" className="text-black hover:underline p-2 rounded hover:bg-black/5">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}