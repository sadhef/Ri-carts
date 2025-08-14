'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Upload, Save, Store, Building2, FileText, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreSettings {
  // Store Identity
  storeName: string
  storeDescription: string
  storeLogo: string
  favicon: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  
  // Business Information
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  taxId: string
  vatNumber: string
  registrationNumber: string
  
  // Social Media
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  linkedinUrl: string
  
  // Legal Pages
  privacyPolicy: string
  termsOfService: string
  returnPolicy: string
  shippingPolicy: string
  
  // Payment Settings
  paymentMethods: {
    razorpay: boolean
  }
  currency: string
  
  // General Settings
  timezone: string
  language: string
  dateFormat: string
  
  createdAt?: string
  updatedAt?: string
}

const defaultSettings: StoreSettings = {
  storeName: '',
  storeDescription: '',
  storeLogo: '',
  favicon: '',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  businessName: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  taxId: '',
  vatNumber: '',
  registrationNumber: '',
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  privacyPolicy: '',
  termsOfService: '',
  returnPolicy: '',
  shippingPolicy: '',
  paymentMethods: {
    razorpay: true
  },
  currency: 'INR',
  timezone: 'UTC',
  language: 'en',
  dateFormat: 'MM/DD/YYYY'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('store')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      } else {
        // If no settings exist yet, use defaults
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateNestedSetting = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof StoreSettings],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store" className="flex items-center space-x-2">
            <Store className="w-4 h-4" />
            <span>Store Identity</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Business Info</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Legal Pages</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Payment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Identity & Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">Store Name *</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => updateSetting('storeName', e.target.value)}
                      placeholder="Your Store Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeEmail">Store Email *</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => updateSetting('storeEmail', e.target.value)}
                      placeholder="contact@yourstore.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={settings.storeDescription}
                    onChange={(e) => updateSetting('storeDescription', e.target.value)}
                    placeholder="Tell customers about your store..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input
                      id="storePhone"
                      value={settings.storePhone}
                      onChange={(e) => updateSetting('storePhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Textarea
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => updateSetting('storeAddress', e.target.value)}
                    placeholder="123 Main Street, City, State, ZIP Code, Country"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Store Logo</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        value={settings.storeLogo}
                        onChange={(e) => updateSetting('storeLogo', e.target.value)}
                        placeholder="Logo URL"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 200x60px</p>
                  </div>

                  <div>
                    <Label>Favicon</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        value={settings.favicon}
                        onChange={(e) => updateSetting('favicon', e.target.value)}
                        placeholder="Favicon URL"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 32x32px .ico file</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      value={settings.facebookUrl}
                      onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/yourstore"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      value={settings.twitterUrl}
                      onChange={(e) => updateSetting('twitterUrl', e.target.value)}
                      placeholder="https://twitter.com/yourstore"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      value={settings.instagramUrl}
                      onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/yourstore"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={settings.linkedinUrl}
                      onChange={(e) => updateSetting('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/company/yourstore"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business & Legal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.businessName}
                    onChange={(e) => updateSetting('businessName', e.target.value)}
                    placeholder="Your Business Legal Name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => updateSetting('businessEmail', e.target.value)}
                    placeholder="business@yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.businessAddress}
                  onChange={(e) => updateSetting('businessAddress', e.target.value)}
                  placeholder="Legal business address for invoicing and tax purposes"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    value={settings.taxId}
                    onChange={(e) => updateSetting('taxId', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={settings.vatNumber}
                    onChange={(e) => updateSetting('vatNumber', e.target.value)}
                    placeholder="GB123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={settings.registrationNumber}
                    onChange={(e) => updateSetting('registrationNumber', e.target.value)}
                    placeholder="Company registration number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  value={settings.businessPhone}
                  onChange={(e) => updateSetting('businessPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.privacyPolicy}
                  onChange={(e) => updateSetting('privacyPolicy', e.target.value)}
                  placeholder="Enter your privacy policy content..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be displayed on your privacy policy page. HTML is supported.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.termsOfService}
                  onChange={(e) => updateSetting('termsOfService', e.target.value)}
                  placeholder="Enter your terms of service content..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be displayed on your terms of service page. HTML is supported.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.returnPolicy}
                  onChange={(e) => updateSetting('returnPolicy', e.target.value)}
                  placeholder="Enter your return policy content..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be displayed on your return policy page. HTML is supported.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.shippingPolicy}
                  onChange={(e) => updateSetting('shippingPolicy', e.target.value)}
                  placeholder="Enter your shipping policy content..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be displayed on your shipping policy page. HTML is supported.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded bg-green-50">
                    <div>
                      <h4 className="font-medium">Razorpay</h4>
                      <p className="text-sm text-gray-500">Complete payment solution for India - Cards, UPI, Net Banking, Wallets & more</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.razorpay}
                      onChange={(e) => updateNestedSetting('paymentMethods', 'razorpay', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ✅ Razorpay is the only payment method enabled in this system. It supports all major payment methods in India.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Currency & Format Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}