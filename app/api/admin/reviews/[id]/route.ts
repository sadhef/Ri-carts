import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Review, User, Product } from '@/lib/models'
import { Role } from '@/types'
import { serializeReview, serializeProduct } from '@/lib/serialize'

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
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get review with product and user details
    const review = await Review.findById(params.id).lean()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Get product details
    const product = await Product.findById(review.productId).lean()
    const reviewer = await User.findById(review.userId).lean()

    // Build detailed review object
    const detailData = {
      ...serializeReview(review),
      productName: product?.name || 'Unknown Product',
      productSlug: product?.slug || '',
      productImage: product?.images?.[0]?.url || '',
      userName: reviewer?.name || 'Unknown User',
      userEmail: reviewer?.email || '',
    }

    return NextResponse.json(detailData)
  } catch (error) {
    console.error('Get review API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { isVerified } = body

    // Update review
    const review = await Review.findByIdAndUpdate(
      params.id,
      { isVerified, updatedAt: new Date() },
      { new: true }
    )

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      id: review._id.toString(),
      isVerified: review.isVerified,
      message: 'Review updated successfully' 
    })
  } catch (error) {
    console.error('Update review API error:', error)
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
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete review
    const review = await Review.findByIdAndDelete(params.id)

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Review deleted successfully' 
    })
  } catch (error) {
    console.error('Delete review API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}