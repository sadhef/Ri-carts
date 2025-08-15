'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { User, Package, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

const sidebarItems = [
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: Package
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(pathname))
    }
  }, [status, router, pathname])

  if (status === 'loading') {
    return (
      <div className="mx-auto px-4 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-black/5 w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="h-64 bg-black/5"></div>
            <div className="lg:col-span-3 h-64 bg-black/5"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black tracking-tight">My Account</h1>
        <p className="text-black/60 mt-1">Welcome back, {session.user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-black/10 p-6 bg-white">
            <div className="flex items-center mb-6">
              <User className="mr-3 h-5 w-5 text-black" />
              <h2 className="font-semibold text-black text-sm tracking-wide uppercase">Account Menu</h2>
            </div>
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={isActive 
                        ? "w-full justify-start bg-black text-white hover:bg-black/90" 
                        : "w-full justify-start text-black hover:bg-black hover:text-white"
                      }
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                )
              })}
              
              <div className="pt-4 border-t border-black/10">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-black/60 hover:text-black hover:bg-black/5"
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
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}