import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, NewsletterCampaign } from '@/lib/models'
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

    // Get real newsletter campaigns from database
    const campaigns = await NewsletterCampaign.find()
      .sort({ createdAt: -1 })
      .lean()

    const formattedCampaigns = campaigns.map(campaign => ({
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
    }))

    return NextResponse.json(formattedCampaigns)
  } catch (error) {
    console.error('Newsletter campaigns API error:', error)
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
    const { subject, content, scheduledAt } = body

    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 })
    }

    // Create newsletter campaign in database
    const campaign = await NewsletterCampaign.create({
      subject: subject.trim(),
      content: content.trim(),
      createdBy: adminUser._id.toString(),
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      recipientCount: 0,
      openCount: 0,
      clickCount: 0
    })

    return NextResponse.json({
      id: campaign._id.toString(),
      message: 'Newsletter campaign created successfully',
      campaign: {
        id: campaign._id.toString(),
        subject: campaign.subject,
        content: campaign.content,
        status: campaign.status,
        scheduledAt: campaign.scheduledAt?.toISOString(),
        createdAt: campaign.createdAt?.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Newsletter campaign create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}