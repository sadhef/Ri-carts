'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Search, Download, Eye, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName?: string
  customerEmail: string
  amount: number
  currency: string
  paymentMethod: string
  paymentGateway: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  transactionId?: string
  paymentIntentId?: string
  refundId?: string
  createdAt: string
  updatedAt: string
  failureReason?: string
  refundAmount?: number
  refundedAt?: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const paymentMethodIcons = {
  razorpay: CreditCard,
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        toast.error('Failed to fetch transactions')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Error fetching transactions')
    } finally {
      setLoading(false)
    }
  }

  const retryPayment = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${transactionId}/retry`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Payment retry initiated')
        fetchTransactions()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to retry payment')
      }
    } catch (error) {
      console.error('Error retrying payment:', error)
      toast.error('Failed to retry payment')
    }
  }

  const exportTransactions = () => {
    try {
      const headers = [
        'Transaction ID', 'Order Number', 'Customer', 'Amount', 'Currency', 
        'Payment Method', 'Status', 'Created At', 'Gateway'
      ]
      
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(transaction => [
          transaction.id,
          transaction.orderNumber,
          `"${transaction.customerName || 'Guest'}"`,
          transaction.amount,
          transaction.currency,
          transaction.paymentMethod,
          transaction.status,
          `"${new Date(transaction.createdAt).toLocaleDateString()}"`,
          transaction.paymentGateway
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Transactions exported successfully!')
    } catch (error) {
      console.error('Error exporting transactions:', error)
      toast.error('Failed to export transactions')
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.customerName && transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.transactionId && transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.paymentMethod === paymentMethodFilter
    
    const matchesDateRange = (() => {
      if (dateRange === 'all') return true
      const transactionDate = new Date(transaction.createdAt)
      const now = new Date()
      
      switch (dateRange) {
        case 'today':
          return transactionDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return transactionDate >= monthAgo
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange
  })

  const totalAmount = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalRefunded = filteredTransactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + (t.refundAmount || t.amount), 0)

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading transactions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportTransactions}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-gray-600 text-sm">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-gray-600 text-sm">Total Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalRefunded)}
            </div>
            <p className="text-gray-600 text-sm">Total Refunded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-gray-600 text-sm">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order, email, customer, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const PaymentIcon = paymentMethodIcons[transaction.paymentMethod as keyof typeof paymentMethodIcons] || CreditCard
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        #{transaction.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customerName || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                        {transaction.currency !== 'USD' && (
                          <span className="text-xs text-gray-500 ml-1">{transaction.currency}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <PaymentIcon className="w-4 h-4" />
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[transaction.status]}>
                          {transaction.status}
                        </Badge>
                        {transaction.status === 'failed' && transaction.failureReason && (
                          <div className="text-xs text-red-600 mt-1">{transaction.failureReason}</div>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{transaction.paymentGateway}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => alert('View transaction details')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {transaction.status === 'failed' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => retryPayment(transaction.id)}
                              title="Retry Payment"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}