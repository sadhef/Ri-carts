import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { NextRequest, NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const ratelimit = new Map()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')?.[0] ?? '127.0.0.1'
  return `${ip}:${request.nextUrl.pathname}`
}

function rateLimit(request: NextRequest, limit: number = 10, window: number = 60000): boolean {
  const key = getRateLimitKey(request)
  const now = Date.now()
  const windowStart = now - window

  if (!ratelimit.has(key)) {
    ratelimit.set(key, [])
  }

  const requests = ratelimit.get(key).filter((timestamp: number) => timestamp > windowStart)
  requests.push(now)
  ratelimit.set(key, requests)

  return requests.length <= limit
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  
  // Rate limiting for API routes
  if (nextUrl.pathname.startsWith('/api/')) {
    const limit = nextUrl.pathname.startsWith('/api/auth/') ? 5 : 30
    const window = 60000
    
    if (!rateLimit(req, limit, window)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      )
    }
  }
  
  // Admin route protection
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/admin', nextUrl))
    }
    
    if (req.auth?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }
  
  // Dashboard route protection
  if (nextUrl.pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/dashboard', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
