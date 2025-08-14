'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsData {
  revenue: {
    total: number
    change: number
    trend: 'up' | 'down'
    chartData: Array<{ date: string; revenue: number }>
  }
  orders: {
    total: number
    change: number
    trend: 'up' | 'down'
    chartData: Array<{ date: string; orders: number }>
  }
  customers: {
    total: number
    change: number
    trend: 'up' | 'down'
    newCustomers: number
  }
  products: {
    total: number
    topSelling: Array<{ name: string; sales: number; revenue: number }>
    categories: Array<{ name: string; value: number }>
  }
  conversionRate: number
  averageOrderValue: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        console.error('Failed to fetch analytics')
        // Mock data for demonstration
        setAnalytics({
          revenue: {
            total: 45231.89,
            change: 20.1,
            trend: 'up',
            chartData: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
              revenue: Math.random() * 10000 + 5000
            }))
          },
          orders: {
            total: 156,
            change: 12.5,
            trend: 'up',
            chartData: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
              orders: Math.floor(Math.random() * 30 + 10)
            }))
          },
          customers: {
            total: 1234,
            change: 8.3,
            trend: 'up',
            newCustomers: 45
          },
          products: {
            total: 89,
            topSelling: [
              { name: 'Wireless Headphones', sales: 156, revenue: 23400 },
              { name: 'Smart Watch', sales: 134, revenue: 40200 },
              { name: 'Laptop Stand', sales: 98, revenue: 9800 },
              { name: 'Bluetooth Speaker', sales: 87, revenue: 8700 },
              { name: 'USB Cable', sales: 76, revenue: 1520 }
            ],
            categories: [
              { name: 'Electronics', value: 35 },
              { name: 'Accessories', value: 25 },
              { name: 'Clothing', value: 20 },
              { name: 'Home & Garden', value: 15 },
              { name: 'Sports', value: 5 }
            ]
          },
          conversionRate: 3.2,
          averageOrderValue: 290.2
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="text-center py-8 text-gray-500">
          Failed to load analytics data.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.revenue.total)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              {analytics.revenue.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={analytics.revenue.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {analytics.revenue.change}%
              </span>
              <span className="text-gray-500 ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.orders.total}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              {analytics.orders.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={analytics.orders.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {analytics.orders.change}%
              </span>
              <span className="text-gray-500 ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{analytics.customers.total}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-green-500">+{analytics.customers.newCustomers}</span>
              <span className="text-gray-500 ml-1">new customers</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold">{analytics.products.total}</p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-600">Avg. Order Value:</span>
              <span className="font-medium ml-1">{formatCurrency(analytics.averageOrderValue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenue.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.orders.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.products.topSelling}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.products.categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.products.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}