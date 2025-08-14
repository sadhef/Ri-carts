'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ReviewForm } from './review-form'
import { ReviewsList } from './reviews-list'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'

interface ReviewsSectionProps {
  productId: string
  productName: string
  averageRating: number
  totalReviews: number
  userCanReview?: boolean
  userOrderId?: string
}

export function ReviewsSection({
  productId,
  productName,
  averageRating,
  totalReviews,
  userCanReview = false,
  userOrderId
}: ReviewsSectionProps) {
  const { data: session } = useSession()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
        </div>
        
        {/* Write Review Button */}
        {session && userCanReview && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            <Star className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Login Prompt */}
      {!session && (
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in to write a review
            </h3>
            <p className="text-gray-600 mb-4">
              Share your experience with this product and help other customers make informed decisions.
            </p>
            <Button variant="outline">
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          orderId={userOrderId}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Purchase Required Message */}
      {session && !userCanReview && !showReviewForm && (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Purchase required to review
            </h3>
            <p className="text-gray-600">
              You can only review products that you have purchased and received.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <ReviewsList
        productId={productId}
        averageRating={averageRating}
        totalReviews={totalReviews}
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}