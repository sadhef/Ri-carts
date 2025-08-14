import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Address } from '@/lib/models'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { type, firstName, lastName, address, city, state, zipCode, country, phone } = body

    // Validate required fields
    if (!firstName || !lastName || !address || !city || !state || !zipCode || !country) {
      return NextResponse.json({ 
        error: 'All address fields are required except phone' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Find the address and verify ownership
    const existingAddress = await Address.findOne({ 
      _id: id, 
      userId: session.user.id 
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Update the address
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        type: type || 'HOME',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        phone: phone?.trim()
      },
      { new: true }
    )

    return NextResponse.json({
      id: updatedAddress._id.toString(),
      type: updatedAddress.type,
      isDefault: updatedAddress.isDefault,
      firstName: updatedAddress.firstName,
      lastName: updatedAddress.lastName,
      address: updatedAddress.address,
      city: updatedAddress.city,
      state: updatedAddress.state,
      zipCode: updatedAddress.zipCode,
      country: updatedAddress.country,
      phone: updatedAddress.phone
    })
  } catch (error) {
    console.error('Update address API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await connectToDatabase()

    // Find the address and verify ownership
    const address = await Address.findOne({ 
      _id: id, 
      userId: session.user.id 
    })

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Don't allow deleting the default address if there are other addresses
    if (address.isDefault) {
      const otherAddresses = await Address.countDocuments({ 
        userId: session.user.id, 
        _id: { $ne: id } 
      })
      
      if (otherAddresses > 0) {
        return NextResponse.json({ 
          error: 'Cannot delete default address. Set another address as default first.' 
        }, { status: 400 })
      }
    }

    // Delete the address
    await Address.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Delete address API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}