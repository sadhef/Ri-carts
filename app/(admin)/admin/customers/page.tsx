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
import { Search, Eye, Mail, Ban, CheckCircle, Download, Tag, Plus } from 'lucide-react'
import { Role } from '@/types'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  name?: string
  email: string
  role: Role
  emailVerified?: string
  createdAt: string
  lastLoginAt?: string
  orderCount: number
  totalSpent: number
  status: 'active' | 'inactive' | 'banned'
  tags?: string[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showTagModal, setShowTagModal] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [availableTags] = useState(['VIP', 'Wholesale', 'Premium', 'Regular', 'New Customer', 'Frequent Buyer'])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      } else {
        console.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCustomerStatus = async (customerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Customer status updated to ${newStatus}`)
        fetchCustomers() // Refresh customers
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update customer status')
      }
    } catch (error) {
      console.error('Error updating customer status:', error)
      toast.error('Failed to update customer status')
    }
  }

  const addCustomerTag = async (customerId: string, tag: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
      })

      if (response.ok) {
        toast.success(`Tag "${tag}" added to customer`)
        // Update the selected customer's tags immediately for better UX
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer({
            ...selectedCustomer,
            tags: [...(selectedCustomer.tags || []), tag]
          })
        }
        fetchCustomers() // Refresh customers
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add tag')
      }
    } catch (error) {
      console.error('Error adding customer tag:', error)
      toast.error('Failed to add tag')
    }
  }

  const removeCustomerTag = async (customerId: string, tag: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
      })

      if (response.ok) {
        toast.success(`Tag "${tag}" removed from customer`)
        // Update the selected customer's tags immediately for better UX
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer({
            ...selectedCustomer,
            tags: (selectedCustomer.tags || []).filter(t => t !== tag)
          })
        }
        fetchCustomers() // Refresh customers
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to remove tag')
      }
    } catch (error) {
      console.error('Error removing customer tag:', error)
      toast.error('Failed to remove tag')
    }
  }

  const handleViewCustomer = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`)
      if (response.ok) {
        const customerDetails = await response.json()
        // Create a detailed view modal or alert with customer information
        const details = `
Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${customerDetails.name || 'No Name'}
Email: ${customerDetails.email}
Role: ${customerDetails.role}
Status: ${customerDetails.status}
Email Verified: ${customerDetails.emailVerified ? 'Yes' : 'No'}
Orders: ${customerDetails.orderCount || 0}
Total Spent: ${formatCurrency(customerDetails.totalSpent || 0)}
Joined: ${new Date(customerDetails.createdAt).toLocaleDateString()}
${customerDetails.lastLoginAt ? `Last Login: ${new Date(customerDetails.lastLoginAt).toLocaleDateString()}` : ''}
${customerDetails.phone ? `Phone: ${customerDetails.phone}` : ''}
${customerDetails.address ? `Address: ${customerDetails.address}` : ''}
        `
        alert(details.trim())
      } else {
        toast.error('Failed to load customer details')
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      toast.error('Failed to load customer details')
    }
  }

  const handleEmailCustomer = (customer: Customer) => {
    // Create a mailto link
    const subject = encodeURIComponent('Hello from ' + (process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'))
    const body = encodeURIComponent(`Dear ${customer.name || 'Customer'},\n\n\n\nBest regards,\nThe Team`)
    const mailtoLink = `mailto:${customer.email}?subject=${subject}&body=${body}`
    
    // Open the default email client
    window.location.href = mailtoLink
  }

  const handleExportCustomers = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Role', 'Status', 'Orders', 'Total Spent', 'Joined', 'Email Verified']
      const csvContent = [
        headers.join(','),
        ...filteredCustomers.map(customer => [
          `"${customer.name || 'No Name'}"`,
          `"${customer.email}"`,
          customer.role,
          customer.status,
          customer.orderCount || 0,
          customer.totalSpent || 0,
          `"${new Date(customer.createdAt).toLocaleDateString()}"`,
          customer.emailVerified ? 'Yes' : 'No'
        ].join(','))
      ].join('\n')

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Customer data exported successfully!')
    } catch (error) {
      console.error('Error exporting customers:', error)
      toast.error('Failed to export customer data')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || customer.role === roleFilter
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      banned: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportCustomers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-gray-600 text-sm">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.status === 'active').length}
            </div>
            <p className="text-gray-600 text-sm">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.role === Role.ADMIN).length}
            </div>
            <p className="text-gray-600 text-sm">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
            </div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(Role).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No customers found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name || 'No Name'}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        {customer.emailVerified && (
                          <div className="flex items-center text-xs text-green-600 mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.role === Role.ADMIN ? "default" : "secondary"}>
                        {customer.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={`text-xs cursor-pointer hover:bg-red-50 ${
                                tag === 'VIP' ? 'border-purple-300 text-purple-700' :
                                tag === 'Wholesale' ? 'border-blue-300 text-blue-700' :
                                tag === 'Premium' ? 'border-green-300 text-green-700' :
                                'border-gray-300 text-gray-700'
                              }`}
                              onClick={() => removeCustomerTag(customer.id, tag)}
                              title="Click to remove tag"
                            >
                              {tag} ×
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadge(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.orderCount || 0}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalSpent || 0)}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEmailCustomer(customer)}>
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowTagModal(true)
                          }}
                          title="Manage Tags"
                        >
                          <Tag className="w-4 h-4" />
                        </Button>
                        <Select 
                          value={customer.status} 
                          onValueChange={(value) => updateCustomerStatus(customer.id, value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
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

      {/* Tag Management Modal */}
      {showTagModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Manage Tags for {selectedCustomer.name || selectedCustomer.email}
            </h3>
            <div className="space-y-4">
              {/* Current Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Current Tags:</label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded">
                  {selectedCustomer.tags && selectedCustomer.tags.length > 0 ? (
                    selectedCustomer.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-red-50"
                        onClick={() => removeCustomerTag(selectedCustomer.id, tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No tags assigned</span>
                  )}
                </div>
              </div>

              {/* Add New Tag */}
              <div>
                <label className="block text-sm font-medium mb-2">Add Tag:</label>
                <div className="flex space-x-2">
                  <Select 
                    value={newTag} 
                    onValueChange={setNewTag}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags
                        .filter(tag => !selectedCustomer.tags?.includes(tag))
                        .map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (newTag && !selectedCustomer.tags?.includes(newTag)) {
                        addCustomerTag(selectedCustomer.id, newTag)
                        setNewTag('')
                      }
                    }}
                    disabled={!newTag || selectedCustomer.tags?.includes(newTag)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Available Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Quick Add:</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter(tag => !selectedCustomer.tags?.includes(tag))
                    .map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => addCustomerTag(selectedCustomer.id, tag)}
                        className="text-xs"
                      >
                        + {tag}
                      </Button>
                    ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTagModal(false)
                    setSelectedCustomer(null)
                    setNewTag('')
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}