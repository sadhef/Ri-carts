'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  CredentialsSignin: 'Invalid email or password. Please try again.',
  EmailCreateAccount: 'Could not create account with this email.',
  SessionRequired: 'Please sign in to access this page.',
  CallbackError: 'There was an error during the authentication callback.',
  OAuthSignin: 'Error occurred while signing in with OAuth provider.',
  OAuthCallback: 'Error in OAuth callback.',
  OAuthCreateAccount: 'Could not create account with OAuth provider.',
  EmailSignin: 'Check your email for a sign in link.',
  DatabaseError: 'Database connection error.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const error = searchParams.get('error') as keyof typeof errorMessages

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 bg-black/5 rounded-full mx-auto"></div>
          <div className="h-6 bg-black/5 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-black/5 rounded w-64 mx-auto"></div>
        </div>
      </div>
    )
  }

  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
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
            Authentication Error
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-2 font-mono">
                Error Code: {error}
              </p>
            )}
          </div>

          <p className="text-black/60 text-sm">
            If this problem persists, please contact support or try again later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full bg-black text-white hover:bg-black/90">
            <Link href="/auth/signin">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full border-black/20 text-black hover:bg-black hover:text-white">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Help Section */}
        <div className="border-t border-black/10 pt-6">
          <p className="text-xs text-black/60 mb-2">
            Need help?
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <Link href="/contact" className="text-black hover:underline">
              Contact Support
            </Link>
            <span className="text-black/40">•</span>
            <Link href="/help" className="text-black hover:underline">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}