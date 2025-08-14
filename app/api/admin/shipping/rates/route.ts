import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, ShippingRate, ShippingZone } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
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

    const rates = await ShippingRate.find({}).sort({ createdAt: -1 }).lean()
    
    // Get zone names for each rate
    const formattedRates = await Promise.all(
      rates.map(async (rate) => {
        const zone = await ShippingZone.findById(rate.zoneId).lean()
        
        return {
          id: rate._id.toString(),
          zoneId: rate.zoneId,
          zoneName: zone?.name || 'Unknown Zone',
          name: rate.name,
          description: rate.description,
          method: rate.method,
          cost: rate.cost,
          minOrderAmount: rate.minOrderAmount,
          maxOrderAmount: rate.maxOrderAmount,
          minWeight: rate.minWeight,
          maxWeight: rate.maxWeight,
          estimatedDays: rate.estimatedDays,
          isActive: rate.isActive,
          createdAt: rate.createdAt.toISOString(),
          updatedAt: rate.updatedAt.toISOString()
        }
      })
    )

    return NextResponse.json(formattedRates)
  } catch (error) {
    console.error('Shipping rates API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const newRate = await ShippingRate.create({
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
    })

    return NextResponse.json({
      id: newRate._id.toString(),
      zoneId: newRate.zoneId,
      zoneName: zone.name,
      name: newRate.name,
      description: newRate.description,
      method: newRate.method,
      cost: newRate.cost,
      minOrderAmount: newRate.minOrderAmount,
      maxOrderAmount: newRate.maxOrderAmount,
      minWeight: newRate.minWeight,
      maxWeight: newRate.maxWeight,
      estimatedDays: newRate.estimatedDays,
      isActive: newRate.isActive,
      createdAt: newRate.createdAt.toISOString(),
      updatedAt: newRate.updatedAt.toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('Shipping rate create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}