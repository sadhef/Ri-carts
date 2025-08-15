import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Product, Category } from '@/lib/models'
import { serializeProduct, serializeCategory } from '@/lib/serialize'

const ITEMS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sort = searchParams.get('sort')

    // Build filter object
    const filter: any = {
      price: { $gte: minPrice, $lte: maxPrice }
    }

    if (category) {
      // Check if category is an ID (ObjectId format) or a name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        filter.categoryId = category
      } else {
        // It's a category name, find the category first
        const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } }).lean()
        if (categoryDoc) {
          filter.categoryId = categoryDoc._id.toString()
        } else {
          // If category not found, return empty results
          return NextResponse.json({
            products: [],
            total: 0,
            perPage: ITEMS_PER_PAGE,
            page,
          })
        }
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    let sortObj: any = { createdAt: -1 }
    switch (sort) {
      case 'price_asc':
        sortObj = { price: 1 }
        break
      case 'price_desc':
        sortObj = { price: -1 }
        break
      case 'name_asc':
        sortObj = { name: 1 }
        break
      case 'name_desc':
        sortObj = { name: -1 }
        break
      case 'createdAt_desc':
      case 'newest':
        sortObj = { createdAt: -1 }
        break
      case 'createdAt_asc':
        sortObj = { createdAt: 1 }
        break
      case 'popularity':
      case 'trending':
        // Sort by creation date for now (could be enhanced with view counts, sales, etc.)
        sortObj = { createdAt: -1 }
        break
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    // Get products with pagination
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .lean()

    // Get categories for the products and properly serialize data
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        const category = await Category.findById(product.categoryId).lean()
        return {
          ...serializeProduct(product),
          category: serializeCategory(category)
        }
      })
    )

    return NextResponse.json({
      products: productsWithCategory,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
    })
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    const newProduct = new Product(body)
    const savedProduct = await newProduct.save()

    const category = await Category.findById(savedProduct.categoryId).lean()
    const serializedProduct = {
      ...serializeProduct(savedProduct.toObject()),
      category: category ? serializeCategory(category) : null
    }

    return NextResponse.json(serializedProduct, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
