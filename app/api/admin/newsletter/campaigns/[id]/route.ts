import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, NewsletterCampaign } from '@/lib/models'
import { Role } from '@/types'

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
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Find and delete the campaign
    const campaign = await NewsletterCampaign.findById(id)
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Don't allow deletion of sent campaigns
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json({ 
        error: 'Cannot delete campaigns that have been sent or are being sent' 
      }, { status: 400 })
    }

    await NewsletterCampaign.findByIdAndDelete(id)

    return NextResponse.json({ 
      message: 'Campaign deleted successfully',
      id
    })
  } catch (error) {
    console.error('Newsletter campaign delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
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
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Find the campaign
    const campaign = await NewsletterCampaign.findById(id).lean()
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const formattedCampaign = {
      id: campaign._id.toString(),
      subject: campaign.subject,
      content: campaign.content,
      status: campaign.status,
      recipientCount: campaign.recipientCount,
      openRate: campaign.recipientCount > 0 ? (campaign.openCount / campaign.recipientCount * 100) : 0,
      clickRate: campaign.openCount > 0 ? (campaign.clickCount / campaign.openCount * 100) : 0,
      sentAt: campaign.sentAt?.toISOString(),
      scheduledAt: campaign.scheduledAt?.toISOString(),
      createdAt: campaign.createdAt?.toISOString()
    }

    return NextResponse.json(formattedCampaign)
  } catch (error) {
    console.error('Newsletter campaign get API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}