import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Category } from '@/lib/models'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(categories.map(category => ({
      ...category,
      id: category._id.toString(),
      _id: category._id.toString()
    })))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
      ]
    })

    if (existingCategory) {
      return NextResponse.json({ 
        error: 'Category with this name or slug already exists' 
      }, { status: 400 })
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim() || '',
      image: image?.trim() || '',
      slug: slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await category.save()

    return NextResponse.json({
      ...category.toObject(),
      id: category._id.toString()
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}