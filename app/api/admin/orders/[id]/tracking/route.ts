import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User } from '@/lib/models'
import { Role, OrderStatus } from '@/types'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { trackingNumber } = body

    if (!trackingNumber) {
      return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 })
    }

    // Update order with tracking number and set status to shipped
    const order = await Order.findByIdAndUpdate(
      params.id,
      { 
        trackingNumber,
        status: OrderStatus.SHIPPED,
        shippedAt: new Date()
      },
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get customer details
    const customer = await User.findById(order.userId)

    // Send tracking email to customer
    if (customer && customer.email) {
      try {
        await sendEmail({
          to: customer.email,
          subject: `Your Order #${order._id.toString().slice(-8)} Has Shipped!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Order Has Shipped!</h2>
              <p>Hi ${customer.name || 'Valued Customer'},</p>
              <p>Great news! Your order has been shipped and is on its way to you.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> #${order._id.toString().slice(-8)}</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>You can track your package using the tracking number above with your shipping carrier.</p>
              <p>Thank you for your business!</p>
              
              <p>Best regards,<br>Your Store Team</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send tracking email:', emailError)
      }
    }

    return NextResponse.json({ 
      id: order._id.toString(),
      trackingNumber: order.trackingNumber,
      status: order.status,
      message: 'Tracking number added and customer notified' 
    })
  } catch (error) {
    console.error('Admin order tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}