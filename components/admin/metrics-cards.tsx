import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User, OrderStatus, Role } from '@/lib/models'
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react'

async function getMetrics() {
  try {
    await connectToDatabase()
    const session = await auth()

    if (!session || session.user.role !== Role.ADMIN) {
      throw new Error('Unauthorized')
    }

    // Get current date and date for last month
    const now = new Date()
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: OrderStatus.DELIVERED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
    const totalRevenue = revenueResult[0]?.total || 0

    // Get last month revenue
    const lastMonthRevenueResult = await Order.aggregate([
      { 
        $match: { 
          status: OrderStatus.DELIVERED,
          createdAt: { $gte: lastMonth, $lte: now }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0

    // Get total orders and new orders
    const [totalOrders, newOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: lastHour } })
    ])

    // Get total customers and new customers
    const [totalCustomers, newCustomers] = await Promise.all([
      User.countDocuments({ role: Role.USER }),
      User.countDocuments({ 
        role: Role.USER, 
        createdAt: { $gte: lastMonth } 
      })
    ])

    // Calculate average order value
    const aovResult = await Order.aggregate([
      { $match: { status: OrderStatus.DELIVERED } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ])
    const currentAOV = aovResult[0]?.avg || 0

    const lastWeekAOVResult = await Order.aggregate([
      { 
        $match: { 
          status: OrderStatus.DELIVERED,
          createdAt: { $gte: lastWeek, $lte: now }
        } 
      },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ])
    const lastWeekAOV = lastWeekAOVResult[0]?.avg || 0

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    const customerChange = totalCustomers > newCustomers 
      ? ((newCustomers) / (totalCustomers - newCustomers)) * 100 
      : 0

    const aovChange = lastWeekAOV > 0 
      ? ((currentAOV - lastWeekAOV) / lastWeekAOV) * 100 
      : 0

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      newOrders,
      totalCustomers,
      customerChange,
      averageOrderValue: currentAOV,
      aovChange,
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return {
      totalRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      newOrders: 0,
      totalCustomers: 0,
      customerChange: 0,
      averageOrderValue: 0,
      aovChange: 0,
    }
  }
}

export async function MetricsCards() {
  let metrics
  
  try {
    metrics = await getMetrics()
  } catch (error) {
    console.error('MetricsCards error:', error)
    // Return default metrics if there's an error
    metrics = {
      totalRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      newOrders: 0,
      totalCustomers: 0,
      customerChange: 0,
      averageOrderValue: 0,
      aovChange: 0,
    }
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load metrics</p>
        <p className="text-sm text-gray-500 mt-2">Please check your database connection</p>
      </div>
    )
  }

  return (
    <div className='grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
      <Suspense fallback={<MetricCardSkeleton />}>
        <Card className="border-0 rr-card-hover" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--rr-pure-black)' }}>
              <DollarSign className="h-4 w-4" style={{ color: 'var(--rr-light-bg)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='rr-heading-md mb-1' style={{ color: 'var(--rr-pure-black)' }}>
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center space-x-1">
              {metrics.revenueChange > 0 ? (
                <TrendingUp className="h-3 w-3" style={{ color: 'var(--rr-pure-black)' }} />
              ) : (
                <TrendingDown className="h-3 w-3" style={{ color: 'var(--rr-dark-text)' }} />
              )}
              <span className={`rr-body-sm font-medium`} style={{ color: metrics.revenueChange > 0 ? 'var(--rr-pure-black)' : 'var(--rr-dark-text)' }}>
                {metrics.revenueChange > 0 ? '+' : ''}{metrics.revenueChange.toFixed(1)}%
              </span>
              <span className="rr-body-sm" style={{ color: 'var(--rr-medium-gray)' }}>from last month</span>
            </div>
          </CardContent>
        </Card>
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <Card className="border-0 rr-card-hover" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>Total Orders</CardTitle>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--rr-pure-black)' }}>
              <ShoppingCart className="h-4 w-4" style={{ color: 'var(--rr-light-bg)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='rr-heading-md mb-1' style={{ color: 'var(--rr-pure-black)' }}>
              {metrics.totalOrders.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="rr-body-sm" style={{ backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-pure-black)' }}>
                +{metrics.newOrders} new
              </Badge>
              <span className="rr-body-sm" style={{ color: 'var(--rr-medium-gray)' }}>since last hour</span>
            </div>
          </CardContent>
        </Card>
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <Card className="border-0 rr-card-hover" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>
              Total Customers
            </CardTitle>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--rr-pure-black)' }}>
              <Users className="h-4 w-4" style={{ color: 'var(--rr-light-bg)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='rr-heading-md mb-1' style={{ color: 'var(--rr-pure-black)' }}>
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1">
              {metrics.customerChange > 0 ? (
                <TrendingUp className="h-3 w-3" style={{ color: 'var(--rr-pure-black)' }} />
              ) : (
                <TrendingDown className="h-3 w-3" style={{ color: 'var(--rr-dark-text)' }} />
              )}
              <span className={`rr-body-sm font-medium`} style={{ color: metrics.customerChange > 0 ? 'var(--rr-pure-black)' : 'var(--rr-dark-text)' }}>
                {metrics.customerChange > 0 ? '+' : ''}{metrics.customerChange.toFixed(1)}%
              </span>
              <span className="rr-body-sm" style={{ color: 'var(--rr-medium-gray)' }}>from last month</span>
            </div>
          </CardContent>
        </Card>
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <Card className="border-0 rr-card-hover" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>
              Average Order Value
            </CardTitle>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--rr-pure-black)' }}>
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--rr-light-bg)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='rr-heading-md mb-1' style={{ color: 'var(--rr-pure-black)' }}>
              {formatCurrency(metrics.averageOrderValue)}
            </div>
            <div className="flex items-center space-x-1">
              {metrics.aovChange > 0 ? (
                <TrendingUp className="h-3 w-3" style={{ color: 'var(--rr-pure-black)' }} />
              ) : (
                <TrendingDown className="h-3 w-3" style={{ color: 'var(--rr-dark-text)' }} />
              )}
              <span className={`rr-body-sm font-medium`} style={{ color: metrics.aovChange > 0 ? 'var(--rr-pure-black)' : 'var(--rr-dark-text)' }}>
                {metrics.aovChange > 0 ? '+' : ''}{metrics.aovChange.toFixed(1)}%
              </span>
              <span className="rr-body-sm" style={{ color: 'var(--rr-medium-gray)' }}>from last week</span>
            </div>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <Card className="border-0" style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Skeleton className='h-4 w-24' style={{ backgroundColor: 'var(--rr-light-gray)' }} />
        <Skeleton className='h-8 w-8 rounded-full' style={{ backgroundColor: 'var(--rr-light-gray)' }} />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-8 w-36 mb-2' style={{ backgroundColor: 'var(--rr-light-gray)' }} />
        <div className="flex items-center space-x-1">
          <Skeleton className='h-3 w-3' style={{ backgroundColor: 'var(--rr-light-gray)' }} />
          <Skeleton className='h-4 w-16' style={{ backgroundColor: 'var(--rr-light-gray)' }} />
          <Skeleton className='h-4 w-20' style={{ backgroundColor: 'var(--rr-light-gray)' }} />
        </div>
      </CardContent>
    </Card>
  )
}
