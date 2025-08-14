import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Address } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const addresses = await Address.find({ userId: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean()

    const formattedAddresses = addresses.map(address => ({
      id: address._id.toString(),
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone
    }))

    return NextResponse.json(formattedAddresses)
  } catch (error) {
    console.error('Get addresses API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, firstName, lastName, address, city, state, zipCode, country, phone } = body

    // Validate required fields
    if (!firstName || !lastName || !address || !city || !state || !zipCode || !country) {
      return NextResponse.json({ 
        error: 'All address fields are required except phone' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // If this is the first address, make it default
    const existingAddresses = await Address.countDocuments({ userId: session.user.id })
    const isDefault = existingAddresses === 0

    const newAddress = await Address.create({
      userId: session.user.id,
      type: type || 'HOME',
      isDefault,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      phone: phone?.trim()
    })

    return NextResponse.json({
      id: newAddress._id.toString(),
      type: newAddress.type,
      isDefault: newAddress.isDefault,
      firstName: newAddress.firstName,
      lastName: newAddress.lastName,
      address: newAddress.address,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
      country: newAddress.country,
      phone: newAddress.phone
    }, { status: 201 })
  } catch (error) {
    console.error('Create address API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}