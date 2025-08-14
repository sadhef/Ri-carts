'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

interface ReportData {
  id: string
  name: string
  type: 'sales' | 'inventory' | 'customer' | 'financial'
  generatedAt: string
  period: string
  status: 'ready' | 'generating' | 'failed'
  downloadUrl?: string
}

interface SalesReportData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  growthRate: number
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  salesByMonth: Array<{ month: string; sales: number; revenue: number }>
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [salesData, setSalesData] = useState<SalesReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    fetchReports()
    fetchSalesData()
  }, [selectedPeriod])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        // Mock data for demonstration
        setReports([
          {
            id: '1',
            name: 'Monthly Sales Report',
            type: 'sales',
            generatedAt: '2025-08-12T10:30:00Z',
            period: 'August 2025',
            status: 'ready',
            downloadUrl: '/reports/monthly-sales-aug-2025.pdf'
          },
          {
            id: '2',
            name: 'Inventory Report',
            type: 'inventory',
            generatedAt: '2025-08-12T09:15:00Z',
            period: 'Current',
            status: 'ready',
            downloadUrl: '/reports/inventory-current.xlsx'
          },
          {
            id: '3',
            name: 'Customer Analytics',
            type: 'customer',
            generatedAt: '2025-08-12T08:45:00Z',
            period: 'Q3 2025',
            status: 'ready',
            downloadUrl: '/reports/customer-analytics-q3-2025.pdf'
          },
          {
            id: '4',
            name: 'Financial Summary',
            type: 'financial',
            generatedAt: '2025-08-12T11:00:00Z',
            period: 'YTD 2025',
            status: 'generating',
          },
          {
            id: '5',
            name: 'Product Performance',
            type: 'sales',
            generatedAt: '2025-08-10T16:30:00Z',
            period: 'Last 90 days',
            status: 'failed',
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`/api/admin/reports/sales?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setSalesData(data)
      } else {
        // Mock data
        setSalesData({
          totalRevenue: 125432.50,
          totalOrders: 456,
          averageOrderValue: 275.07,
          growthRate: 18.5,
          topProducts: [
            { name: 'Wireless Headphones', sales: 156, revenue: 23400 },
            { name: 'Smart Watch', sales: 134, revenue: 40200 },
            { name: 'Laptop Stand', sales: 98, revenue: 9800 },
            { name: 'Bluetooth Speaker', sales: 87, revenue: 8700 },
            { name: 'USB Cable', sales: 76, revenue: 1520 }
          ],
          salesByMonth: [
            { month: 'Jan', sales: 65, revenue: 17850 },
            { month: 'Feb', sales: 78, revenue: 21420 },
            { month: 'Mar', sales: 90, revenue: 24750 },
            { month: 'Apr', sales: 81, revenue: 22275 },
            { month: 'May', sales: 95, revenue: 26125 },
            { month: 'Jun', sales: 110, revenue: 30250 },
            { month: 'Jul', sales: 125, revenue: 34375 },
            { month: 'Aug', sales: 142, revenue: 39050 }
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    }
  }

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, period: selectedPeriod }),
      })

      if (response.ok) {
        fetchReports() // Refresh reports list
      } else {
        console.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const downloadReport = (report: ReportData) => {
    if (report.downloadUrl) {
      // In a real implementation, this would trigger a download
      console.log('Downloading report:', report.downloadUrl)
    }
  }

  const filteredReports = selectedType === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedType)

  const getStatusBadge = (status: string) => {
    const colors = {
      ready: 'bg-green-100 text-green-800',
      generating: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.ready
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      sales: ShoppingCart,
      inventory: Package,
      customer: Users,
      financial: DollarSign
    }
    const Icon = icons[type as keyof typeof icons] || FileText
    return <Icon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales Overview */}
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+{salesData.growthRate}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{salesData.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Order</p>
                  <p className="text-2xl font-bold">{formatCurrency(salesData.averageOrderValue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold">+{salesData.growthRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {salesData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => generateReport('sales')} className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales Report
            </Button>
            <Button onClick={() => generateReport('inventory')} variant="outline" className="flex-1">
              <Package className="w-4 h-4 mr-2" />
              Inventory Report
            </Button>
            <Button onClick={() => generateReport('customer')} variant="outline" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Customer Report
            </Button>
            <Button onClick={() => generateReport('financial')} variant="outline" className="flex-1">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generated Reports</CardTitle>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports found for the selected criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(report.type)}
                        <span className="font-medium">{report.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.period}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadge(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {report.status === 'ready' && report.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}