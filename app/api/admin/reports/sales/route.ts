import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, Order, OrderItem, Product } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'ytd' // year-to-date by default

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
      case 'ytd':
      default:
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Get real sales data from database
    const [totalStats, topProducts, monthlyData] = await Promise.all([
      // Total revenue and orders
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ]),

      // Top selling products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $lookup: { from: 'orderitems', localField: '_id', foreignField: 'orderId', as: 'items' } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product._id',
            name: { $first: '$product.name' },
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ]),

      // Monthly sales data
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } }, // Full year for monthly breakdown
        {
          $group: {
            _id: { $month: '$createdAt' },
            sales: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ])

    const stats = totalStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
    
    // Format monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const salesByMonth = months.map((month, index) => {
      const data = monthlyData.find(d => d._id === index + 1)
      return {
        month,
        sales: data?.sales || 0,
        revenue: data?.revenue || 0
      }
    })

    const salesData = {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      averageOrderValue: stats.avgOrderValue,
      topProducts: topProducts,
      salesByMonth: salesByMonth
    }

    return NextResponse.json(salesData)
  } catch (error) {
    console.error('Admin sales report API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}