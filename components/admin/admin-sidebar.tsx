'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Tag,
  Truck,
  Star,
  Gift,
  FileText,
  Mail,
  Menu,
  X,
  CreditCard,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

const sidebarItems = [
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tag,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    title: 'Coupons',
    href: '/admin/coupons',
    icon: Gift,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Newsletter',
    href: '/admin/newsletter',
    icon: Mail,
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Shipping',
    href: '/admin/shipping',
    icon: Truck,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center h-16" style={{ borderBottom: '1px solid var(--rr-light-gray)' }}>
        <h2 className="rr-heading-sm" style={{ color: 'var(--rr-pure-black)' }}>ADMIN PANEL</h2>
      </div>
      
      <nav className="flex-1 space-y-2 p-6 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-4 px-4 py-3 rr-body-sm font-medium transition-all duration-300 hover:rr-card-hover',
                isActive
                  ? 'text-white'
                  : 'hover:opacity-70'
              )}
              style={{
                backgroundColor: isActive ? 'var(--rr-pure-black)' : 'transparent',
                color: isActive ? 'var(--rr-light-bg)' : 'var(--rr-dark-text)'
              }}
            >
              <item.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="truncate rr-label">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col" style={{ backgroundColor: 'var(--rr-light-bg)', borderRight: '1px solid var(--rr-light-gray)' }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 shadow-md"
            style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)', color: 'var(--rr-pure-black)' }}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0" style={{ backgroundColor: 'var(--rr-light-bg)' }}>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}