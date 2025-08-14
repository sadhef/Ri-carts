import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email }).lean()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user profile data
    const profile = {
      id: user._id.toString(),
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      country: user.country || '',
      dateOfBirth: user.dateOfBirth || '',
      role: user.role,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      dateOfBirth
    } = body

    await connectToDatabase()
    
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(zipCode && { zipCode }),
          ...(country && { country }),
          ...(dateOfBirth && { dateOfBirth }),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return updated profile data
    const profile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name || '',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      city: updatedUser.city || '',
      state: updatedUser.state || '',
      zipCode: updatedUser.zipCode || '',
      country: updatedUser.country || '',
      dateOfBirth: updatedUser.dateOfBirth || '',
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified || false,
      createdAt: updatedUser.createdAt
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}