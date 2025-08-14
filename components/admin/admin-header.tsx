'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Bell, Search, User, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface AdminHeaderProps {
  onMenuClick?: () => void
  userSession?: any
}

export function AdminHeader({ onMenuClick, userSession }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSignOut = async () => {
    try {
      toast.loading('Signing out...', { id: 'signout' })
      
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
      
      toast.success('Signed out successfully', { id: 'signout' })
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out', { id: 'signout' })
    }
  }

  return (
    <header className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6" style={{ borderBottom: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
      <div className="flex items-center space-x-2 md:space-x-4 flex-1">
        {/* Search - Hidden on small screens, shown on medium+ */}
        <div className="hidden md:block relative w-full max-w-sm lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--rr-medium-gray)' }} />
          <Input
            placeholder="Search products, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-0 border-b focus:ring-0 bg-transparent rounded-none pb-2 rr-body-sm"
            style={{ 
              borderColor: 'var(--rr-light-gray)', 
              color: 'var(--rr-dark-text)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--rr-pure-black)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--rr-light-gray)'}
          />
        </div>
        
        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:opacity-70 transition-opacity"
          style={{ color: 'var(--rr-pure-black)' }}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative hover:opacity-70 transition-opacity" style={{ color: 'var(--rr-pure-black)' }}>
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-4 w-4 md:h-5 md:w-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: 'var(--rr-pure-black)', color: 'var(--rr-light-bg)' }}>
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--rr-light-gray)' }}>
              <h4 className="rr-body-sm font-medium" style={{ color: 'var(--rr-pure-black)' }}>Notifications</h4>
              <Button variant="ghost" size="sm" className="rr-body-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--rr-pure-black)' }}>
                Mark all as read
              </Button>
            </div>
            <div className="p-3">
              <p className="rr-body-sm" style={{ color: 'var(--rr-dark-text)' }}>No new notifications</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--rr-pure-black)' }}>
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarImage src={userSession?.user?.image || ''} />
                <AvatarFallback className="text-xs md:text-sm" style={{ backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-pure-black)' }}>
                  {userSession?.user?.name?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block rr-body-sm font-medium truncate max-w-20 md:max-w-none">
                {userSession?.user?.name || 'Admin'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <div className="flex flex-col space-y-1 p-3" style={{ borderBottom: '1px solid var(--rr-light-gray)' }}>
              <p className="rr-body-sm font-medium" style={{ color: 'var(--rr-pure-black)' }}>{userSession?.user?.name || 'Admin'}</p>
              <p className="rr-body-sm" style={{ color: 'var(--rr-dark-text)' }}>{userSession?.user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer rr-body-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--rr-pure-black)' }}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <div style={{ borderTop: '1px solid var(--rr-light-gray)' }} />
            <DropdownMenuItem 
              className="cursor-pointer rr-body-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--rr-dark-text)' }}
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}