import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, Order, Product, Category } from '@/lib/models'
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
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    let startDate = new Date()
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    try {
      // Get revenue data
      const revenueData = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ])

      const revenue = revenueData[0] || { total: 0, count: 0 }

      // Get previous period for comparison
      const prevStartDate = new Date(startDate)
      prevStartDate.setTime(prevStartDate.getTime() - (Date.now() - startDate.getTime()))
      
      const prevRevenueData = await Order.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: prevStartDate,
              $lt: startDate 
            } 
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ])

      const prevRevenue = prevRevenueData[0] || { total: 0, count: 0 }

      // Calculate revenue trend data from real orders
      const days = Math.ceil((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      const revenueChartData = []
      
      for (let i = 0; i < Math.min(days, 30); i++) {
        const dayStart = new Date(startDate)
        dayStart.setDate(dayStart.getDate() + i)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)
        
        const dayRevenue = await Order.aggregate([
          { 
            $match: { 
              createdAt: { $gte: dayStart, $lt: dayEnd } 
            } 
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' }
            }
          }
        ])
        
        revenueChartData.push({
          date: dayStart.toLocaleDateString(),
          revenue: dayRevenue[0]?.total || 0
        })
      }

      // Get customer data
      const customerCount = await User.countDocuments()
      const newCustomers = await User.countDocuments({ 
        createdAt: { $gte: startDate } 
      })
      
      const prevCustomers = await User.countDocuments({ 
        createdAt: { $gte: prevStartDate, $lt: startDate } 
      })

      // Get product data
      const productCount = await Product.countDocuments()
      
      // Get real top selling products from orders
      const topSellingProducts = await Order.aggregate([
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
      ])

      // Get real category data based on product counts
      const categoryData = await Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'products'
          }
        },
        {
          $project: {
            name: 1,
            value: { $size: '$products' }
          }
        },
        { $match: { value: { $gt: 0 } } }
      ])

      const analytics = {
        revenue: {
          total: revenue.total,
          change: prevRevenue.total > 0 
            ? ((revenue.total - prevRevenue.total) / prevRevenue.total * 100)
            : 100,
          trend: revenue.total >= prevRevenue.total ? 'up' : 'down',
          chartData: revenueChartData
        },
        orders: {
          total: revenue.count,
          change: prevRevenue.count > 0 
            ? ((revenue.count - prevRevenue.count) / prevRevenue.count * 100)
            : 100,
          trend: revenue.count >= prevRevenue.count ? 'up' : 'down',
          chartData: revenueChartData.map(item => ({
            date: item.date,
            orders: Math.floor(item.revenue / 50) // Estimate orders based on revenue
          }))
        },
        customers: {
          total: customerCount,
          change: prevCustomers > 0 
            ? ((newCustomers - prevCustomers) / prevCustomers * 100)
            : (newCustomers > 0 ? 100 : 0),
          trend: newCustomers >= prevCustomers ? 'up' : 'down',
          newCustomers: newCustomers
        },
        products: {
          total: productCount,
          topSelling: topSellingProducts,
          categories: categoryData
        },
        conversionRate: customerCount > 0 ? (revenue.count / customerCount * 100) : 0,
        averageOrderValue: revenue.count > 0 ? revenue.total / revenue.count : 0
      }

      return NextResponse.json(analytics)
    } catch (error) {
      console.error('Analytics aggregation error:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Admin analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}