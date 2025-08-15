import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Order, User } from '@/lib/models'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const diagnostics = {
    authWorking: false,
    dbConnected: false,
    userCount: 0,
    orderCount: 0,
    errors: [] as string[]
  }

  try {
    // Test auth
    const session = await auth()
    if (session?.user) {
      diagnostics.authWorking = true
    } else {
      diagnostics.errors.push('Auth session not found')
    }
  } catch (error) {
    diagnostics.errors.push(`Auth error: ${error}`)
  }

  try {
    // Test database connection
    await connectToDatabase()
    diagnostics.dbConnected = true

    // Test basic queries
    const [userCount, orderCount] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Order.countDocuments().catch(() => 0)
    ])
    
    diagnostics.userCount = userCount
    diagnostics.orderCount = orderCount
  } catch (error) {
    diagnostics.errors.push(`Database error: ${error}`)
  }

  return diagnostics
}

export default async function AdminDashboardPage() {
  const diagnostics = await getDashboardData()

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
      </div>

      {/* Diagnostic Information */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">System Status</h3>
              <ul className="space-y-1 text-sm">
                <li className={`flex items-center gap-2 ${diagnostics.authWorking ? 'text-green-600' : 'text-red-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${diagnostics.authWorking ? 'bg-green-600' : 'bg-red-600'}`}></span>
                  Authentication: {diagnostics.authWorking ? 'Working' : 'Failed'}
                </li>
                <li className={`flex items-center gap-2 ${diagnostics.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${diagnostics.dbConnected ? 'bg-green-600' : 'bg-red-600'}`}></span>
                  Database: {diagnostics.dbConnected ? 'Connected' : 'Failed'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Data Counts</h3>
              <ul className="space-y-1 text-sm">
                <li>Users: {diagnostics.userCount}</li>
                <li>Orders: {diagnostics.orderCount}</li>
              </ul>
            </div>
          </div>
          {diagnostics.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-red-600">Errors:</h3>
              <ul className="space-y-1 text-sm text-red-600">
                {diagnostics.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">
              {diagnostics.dbConnected ? 'No orders with delivered status' : 'Database connection failed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {diagnostics.dbConnected ? 'Total orders in database' : 'Database connection failed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.userCount}</div>
            <p className="text-xs text-muted-foreground">
              {diagnostics.dbConnected ? 'Total users in database' : 'Database connection failed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {diagnostics.authWorking && diagnostics.dbConnected ? '✅' : '❌'}
            </div>
            <p className="text-xs text-muted-foreground">
              {diagnostics.authWorking && diagnostics.dbConnected ? 'All systems operational' : 'System issues detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Temporary Message */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Diagnostic Mode Active</h3>
            <p className="text-muted-foreground mb-4">
              This dashboard is currently in diagnostic mode to identify production issues.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check the System Diagnostics section above for detailed information about what&apos;s working and what&apos;s not.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}