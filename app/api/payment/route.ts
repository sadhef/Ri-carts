import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, OrderItem, Product, Address } from '@/lib/models'
import RazorpayService from '@/lib/razorpay'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 })
    }

    await connectToDatabase()

    // Get the order
    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id,
    }).lean()

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // If order is already paid, return error
    if (order.razorpayOrderId || order.razorpayPaymentId) {
      return new NextResponse('Order is already paid', { status: 400 })
    }

    // Use embedded order data (no need to fetch OrderItems and Address separately)
    const subtotal = order.subtotal || 0
    const shipping = order.shippingCost || 0
    const tax = order.taxAmount || 0
    const totalAmount = order.totalAmount || 0


    if (!totalAmount || totalAmount <= 0) {
      return new NextResponse('Invalid order amount', { status: 400 })
    }

    // Create Razorpay order
    const razorpayOrder = await RazorpayService.createOrder({
      amount: RazorpayService.formatAmount(totalAmount), // Convert to paise
      currency: 'INR',
      receipt: `order_${order._id.toString().slice(-8)}`,
      notes: {
        orderId: order._id.toString(),
        userId: session.user.id,
        customerEmail: session.user.email || '',
      },
    })

    // Update order with Razorpay order details
    await Order.findByIdAndUpdate(order._id, {
      razorpayOrderId: razorpayOrder.id,
      'paymentMethod.type': 'razorpay',
    })

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order._id.toString(),
      customerName: session.user.name || 'Customer',
      customerEmail: session.user.email,
    })
  } catch (error) {
    console.error('[PAYMENT_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
