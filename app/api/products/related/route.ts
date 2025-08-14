import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Product, Review } from '@/lib/models'
import { serializeProduct, serializeReview } from '@/lib/serialize'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const currentProductId = searchParams.get('currentProductId')

    if (!categoryId || !currentProductId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const products = await Product.find({
      categoryId,
      _id: { $ne: currentProductId }
    })
      .limit(6)
      .lean()

    // Get reviews for each product and properly serialize data
    const relatedProducts = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({ productId: product._id.toString() }).lean()
        return {
          ...serializeProduct(product),
          reviews: reviews.map(review => serializeReview(review))
        }
      })
    )

    return NextResponse.json(relatedProducts)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
