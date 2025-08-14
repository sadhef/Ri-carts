import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order } from '@/lib/models'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { orderId } = await params
    const order = await Order.findById(orderId).populate('userId', 'name email').lean()
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user can access this order
    if (session.user.role !== 'ADMIN' && order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      savings: order.savings,
      createdAt: order.createdAt,
      items: order.items || [],
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      orderNotes: order.orderNotes,
      trackingNumber: order.trackingNumber,
      userId: order.userId._id ? order.userId._id.toString() : order.userId.toString()
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update order status
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectToDatabase()
    
    const { status, paymentStatus, trackingNumber } = await req.json()
    
    const updateData: any = {}
    if (status) updateData.status = status.toUpperCase()
    if (paymentStatus) updateData.paymentStatus = paymentStatus.toUpperCase()
    if (trackingNumber) updateData.trackingNumber = trackingNumber

    const { orderId } = await params
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('userId', 'name email').lean()
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      savings: order.savings,
      createdAt: order.createdAt,
      items: order.items || [],
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      orderNotes: order.orderNotes,
      trackingNumber: order.trackingNumber,
      userId: order.userId._id ? order.userId._id.toString() : order.userId.toString()
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}