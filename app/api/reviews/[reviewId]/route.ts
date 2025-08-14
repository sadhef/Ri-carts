import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Review, Product } from '@/lib/models'

export async function PUT(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { rating, comment } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating (1-5) is required' },
        { status: 400 }
      )
    }

    const review = await Review.findById(params.reviewId)
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if user owns this review
    if (review.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      params.reviewId,
      {
        rating,
        comment: comment?.trim() || '',
        updatedAt: new Date()
      },
      { new: true }
    )

    // Recalculate product's average rating
    const reviews = await Review.find({ productId: review.productId })
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / reviews.length

    await Product.findByIdAndUpdate(review.productId, {
      averageRating: Math.round(averageRating * 10) / 10
    })

    return NextResponse.json({
      id: updatedReview!._id.toString(),
      rating: updatedReview!.rating,
      comment: updatedReview!.comment,
      userName: updatedReview!.userName,
      isVerified: updatedReview!.isVerified,
      createdAt: updatedReview!.createdAt,
      updatedAt: updatedReview!.updatedAt
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const review = await Review.findById(params.reviewId)
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const productId = review.productId
    
    // Delete review
    await Review.findByIdAndDelete(params.reviewId)

    // Recalculate product's average rating and review count
    const remainingReviews = await Review.find({ productId })
    const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = remainingReviews.length > 0 ? totalRating / remainingReviews.length : 0

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: remainingReviews.length
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}