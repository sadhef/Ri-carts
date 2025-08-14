import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get user details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          // Get customer details
          const customer = await User.findById(order.userId).lean()
          
          // Use embedded order items (no need to fetch OrderItem collection)
          const itemsFormatted = (order.items || []).map((item: any) => ({
            id: item._id || Math.random().toString(),
            productName: item.name || 'Unknown Product',
            quantity: item.quantity || 0,
            price: item.price || 0
          }))
          
          return {
            id: order._id.toString(),
            userId: order.userId,
            email: customer?.email || order.shippingAddress?.email || 'Unknown',
            status: order.status,
            total: order.totalAmount || 0,
            items: itemsFormatted,
            createdAt: order.createdAt?.toISOString(),
            customerName: customer?.name || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
            trackingNumber: order.trackingNumber,
            paymentMethod: order.paymentMethod?.type || 'card'
          }
        } catch (error) {
          console.error('Error processing order:', order._id, error)
          return {
            id: order._id.toString(),
            userId: order.userId,
            email: 'Error loading',
            status: order.status,
            total: 0,
            items: [],
            createdAt: order.createdAt?.toISOString(),
            trackingNumber: order.trackingNumber,
            paymentMethod: 'card'
          }
        }
      })
    )

    return NextResponse.json(ordersWithDetails)
  } catch (error) {
    console.error('Admin orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}