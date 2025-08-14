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

    await connectToDatabase()

    // Find the address and verify ownership
    const address = await Address.findOne({ 
      _id: id, 
      userId: session.user.id 
    })

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Remove default from all other addresses for this user
    await Address.updateMany(
      { userId: session.user.id },
      { isDefault: false }
    )

    // Set this address as default
    await Address.findByIdAndUpdate(id, { isDefault: true })

    return NextResponse.json({ message: 'Default address updated successfully' })
  } catch (error) {
    console.error('Set default address API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}