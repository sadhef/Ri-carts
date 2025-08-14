import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Category, Product } from '@/lib/models'
import { serializeCategory } from '@/lib/serialize'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const category = await Category.findById(id).lean()
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(serializeCategory(category))
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image, slug } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if category exists
    const existingCategory = await Category.findById(id)
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if another category with same name or slug already exists
    const duplicateCategory = await Category.findOne({
      _id: { $ne: id },
      $or: [
        { name: name.trim() },
        { slug: slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
      ]
    })

    if (duplicateCategory) {
      return NextResponse.json({ 
        error: 'Category with this name or slug already exists' 
      }, { status: 400 })
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() || '',
        image: image?.trim() || '',
        slug: slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        updatedAt: new Date()
      },
      { new: true }
    ).lean()

    return NextResponse.json(serializeCategory(updatedCategory))
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if category exists
    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if any products are using this category
    const productsUsingCategory = await Product.countDocuments({ categoryId: id })
    if (productsUsingCategory > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category. ${productsUsingCategory} products are using this category.` 
      }, { status: 400 })
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}