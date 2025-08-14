import connectToDatabase from '@/lib/mongodb'
import { Order, User, OrderStatus } from '@/lib/models'
import { startOfDay, subDays, format } from 'date-fns'
import { serializeDocument } from '@/lib/serialize'

export async function getRevenueData(days: number = 30) {
  await connectToDatabase()
  
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, days)

  const orders = await Order.find({
    status: OrderStatus.DELIVERED,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .select('totalAmount createdAt')
    .sort({ createdAt: 1 })
    .lean()

  // Group orders by date and calculate daily revenue
  const dailyRevenue = orders.reduce((acc, order) => {
    const date = format(order.createdAt, 'MMM d')
    acc[date] = (acc[date] || 0) + (order.totalAmount || 0)
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for Recharts
  const data = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }))

  return data
}

export async function getOrderStats() {
  await connectToDatabase()
  
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  const orderStats = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  return orderStats.map((stat) => ({
    name: stat._id,
    value: stat.count,
  }))
}

export async function getRecentOrders(limit: number = 5) {
  await connectToDatabase()
  
  try {
    // First check if we have any orders
    const orderCount = await Order.countDocuments()
    
    if (orderCount === 0) {
      return []
    }

    const orders = await Order.find()
      .select('totalAmount status createdAt userId orderNumber shippingAddress')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Get user names for each order
    const ordersWithUser = await Promise.all(
      orders.map(async (order) => {
        try {
          const user = await User.findById(order.userId).select('name email').lean()
          
          // Get customer name from user or shipping address
          let customerName = 'Guest User'
          if (user?.name) {
            customerName = user.name
          } else if (order.shippingAddress?.firstName && order.shippingAddress?.lastName) {
            customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
          }
          
          return {
            id: order._id.toString(),
            total: Number(order.totalAmount) || 0,
            status: order.status || 'PENDING',
            createdAt: order.createdAt,
            orderNumber: order.orderNumber,
            user: {
              name: customerName,
            },
          }
        } catch (error) {
          console.error('Error fetching user for order:', order._id, error)
          return {
            id: order._id.toString(),
            total: Number(order.totalAmount) || 0,
            status: order.status || 'PENDING',
            createdAt: order.createdAt,
            orderNumber: order.orderNumber,
            user: {
              name: order.shippingAddress?.firstName && order.shippingAddress?.lastName 
                ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                : 'Guest User',
            },
          }
        }
      })
    )

    // Serialize the data to ensure proper client-side handling
    return serializeDocument(ordersWithUser)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}
