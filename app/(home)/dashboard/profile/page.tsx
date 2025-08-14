'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Edit3,
  Save,
  X,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  dateOfBirth: string
  role: string
  emailVerified: boolean
  createdAt: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData(data)
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
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

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border border-black/10 p-6 bg-white">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-black/5 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-black/5 w-48"></div>
                <div className="h-4 bg-black/5 w-32"></div>
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-black/5 w-24"></div>
                <div className="h-10 bg-black/5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-black/40" />
        <h3 className="mt-4 text-lg font-semibold text-black">Profile not found</h3>
        <p className="mt-2 text-black/60">Unable to load your profile information.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Admin Link for Admin Users */}
      {session?.user?.role === 'ADMIN' && (
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm" className="border-black/20 text-black hover:bg-black hover:text-white">
            <Link href="/admin" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      )}
      
      <div className="border border-black/10 p-6 bg-white">
        <div className="flex flex-row items-center justify-between mb-6">
          <div>
            <div className="flex items-center mb-2">
              <User className="mr-3 h-5 w-5 text-black" />
              <h1 className="font-semibold text-black text-sm tracking-wide uppercase">My Profile</h1>
            </div>
            <p className="text-black/60">Manage your account information</p>
          </div>
          <div className="flex space-x-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="border-black/20 text-black hover:bg-black hover:text-white"
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-black text-white hover:bg-black/90"
                >
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="border-black/20 text-black hover:bg-black hover:text-white"
              >
                <Edit3 className="mr-1 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="text-lg bg-black/10 text-black">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-black">{profile.name}</h2>
              <p className="text-black/60">{profile.email}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  profile.role === 'ADMIN' 
                    ? 'bg-black text-white' 
                    : 'bg-black/10 text-black'
                }`}>
                  <Shield className="mr-1 h-3 w-3 inline" />
                  {profile.role}
                </span>
                {profile.emailVerified && (
                  <span className="px-2 py-1 text-xs font-medium rounded border border-black/20 text-black">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-black/10" />

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black font-medium">Full Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <User className="mr-2 h-4 w-4 text-black/60" />
                  <span className="text-black">{profile.name || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-medium">Email Address</Label>
              <div className="flex items-center p-3 bg-black/5 border border-black/10">
                <Mail className="mr-2 h-4 w-4 text-black/60" />
                <span className="text-black">{profile.email}</span>
              </div>
              <p className="text-sm text-black/60">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-black font-medium">Phone Number</Label>
              {editing ? (
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <Phone className="mr-2 h-4 w-4 text-black/60" />
                  <span className="text-black">{profile.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-black font-medium">Date of Birth</Label>
              {editing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <Calendar className="mr-2 h-4 w-4 text-black/60" />
                  <span className="text-black">
                    {profile.dateOfBirth 
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-black font-medium">Address</Label>
              {editing ? (
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <MapPin className="mr-2 h-4 w-4 text-black/60" />
                  <span className="text-black">{profile.address || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-black font-medium">City</Label>
              {editing ? (
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter your city"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <span className="text-black">{profile.city || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-black font-medium">State/Province</Label>
              {editing ? (
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter your state/province"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <span className="text-black">{profile.state || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-black font-medium">ZIP/Postal Code</Label>
              {editing ? (
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Enter your ZIP/postal code"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <span className="text-black">{profile.zipCode || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-black font-medium">Country</Label>
              {editing ? (
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter your country"
                  className="border-black/20 focus:border-black focus:ring-0"
                />
              ) : (
                <div className="flex items-center p-3 bg-black/5 border border-black/10">
                  <span className="text-black">{profile.country || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-black/10 pt-6" />

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Member Since</Label>
                <p className="text-black/60">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-black font-medium">Account Status</Label>
                <p className="text-black/60">
                  {profile.emailVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}