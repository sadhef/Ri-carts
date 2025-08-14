import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
})

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async ({ to, subject, html, text }: EmailData) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
      text,
    })
    return result
  } catch (error) {
    console.error('Email sending error:', error)
    // Don't throw error - just log it so order creation doesn't fail
    return null
  }
}

// Email templates
export const orderConfirmationEmail = (orderData: {
  orderId: string
  customerName: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
}) => {
  const itemsList = orderData.items
    .map(item => `<li>${item.name} x ${item.quantity} - $${item.price.toFixed(2)}</li>`)
    .join('')

  return {
    subject: `Order Confirmation - #${orderData.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thank you for your order!</h1>
        <p>Hi ${orderData.customerName},</p>
        <p>Your order #${orderData.orderId} has been confirmed.</p>
        
        <h3>Order Details:</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${itemsList}
        </ul>
        
        <p><strong>Total: $${orderData.total.toFixed(2)}</strong></p>
        
        <p>We'll send you another email when your order ships.</p>
        
        <p>Best regards,<br>RI-CART Team</p>
      </div>
    `,
    text: `Thank you for your order! Your order #${orderData.orderId} has been confirmed. Total: $${orderData.total.toFixed(2)}`
  }
}

export const orderStatusUpdateEmail = (orderData: {
  orderId: string
  customerName: string
  status: string
  trackingNumber?: string
}) => {
  return {
    subject: `Order Update - #${orderData.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        <p>Hi ${orderData.customerName},</p>
        <p>Your order #${orderData.orderId} status has been updated to: <strong>${orderData.status}</strong></p>
        
        ${orderData.trackingNumber ? `<p>Tracking Number: <strong>${orderData.trackingNumber}</strong></p>` : ''}
        
        <p>Best regards,<br>RI-CART Team</p>
      </div>
    `,
    text: `Your order #${orderData.orderId} status: ${orderData.status}${orderData.trackingNumber ? ` Tracking: ${orderData.trackingNumber}` : ''}`
  }
}

// Convenience functions
export const sendOrderConfirmationEmail = async (
  to: string,
  orderData: {
    orderNumber: string
    customerName: string
    items: Array<{ name: string; quantity: number; price: number }>
    subtotal: number
    shippingCost: number
    taxAmount: number
    totalAmount: number
    shippingAddress: any
  }
) => {
  const emailTemplate = orderConfirmationEmail({
    orderId: orderData.orderNumber,
    customerName: orderData.customerName,
    items: orderData.items,
    total: orderData.totalAmount
  })

  return sendEmail({
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text
  })
}

export const sendOrderStatusUpdateEmail = async (
  to: string,
  orderData: {
    orderId: string
    customerName: string
    status: string
    trackingNumber?: string
  }
) => {
  const emailTemplate = orderStatusUpdateEmail(orderData)

  return sendEmail({
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text
  })
}