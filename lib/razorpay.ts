import Razorpay from 'razorpay'
import crypto from 'crypto'

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are required')
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface RazorpayOrderOptions {
  amount: number // Amount in paise (smallest currency unit)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  id: string
  amount: number
  amount_due: number
  amount_paid: number
  currency: string
  receipt: string | null
  status: 'created' | 'attempted' | 'paid'
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export interface PaymentVerificationData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export class RazorpayService {
  static async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    try {
      // Validate parameters
      if (!options.amount || options.amount <= 0) {
        throw new Error('Amount must be a positive number')
      }
      
      if (options.amount < 100) {
        throw new Error('Minimum amount is ₹1 (100 paise)')
      }

      const orderData = {
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {},
      }

      const order = await razorpay.orders.create(orderData)
      return order
    } catch (error) {
      console.error('Razorpay order creation failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        options: options
      })
      throw new Error(`Failed to create payment order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    try {
      const order = await razorpay.orders.fetch(orderId)
      return order
    } catch (error) {
      console.error('Razorpay order fetch failed:', error)
      throw new Error('Failed to fetch payment order')
    }
  }

  static async fetchPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId)
      return payment
    } catch (error) {
      console.error('Razorpay payment fetch failed:', error)
      throw new Error('Failed to fetch payment details')
    }
  }

  static verifyPaymentSignature(data: PaymentVerificationData): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data
      
      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex')
      
      return expectedSignature === razorpay_signature
    } catch (error) {
      console.error('Payment signature verification failed:', error)
      return false
    }
  }

  static async createRefund(paymentId: string, amount?: number, notes?: Record<string, string>) {
    try {
      const refundData: any = {
        notes: notes || {},
      }

      if (amount) {
        refundData.amount = amount
      }

      const refund = await razorpay.payments.refund(paymentId, refundData)
      return refund
    } catch (error) {
      console.error('Razorpay refund failed:', error)
      throw new Error('Failed to process refund')
    }
  }

  static async fetchRefund(paymentId: string, refundId: string) {
    try {
      const refund = await razorpay.payments.fetchRefund(paymentId, refundId)
      return refund
    } catch (error) {
      console.error('Razorpay refund fetch failed:', error)
      throw new Error('Failed to fetch refund details')
    }
  }

  static formatAmount(amount: number): number {
    // Convert rupees to paise (multiply by 100)
    return Math.round(amount * 100)
  }

  static parseAmount(amountInPaise: number): number {
    // Convert paise to rupees (divide by 100)
    return amountInPaise / 100
  }
}

export default RazorpayService