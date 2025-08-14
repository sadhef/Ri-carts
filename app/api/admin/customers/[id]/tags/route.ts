import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import { Role } from '@/types'

export async function POST(
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
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { tag } = body

    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 })
    }

    // Add tag to customer
    const customer = await User.findByIdAndUpdate(
      params.id,
      { $addToSet: { tags: tag } },
      { new: true }
    ).select('-password')

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Tag added successfully',
      tags: customer.tags 
    })
  } catch (error) {
    console.error('Add customer tag API error:', error)
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
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    if (!tag) {
      return NextResponse.json({ error: 'Tag parameter is required' }, { status: 400 })
    }

    // Remove tag from customer
    const customer = await User.findByIdAndUpdate(
      params.id,
      { $pull: { tags: tag } },
      { new: true }
    ).select('-password')

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Tag removed successfully',
      tags: customer.tags 
    })
  } catch (error) {
    console.error('Remove customer tag API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}