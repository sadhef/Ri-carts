'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  Home,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Address {
  id: string
  type: 'HOME' | 'WORK' | 'OTHER'
  isDefault: boolean
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Address>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load addresses' }))
        toast.error(errorData.error || 'Failed to load addresses')
        setAddresses([])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error('Failed to load addresses')
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAdd = () => {
    setFormData({
      type: 'HOME',
      isDefault: false,
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    })
    setIsAdding(true)
  }

  const handleEdit = (address: Address) => {
    setFormData(address)
    setEditing(address.id)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || 
        !formData.address?.trim() || !formData.city?.trim() || 
        !formData.state?.trim() || !formData.zipCode?.trim() || 
        !formData.country?.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const url = isAdding ? '/api/user/addresses' : `/api/user/addresses/${editing}`
      const method = isAdding ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAddresses()
        setIsAdding(false)
        setEditing(null)
        setFormData({})
        toast.success(isAdding ? 'Address added successfully!' : 'Address updated successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save address' }))
        toast.error(errorData.error || 'Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({})
    setIsAdding(false)
    setEditing(null)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAddresses()
        toast.success('Address deleted successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete address' }))
        toast.error(errorData.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
      })

      if (response.ok) {
        await fetchAddresses()
        toast.success('Default address updated!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update default address' }))
        toast.error(errorData.error || 'Failed to update default address')
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      toast.error('Failed to update default address')
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'HOME': return Home
      case 'WORK': return Building2
      default: return MapPin
    }
  }

  const getAddressColor = (type: string) => {
    switch (type) {
      case 'HOME': return 'bg-blue-100 text-blue-800'
      case 'WORK': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              My Addresses
            </CardTitle>
            <p className="text-gray-600">Manage your shipping addresses</p>
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="mr-1 h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add New Address Form */}
        {isAdding && (
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-lg">Add New Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Address Type</Label>
                <Select value={formData.type || 'HOME'} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME">Home</SelectItem>
                    <SelectItem value="WORK">Work</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Cards */}
        {addresses.map((address) => {
          const Icon = getAddressIcon(address.type)
          const isEditing = editing === address.id

          return (
            <Card key={address.id} className={address.isDefault ? 'ring-2 ring-blue-500' : ''}>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Address Type</Label>
                      <Select value={formData.type || 'HOME'} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOME">Home</SelectItem>
                          <SelectItem value="WORK">Work</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state || ''}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode || ''}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={formData.country || ''}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save className="mr-1 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <Badge 
                          variant="secondary" 
                          className={getAddressColor(address.type)}
                        >
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(address)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                          disabled={address.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-gray-600">{address.address}</p>
                      <p className="text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-gray-600">{address.country}</p>
                      {address.phone && (
                        <p className="text-gray-600">{address.phone}</p>
                      )}
                    </div>

                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {addresses.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No addresses found</h3>
          <p className="mt-2 text-gray-600">Add your first shipping address to get started.</p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Add Address
          </Button>
        </div>
      )}
    </div>
  )
}