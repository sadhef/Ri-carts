import connectToDatabase from '@/lib/mongodb'
import { Order, User, Product, Review } from '@/lib/models'
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Eye, Star, AlertCircle, CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

async function getAdvancedStats() {
  try {
    await connectToDatabase()
    
    // Current month dates
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Basic counts
    const [userCount, orderCount, productCount, reviewCount] = await Promise.allSettled([
      User.countDocuments(),
      Order.countDocuments(), 
      Product.countDocuments(),
      Review.countDocuments()
    ])

    // Revenue calculations
    const [totalRevenueResult, currentMonthRevenueResult, lastMonthRevenueResult] = await Promise.allSettled([
      Order.aggregate([
        { $match: { status: 'DELIVERED' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { status: 'DELIVERED', createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { status: 'DELIVERED', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ])

    // Order status counts
    const [pendingOrders, processingOrders, deliveredOrders] = await Promise.allSettled([
      Order.countDocuments({ status: 'PENDING' }),
      Order.countDocuments({ status: 'PROCESSING' }),
      Order.countDocuments({ status: 'DELIVERED' })
    ])

    // Monthly growth calculations
    const currentMonthUsers = await User.countDocuments({ createdAt: { $gte: currentMonthStart } })
    const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } })
    
    const currentMonthOrders = await Order.countDocuments({ createdAt: { $gte: currentMonthStart } })
    const lastMonthOrders = await Order.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } })

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenueResult.status === 'fulfilled' && lastMonthRevenueResult.value[0]?.total > 0 
      ? ((currentMonthRevenueResult.status === 'fulfilled' ? currentMonthRevenueResult.value[0]?.total || 0 : 0) - lastMonthRevenueResult.value[0].total) / lastMonthRevenueResult.value[0].total * 100
      : 0

    const userGrowth = lastMonthUsers > 0 ? (currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100 : 0
    const orderGrowth = lastMonthOrders > 0 ? (currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100 : 0

    // Low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } })

    // Recent orders for activity feed
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .lean()

    return {
      users: {
        total: userCount.status === 'fulfilled' ? userCount.value : 0,
        growth: userGrowth,
        current: currentMonthUsers
      },
      orders: {
        total: orderCount.status === 'fulfilled' ? orderCount.value : 0,
        growth: orderGrowth,
        current: currentMonthOrders,
        pending: pendingOrders.status === 'fulfilled' ? pendingOrders.value : 0,
        processing: processingOrders.status === 'fulfilled' ? processingOrders.value : 0,
        delivered: deliveredOrders.status === 'fulfilled' ? deliveredOrders.value : 0
      },
      products: {
        total: productCount.status === 'fulfilled' ? productCount.value : 0,
        lowStock: lowStockProducts
      },
      revenue: {
        total: totalRevenueResult.status === 'fulfilled' ? totalRevenueResult.value[0]?.total || 0 : 0,
        growth: revenueGrowth,
        current: currentMonthRevenueResult.status === 'fulfilled' ? currentMonthRevenueResult.value[0]?.total || 0 : 0
      },
      reviews: {
        total: reviewCount.status === 'fulfilled' ? reviewCount.value : 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        customerName: order.userId?.name || 'Guest',
        createdAt: order.createdAt
      })),
      status: 'connected'
    }
  } catch (error) {
    return {
      users: { total: 0, growth: 0, current: 0 },
      orders: { total: 0, growth: 0, current: 0, pending: 0, processing: 0, delivered: 0 },
      products: { total: 0, lowStock: 0 },
      revenue: { total: 0, growth: 0, current: 0 },
      reviews: { total: 0 },
      recentOrders: [],
      status: 'error',
      error: error.message
    }
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdvancedStats()

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your store's performance and manage operations</p>
      </div>


      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{stats.revenue.total.toLocaleString('en-IN')}</div>
            <div className="flex items-center gap-1 text-sm">
              {stats.revenue.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.revenue.growth.toFixed(1)}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This month: ₹{stats.revenue.current.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.orders.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm">
              {stats.orders.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={stats.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.orders.growth.toFixed(1)}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This month: {stats.orders.current} orders
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.users.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm">
              {stats.users.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={stats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.users.growth.toFixed(1)}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              New this month: {stats.users.current}
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.products.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm">
              {stats.products.lowStock > 0 && (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <span className="text-gray-500">In catalog</span>
            </div>
            {stats.products.lowStock > 0 && (
              <div className="text-xs text-orange-600 mt-1">
                {stats.products.lowStock} low stock items
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {stats.orders.pending}
                </Badge>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processing</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.orders.processing}
                </Badge>
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivered</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.orders.delivered}
                </Badge>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Reviews</span>
              <Badge variant="outline" className="bg-gray-50">
                {stats.reviews.total}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock Items</span>
              <Badge variant="outline" className={stats.products.lowStock > 0 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-gray-50"}>
                {stats.products.lowStock}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <Badge variant="outline" className="bg-gray-50">
                ₹{stats.orders.total > 0 ? Math.round(stats.revenue.total / stats.orders.total).toLocaleString('en-IN') : '0'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products" className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Products</p>
                <p className="text-xs text-blue-600">Manage inventory</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-blue-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link href="/admin/orders" className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Orders</p>
                <p className="text-xs text-green-600">Process orders</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link href="/admin/customers" className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Customers</p>
                <p className="text-xs text-purple-600">User management</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link href="/admin/analytics" className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Analytics</p>
                <p className="text-xs text-orange-600">View insights</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-orange-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}