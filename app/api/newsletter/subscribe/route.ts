import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { NewsletterSubscription } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check if subscriber already exists
    const existingSubscriber = await NewsletterSubscription.findOne({ email: cleanEmail })
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({ 
          error: 'This email is already subscribed to our newsletter' 
        }, { status: 409 })
      } else {
        // Reactivate existing subscriber
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date()
        existingSubscriber.unsubscribedAt = undefined
        await existingSubscriber.save()

        return NextResponse.json({
          message: 'Successfully resubscribed to our newsletter!',
          subscriber: {
            email: existingSubscriber.email,
            isActive: existingSubscriber.isActive
          }
        }, { status: 200 })
      }
    }

    // Create new subscriber
    const subscriber = await NewsletterSubscription.create({
      email: cleanEmail,
      source: 'website',
      isActive: true,
      tags: ['website-subscriber']
    })

    return NextResponse.json({
      message: 'Successfully subscribed to our newsletter!',
      subscriber: {
        email: subscriber.email,
        isActive: subscriber.isActive
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscription API error:', error)
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again later.' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

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