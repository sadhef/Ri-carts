import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Category } from '@/lib/models'
import { serializeCategory } from '@/lib/serialize'

export async function GET() {
  try {
    await connectToDatabase()
    
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean()
      .then(categories => 
        categories.map(category => serializeCategory(category))
      )

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
