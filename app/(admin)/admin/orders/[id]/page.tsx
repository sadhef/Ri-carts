'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Package, CreditCard, MapPin, User } from 'lucide-react'
import { OrderStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { GET_ORDER } from '@/lib/graphql/queries'

interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  sku: string
}

interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  totalAmount: number
  subtotal: number
  shippingCost: number
  taxAmount: number
  items: OrderItem[]
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
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

const statusColors = {
  [OrderStatus.PENDING]: { backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-dark-text)' },
  [OrderStatus.PROCESSING]: { backgroundColor: 'var(--rr-pure-black)', color: 'var(--rr-light-bg)' },
  [OrderStatus.SHIPPED]: { backgroundColor: 'var(--rr-dark-text)', color: 'var(--rr-light-bg)' },
  [OrderStatus.DELIVERED]: { backgroundColor: 'var(--rr-pure-black)', color: 'var(--rr-light-bg)' },
  [OrderStatus.CANCELLED]: { backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-dark-text)' },
  [OrderStatus.REFUNDED]: { backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-dark-text)' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
    onError: (error) => {
      console.error('Error fetching order:', error)
    }
  })

  const order = data?.order

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="hover:opacity-70"
            style={{ color: 'var(--rr-pure-black)' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="rr-body" style={{ color: 'var(--rr-medium-gray)' }}>
            {error?.message || 'Order not found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="hover:opacity-70"
            style={{ color: 'var(--rr-pure-black)' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="rr-heading-lg" style={{ color: 'var(--rr-pure-black)' }}>
              Order #{order.orderNumber}
            </h1>
            <p className="rr-body" style={{ color: 'var(--rr-dark-text)' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <Badge
          className="rr-label"
          style={statusColors[order.status]}
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <CardHeader>
              <CardTitle className="rr-label flex items-center gap-2" style={{ color: 'var(--rr-dark-text)' }}>
                <Package className="h-4 w-4" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4" style={{ border: '1px solid var(--rr-light-gray)' }}>
                  <div className="h-16 w-16 rounded overflow-hidden" style={{ backgroundColor: 'var(--rr-light-gray)' }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="rr-body font-medium" style={{ color: 'var(--rr-pure-black)' }}>
                      {item.name}
                    </h4>
                    <p className="rr-body-sm" style={{ color: 'var(--rr-dark-text)' }}>
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="rr-body-sm" style={{ color: 'var(--rr-dark-text)' }}>
                      Qty: {item.quantity}
                    </p>
                    <p className="rr-body font-medium" style={{ color: 'var(--rr-pure-black)' }}>
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <CardHeader>
              <CardTitle className="rr-label" style={{ color: 'var(--rr-dark-text)' }}>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="rr-body" style={{ color: 'var(--rr-dark-text)' }}>Subtotal</span>
                <span className="rr-body" style={{ color: 'var(--rr-pure-black)' }}>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="rr-body" style={{ color: 'var(--rr-dark-text)' }}>Shipping</span>
                <span className="rr-body" style={{ color: 'var(--rr-pure-black)' }}>{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="rr-body" style={{ color: 'var(--rr-dark-text)' }}>Tax</span>
                <span className="rr-body" style={{ color: 'var(--rr-pure-black)' }}>{formatCurrency(order.taxAmount)}</span>
              </div>
              <Separator style={{ backgroundColor: 'var(--rr-light-gray)' }} />
              <div className="flex justify-between">
                <span className="rr-body font-medium" style={{ color: 'var(--rr-pure-black)' }}>Total</span>
                <span className="rr-body font-medium" style={{ color: 'var(--rr-pure-black)' }}>{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <CardHeader>
              <CardTitle className="rr-label flex items-center gap-2" style={{ color: 'var(--rr-dark-text)' }}>
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="rr-body font-medium" style={{ color: 'var(--rr-pure-black)' }}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="rr-body-sm" style={{ color: 'var(--rr-dark-text)' }}>
                  {order.shippingAddress.email}
                </p>
                <p className="rr-body-sm" style={{ color: 'var(--rr-dark-text)' }}>
                  {order.shippingAddress.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <CardHeader>
              <CardTitle className="rr-label flex items-center gap-2" style={{ color: 'var(--rr-dark-text)' }}>
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rr-body-sm space-y-1" style={{ color: 'var(--rr-dark-text)' }}>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
            <CardHeader>
              <CardTitle className="rr-label flex items-center gap-2" style={{ color: 'var(--rr-dark-text)' }}>
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rr-body" style={{ color: 'var(--rr-pure-black)' }}>
                {order.paymentMethod.type}
                {order.paymentMethod.lastFourDigits && ` •••• ${order.paymentMethod.lastFourDigits}`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}