'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { GET_ORDER } from '@/lib/graphql/queries'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  subtotal: number
  shippingCost: number
  taxAmount: number
  savings: number
  createdAt: string
  items: Array<{
    productId: string
    name: string
    price: number
    comparePrice?: number
    quantity: number
    image: string
    sku: string
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: {
    type: string
    lastFourDigits?: string
  }
  shippingMethod: string
  orderNotes?: string
  trackingNumber?: string
}

const statusIcons = {
  PENDING: Clock,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusSteps = [
  { status: 'PENDING', label: 'Order Placed', description: 'Your order has been received' },
  { status: 'PROCESSING', label: 'Processing', description: 'We are preparing your order' },
  { status: 'SHIPPED', label: 'Shipped', description: 'Your order is on the way' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Your order has been delivered' }
]

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const orderId = params.orderId as string

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
    onError: (error) => {
      console.error('Failed to fetch order:', error)
      router.push('/dashboard/orders')
    },
  })

  const order = data?.order

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Order not found</h3>
        <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
        <Link href="/dashboard/orders">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package
  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Order Details</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
        </div>
        <Badge 
          variant="secondary" 
          className={`${statusColors[order.status as keyof typeof statusColors]} text-sm px-3 py-1`}
        >
          <StatusIcon className="mr-1 h-4 w-4" />
          {order.status}
        </Badge>
      </div>

      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              const StepIcon = statusIcons[step.status as keyof typeof statusIcons]
              
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`absolute top-5 w-full h-0.5 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`} style={{ 
                      left: '50%', 
                      width: `${100 / (statusSteps.length - 1)}%`,
                      marginLeft: '25%'
                    }} />
                  )}
                </div>
              )
            })}
          </div>
          
          {order.trackingNumber && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Tracking Information</h4>
              <p className="text-blue-700">Tracking Number: {order.trackingNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.productId.startsWith('cart_') ? (
                        <span className="font-medium truncate text-gray-600">
                          {item.name}
                        </span>
                      ) : (
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-medium truncate hover:text-blue-600"
                        >
                          {item.name}
                        </Link>
                      )}
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="font-semibold">${item.price.toFixed(2)}</span>
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${item.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {(order.status === 'DELIVERED' || order.status === 'SHIPPED') && !item.productId.startsWith('cart_') && (
                        <Link href={`/products/${item.productId}#reviews`}>
                          <Button size="sm" variant="outline" className="mt-2">
                            <Star className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Phone: {order.shippingAddress.phone}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {order.shippingAddress.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Payment */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Razorpay - Secure Payment Gateway</p>
                <Badge variant="outline" className="mt-2">
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              
              {order.savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You saved</span>
                  <span>-${order.savings.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="pt-3 text-xs text-gray-500 space-y-1">
                <p>Order Date: {format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                <p>Shipping Method: {order.shippingMethod}</p>
                {order.orderNotes && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Order Notes:</p>
                    <p className="text-sm">{order.orderNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}