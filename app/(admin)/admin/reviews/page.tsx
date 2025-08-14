'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Search, MoreHorizontal, Eye, Trash2, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Review {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  comment: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface ReviewStats {
  total: number
  verified: number
  average: number
  recent: number
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ total: 0, verified: 0, average: 0, recent: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [statusFilter, ratingFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (ratingFilter !== 'all') {
        params.append('rating', ratingFilter)
      }

      const response = await fetch(`/api/admin/reviews?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      } else {
        toast.error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        const allReviews = data.reviews
        
        const total = allReviews.length
        const verified = allReviews.filter((r: Review) => r.isVerified).length
        const average = total > 0 ? allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / total : 0
        const recent = allReviews.filter((r: Review) => {
          const reviewDate = new Date(r.createdAt)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return reviewDate > weekAgo
        }).length

        setStats({ total, verified, average, recent })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleViewReview = async (review: Review) => {
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`)
      if (response.ok) {
        const detailData = await response.json()
        setSelectedReview(detailData)
        setShowDetailModal(true)
      } else {
        toast.error('Failed to load review details')
      }
    } catch (error) {
      console.error('Error fetching review details:', error)
      toast.error('Failed to load review details')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Review deleted successfully')
        fetchReviews()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  }

  const handleToggleVerification = async (reviewId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Review ${!currentStatus ? 'verified' : 'unverified'} successfully`)
        fetchReviews()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update review')
      }
    } catch (error) {
      console.error('Error updating review:', error)
      toast.error('Failed to update review')
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Reviews Management</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading reviews...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews Management</h1>
          <p className="text-gray-600">Monitor and manage customer reviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">From verified purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground fill-yellow-400 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-3 h-3',
                    star <= Math.round(stats.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">Past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews by product, customer, or comment..."
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
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full lg:w-[120px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No reviews found</p>
              <p className="text-sm">Reviews will appear here once customers start reviewing products</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {review.productImage && (
                          <div className="w-10 h-10 relative bg-gray-100 rounded">
                            <Image
                              src={review.productImage}
                              alt={review.productName}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{review.productName}</p>
                          {review.productSlug && (
                            <Link
                              href={`/products/${review.productId}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Product
                            </Link>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        {review.userEmail && (
                          <p className="text-sm text-gray-500">{review.userEmail}</p>
                        )}
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-4 h-4',
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                        <span className="ml-1 text-sm font-medium">
                          {review.rating}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {review.comment || 'No comment'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.isVerified ? "default" : "secondary"}>
                        {review.isVerified ? (
                          <>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewReview(review)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleVerification(review.id, review.isVerified)}
                          >
                            {review.isVerified ? (
                              <>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Mark as Unverified
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Mark as Verified
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Review Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedReview(null)
                }}
              >
                Close
              </Button>
            </div>

            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Product Information</h4>
                <div className="flex items-center space-x-4">
                  {selectedReview.productImage && (
                    <div className="w-16 h-16 relative bg-gray-200 rounded">
                      <Image
                        src={selectedReview.productImage}
                        alt={selectedReview.productName}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedReview.productName}</p>
                    {selectedReview.productSlug && (
                      <Link
                        href={`/products/${selectedReview.productId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Product Page
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedReview.userName}</p>
                  {selectedReview.userEmail && (
                    <p><span className="font-medium">Email:</span> {selectedReview.userEmail}</p>
                  )}
                  <div className="flex items-center">
                    <span className="font-medium">Status:</span> 
                    <Badge variant={selectedReview.isVerified ? "default" : "secondary"} className="ml-2">
                      {selectedReview.isVerified ? 'Verified Purchase' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Review Content</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Rating:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-5 h-5',
                            star <= selectedReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                      <span className="ml-2 font-medium">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Comment:</span>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {selectedReview.comment || 'No comment provided'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Created: {new Date(selectedReview.createdAt).toLocaleString()}</p>
                    {selectedReview.updatedAt !== selectedReview.createdAt && (
                      <p>Updated: {new Date(selectedReview.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleToggleVerification(selectedReview.id, selectedReview.isVerified)}
                  variant="outline"
                >
                  {selectedReview.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteReview(selectedReview.id)
                    setShowDetailModal(false)
                    setSelectedReview(null)
                  }}
                  variant="destructive"
                >
                  Delete Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}