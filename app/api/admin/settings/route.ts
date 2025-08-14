import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, StoreSettings } from '@/lib/models'
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

    // Get the first (and should be only) settings record
    const settings = await StoreSettings.findOne({}).lean()
    
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    // Format the response to match the frontend interface
    const formattedSettings = {
      storeName: settings.storeName,
      storeDescription: settings.storeDescription || '',
      storeLogo: settings.storeLogo || '',
      favicon: settings.favicon || '',
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone || '',
      storeAddress: settings.storeAddress || '',
      businessName: settings.businessName || '',
      businessAddress: settings.businessAddress || '',
      businessPhone: settings.businessPhone || '',
      businessEmail: settings.businessEmail || '',
      taxId: settings.taxId || '',
      vatNumber: settings.vatNumber || '',
      registrationNumber: settings.registrationNumber || '',
      facebookUrl: settings.facebookUrl || '',
      twitterUrl: settings.twitterUrl || '',
      instagramUrl: settings.instagramUrl || '',
      linkedinUrl: settings.linkedinUrl || '',
      privacyPolicy: settings.privacyPolicy || '',
      termsOfService: settings.termsOfService || '',
      returnPolicy: settings.returnPolicy || '',
      shippingPolicy: settings.shippingPolicy || '',
      paymentMethods: settings.paymentMethods,
      currency: settings.currency,
      timezone: settings.timezone,
      language: settings.language,
      dateFormat: settings.dateFormat,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('Settings API error:', error)
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
    
    // Validate required fields
    if (!body.storeName || !body.storeEmail) {
      return NextResponse.json({ 
        error: 'Store name and email are required' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.storeEmail)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    // Check if settings already exist
    let settings = await StoreSettings.findOne({})
    
    if (settings) {
      // Update existing settings
      settings = await StoreSettings.findByIdAndUpdate(
        settings._id,
        { ...body },
        { new: true, runValidators: true }
      )
    } else {
      // Create new settings
      settings = await StoreSettings.create(body)
    }

    return NextResponse.json({ 
      message: 'Settings saved successfully',
      settings: {
        storeName: settings.storeName,
        storeDescription: settings.storeDescription,
        storeLogo: settings.storeLogo,
        favicon: settings.favicon,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        businessPhone: settings.businessPhone,
        businessEmail: settings.businessEmail,
        taxId: settings.taxId,
        vatNumber: settings.vatNumber,
        registrationNumber: settings.registrationNumber,
        facebookUrl: settings.facebookUrl,
        twitterUrl: settings.twitterUrl,
        instagramUrl: settings.instagramUrl,
        linkedinUrl: settings.linkedinUrl,
        privacyPolicy: settings.privacyPolicy,
        termsOfService: settings.termsOfService,
        returnPolicy: settings.returnPolicy,
        shippingPolicy: settings.shippingPolicy,
        paymentMethods: settings.paymentMethods,
        currency: settings.currency,
        timezone: settings.timezone,
        language: settings.language,
        dateFormat: settings.dateFormat,
        createdAt: settings.createdAt.toISOString(),
        updatedAt: settings.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Settings save API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}