import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User } from '@/lib/models'
import RazorpayService from '@/lib/razorpay'
import { sendEmail } from '@/lib/email'
import { OrderStatus } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ 
        error: 'Missing payment verification data' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Get the order
    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id,
      razorpayOrderId: razorpay_order_id
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify payment signature
    const isValidSignature = RazorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isValidSignature) {
      return NextResponse.json({ 
        error: 'Payment signature verification failed' 
      }, { status: 400 })
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await RazorpayService.fetchPayment(razorpay_payment_id)

    // Update order with payment information
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        status: OrderStatus.PROCESSING,
        paymentMethod: 'razorpay',
        paidAt: new Date(),
      },
      { new: true }
    )

    // Get customer details
    const customer = await User.findById(order.userId)

    // Send payment confirmation email
    if (customer?.email) {
      try {
        await sendEmail({
          to: customer.email,
          subject: `Payment Confirmed - Order #${order._id.toString().slice(-8)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Payment Successful!</h2>
              <p>Hi ${customer.name || 'Valued Customer'},</p>
              <p>We have successfully received your payment for order #${order._id.toString().slice(-8)}.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> ₹${RazorpayService.parseAmount(paymentDetails.amount)}</p>
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                <p><strong>Payment Method:</strong> ${paymentDetails.method}</p>
                <p><strong>Status:</strong> ${paymentDetails.status}</p>
              </div>
              
              <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> #${order._id.toString().slice(-8)}</p>
                <p><strong>Total Amount:</strong> ₹${order.total}</p>
                <p><strong>Status:</strong> Processing</p>
              </div>
              
              <p>Your order is now being processed and will be shipped soon. You will receive another email with tracking information once it's dispatched.</p>
              
              <p>Thank you for shopping with us!</p>
              
              <p>Best regards,<br>RI-CART Team</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: updatedOrder._id.toString(),
      paymentId: razorpay_payment_id,
      status: paymentDetails.status,
      amount: RazorpayService.parseAmount(paymentDetails.amount),
    })

  } catch (error) {
    console.error('[PAYMENT_VERIFY_ERROR]', error)
    return NextResponse.json({ 
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}