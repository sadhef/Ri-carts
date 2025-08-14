import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, NewsletterSubscription, NewsletterCampaign } from '@/lib/models'
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

    // Get real newsletter statistics from database
    const [subscriptions, campaigns] = await Promise.all([
      NewsletterSubscription.find().lean(),
      NewsletterCampaign.find().lean()
    ])

    const totalSubscribers = subscriptions.length
    const activeSubscribers = subscriptions.filter(s => s.isActive).length
    const unsubscribeRate = totalSubscribers > 0 ? ((totalSubscribers - activeSubscribers) / totalSubscribers * 100) : 0

    // Calculate campaign statistics
    const sentCampaigns = campaigns.filter(c => c.status === 'sent')
    const averageOpenRate = sentCampaigns.length > 0 
      ? sentCampaigns.reduce((acc, c) => acc + (c.recipientCount > 0 ? (c.openCount / c.recipientCount * 100) : 0), 0) / sentCampaigns.length
      : 0
    
    const averageClickRate = sentCampaigns.length > 0 
      ? sentCampaigns.reduce((acc, c) => acc + (c.openCount > 0 ? (c.clickCount / c.openCount * 100) : 0), 0) / sentCampaigns.length
      : 0

    // Calculate recent growth (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentGrowth = subscriptions.filter(s => 
      new Date(s.subscribedAt) >= thirtyDaysAgo && s.isActive
    ).length

    const stats = {
      totalSubscribers,
      activeSubscribers,
      unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
      averageOpenRate: Math.round(averageOpenRate * 100) / 100,
      averageClickRate: Math.round(averageClickRate * 100) / 100,
      recentGrowth
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Newsletter stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}