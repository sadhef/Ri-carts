'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
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
import { GET_REVIEWS, DELETE_REVIEW, UPDATE_REVIEW } from '@/lib/graphql/queries'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Review {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
  }
  userId: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_REVIEWS, {
    variables: {
      page: 1,
      perPage: 50,
      filters: {
        ...(statusFilter !== 'all' && { isVerified: statusFilter === 'verified' }),
        ...(ratingFilter !== 'all' && { rating: parseInt(ratingFilter) })
      }
    },
    errorPolicy: 'all'
  })

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    onCompleted: () => {
      refetch()
      toast.success('Review deleted successfully')
    },
    onError: (error) => {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  })

  const [updateReview] = useMutation(UPDATE_REVIEW, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => {
      console.error('Error updating review:', error)
      toast.error('Failed to update review')
    }
  })

  const reviews = data?.reviews?.reviews || []
  const stats = {
    total: data?.reviews?.total || 0,
    verified: reviews.filter((r: Review) => r.isVerified).length,
    average: reviews.length > 0 ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length : 0,
    recent: reviews.filter((r: Review) => {
      const reviewDate = new Date(r.createdAt)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return reviewDate > weekAgo
    }).length
  }

  useEffect(() => {
    refetch()
  }, [statusFilter, ratingFilter, refetch])

  const handleViewReview = (review: Review) => {
    setSelectedReview(review)
    setShowDetailModal(true)
  }

  const handleDeleteReview = (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    deleteReview({
      variables: { id: reviewId }
    })
  }

  const handleToggleVerification = (reviewId: string, currentStatus: boolean) => {
    updateReview({
      variables: {
        id: reviewId,
        input: {
          isVerified: !currentStatus
        }
      }
    }).then(() => {
      toast.success(`Review ${!currentStatus ? 'verified' : 'unverified'} successfully`)
    })
  }

  const filteredReviews = reviews.filter((review: Review) => {
    const matchesSearch = 
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
                        <div>
                          <p className="font-medium">{review.product?.name}</p>
                          {review.product?.slug && (
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
                        <p className="font-medium">{review.user?.name}</p>
                        {review.user?.email && (
                          <p className="text-sm text-gray-500">{review.user.email}</p>
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
                  <div>
                    <p className="font-medium">{selectedReview.product?.name}</p>
                    {selectedReview.product?.slug && (
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
                  <p><span className="font-medium">Name:</span> {selectedReview.user?.name}</p>
                  {selectedReview.user?.email && (
                    <p><span className="font-medium">Email:</span> {selectedReview.user.email}</p>
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