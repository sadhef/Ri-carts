'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Mail, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  shippingAddress: any
  items: any[]
  createdAt: string
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrderDetails(data)
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded-full mx-auto w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Details</span>
              {orderDetails && (
                <Badge variant="secondary">
                  {orderDetails.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderDetails ? (
              <>
                {/* Order Number & Total */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold text-lg">{orderDetails.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-2xl">${orderDetails.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {orderDetails.items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {orderDetails.shippingAddress && (
                  <div>
                    <h3 className="font-semibold mb-3">Shipping Address</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                      </p>
                      <p>{orderDetails.shippingAddress.address}</p>
                      <p>
                        {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                      </p>
                      <p>{orderDetails.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Order details will be available shortly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Order Confirmation Email</h4>
                <p className="text-sm text-gray-600">
                  You'll receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Order Processing</h4>
                <p className="text-sm text-gray-600">
                  We'll prepare your order for shipping within 1-2 business days.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Shipping Updates</h4>
                <p className="text-sm text-gray-600">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard/orders" className="flex-1">
            <Button className="w-full">
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help with your order?
          </p>
          <Link href="/contact" className="text-blue-600 hover:underline text-sm">
            Contact Customer Support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded-full mx-auto w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}