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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, MapPin, Truck, Package, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  states?: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface ShippingRate {
  id: string
  zoneId: string
  zoneName: string
  name: string
  description?: string
  method: 'flat_rate' | 'free' | 'weight_based' | 'order_total'
  cost: number
  minOrderAmount?: number
  maxOrderAmount?: number
  minWeight?: number
  maxWeight?: number
  estimatedDays: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const shippingMethods = [
  { value: 'flat_rate', label: 'Flat Rate' },
  { value: 'free', label: 'Free Shipping' },
  { value: 'weight_based', label: 'Weight Based' },
  { value: 'order_total', label: 'Based on Order Total' },
]

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('zones')
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)

  // Zone form data
  const [zoneForm, setZoneForm] = useState({
    name: '',
    countries: [''],
    states: [''],
    isDefault: false
  })

  // Rate form data
  const [rateForm, setRateForm] = useState({
    zoneId: '',
    name: '',
    description: '',
    method: 'flat_rate',
    cost: 0,
    minOrderAmount: '',
    maxOrderAmount: '',
    minWeight: '',
    maxWeight: '',
    estimatedDays: '3-5',
    isActive: true
  })

  useEffect(() => {
    fetchShippingData()
  }, [])

  const fetchShippingData = async () => {
    try {
      setLoading(true)
      const [zonesResponse, ratesResponse] = await Promise.all([
        fetch('/api/admin/shipping/zones'),
        fetch('/api/admin/shipping/rates')
      ])

      if (zonesResponse.ok) {
        const zonesData = await zonesResponse.json()
        setZones(zonesData)
      }

      if (ratesResponse.ok) {
        const ratesData = await ratesResponse.json()
        setRates(ratesData)
      }
    } catch (error) {
      console.error('Error fetching shipping data:', error)
      toast.error('Failed to load shipping data')
    } finally {
      setLoading(false)
    }
  }

  const saveZone = async () => {
    try {
      const method = editingZone ? 'PUT' : 'POST'
      const url = editingZone 
        ? `/api/admin/shipping/zones/${editingZone.id}`
        : '/api/admin/shipping/zones'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...zoneForm,
          countries: zoneForm.countries.filter(c => c.trim()),
          states: zoneForm.states.filter(s => s.trim()),
        }),
      })

      if (response.ok) {
        toast.success(`Zone ${editingZone ? 'updated' : 'created'} successfully`)
        setShowZoneModal(false)
        setEditingZone(null)
        setZoneForm({ name: '', countries: [''], states: [''], isDefault: false })
        fetchShippingData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save zone')
      }
    } catch (error) {
      console.error('Error saving zone:', error)
      toast.error('Failed to save zone')
    }
  }

  const deleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return

    try {
      const response = await fetch(`/api/admin/shipping/zones/${zoneId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Zone deleted successfully')
        fetchShippingData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete zone')
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      toast.error('Failed to delete zone')
    }
  }

  const saveRate = async () => {
    try {
      const method = editingRate ? 'PUT' : 'POST'
      const url = editingRate 
        ? `/api/admin/shipping/rates/${editingRate.id}`
        : '/api/admin/shipping/rates'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...rateForm,
          cost: parseFloat(rateForm.cost.toString()),
          minOrderAmount: rateForm.minOrderAmount ? parseFloat(rateForm.minOrderAmount) : null,
          maxOrderAmount: rateForm.maxOrderAmount ? parseFloat(rateForm.maxOrderAmount) : null,
          minWeight: rateForm.minWeight ? parseFloat(rateForm.minWeight) : null,
          maxWeight: rateForm.maxWeight ? parseFloat(rateForm.maxWeight) : null,
        }),
      })

      if (response.ok) {
        toast.success(`Rate ${editingRate ? 'updated' : 'created'} successfully`)
        setShowRateModal(false)
        setEditingRate(null)
        setRateForm({
          zoneId: '',
          name: '',
          description: '',
          method: 'flat_rate',
          cost: 0,
          minOrderAmount: '',
          maxOrderAmount: '',
          minWeight: '',
          maxWeight: '',
          estimatedDays: '3-5',
          isActive: true
        })
        fetchShippingData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save rate')
      }
    } catch (error) {
      console.error('Error saving rate:', error)
      toast.error('Failed to save rate')
    }
  }

  const deleteRate = async (rateId: string) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return

    try {
      const response = await fetch(`/api/admin/shipping/rates/${rateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Rate deleted successfully')
        fetchShippingData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete rate')
      }
    } catch (error) {
      console.error('Error deleting rate:', error)
      toast.error('Failed to delete rate')
    }
  }

  const printShippingLabel = (orderId: string) => {
    const printWindow = window.open('', '_blank')
    const labelHtml = `
      <html>
        <head>
          <title>Shipping Label</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label { border: 2px solid #000; padding: 20px; width: 4in; height: 6in; }
            .header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .section h4 { margin: 0 0 5px 0; font-size: 14px; }
            .barcode { text-align: center; font-family: 'Courier New', monospace; font-size: 24px; margin: 10px 0; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">SHIPPING LABEL</div>
            <div class="section">
              <h4>FROM:</h4>
              <div>Your Store Name</div>
              <div>123 Business Street</div>
              <div>City, State 12345</div>
            </div>
            <div class="section">
              <h4>TO:</h4>
              <div>[Customer Name]</div>
              <div>[Customer Address]</div>
              <div>[City, State ZIP]</div>
            </div>
            <div class="barcode">*${orderId}*</div>
            <div style="text-align: center; font-size: 12px;">Order: ${orderId}</div>
          </div>
          <button class="no-print" onclick="window.print()">Print Label</button>
        </body>
      </html>
    `
    printWindow?.document.write(labelHtml)
    printWindow?.document.close()
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Shipping Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading shipping data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shipping Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zones" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Shipping Zones</span>
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Shipping Rates</span>
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Shipping Labels</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipping Zones ({zones.length})</CardTitle>
                <Button
                  onClick={() => {
                    setZoneForm({ name: '', countries: [''], states: [''], isDefault: false })
                    setEditingZone(null)
                    setShowZoneModal(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {zones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No shipping zones configured. Create your first zone to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone Name</TableHead>
                      <TableHead>Countries</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell className="font-medium">
                          {zone.name}
                          {zone.isDefault && (
                            <Badge variant="secondary" className="ml-2">Default</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {zone.countries.slice(0, 3).join(', ')}
                            {zone.countries.length > 3 && (
                              <span className="text-gray-500"> +{zone.countries.length - 3} more</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(zone.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setZoneForm({
                                  name: zone.name,
                                  countries: zone.countries,
                                  states: zone.states || [''],
                                  isDefault: zone.isDefault
                                })
                                setEditingZone(zone)
                                setShowZoneModal(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteZone(zone.id)}
                              disabled={zone.isDefault}
                            >
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
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipping Rates ({rates.length})</CardTitle>
                <Button
                  onClick={() => {
                    setRateForm({
                      zoneId: '',
                      name: '',
                      description: '',
                      method: 'flat_rate',
                      cost: 0,
                      minOrderAmount: '',
                      maxOrderAmount: '',
                      minWeight: '',
                      maxWeight: '',
                      estimatedDays: '3-5',
                      isActive: true
                    })
                    setEditingRate(null)
                    setShowRateModal(true)
                  }}
                  disabled={zones.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {zones.length === 0 
                    ? 'Create shipping zones first before adding rates.'
                    : 'No shipping rates configured. Create your first rate to get started.'
                  }
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rate Name</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.name}</TableCell>
                        <TableCell>{rate.zoneName}</TableCell>
                        <TableCell className="capitalize">
                          {rate.method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {rate.method === 'free' ? 'Free' : formatCurrency(rate.cost)}
                        </TableCell>
                        <TableCell>{rate.estimatedDays} days</TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={rate.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                            }
                          >
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRateForm({
                                  zoneId: rate.zoneId,
                                  name: rate.name,
                                  description: rate.description || '',
                                  method: rate.method,
                                  cost: rate.cost,
                                  minOrderAmount: rate.minOrderAmount?.toString() || '',
                                  maxOrderAmount: rate.maxOrderAmount?.toString() || '',
                                  minWeight: rate.minWeight?.toString() || '',
                                  maxWeight: rate.maxWeight?.toString() || '',
                                  estimatedDays: rate.estimatedDays,
                                  isActive: rate.isActive
                                })
                                setEditingRate(rate)
                                setShowRateModal(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRate(rate.id)}
                            >
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
        </TabsContent>

        <TabsContent value="labels">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Label Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Generate Shipping Labels</h3>
                  <p className="text-gray-500 mb-4">
                    Print shipping labels for your orders. Labels will include sender and recipient information with tracking barcodes.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Input 
                      placeholder="Enter Order ID" 
                      className="max-w-xs"
                      id="orderIdInput"
                    />
                    <Button 
                      onClick={() => {
                        const input = document.getElementById('orderIdInput') as HTMLInputElement
                        if (input?.value) {
                          printShippingLabel(input.value)
                        } else {
                          toast.error('Please enter an order ID')
                        }
                      }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Label
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Future Integrations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 opacity-50">
                      <h5 className="font-medium">DHL Integration</h5>
                      <p className="text-sm text-gray-500">Coming Soon</p>
                    </Card>
                    <Card className="p-4 opacity-50">
                      <h5 className="font-medium">FedEx Integration</h5>
                      <p className="text-sm text-gray-500">Coming Soon</p>
                    </Card>
                    <Card className="p-4 opacity-50">
                      <h5 className="font-medium">Aramex Integration</h5>
                      <p className="text-sm text-gray-500">Coming Soon</p>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingZone ? 'Edit Zone' : 'Create Zone'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Zone Name</label>
                <Input
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                  placeholder="e.g., United States, Europe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Countries</label>
                {zoneForm.countries.map((country, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <Input
                      value={country}
                      onChange={(e) => {
                        const newCountries = [...zoneForm.countries]
                        newCountries[index] = e.target.value
                        setZoneForm({ ...zoneForm, countries: newCountries })
                      }}
                      placeholder="Country name or code"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCountries = zoneForm.countries.filter((_, i) => i !== index)
                        setZoneForm({ ...zoneForm, countries: newCountries })
                      }}
                      disabled={zoneForm.countries.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoneForm({ ...zoneForm, countries: [...zoneForm.countries, ''] })}
                >
                  Add Country
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="defaultZone"
                  checked={zoneForm.isDefault}
                  onChange={(e) => setZoneForm({ ...zoneForm, isDefault: e.target.checked })}
                />
                <label htmlFor="defaultZone" className="text-sm">Set as default zone</label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={saveZone} disabled={!zoneForm.name.trim()}>
                  {editingZone ? 'Update' : 'Create'} Zone
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowZoneModal(false)
                    setEditingZone(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingRate ? 'Edit Rate' : 'Create Rate'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Zone</label>
                <Select value={rateForm.zoneId} onValueChange={(value) => setRateForm({ ...rateForm, zoneId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rate Name</label>
                <Input
                  value={rateForm.name}
                  onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                  placeholder="e.g., Standard Shipping, Express"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shipping Method</label>
                <Select value={rateForm.method} onValueChange={(value) => setRateForm({ ...rateForm, method: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cost</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={rateForm.cost}
                    onChange={(e) => setRateForm({ ...rateForm, cost: parseFloat(e.target.value) || 0 })}
                    disabled={rateForm.method === 'free'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Days</label>
                  <Input
                    value={rateForm.estimatedDays}
                    onChange={(e) => setRateForm({ ...rateForm, estimatedDays: e.target.value })}
                    placeholder="3-5"
                  />
                </div>
              </div>

              {rateForm.method === 'order_total' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Order Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={rateForm.minOrderAmount}
                      onChange={(e) => setRateForm({ ...rateForm, minOrderAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Order Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={rateForm.maxOrderAmount}
                      onChange={(e) => setRateForm({ ...rateForm, maxOrderAmount: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {rateForm.method === 'weight_based' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Weight (kg)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rateForm.minWeight}
                      onChange={(e) => setRateForm({ ...rateForm, minWeight: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Weight (kg)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rateForm.maxWeight}
                      onChange={(e) => setRateForm({ ...rateForm, maxWeight: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Input
                  value={rateForm.description}
                  onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
                  placeholder="Additional details about this shipping option"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activeRate"
                  checked={rateForm.isActive}
                  onChange={(e) => setRateForm({ ...rateForm, isActive: e.target.checked })}
                />
                <label htmlFor="activeRate" className="text-sm">Active</label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={saveRate} 
                  disabled={!rateForm.name.trim() || !rateForm.zoneId}
                >
                  {editingRate ? 'Update' : 'Create'} Rate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRateModal(false)
                    setEditingRate(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}