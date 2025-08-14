import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User, Role } from '@/lib/models'
import { serializeDocument } from '@/lib/serialize'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { orderId } = params

    // Find the order by ID
    const order = await Order.findById(orderId).lean()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get user information
    let user = null
    if (order.userId) {
      user = await User.findById(order.userId).select('name email').lean()
    }

    // Prepare order data with user info
    const orderWithUser = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost || 0,
      taxAmount: order.taxAmount || 0,
      items: order.items || [],
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      user: user ? {
        name: user.name,
        email: user.email
      } : null
    }

    // Serialize the data
    const serializedOrder = serializeDocument(orderWithUser)

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}