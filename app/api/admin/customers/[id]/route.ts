import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import { Role } from '@/types'

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
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, role, name } = body

    // Build update object
    const updateData: any = {}
    if (status) updateData.status = status
    if (role) updateData.role = role
    if (name) updateData.name = name
    updateData.updatedAt = new Date()

    // Update customer
    const customer = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).select('-password')

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      role: customer.role,
      status: customer.status,
      tags: customer.tags || [],
      message: 'Customer updated successfully' 
    })
  } catch (error) {
    console.error('Update customer API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get customer details
    const customer = await User.findById(params.id).select('-password').lean()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      role: customer.role,
      emailVerified: customer.emailVerified?.toISOString(),
      createdAt: customer.createdAt?.toISOString(),
      lastLoginAt: customer.lastLoginAt?.toISOString(),
      status: customer.status || 'active',
      tags: customer.tags || []
    })
  } catch (error) {
    console.error('Get customer API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}