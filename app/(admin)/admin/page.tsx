// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>
        🔧 DASHBOARD DEBUG MODE
      </h1>
      
      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#856404' }}>Status Check</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>✅ Page is rendering</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>✅ Layout is working</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>✅ Basic HTML/CSS is functional</p>
      </div>

      <div style={{ 
        backgroundColor: '#d1ecf1', 
        border: '1px solid #bee5eb', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>Test Information</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Environment:</strong> Production
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>URL:</strong> /admin/dashboard
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Time:</strong> {new Date().toISOString()}
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Previous Issues</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>❌ Complex components were failing</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>❌ Analytics functions causing crashes</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>❌ Database/Auth calls failing silently</p>
      </div>

      <div style={{ 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#155724' }}>Next Steps</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>1. If you can see this page → React rendering works</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>2. Check browser console for any JavaScript errors</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>3. If no console errors → Issue is with complex components</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>4. Send screenshot of this page + console to confirm</p>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Quick Navigation Test</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/admin/products" style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Products
          </a>
          <a href="/admin/orders" style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Orders
          </a>
          <a href="/admin/customers" style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Customers
          </a>
        </div>
      </div>
    </div>
  )
}