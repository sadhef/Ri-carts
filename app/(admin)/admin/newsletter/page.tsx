'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Mail, 
  Send, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  GET_NEWSLETTER_SUBSCRIBERS,
  GET_NEWSLETTER_CAMPAIGNS,
  GET_NEWSLETTER_STATS,
  CREATE_NEWSLETTER_CAMPAIGN,
  DELETE_NEWSLETTER_CAMPAIGN,
  CREATE_NEWSLETTER_SUBSCRIBER,
  UPDATE_NEWSLETTER_SUBSCRIBER,
  DELETE_NEWSLETTER_SUBSCRIBER
} from '@/lib/graphql/queries'

interface Subscriber {
  id: string
  email: string
  name?: string
  subscribed: boolean
  subscribedAt: string
  tags: string[]
  source: 'website' | 'checkout' | 'import' | 'manual'
}

interface Newsletter {
  id: string
  subject: string
  content: string
  status: 'draft' | 'scheduled' | 'sent' | 'sending'
  recipientCount: number
  openRate?: number
  clickRate?: number
  sentAt?: string
  scheduledAt?: string
  createdAt: string
}

interface NewsletterStats {
  totalSubscribers: number
  activeSubscribers: number
  unsubscribeRate: number
  averageOpenRate: number
  averageClickRate: number
  recentGrowth: number
}

