import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import * as z from 'zod'

const profileSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Name must not be longer than 30 characters.',
    }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
})

export async function PATCH(req: Request) {
  try {
    await connectToDatabase()
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, email } = profileSchema.parse(body)

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: session.user.id }
    }).lean()

    if (existingUser) {
      return new NextResponse('Email already taken', { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name, email },
      { new: true }
    ).lean()

    if (!updatedUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json({
      ...updatedUser,
      id: updatedUser._id.toString()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
