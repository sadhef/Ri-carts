import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { MetricsCards } from '@/components/admin/metrics-cards'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { OrderStats } from '@/components/admin/order-stats'
import { getOrderStats, getRevenueData, getRecentOrders } from '@/lib/analytics'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

async function DashboardContent() {
  let orderStatsData = []
  let revenueData = []
  let recentOrders = []

  try {
    // Fetch analytics data with individual error handling
    const results = await Promise.allSettled([
      getOrderStats(),
      getRevenueData(),
      getRecentOrders()
    ])

    orderStatsData = results[0].status === 'fulfilled' ? results[0].value : []
    revenueData = results[1].status === 'fulfilled' ? results[1].value : []
    recentOrders = results[2].status === 'fulfilled' ? results[2].value : []
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
  }

  return (
    <>
      {/* Metrics Cards */}
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <MetricsCards />
      </Suspense>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              {revenueData && revenueData.length > 0 ? (
                <RevenueChart data={revenueData} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No revenue data available</p>
                    <p className="text-sm">Start making sales to see revenue trends</p>
                  </div>
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              {orderStatsData && orderStatsData.length > 0 ? (
                <OrderStats data={orderStatsData} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No order data available</p>
                    <p className="text-sm">Orders will appear here</p>
                  </div>
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            {recentOrders && recentOrders.length > 0 ? (
              <RecentOrders orders={recentOrders} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent orders found</p>
                <p className="text-sm">New orders will appear here</p>
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
      </div>

      {/* Dashboard Content with Real Data */}
      <Suspense fallback={
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      }>
        <DashboardContent />
      </Suspense>

      {/* Getting Started Section */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Add Products</h3>
              <p className="text-sm text-muted-foreground mb-3">Start by adding products to your store</p>
              <a href="/admin/products" className="text-sm text-blue-600 hover:underline">Go to Products →</a>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Manage Categories</h3>
              <p className="text-sm text-muted-foreground mb-3">Organize your products with categories</p>
              <a href="/admin/categories" className="text-sm text-blue-600 hover:underline">Go to Categories →</a>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Store Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">Configure your store settings</p>
              <a href="/admin/settings" className="text-sm text-blue-600 hover:underline">Go to Settings →</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}