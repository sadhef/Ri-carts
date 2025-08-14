'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-black tracking-tight">
                Something went wrong!
              </h1>
              
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm text-red-700">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
                {error.digest && (
                  <p className="text-xs text-red-500 mt-2 font-mono">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              <p className="text-black/60 text-sm">
                If the problem continues, please contact support.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={reset} className="w-full bg-black text-white hover:bg-black/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full border-black/20 text-black hover:bg-black hover:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="border-t border-black/10 pt-6">
              <p className="text-xs text-black/60 mb-2">
                Need assistance?
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <a href="/contact" className="text-black hover:underline">
                  Contact Support
                </a>
                <span className="text-black/40">•</span>
                <a href="/help" className="text-black hover:underline">
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}