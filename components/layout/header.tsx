'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, User, LogOut, X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, signIn, signOut } from 'next-auth/react'
import { CartBadge } from '@/components/layout/cart-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/products')
  }

  return (
    <header className='border-b sticky top-0 z-50' style={{ borderColor: 'var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
      <div className='rr-container'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo */}
          <Link
            href='/'
            className='rr-heading-sm tracking-[-0.02em] hover:opacity-70 transition-opacity duration-300'
            style={{ color: 'var(--rr-pure-black)' }}
          >
            RI-CART
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center space-x-12'>
            <Link
              href='/products'
              className='rr-mega-menu-item hover:opacity-100'
              style={{ color: 'var(--rr-dark-text)' }}
            >
              SHOP
            </Link>
            <Link
              href='/products?sort=newest'
              className='rr-mega-menu-item hover:opacity-100'
              style={{ color: 'var(--rr-dark-text)' }}
            >
              NEW IN
            </Link>
            <Link
              href='/products?sort=trending'
              className='rr-mega-menu-item hover:opacity-100'
              style={{ color: 'var(--rr-dark-text)' }}
            >
              TRENDING
            </Link>
          </nav>

          {/* Desktop Search */}
          <div className='hidden lg:block flex-1 max-w-sm mx-12'>
            <form onSubmit={handleSearch} className='relative'>
              <Input
                type='search'
                placeholder='Search...'
                className='w-full pl-10 pr-10 border-0 border-b focus:ring-0 bg-transparent rounded-none pb-2 rr-body-sm'
                style={{ 
                  borderColor: 'var(--rr-light-gray)', 
                  color: 'var(--rr-dark-text)',
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = 'var(--rr-pure-black)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--rr-light-gray)'}
              />
              <Search className='absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4' style={{ color: 'var(--rr-medium-gray)' }} />
              {searchQuery && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-black/5 rounded-full'
                  onClick={clearSearch}
                >
                  <X className='h-3 w-3 text-black/40' />
                </Button>
              )}
            </form>
          </div>

          {/* Mobile Search */}
          <div className='lg:hidden flex-1 max-w-xs mx-4'>
            <form onSubmit={handleSearch} className='relative'>
              <Input
                type='search'
                placeholder='Search...'
                className='w-full pl-8 pr-8 border-0 border-b border-black/10 focus:border-black focus:ring-0 bg-transparent rounded-none pb-1 rr-body-sm'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className='absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40' />
            </form>
          </div>

          {/* Right Navigation */}
          <div className='flex items-center space-x-6'>
            <CartBadge />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='text-black hover:bg-black/5 p-2'>
                    <User className='h-5 w-5' />
                    <span className='hidden md:inline-block ml-3 rr-body-sm font-normal'>
                      {session.user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-64 bg-white border-black/5 shadow-lg rounded-sm'>
                  <div className='px-4 py-3 border-b border-black/5'>
                    <p className='rr-body-sm font-medium text-black'>{session.user.name}</p>
                    <p className='rr-body-sm text-black/60 mt-1'>{session.user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/orders' className='cursor-pointer text-black hover:bg-black/5 px-4 py-3 rr-body-sm'>
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/profile' className='cursor-pointer text-black hover:bg-black/5 px-4 py-3 rr-body-sm'>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator className='bg-black/5' />
                      <DropdownMenuItem asChild>
                        <Link href='/admin' className='cursor-pointer text-black hover:bg-black/5 px-4 py-3 rr-body-sm'>
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className='bg-black/5' />
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await signOut({ 
                          callbackUrl: '/',
                          redirect: true 
                        })
                      } catch (error) {
                        console.error('Sign out error:', error)
                      }
                    }}
                    className='text-black cursor-pointer hover:bg-black/5 px-4 py-3 rr-body-sm'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => signIn()} 
                className='rr-button-primary'
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
