import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, Coupon } from '@/lib/models'
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
    
    // Update coupon
    const coupon = await Coupon.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    )

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: coupon._id.toString(),
      message: 'Coupon updated successfully'
    })
  } catch (error) {
    console.error('Admin coupon update API error:', error)
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

    // Delete coupon
    const coupon = await Coupon.findByIdAndDelete(params.id)

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Coupon deleted successfully'
    })
  } catch (error) {
    console.error('Admin coupon delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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
    
    // Validate required fields
    const { code, name, discountType, discountValue } = body
    if (!code || !name || !discountType || discountValue === undefined) {
      return NextResponse.json({ 
        error: 'Code, name, discount type, and discount value are required' 
      }, { status: 400 })
    }

    // Check if coupon code already exists for a different coupon
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      _id: { $ne: params.id }
    })

    if (existingCoupon) {
      return NextResponse.json({ 
        error: 'A coupon with this code already exists' 
      }, { status: 409 })
    }
    
    // Update coupon
    const coupon = await Coupon.findByIdAndUpdate(
      params.id,
      {
        ...body,
        code: code.toUpperCase().trim(),
        name: name.trim()
      },
      { new: true }
    )

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: coupon._id.toString(),
      message: 'Coupon updated successfully',
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        startDate: coupon.startDate?.toISOString(),
        endDate: coupon.endDate?.toISOString(),
        createdAt: coupon.createdAt?.toISOString()
      }
    })
  } catch (error) {
    console.error('Admin coupon update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}