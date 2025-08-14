import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, NewsletterSubscription } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get real newsletter subscriptions
    const subscribers = await NewsletterSubscription.find()
      .sort({ subscribedAt: -1 })
      .lean()

    const formattedSubscribers = subscribers.map(sub => ({
      id: sub._id.toString(),
      email: sub.email,
      name: sub.name || '',
      subscribed: sub.isActive,
      subscribedAt: sub.subscribedAt?.toISOString(),
      tags: sub.tags || [],
      source: sub.source || 'website'
    }))

    return NextResponse.json(formattedSubscribers)
  } catch (error) {
    console.error('Newsletter subscribers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, source = 'manual', tags = [] } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if subscriber already exists
    const existingSubscriber = await NewsletterSubscription.findOne({ email })
    
    if (existingSubscriber) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 })
    }

    // Create new subscriber
    const subscriber = await NewsletterSubscription.create({
      email: email.trim().toLowerCase(),
      name: name?.trim(),
      source,
      tags,
      isActive: true
    })

    return NextResponse.json({
      message: 'Subscriber added successfully',
      subscriber: {
        id: subscriber._id.toString(),
        email: subscriber.email,
        name: subscriber.name,
        subscribed: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt?.toISOString(),
        source: subscriber.source,
        tags: subscriber.tags
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscriber create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}