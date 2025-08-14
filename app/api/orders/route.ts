import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, Product, User, OrderItem, Address, OrderStatus } from '@/lib/models'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      orderNotes,
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
      savings
    } = await req.json()


    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}. Available: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // Generate order number
    const orderCount = await Order.countDocuments()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`

    // Create order with all data embedded
    const order = new Order({
      userId: session.user.id,
      orderNumber: orderNumber,
      status: OrderStatus.PENDING,
      paymentStatus: 'PENDING',
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        comparePrice: item.comparePrice,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku || 'N/A'
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'IN'
      },
      paymentMethod: {
        type: paymentMethod || 'Razorpay',
        lastFourDigits: ''
      },
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shippingCost) || 0,
      taxAmount: Number(taxAmount) || 0,
      totalAmount: Number(totalAmount) || 0,
      savings: Number(savings) || 0,
      shippingMethod: shippingMethod || 'Standard',
      orderNotes: orderNotes || ''
    })
    
    await order.save()

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      )
    }

    // Send order confirmation email
    try {
      await sendEmail({
        to: shippingAddress.email,
        subject: `Order Confirmation - Order #${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Order Confirmed!</h2>
            <p>Hi ${shippingAddress.firstName},</p>
            <p>Thank you for your order. We have received your order and will process it shortly.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p><strong>Status:</strong> Order Placed</p>
            </div>
            
            <p>You will receive another email with payment details shortly.</p>
            
            <p>Thank you for shopping with us!</p>
            
            <p>Best regards,<br>RI-CART Team</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
    }

    return NextResponse.json({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.totalAmount
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    const query: any = {}
    
    // Only show user's own orders unless admin
    if (session.user.role !== 'ADMIN') {
      query.userId = session.user.id
    }
    
    if (status && status !== 'all') {
      query.status = status.toUpperCase()
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .lean()

    const total = await Order.countDocuments(query)

    const formattedOrders = orders.map(order => ({
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
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}