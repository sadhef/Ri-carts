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
import { Search, Eye, Download, Truck, RotateCcw, Printer, Mail } from 'lucide-react'
import { OrderStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Order {
  id: string
  userId: string
  email: string
  status: OrderStatus
  total: number
  items: {
    id: string
    productName: string
    quantity: number
    price: number
  }[]
  createdAt: string
  customerName?: string
  trackingNumber?: string
  paymentMethod?: string
}

const statusColors = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchOrders() // Refresh orders
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const addTrackingNumber = async (orderId: string, trackingNum: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber: trackingNum }),
      })

      if (response.ok) {
        await updateOrderStatus(orderId, OrderStatus.SHIPPED)
        fetchOrders() // Refresh orders
        setShowTrackingModal(false)
        setTrackingNumber('')
      } else {
        console.error('Failed to add tracking number')
      }
    } catch (error) {
      console.error('Error adding tracking number:', error)
    }
  }

  const processRefund = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await updateOrderStatus(orderId, OrderStatus.REFUNDED)
        fetchOrders() // Refresh orders
        setShowRefundModal(false)
      } else {
        console.error('Failed to process refund')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
    }
  }

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank')
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice #${order.id.slice(-8)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total { font-weight: bold; text-align: right; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Order #${order.id.slice(-8)}</p>
          </div>
          <div class="order-info">
            <div>
              <h3>Customer:</h3>
              <p>${order.customerName || 'Guest'}</p>
              <p>${order.email}</p>
            </div>
            <div>
              <h3>Order Details:</h3>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Status: ${order.status}</p>
              ${order.trackingNumber ? `<p>Tracking: ${order.trackingNumber}</p>` : ''}
            </div>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <h3>Total: ${formatCurrency(order.total)}</h3>
          </div>
          <button class="no-print" onclick="window.print()">Print Invoice</button>
        </body>
      </html>
    `
    printWindow?.document.write(invoiceHtml)
    printWindow?.document.close()
  }

  const printPackingSlip = (order: Order) => {
    const printWindow = window.open('', '_blank')
    const packingSlipHtml = `
      <html>
        <head>
          <title>Packing Slip #${order.id.slice(-8)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #000; display: inline-block; margin-right: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PACKING SLIP</h1>
            <p>Order #${order.id.slice(-8)}</p>
          </div>
          <div class="order-info">
            <h3>Ship To:</h3>
            <p>${order.customerName || 'Guest'}</p>
            <p>${order.email}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            ${order.trackingNumber ? `<p>Tracking: ${order.trackingNumber}</p>` : ''}
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>✓</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td><span class="checkbox"></span></td>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>_________________</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p><strong>Special Instructions:</strong> _________________________________</p>
          <p><strong>Packed by:</strong> ________________ <strong>Date:</strong> ________________</p>
          <button class="no-print" onclick="window.print()">Print Packing Slip</button>
        </body>
      </html>
    `
    printWindow?.document.write(packingSlipHtml)
    printWindow?.document.close()
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === OrderStatus.PENDING).length}
            </div>
            <p className="text-gray-600 text-sm">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === OrderStatus.PROCESSING).length}
            </div>
            <p className="text-gray-600 text-sm">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === OrderStatus.DELIVERED).length}
            </div>
            <p className="text-gray-600 text-sm">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order ID, email, or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName || 'Guest'}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowDetailsModal(true)
                          }}
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => printInvoice(order)} title="Print Invoice">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => printPackingSlip(order)} title="Print Packing Slip">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrder(order)
                            setTrackingNumber(order.trackingNumber || '')
                            setShowTrackingModal(true)
                          }}
                          title="Add Tracking Number"
                          disabled={order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED}
                        >
                          <Truck className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowRefundModal(true)
                          }}
                          title="Process Refund"
                          disabled={order.status === OrderStatus.REFUNDED || order.status === OrderStatus.CANCELLED}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(OrderStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tracking Number Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Add Tracking Number for Order #{selectedOrder.id.slice(-8)}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tracking Number
                </label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => addTrackingNumber(selectedOrder.id, trackingNumber)}
                  disabled={!trackingNumber.trim()}
                >
                  Add Tracking & Ship Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTrackingModal(false)
                    setTrackingNumber('')
                    setSelectedOrder(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Process Refund for Order #{selectedOrder.id.slice(-8)}
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to process a refund for this order? 
                This action cannot be undone.
              </p>
              <div className="text-sm bg-gray-50 p-3 rounded">
                <p><strong>Customer:</strong> {selectedOrder.customerName || 'Guest'}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => processRefund(selectedOrder.id)}
                  variant="destructive"
                >
                  Process Refund
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false)
                    setSelectedOrder(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Order Details - #{selectedOrder.id.slice(-8)}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedOrder(null)
                }}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{selectedOrder.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="secondary" className={statusColors[selectedOrder.status]}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="capitalize">{selectedOrder.paymentMethod}</span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking:</span>
                        <span className="font-medium">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedOrder.customerName || 'Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer ID:</span>
                      <span className="font-mono text-xs">{selectedOrder.userId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Order Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.price)}</div>
                          <div className="text-xs text-gray-500">
                            Total: {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold text-lg">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => printInvoice(selectedOrder)}>
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline" onClick={() => printPackingSlip(selectedOrder)}>
                <Download className="w-4 h-4 mr-2" />
                Packing Slip
              </Button>
              {selectedOrder.status !== OrderStatus.DELIVERED && selectedOrder.status !== OrderStatus.CANCELLED && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setTrackingNumber(selectedOrder.trackingNumber || '')
                    setShowTrackingModal(true)
                  }}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Add Tracking
                </Button>
              )}
              {selectedOrder.status !== OrderStatus.REFUNDED && selectedOrder.status !== OrderStatus.CANCELLED && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowRefundModal(true)
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Process Refund
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}