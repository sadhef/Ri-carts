'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DiscountType } from '@/types'
import toast from 'react-hot-toast'
import { 
  GET_COUPONS, 
  CREATE_COUPON, 
  UPDATE_COUPON, 
  DELETE_COUPON 
} from '@/lib/graphql/queries'

interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
}

export default function CouponsPage() {
  // GraphQL hooks
  const { data: couponsData, loading, refetch } = useQuery(GET_COUPONS, {
    onError: (error) => {
      console.error('Coupons query error:', error)
      toast.error('Failed to load coupons')
    }
  })
  const [createCouponMutation] = useMutation(CREATE_COUPON)
  const [updateCouponMutation] = useMutation(UPDATE_COUPON)
  const [deleteCouponMutation] = useMutation(DELETE_COUPON)
  
  // State for UI
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  
  const coupons = couponsData?.coupons || []
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    isActive: true,
    startDate: '',
    endDate: ''
  })


  const createCoupon = async () => {
    try {
      setIsCreating(true)
      
      // Basic validation
      if (!formData.code.trim() || !formData.name.trim()) {
        toast.error('Code and name are required')
        return
      }

      if (formData.discountType !== DiscountType.FREE_SHIPPING && (!formData.discountValue || parseFloat(formData.discountValue) <= 0)) {
        toast.error('Discount value must be greater than 0')
        return
      }

      if (formData.discountType === DiscountType.PERCENTAGE && parseFloat(formData.discountValue) > 100) {
        toast.error('Percentage discount cannot exceed 100%')
        return
      }
      
      // Prepare the data
      const couponInput = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        discountType: formData.discountType,
        discountValue: formData.discountType === DiscountType.FREE_SHIPPING ? 0 : parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        isActive: formData.isActive,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      }

      if (editingCoupon) {
        await updateCouponMutation({
          variables: {
            id: editingCoupon.id,
            input: couponInput
          }
        })
        toast.success('Coupon updated successfully!')
      } else {
        await createCouponMutation({
          variables: {
            input: couponInput
          }
        })
        toast.success('Coupon created successfully!')
      }
      
      setIsCreateDialogOpen(false)
      setEditingCoupon(null)
      resetForm()
      refetch()
    } catch (error: any) {
      console.error('Error creating coupon:', error)
      toast.error(error.message || 'Failed to create coupon')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: DiscountType.PERCENTAGE,
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      isActive: true,
      startDate: '',
      endDate: ''
    })
    setEditingCoupon(null)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    // Pre-fill the form with coupon data
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      isActive: coupon.isActive,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : ''
    })
    setEditingCoupon(coupon)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return
    }

    try {
      await deleteCouponMutation({
        variables: { id: couponId }
      })
      toast.success('Coupon deleted successfully!')
      refetch()
    } catch (error: any) {
      console.error('Error deleting coupon:', error)
      toast.error(error.message || 'Failed to delete coupon')
    }
  }

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const coupon = coupons.find(c => c.id === couponId)
      if (!coupon) return
      
      // Only send fields that are part of CouponInput
      const couponInput = {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimit,
        isActive,
        startDate: coupon.startDate,
        endDate: coupon.endDate
      }
      
      await updateCouponMutation({
        variables: {
          id: couponId,
          input: couponInput
        }
      })
      refetch()
    } catch (error: any) {
      console.error('Error updating coupon:', error)
      toast.error(error.message || 'Failed to update coupon status')
    }
  }

  const filteredCoupons = coupons.filter((coupon: any) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDiscountText = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case DiscountType.PERCENTAGE:
        return `${coupon.discountValue}% off`
      case DiscountType.FIXED_AMOUNT:
        return `${formatCurrency(coupon.discountValue)} off`
      case DiscountType.FREE_SHIPPING:
        return 'Free Shipping'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Coupon Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading coupons...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update the coupon details.' : 'Create a new discount coupon for your customers.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g. WELCOME10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Welcome Discount"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this coupon..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => setFormData({ ...formData, discountType: value as DiscountType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>Percentage</SelectItem>
                    <SelectItem value={DiscountType.FIXED_AMOUNT}>Fixed Amount</SelectItem>
                    <SelectItem value={DiscountType.FREE_SHIPPING}>Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === DiscountType.PERCENTAGE ? 'Percentage (%)' : 
                   formData.discountType === DiscountType.FIXED_AMOUNT ? 'Amount ($)' : 
                   'Value'} *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder={formData.discountType === DiscountType.PERCENTAGE ? "10" : "25.00"}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  disabled={formData.discountType === DiscountType.FREE_SHIPPING}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  placeholder="50.00"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Maximum Discount Amount ($)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  placeholder="100.00"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  disabled={formData.discountType !== DiscountType.PERCENTAGE}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createCoupon} disabled={isCreating || !formData.code || !formData.name}>
                {isCreating 
                  ? `${editingCoupon ? 'Updating' : 'Creating'}...` 
                  : `${editingCoupon ? 'Update' : 'Create'} Coupon`
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-gray-600 text-sm">Total Coupons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {coupons.filter((c: any) => c.isActive).length}
            </div>
            <p className="text-gray-600 text-sm">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {coupons.reduce((sum: number, c: any) => sum + c.usedCount, 0)}
            </div>
            <p className="text-gray-600 text-sm">Total Uses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(coupons.reduce((sum: number, c: any) => 
                sum + (c.discountType === DiscountType.FIXED_AMOUNT ? c.discountValue * c.usedCount : 0), 0
              ))}
            </div>
            <p className="text-gray-600 text-sm">Total Discount</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No coupons found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon: any) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{coupon.name}</div>
                        {coupon.description && (
                          <div className="text-sm text-gray-500">{coupon.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getDiscountText(coupon)}</div>
                      {coupon.minOrderAmount && (
                        <div className="text-sm text-gray-500">
                          Min order: {formatCurrency(coupon.minOrderAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                        </div>
                        <div className="text-sm text-gray-500">uses</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.endDate 
                        ? new Date(coupon.endDate).toLocaleDateString()
                        : 'No expiry'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCoupon(coupon)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon.id, !coupon.isActive)}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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