import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Review, Product, Order } from '@/lib/models'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { productId, rating, comment, orderId } = await req.json()

    // Validate required fields
    if (!productId || !rating) {
      return NextResponse.json(
        { error: 'Product ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user has purchased this product (optional but recommended)
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        userId: session.user.id,
        status: { $in: ['DELIVERED', 'SHIPPED'] },
        'items.productId': productId
      })
      
      if (!order) {
        return NextResponse.json(
          { error: 'You can only review products you have purchased' },
          { status: 403 }
        )
      }
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: session.user.id
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      )
    }

    // Create review
    const review = new Review({
      productId,
      userId: session.user.id,
      userName: session.user.name,
      rating,
      comment: comment?.trim() || '',
      orderId: orderId || null,
      isVerified: orderId ? true : false
    })

    await review.save()

    // Update product's average rating and review count
    const reviews = await Review.find({ productId })
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / reviews.length

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    })

    return NextResponse.json({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      userName: review.userName,
      isVerified: review.isVerified,
      createdAt: review.createdAt
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'newest'
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Build sort criteria
    let sortCriteria: any = {}
    switch (sortBy) {
      case 'oldest':
        sortCriteria = { createdAt: 1 }
        break
      case 'highest':
        sortCriteria = { rating: -1, createdAt: -1 }
        break
      case 'lowest':
        sortCriteria = { rating: 1, createdAt: -1 }
        break
      default: // newest
        sortCriteria = { createdAt: -1 }
    }

    const reviews = await Review.find({ productId })
      .sort(sortCriteria)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Review.countDocuments({ productId })

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: productId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ])

    const distribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratingDistribution.find(d => d._id === rating)?.count || 0
    }))

    const formattedReviews = reviews.map(review => ({
      ...review,
      id: review._id.toString()
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      ratingDistribution: distribution
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}