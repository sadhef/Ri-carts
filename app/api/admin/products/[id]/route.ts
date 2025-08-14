import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product } from '@/lib/models'
import { serializeProduct } from '@/lib/serialize'

type Params = {
  id: string
}

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const product = await Product.findById(params.id).lean()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(serializeProduct(product))

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await Product.findByIdAndDelete(params.id)

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      productId: params.id 
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if slug is being changed and if it already exists
    if (body.slug && body.slug !== product.slug) {
      const existingSlug = await Product.findOne({ 
        slug: body.slug, 
        _id: { $ne: params.id } 
      })
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Check if SKU is being changed and if it already exists
    if (body.sku && body.sku !== product.sku) {
      const existingSKU = await Product.findOne({ 
        sku: body.sku, 
        _id: { $ne: params.id } 
      })
      if (existingSKU) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean()

    return NextResponse.json({
      message: 'Product updated successfully',
      product: serializeProduct(updatedProduct)
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}