import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product, ProductStatus } from '@/lib/models'
import { serializeProduct } from '@/lib/serialize'
import * as z from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  price: z.number().min(0),
  comparePrice: z.number().optional(),
  categoryId: z.string().min(1),
  stock: z.number().min(0),
  lowStockThreshold: z.number().min(0),
  sku: z.string().min(1),
  weight: z.number().optional(),
  images: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional()
  })),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  featured: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Check if SKU already exists
    const existingSKU = await Product.findOne({ sku: validatedData.sku })
    if (existingSKU) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
    }

    // Check if slug already exists
    const existingSlug = await Product.findOne({ slug: validatedData.slug })
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const product = await Product.create({
      ...validatedData,
      averageRating: 0,
      totalReviews: 0,
    })

    return NextResponse.json({
      id: product._id.toString(),
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid data', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')

    // Build filter
    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      filter.categoryId = category
    }

    if (status) {
      filter.status = status
    }

    if (featured) {
      filter.featured = featured === 'true'
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ])

    const formattedProducts = products.map(product => serializeProduct(product))

    return NextResponse.json({
      products: formattedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}