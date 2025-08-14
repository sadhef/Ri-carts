import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, ShippingRate, ShippingZone } from '@/lib/models'
import { Role } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      zoneId, 
      name, 
      description, 
      method, 
      cost, 
      minOrderAmount, 
      maxOrderAmount, 
      minWeight, 
      maxWeight, 
      estimatedDays, 
      isActive 
    } = body

    if (!zoneId || !name || !method) {
      return NextResponse.json({ error: 'Zone ID, name, and method are required' }, { status: 400 })
    }

    // Verify zone exists
    const zone = await ShippingZone.findById(zoneId).lean()
    if (!zone) {
      return NextResponse.json({ error: 'Invalid zone ID' }, { status: 400 })
    }

    const updatedRate = await ShippingRate.findByIdAndUpdate(
      params.id,
      {
        zoneId,
        name,
        description: description || '',
        method,
        cost: cost || 0,
        minOrderAmount: minOrderAmount || null,
        maxOrderAmount: maxOrderAmount || null,
        minWeight: minWeight || null,
        maxWeight: maxWeight || null,
        estimatedDays: estimatedDays || '3-5',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    )

    if (!updatedRate) {
      return NextResponse.json({ error: 'Rate not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedRate._id.toString(),
      zoneId: updatedRate.zoneId,
      zoneName: zone.name,
      name: updatedRate.name,
      description: updatedRate.description,
      method: updatedRate.method,
      cost: updatedRate.cost,
      minOrderAmount: updatedRate.minOrderAmount,
      maxOrderAmount: updatedRate.maxOrderAmount,
      minWeight: updatedRate.minWeight,
      maxWeight: updatedRate.maxWeight,
      estimatedDays: updatedRate.estimatedDays,
      isActive: updatedRate.isActive,
      createdAt: updatedRate.createdAt.toISOString(),
      updatedAt: updatedRate.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Shipping rate update API error:', error)
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

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const deletedRate = await ShippingRate.findByIdAndDelete(params.id)

    if (!deletedRate) {
      return NextResponse.json({ error: 'Rate not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Rate deleted successfully' })
  } catch (error) {
    console.error('Shipping rate delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}