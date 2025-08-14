import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, ShippingZone } from '@/lib/models'
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

    const zones = await ShippingZone.find({}).sort({ createdAt: -1 }).lean()
    
    const formattedZones = zones.map(zone => ({
      id: zone._id.toString(),
      name: zone.name,
      countries: zone.countries,
      states: zone.states || [],
      isDefault: zone.isDefault,
      createdAt: zone.createdAt.toISOString(),
      updatedAt: zone.updatedAt.toISOString()
    }))

    return NextResponse.json(formattedZones)
  } catch (error) {
    console.error('Shipping zones API error:', error)
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
    const { name, countries, states, isDefault } = body

    if (!name || !countries || countries.length === 0) {
      return NextResponse.json({ error: 'Name and countries are required' }, { status: 400 })
    }

    // If this is set as default, remove default from others
    if (isDefault) {
      await ShippingZone.updateMany({}, { isDefault: false })
    }

    const newZone = await ShippingZone.create({
      name,
      countries: countries.filter((c: string) => c.trim()),
      states: states ? states.filter((s: string) => s.trim()) : [],
      isDefault: isDefault || false
    })

    return NextResponse.json({
      id: newZone._id.toString(),
      name: newZone.name,
      countries: newZone.countries,
      states: newZone.states || [],
      isDefault: newZone.isDefault,
      createdAt: newZone.createdAt.toISOString(),
      updatedAt: newZone.updatedAt.toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('Shipping zone create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}