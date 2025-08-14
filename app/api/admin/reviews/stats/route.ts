import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Review, User } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get review statistics
    const [
      totalReviews,
      verifiedReviews,
      averageRatingResult,
      recentReviews
    ] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ isVerified: true }),
      Review.aggregate([
        { $group: { _id: null, average: { $avg: '$rating' } } }
      ]),
      Review.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ])

    const averageRating = averageRatingResult[0]?.average || 0

    return NextResponse.json({
      total: totalReviews,
      verified: verifiedReviews,
      average: Math.round(averageRating * 10) / 10,
      recent: recentReviews
    })
  } catch (error) {
    console.error('Review stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}