import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, Order } from '@/lib/models'
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
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const query: any = {}
    if (role && role !== 'all') {
      query.role = role
    }

    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password') // Exclude password field
      .lean()

    // Get order stats for each user
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          // Get order count and total spent for this user
          const orderStats = await Order.aggregate([
            { $match: { userId: user._id.toString() } },
            {
              $group: {
                _id: null,
                orderCount: { $sum: 1 },
                totalSpent: { $sum: '$totalAmount' }
              }
            }
          ])

          const stats = orderStats[0] || { orderCount: 0, totalSpent: 0 }
          

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified?.toISOString(),
            createdAt: user.createdAt?.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
            orderCount: stats.orderCount,
            totalSpent: stats.totalSpent,
            status: user.status || 'active',
            tags: user.tags || []
          }
        } catch (error) {
          console.error('Error processing customer:', user._id, error)
          return {
            id: user._id.toString(),
            name: user.name || 'Guest User',
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified?.toISOString(),
            createdAt: user.createdAt?.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
            orderCount: 0,
            totalSpent: 0,
            status: user.status || 'active',
            tags: user.tags || []
          }
        }
      })
    )

    return NextResponse.json(customersWithStats)
  } catch (error) {
    console.error('Admin customers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}