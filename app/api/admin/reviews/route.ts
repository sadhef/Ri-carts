import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Review, Product, User } from '@/lib/models'
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const rating = searchParams.get('rating')

    // Build query
    const query: any = {}
    if (status === 'verified') {
      query.isVerified = true
    } else if (status === 'unverified') {
      query.isVerified = false
    }
    
    if (rating) {
      query.rating = parseInt(rating)
    }

    // Get reviews
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Review.countDocuments(query)

    // Get unique product and user IDs for manual lookup
    const productIds = [...new Set(reviews.map(r => r.productId).filter(Boolean))]
    const userIds = [...new Set(reviews.map(r => r.userId).filter(Boolean))]

    // Manual lookups
    const products = await Product.find({ _id: { $in: productIds } }).lean()
    const users = await User.find({ _id: { $in: userIds } }).lean()

    // Create lookup maps
    const productMap = new Map(products.map(p => [p._id.toString(), p]))
    const userMap = new Map(users.map(u => [u._id.toString(), u]))

    // Format reviews for admin display
    const formattedReviews = reviews.map((review) => {
      const product = productMap.get(review.productId)
      const user = userMap.get(review.userId)
      
      
      return {
        id: review._id.toString(),
        productId: review.productId || null,
        productName: product?.name || 'Product not found',
        productSlug: product?.slug || null,
        productImage: product?.images?.[0]?.url || null,
        userId: review.userId || null,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || null,
        rating: review.rating,
        comment: review.comment,
        isVerified: review.isVerified,
        createdAt: review.createdAt?.toISOString(),
        updatedAt: review.updatedAt?.toISOString()
      }
    })

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin reviews API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}