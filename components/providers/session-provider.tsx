'use client'

import { Session } from 'next-auth'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  useEffect(() => {
    // Handle any unhandled authentication errors
    const handleAuthError = (event: Event) => {
      console.error('NextAuth Error:', event)
    }
    
    window.addEventListener('error', handleAuthError)
    
    return () => {
      window.removeEventListener('error', handleAuthError)
    }
  }, [])

  return (
    <NextAuthSessionProvider 
      session={session}
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
