import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, Coupon } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
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

    // Get all coupons
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .lean()

    const formattedCoupons = coupons.map(coupon => ({
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
    }))

    return NextResponse.json(formattedCoupons)
  } catch (error) {
    console.error('Admin coupons API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    if (!body.code || !body.name) {
      return NextResponse.json({ error: 'Code and name are required' }, { status: 400 })
    }

    if (!body.discountType) {
      return NextResponse.json({ error: 'Discount type is required' }, { status: 400 })
    }

    if (body.discountType !== 'FREE_SHIPPING' && (!body.discountValue || body.discountValue <= 0)) {
      return NextResponse.json({ error: 'Discount value is required and must be greater than 0' }, { status: 400 })
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: body.code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    
    // Create new coupon
    const coupon = new Coupon({
      ...body,
      code: body.code.toUpperCase(),
      usedCount: 0
    })
    await coupon.save()

    return NextResponse.json({
      id: coupon._id.toString(),
      message: 'Coupon created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Admin coupons create API error:', error)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}