'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReviewFormProps {
  productId: string
  productName: string
  orderId?: string
  onReviewSubmitted: () => void
  onCancel?: () => void
}

export function ReviewForm({ 
  productId, 
  productName, 
  orderId, 
  onReviewSubmitted, 
  onCancel 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          orderId
        })
      })

      if (response.ok) {
        toast.success('Review submitted successfully!')
        setRating(0)
        setComment('')
        onReviewSubmitted()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <p className="text-sm text-gray-600">Share your experience with {productName}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <Label className="text-base font-medium">Rating *</Label>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? 's' : ''} - 
                    {rating === 1 && ' Poor'}
                    {rating === 2 && ' Fair'}
                    {rating === 3 && ' Good'}
                    {rating === 4 && ' Very Good'}
                    {rating === 5 && ' Excellent'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-base font-medium">
              Your Review (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 min-h-[120px]"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Share your honest opinion to help other customers
              </p>
              <span className="text-xs text-gray-400">
                {comment.length}/1000
              </span>
            </div>
          </div>

          {orderId && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Verified Purchase - You purchased this product
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}