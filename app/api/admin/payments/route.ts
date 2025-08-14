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

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all orders with payment information
    const orders = await Order.find({
      $or: [
        { stripePaymentId: { $exists: true, $ne: null } },
        { paymentMethod: { $exists: true } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean()

    // Transform orders into transaction format
    const transactions = await Promise.all(
      orders.map(async (order) => {
        try {
          // Get customer details
          const customer = await User.findById(order.userId).lean()
          
          // Determine payment status based on order status
          let paymentStatus = 'pending'
          if (order.status === 'DELIVERED' || order.status === 'SHIPPED') {
            paymentStatus = 'completed'
          } else if (order.status === 'CANCELLED') {
            paymentStatus = 'cancelled'
          } else if (order.status === 'REFUNDED') {
            paymentStatus = 'refunded'
          }

          return {
            id: order._id.toString(),
            orderId: order._id.toString(),
            orderNumber: order._id.toString().slice(-8),
            customerId: order.userId,
            customerName: customer?.name,
            customerEmail: customer?.email || 'Unknown',
            amount: order.total || 0,
            currency: 'USD',
            paymentMethod: order.paymentMethod || 'card',
            paymentGateway: order.stripePaymentId ? 'stripe' : 'manual',
            status: paymentStatus,
            transactionId: order.stripePaymentId || order._id.toString(),
            paymentIntentId: order.stripePaymentId,
            refundId: order.refundId,
            createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
            refundAmount: order.refundAmount,
            refundedAt: order.refundedAt?.toISOString(),
          }
        } catch (error) {
          console.error('Error processing order for payment:', order._id, error)
          return {
            id: order._id.toString(),
            orderId: order._id.toString(),
            orderNumber: order._id.toString().slice(-8),
            customerId: order.userId,
            customerName: 'Error loading',
            customerEmail: 'Error loading',
            amount: order.total || 0,
            currency: 'USD',
            paymentMethod: 'unknown',
            paymentGateway: 'unknown',
            status: 'failed',
            transactionId: order._id.toString(),
            createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
            failureReason: 'Failed to load transaction details'
          }
        }
      })
    )

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Admin payments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}