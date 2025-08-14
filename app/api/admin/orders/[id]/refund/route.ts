import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User } from '@/lib/models'
import { Role, OrderStatus } from '@/types'
import { sendEmail } from '@/lib/email'
import RazorpayService from '@/lib/razorpay'

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

    // Get the order
    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === OrderStatus.REFUNDED) {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 })
    }

    let refundResult = null

    // Process Razorpay refund if payment exists
    if (order.razorpayPaymentId) {
      try {
        refundResult = await RazorpayService.createRefund(
          order.razorpayPaymentId,
          RazorpayService.formatAmount(order.total), // Convert to paise
          {
            order_id: order._id.toString(),
            refund_reason: 'requested_by_customer'
          }
        )
      } catch (razorpayError) {
        console.error('Razorpay refund error:', razorpayError)
        return NextResponse.json({ 
          error: 'Failed to process refund with payment provider' 
        }, { status: 400 })
      }
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { 
        status: OrderStatus.REFUNDED,
        refundId: refundResult?.id,
        refundedAt: new Date(),
        refundAmount: order.total
      },
      { new: true }
    )

    // Get customer details
    const customer = await User.findById(order.userId)

    // Send refund confirmation email to customer
    if (customer && customer.email) {
      try {
        await sendEmail({
          to: customer.email,
          subject: `Refund Processed for Order #${order._id.toString().slice(-8)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Refund Processed</h2>
              <p>Hi ${customer.name || 'Valued Customer'},</p>
              <p>We have processed a refund for your order. Here are the details:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Refund Details:</h3>
                <p><strong>Order Number:</strong> #${order._id.toString().slice(-8)}</p>
                <p><strong>Refund Amount:</strong> ₹${order.total.toLocaleString('en-IN')}</p>
                <p><strong>Refund Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                ${refundResult ? `<p><strong>Refund ID:</strong> ${refundResult.id}</p>` : ''}
              </div>
              
              <p>The refund will appear on your original payment method within 5-10 business days.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Thank you for your understanding.</p>
              
              <p>Best regards,<br>Your Store Team</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send refund email:', emailError)
      }
    }

    return NextResponse.json({ 
      id: updatedOrder._id.toString(),
      status: updatedOrder.status,
      refundId: refundResult?.id,
      refundAmount: order.total,
      message: 'Refund processed successfully and customer notified' 
    })
  } catch (error) {
    console.error('Admin order refund API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}