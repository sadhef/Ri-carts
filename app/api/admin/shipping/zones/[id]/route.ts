import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, ShippingZone, ShippingRate } from '@/lib/models'
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
    const { name, countries, states, isDefault } = body

    if (!name || !countries || countries.length === 0) {
      return NextResponse.json({ error: 'Name and countries are required' }, { status: 400 })
    }

    // If this is set as default, remove default from others
    if (isDefault) {
      await ShippingZone.updateMany({ _id: { $ne: params.id } }, { isDefault: false })
    }

    const updatedZone = await ShippingZone.findByIdAndUpdate(
      params.id,
      {
        name,
        countries: countries.filter((c: string) => c.trim()),
        states: states ? states.filter((s: string) => s.trim()) : [],
        isDefault: isDefault || false
      },
      { new: true, runValidators: true }
    )

    if (!updatedZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedZone._id.toString(),
      name: updatedZone.name,
      countries: updatedZone.countries,
      states: updatedZone.states || [],
      isDefault: updatedZone.isDefault,
      createdAt: updatedZone.createdAt.toISOString(),
      updatedAt: updatedZone.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Shipping zone update API error:', error)
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

    // Check if zone is default
    const zone = await ShippingZone.findById(params.id)
    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
    }

    if (zone.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default zone' }, { status: 400 })
    }

    // Check if zone has any shipping rates
    const ratesCount = await ShippingRate.countDocuments({ zoneId: params.id })
    if (ratesCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete zone with shipping rates. Delete rates first.' 
      }, { status: 400 })
    }

    await ShippingZone.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Zone deleted successfully' })
  } catch (error) {
    console.error('Shipping zone delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}