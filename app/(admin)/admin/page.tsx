import connectToDatabase from '@/lib/mongodb'
import { Order, User, Product } from '@/lib/models'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

async function getSimpleStats() {
  try {
    await connectToDatabase()
    
    const [userCount, orderCount, productCount] = await Promise.allSettled([
      User.countDocuments(),
      Order.countDocuments(), 
      Product.countDocuments()
    ])

    // Calculate total revenue safely
    const revenueResult = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).catch(() => [])

    const totalRevenue = revenueResult[0]?.total || 0

    return {
      users: userCount.status === 'fulfilled' ? userCount.value : 0,
      orders: orderCount.status === 'fulfilled' ? orderCount.value : 0,
      products: productCount.status === 'fulfilled' ? productCount.value : 0,
      revenue: totalRevenue,
      status: 'connected'
    }
  } catch (error) {
    return {
      users: 0,
      orders: 0, 
      products: 0,
      revenue: 0,
      status: 'error',
      error: error.message
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getSimpleStats()

  const cardStyle = {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }

  const headerStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '8px'
  }

  const valueStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '4px'
  }

  const subTextStyle = {
    fontSize: '12px',
    color: '#9ca3af'
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Status Indicator */}
      <div style={{ 
        ...cardStyle, 
        backgroundColor: stats.status === 'connected' ? '#ecfdf5' : '#fef2f2',
        borderColor: stats.status === 'connected' ? '#10b981' : '#ef4444',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: stats.status === 'connected' ? '#10b981' : '#ef4444' 
          }}></span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500',
            color: stats.status === 'connected' ? '#065f46' : '#991b1b'
          }}>
            Database: {stats.status === 'connected' ? 'Connected' : 'Error'}
          </span>
          {stats.error && (
            <span style={{ fontSize: '12px', color: '#991b1b', marginLeft: '8px' }}>
              ({stats.error})
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Revenue */}
        <div style={cardStyle}>
          <div style={headerStyle}>💰 Total Revenue</div>
          <div style={valueStyle}>₹{stats.revenue.toLocaleString('en-IN')}</div>
          <div style={subTextStyle}>From delivered orders</div>
        </div>

        {/* Total Orders */}
        <div style={cardStyle}>
          <div style={headerStyle}>📦 Total Orders</div>
          <div style={valueStyle}>{stats.orders.toLocaleString()}</div>
          <div style={subTextStyle}>All time orders</div>
        </div>

        {/* Total Users */}
        <div style={cardStyle}>
          <div style={headerStyle}>👥 Total Users</div>
          <div style={valueStyle}>{stats.users.toLocaleString()}</div>
          <div style={subTextStyle}>Registered customers</div>
        </div>

        {/* Total Products */}
        <div style={cardStyle}>
          <div style={headerStyle}>🛍️ Total Products</div>
          <div style={valueStyle}>{stats.products.toLocaleString()}</div>
          <div style={subTextStyle}>In your catalog</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/admin/products" style={{ 
            padding: '10px 16px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📦 Manage Products
          </a>
          <a href="/admin/orders" style={{ 
            padding: '10px 16px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📋 View Orders
          </a>
          <a href="/admin/customers" style={{ 
            padding: '10px 16px', 
            backgroundColor: '#8b5cf6', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            👥 Manage Customers
          </a>
          <a href="/admin/analytics" style={{ 
            padding: '10px 16px', 
            backgroundColor: '#f59e0b', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📊 View Analytics
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          Last updated: {new Date().toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  )
}