export default function NewsletterPage() {
  // GraphQL queries
  const { data: subscribersData, loading: subscribersLoading, refetch: refetchSubscribers } = useQuery(GET_NEWSLETTER_SUBSCRIBERS)
  const { data: campaignsData, loading: campaignsLoading, refetch: refetchCampaigns } = useQuery(GET_NEWSLETTER_CAMPAIGNS)
  const { data: statsData, loading: statsLoading } = useQuery(GET_NEWSLETTER_STATS)
  
  // GraphQL mutations
  const [createCampaign] = useMutation(CREATE_NEWSLETTER_CAMPAIGN)
  const [deleteCampaign] = useMutation(DELETE_NEWSLETTER_CAMPAIGN)
  const [createSubscriber] = useMutation(CREATE_NEWSLETTER_SUBSCRIBER, {
    onCompleted: (data) => {
      console.log('Newsletter subscriber created:', data)
    },
    onError: (error) => {
      console.error('Newsletter subscriber creation error:', error)
    }
  })
  const [updateSubscriber] = useMutation(UPDATE_NEWSLETTER_SUBSCRIBER)
  const [deleteSubscriber] = useMutation(DELETE_NEWSLETTER_SUBSCRIBER)
  
  const subscribers = subscribersData?.newsletterSubscribers || []
  const newsletters = campaignsData?.newsletterCampaigns || []
  const stats = statsData?.newsletterStats || null
  const loading = subscribersLoading || campaignsLoading || statsLoading
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isAddSubscriberOpen, setIsAddSubscriberOpen] = useState(false)
  const [isEditSubscriberOpen, setIsEditSubscriberOpen] = useState(false)
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null)

  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    content: '',
    scheduledAt: ''
  })

  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    name: ''
  })

  const [editSubscriber, setEditSubscriber] = useState({
    email: '',
    name: ''
  })

  // Data fetching is now handled by Apollo Client useQuery hooks

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.subject.trim() || !newNewsletter.content.trim()) {
      toast.error('Please fill in both subject and content')
      return
    }

    try {
      await createCampaign({
        variables: {
          input: {
            subject: newNewsletter.subject,
            content: newNewsletter.content,
            scheduledAt: newNewsletter.scheduledAt || undefined
          }
        }
      })
      toast.success('Newsletter campaign created successfully!')
      setIsComposerOpen(false)
      setNewNewsletter({ subject: '', content: '', scheduledAt: '' })
      refetchCampaigns()
    } catch (error) {
      console.error('Error creating newsletter:', error)
      toast.error('Failed to create campaign')
    }
  }

  const handleUnsubscribe = async (subscriberId: string) => {
    try {
      await updateSubscriber({
        variables: {
          id: subscriberId,
          input: { isActive: false }
        }
      })
      toast.success('Subscriber unsubscribed successfully')
      refetchSubscribers()
    } catch (error) {
      console.error('Error updating subscriber:', error)
      toast.error('Failed to unsubscribe user')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return
    }

    try {
      await deleteCampaign({
        variables: { id: campaignId }
      })
      toast.success('Campaign deleted successfully!')
      refetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const handleViewCampaign = (campaign: Newsletter) => {
    // Create a modal or navigate to view campaign
    alert(`Subject: ${campaign.subject}\n\nContent:\n${campaign.content}`)
  }

  const handleEditCampaign = (campaign: Newsletter) => {
    // Pre-fill the composer with campaign data
    setNewNewsletter({
      subject: campaign.subject,
      content: campaign.content,
      scheduledAt: campaign.scheduledAt || ''
    })
    setIsComposerOpen(true)
  }

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newSubscriber.email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      const result = await createSubscriber({
        variables: {
          input: {
            email: newSubscriber.email.trim(),
            name: newSubscriber.name ? newSubscriber.name.trim() : undefined
          }
        }
      })
      
      console.log('Subscriber creation result:', result)
      toast.success('Subscriber added successfully!')
      setIsAddSubscriberOpen(false)
      setNewSubscriber({ email: '', name: '' })
      
      // Refetch subscribers with error handling
      try {
        await refetchSubscribers()
      } catch (refetchError) {
        console.error('Error refetching subscribers:', refetchError)
        // Don't show error to user as the subscriber was still created successfully
      }
    } catch (error: any) {
      console.error('Error adding subscriber:', error)
      
      // Handle specific GraphQL errors
      const errorMessage = error?.graphQLErrors?.[0]?.message || 
                          error?.networkError?.message || 
                          error?.message ||
                          'Failed to add subscriber'
      
      toast.error(errorMessage)
    }
  }

  const handleEditSubscriberClick = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber)
    setEditSubscriber({
      email: subscriber.email,
      name: subscriber.name || ''
    })
    setIsEditSubscriberOpen(true)
  }

  const handleUpdateSubscriber = async () => {
    if (!editingSubscriber) return

    try {
      await updateSubscriber({
        variables: {
          id: editingSubscriber.id,
          input: { name: editSubscriber.name }
        }
      })
      toast.success('Subscriber updated successfully!')
      setIsEditSubscriberOpen(false)
      setEditingSubscriber(null)
      setEditSubscriber({ email: '', name: '' })
      refetchSubscribers()
    } catch (error) {
      console.error('Error updating subscriber:', error)
      toast.error('Failed to update subscriber')
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return
    }

    try {
      await deleteSubscriber({
        variables: { id: subscriberId }
      })
      toast.success('Subscriber deleted successfully!')
      refetchSubscribers()
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      toast.error('Failed to delete subscriber')
    }
  }

  const filteredSubscribers = subscribers.filter((subscriber: any) => {
    const matchesSearch = 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && subscriber.isActive) ||
      (statusFilter === 'inactive' && !subscriber.isActive)
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getSourceBadge = (source: string) => {
    const colors = {
      website: 'bg-blue-100 text-blue-800',
      checkout: 'bg-green-100 text-green-800',
      import: 'bg-purple-100 text-purple-800',
      manual: 'bg-orange-100 text-orange-800',
    }
    return colors[source as keyof typeof colors] || colors.website
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Newsletter Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading newsletter data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Newsletter Management</h1>
        <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Newsletter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Newsletter</DialogTitle>
              <DialogDescription>
                Compose and schedule your newsletter campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={newNewsletter.subject}
                  onChange={(e) => setNewNewsletter({...newNewsletter, subject: e.target.value})}
                  placeholder="Enter newsletter subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter({...newNewsletter, content: e.target.value})}
                  placeholder="Write your newsletter content..."
                  rows={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Schedule (Optional)</label>
                <Input
                  type="datetime-local"
                  value={newNewsletter.scheduledAt}
                  onChange={(e) => setNewNewsletter({...newNewsletter, scheduledAt: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsComposerOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewsletter}>
                  <Send className="w-4 h-4 mr-2" />
                  Create & Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Subscribers</p>
                  <p className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.activeSubscribers.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth</p>
                  <p className="text-2xl font-bold">+{stats.recentGrowth}%</p>
                </div>
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold">{stats.averageOpenRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-bold">{stats.averageClickRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Unsubscribe Rate</p>
                <p className="text-2xl font-bold">{stats.unsubscribeRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Newsletter Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="font-medium">
                    {newsletter.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadge(newsletter.status)}>
                      {newsletter.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{newsletter.recipientCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {newsletter.openRate ? `${newsletter.openRate}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {newsletter.clickRate ? `${newsletter.clickRate}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {newsletter.sentAt 
                      ? new Date(newsletter.sentAt).toLocaleDateString()
                      : newsletter.scheduledAt
                      ? `Scheduled: ${new Date(newsletter.scheduledAt).toLocaleDateString()}`
                      : 'Draft'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCampaign(newsletter)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {newsletter.status === 'draft' && (
                        <Button variant="outline" size="sm" onClick={() => handleEditCampaign(newsletter)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCampaign(newsletter.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscribers Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddSubscriberOpen} onOpenChange={setIsAddSubscriberOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscriber
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subscriber</DialogTitle>
                  <DialogDescription>
                    Add a new subscriber to your newsletter.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={newSubscriber.email}
                      onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})}
                      placeholder="Enter email address..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name (Optional)</label>
                    <Input
                      value={newSubscriber.name}
                      onChange={(e) => setNewSubscriber({...newSubscriber, name: e.target.value})}
                      placeholder="Enter subscriber name..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddSubscriberOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubscriber}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subscriber
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isEditSubscriberOpen} onOpenChange={setIsEditSubscriberOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Subscriber</DialogTitle>
                  <DialogDescription>
                    Update subscriber information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={editSubscriber.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={editSubscriber.name}
                      onChange={(e) => setEditSubscriber({...editSubscriber, name: e.target.value})}
                      placeholder="Enter subscriber name..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditSubscriberOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateSubscriber}>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Subscriber
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">
                    {subscriber.email}
                  </TableCell>
                  <TableCell>{subscriber.name || '-'}</TableCell>
                  <TableCell>
                    {subscriber.isActive ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Unsubscribed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getSourceBadge(subscriber.source)}>
                      {subscriber.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSubscriberClick(subscriber)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {subscriber.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUnsubscribe(subscriber.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}