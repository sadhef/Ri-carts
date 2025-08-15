import { MetricsCards } from '@/components/admin/metrics-cards'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { OrderStats } from '@/components/admin/order-stats'
import { getOrderStats, getRevenueData, getRecentOrders } from '@/lib/analytics'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Fetch analytics data
  const [orderStatsData, revenueData, recentOrders] = await Promise.all([
    getOrderStats(),
    getRevenueData(),
    getRecentOrders()
  ])
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
      <MetricsCards />

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-7">
        {/* Revenue Chart */}
        <div className="lg:col-span-4 p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
          <h2 className="rr-label mb-6" style={{ color: 'var(--rr-dark-text)' }}>Revenue</h2>
          <RevenueChart data={revenueData} />
        </div>

        {/* Order Status Chart */}
        <div className="lg:col-span-3 p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
          <h2 className="rr-label mb-6" style={{ color: 'var(--rr-dark-text)' }}>Order Status</h2>
          <OrderStats data={orderStatsData} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-8" style={{ border: '1px solid var(--rr-light-gray)', backgroundColor: 'var(--rr-light-bg)' }}>
        <h2 className="rr-label mb-6" style={{ color: 'var(--rr-dark-text)' }}>Recent Orders</h2>
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  )
}