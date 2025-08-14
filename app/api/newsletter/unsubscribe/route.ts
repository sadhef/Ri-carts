import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { NewsletterSubscription } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token') // For security, you might want to add token validation

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Find and deactivate subscriber
    const subscriber = await NewsletterSubscription.findOne({ email: cleanEmail })
    
    if (!subscriber) {
      return NextResponse.json({ error: 'Email not found in our newsletter list' }, { status: 404 })
    }

    if (!subscriber.isActive) {
      return NextResponse.json({ 
        message: 'This email is already unsubscribed from our newsletter' 
      }, { status: 200 })
    }

    subscriber.isActive = false
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()

    // Return HTML response for better UX
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unsubscribed - RI-CART</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .success { color: #22c55e; font-size: 18px; margin-bottom: 20px; }
        .email { color: #6b7280; font-size: 14px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>✓ Successfully Unsubscribed</h1>
      <p class="success">You have been successfully unsubscribed from our newsletter.</p>
      <p class="email">Email: ${email}</p>
      <p>We're sorry to see you go! If you change your mind, you can always subscribe again from our website.</p>
      <div class="footer">
        <p>© ${new Date().getFullYear()} RI-CART. All rights reserved.</p>
      </div>
    </body>
    </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Newsletter unsubscribe API error:', error)
    
    const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error - RI-CART</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .error { color: #ef4444; font-size: 18px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>❌ Something went wrong</h1>
      <p class="error">We couldn't process your unsubscribe request at this time.</p>
      <p>Please try again later or contact our support team.</p>
    </body>
    </html>
    `

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Find and deactivate subscriber
    const subscriber = await NewsletterSubscription.findOne({ email: cleanEmail })
    
    if (!subscriber) {
      return NextResponse.json({ error: 'Email not found in our newsletter list' }, { status: 404 })
    }

    if (!subscriber.isActive) {
      return NextResponse.json({ error: 'This email is already unsubscribed' }, { status: 400 })
    }

    subscriber.isActive = false
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()

    return NextResponse.json({
      message: 'Successfully unsubscribed from our newsletter'
    }, { status: 200 })
  } catch (error) {
    console.error('Newsletter unsubscribe API error:', error)
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again later.' 
    }, { status: 500 })
  }
}