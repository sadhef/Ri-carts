import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Product, Category } from '@/lib/models'
import { serializeProduct, serializeCategory } from '@/lib/serialize'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const product = await Product.findById(params.id).lean()
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const category = await Category.findById(product.categoryId).lean()
    const serializedProduct = {
      ...serializeProduct(product),
      category: category ? serializeCategory(category) : null
    }

    return NextResponse.json(serializedProduct)
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Failed to get product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    ).lean()

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const category = await Category.findById(updatedProduct.categoryId).lean()
    const serializedProduct = {
      ...serializeProduct(updatedProduct),
      category: category ? serializeCategory(category) : null
    }

    return NextResponse.json(serializedProduct)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}