import { Suspense } from 'react'
import { MetricsCards } from '@/components/admin/metrics-cards'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { OrderStats } from '@/components/admin/order-stats'
import { getOrderStats, getRevenueData, getRecentOrders } from '@/lib/analytics'
import { Skeleton } from '@/components/ui/skeleton'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

// Fallback components for error states
function ErrorFallback({ title }: { title: string }) {
  return (
    <div className="p-8 text-center" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
      <p className="text-red-600">Failed to load {title}</p>
      <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default async function AdminDashboardPage() {
  // Fetch analytics data with error handling
  let orderStatsData, revenueData, recentOrders
  
  try {
    [orderStatsData, revenueData, recentOrders] = await Promise.all([
      getOrderStats().catch(() => []),
      getRevenueData().catch(() => []),
      getRecentOrders().catch(() => [])
    ])
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    orderStatsData = []
    revenueData = []
    recentOrders = []
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="rr-heading-lg" style={{ color: 'var(--rr-pure-black)' }}>Dashboard</h1>
          <p className="rr-body" style={{ color: 'var(--rr-dark-text)' }}>
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <Suspense fallback={<LoadingSkeleton />}>
        <MetricsCards />
      </Suspense>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-7">
        {/* Revenue Chart */}
        <div className="lg:col-span-4 p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
          <h2 className="rr-label mb-6" style={{ color: 'var(--rr-dark-text)' }}>Revenue</h2>
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            {revenueData && revenueData.length > 0 ? (
              <RevenueChart data={revenueData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </Suspense>
        </div>

        {/* Order Status Chart */}
        <div className="lg:col-span-3 p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
          <h2 className="rr-label mb-6" style={{ color: 'var(--rr-dark-text)' }}>Order Status</h2>
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            {orderStatsData && orderStatsData.length > 0 ? (
              <OrderStats data={orderStatsData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No order data available
              </div>
            )}
          </Suspense>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
        <h2 className="rr-label mb-6" style={{ color: 'var(--rr-dark-text)' }}>Recent Orders</h2>
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          {recentOrders && recentOrders.length > 0 ? (
            <RecentOrders orders={recentOrders} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent orders found
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}