import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, NewsletterSubscription } from '@/lib/models'
import { Role } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { subscribed, name } = body

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    // Find the subscriber
    const subscriber = await NewsletterSubscription.findById(id)
    
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    // Update subscriber status
    const updateData: any = {}
    
    if (typeof subscribed === 'boolean') {
      updateData.isActive = subscribed
      if (!subscribed) {
        updateData.unsubscribedAt = new Date()
      } else {
        updateData.unsubscribedAt = undefined
      }
    }
    
    if (name !== undefined) {
      updateData.name = name
    }

    const updatedSubscriber = await NewsletterSubscription.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    return NextResponse.json({
      message: 'Subscriber updated successfully',
      subscriber: {
        id: updatedSubscriber._id.toString(),
        email: updatedSubscriber.email,
        name: updatedSubscriber.name,
        subscribed: updatedSubscriber.isActive,
        subscribedAt: updatedSubscriber.subscribedAt?.toISOString(),
        unsubscribedAt: updatedSubscriber.unsubscribedAt?.toISOString(),
        source: updatedSubscriber.source,
        tags: updatedSubscriber.tags
      }
    })
  } catch (error) {
    console.error('Newsletter subscriber update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    // Delete the subscriber
    const subscriber = await NewsletterSubscription.findByIdAndDelete(id)
    
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Subscriber deleted successfully',
      id
    })
  } catch (error) {
    console.error('Newsletter subscriber delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}