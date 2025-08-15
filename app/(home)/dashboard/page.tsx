'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { Package, User, MapPin, ShoppingBag, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GET_DASHBOARD_STATS } from '@/lib/graphql/queries'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalSpent: number
  recentOrders: any[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  
  // GraphQL query
  const { data: statsData, loading } = useQuery(GET_DASHBOARD_STATS, {
    variables: { userId: session?.user?.id },
    skip: !session?.user?.id
  })
  
  const stats = statsData?.dashboardStats || {
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    recentOrders: []
  }

  // Data fetching is now handled by Apollo Client useQuery hook

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-black/5 w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-black/5"></div>
            ))}
          </div>
          <div className="h-64 bg-black/5"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-black tracking-tight">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-black/60">Here's an overview of your account activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-black/10 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-black">Total Orders</h3>
            <Package className="h-4 w-4 text-black/60" />
          </div>
          <div className="text-2xl font-bold text-black">{stats.totalOrders}</div>
          <p className="text-xs text-black/60 mt-1">
            All time orders
          </p>
        </div>

        <div className="border border-black/10 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-black">Pending Orders</h3>
            <ShoppingBag className="h-4 w-4 text-black/60" />
          </div>
          <div className="text-2xl font-bold text-black">{stats.pendingOrders}</div>
          <p className="text-xs text-black/60 mt-1">
            Awaiting processing
          </p>
        </div>

        <div className="border border-black/10 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-black">Total Spent</h3>
            <TrendingUp className="h-4 w-4 text-black/60" />
          </div>
          <div className="text-2xl font-bold text-black">${stats.totalSpent.toFixed(2)}</div>
          <p className="text-xs text-black/60 mt-1">
            Lifetime spending
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="border border-black/10 p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-black text-sm tracking-wide uppercase">Recent Orders</h2>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm" className="border-black/20 text-black hover:bg-black hover:text-white">View All</Button>
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <Package className="mx-auto h-8 w-8 text-black/40" />
              <p className="mt-2 text-sm text-black/60">No orders yet</p>
              <Link href="/products">
                <Button className="mt-3 bg-black text-white hover:bg-black/90" size="sm">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between pb-4 border-b border-black/10 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-black">{order.orderNumber}</p>
                    <p className="text-xs text-black/60">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-black/10 text-xs font-medium text-black rounded">
                      {order.status}
                    </span>
                    <span className="font-semibold text-sm text-black">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border border-black/10 p-6 bg-white">
          <h2 className="font-semibold text-black mb-6 text-sm tracking-wide uppercase">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full justify-start border-black/20 text-black hover:bg-black hover:text-white">
                <Package className="mr-2 h-4 w-4" />
                View All Orders
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full justify-start border-black/20 text-black hover:bg-black hover:text-white">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
            <Link href="/dashboard/addresses">
              <Button variant="outline" className="w-full justify-start border-black/20 text-black hover:bg-black hover:text-white">
                <MapPin className="mr-2 h-4 w-4" />
                Manage Addresses
              </Button>
            </Link>
            <Link href="/products">
              <Button className="w-full justify-start bg-black text-white hover:bg-black/90">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}