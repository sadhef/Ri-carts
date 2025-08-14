import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { User, Report } from '@/lib/models'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get real reports from database
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .lean()

    const formattedReports = reports.map(report => ({
      id: report._id.toString(),
      name: report.name,
      type: report.type,
      generatedAt: report.createdAt?.toISOString(),
      generatedBy: report.generatedBy,
      period: report.period,
      status: report.status,
      downloadUrl: report.downloadUrl
    }))

    return NextResponse.json(formattedReports)
  } catch (error) {
    console.error('Admin reports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    await connectToDatabase()
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, period } = body

    if (!name || !type || !period) {
      return NextResponse.json({ error: 'Name, type, and period are required' }, { status: 400 })
    }

    const report = await Report.create({
      name,
      type,
      period,
      generatedBy: adminUser._id.toString(),
      status: 'generating'
    })

    return NextResponse.json({
      id: report._id.toString(),
      message: 'Report generation started',
      status: 'generating'
    })
  } catch (error) {
    console.error('Admin reports create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}