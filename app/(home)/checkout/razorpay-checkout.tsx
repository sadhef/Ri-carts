'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { CreditCard, Truck, Package, ArrowLeft, Check, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/store/use-cart'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ShippingAddress {
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

interface RazorpayOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  key: string
  orderId: string
  customerName: string
  customerEmail: string
}

export default function RazorpayCheckout() {
  const { data: session } = useSession()
  const router = useRouter()
  const cart = useCart()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN'
  })

  const [saveAddress, setSaveAddress] = useState(true)
  const [orderNotes, setOrderNotes] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 50, days: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 150, days: '2-3 business days' },
    { id: 'overnight', name: 'Overnight Shipping', price: 300, days: '1 business day' }
  ]

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => setRazorpayLoaded(true)
      script.onerror = () => toast.error('Failed to load Razorpay')
      document.body.appendChild(script)
    }

    loadRazorpay()
  }, [])

  useEffect(() => {
    setMounted(true)
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout')
      return
    }
    
    if (cart.items.length === 0) {
      router.push('/cart')
      return
    }
  }, [session, cart.items.length, router])

  // Calculate order totals in INR
  const subtotal = cart.subtotal || 0
  const selectedShipping = shippingOptions.find(option => option.id === shippingMethod)
  const shippingCost = subtotal > 2000 ? 0 : selectedShipping?.price || 0 // Free shipping above ₹2000
  const taxRate = 0.18 // 18% GST
  const taxAmount = Math.round(subtotal * taxRate)
  const totalAmount = subtotal + shippingCost + taxAmount

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return (
        shippingAddress.firstName.trim() !== '' &&
        shippingAddress.lastName.trim() !== '' &&
        shippingAddress.email.trim() !== '' &&
        shippingAddress.phone.trim() !== '' &&
        shippingAddress.address.trim() !== '' &&
        shippingAddress.city.trim() !== '' &&
        shippingAddress.state.trim() !== '' &&
        shippingAddress.zipCode.trim() !== ''
      )
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const createOrder = async (): Promise<RazorpayOrderResponse> => {
    const orderData = {
      items: cart.items,
      shippingAddress,
      shippingMethod,
      orderNotes,
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    const order = await response.json()
    
    // Create Razorpay order
    const paymentResponse = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId: order.id })
    })

    if (!paymentResponse.ok) {
      throw new Error('Failed to create payment order')
    }

    return await paymentResponse.json()
  }

  const handlePaymentSuccess = async (response: any) => {
    try {
      const verificationResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: response.orderId || response.order_id
        })
      })

      if (verificationResponse.ok) {
        const result = await verificationResponse.json()
        cart.clearCart()
        router.push(`/order-confirmation/${result.orderId}`)
        toast.success('Payment successful! Order confirmed.')
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Payment verification failed. Please contact support.')
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error)
    toast.error(`Payment failed: ${error.description || 'Unknown error'}`)
  }

  const handlePlaceOrder = async () => {
    if (!validateStep(1)) {
      toast.error('Please complete all required fields')
      return
    }

    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again in a moment.')
      return
    }

    setLoading(true)
    
    try {
      const razorpayOrder = await createOrder()
      
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'RI-CART',
        description: `Order #${razorpayOrder.orderId.slice(-8)}`,
        order_id: razorpayOrder.razorpayOrderId,
        handler: (response: any) => {
          response.orderId = razorpayOrder.orderId
          handlePaymentSuccess(response)
        },
        prefill: {
          name: razorpayOrder.customerName,
          email: razorpayOrder.customerEmail,
          contact: shippingAddress.phone
        },
        notes: {
          orderId: razorpayOrder.orderId,
          address: shippingAddress.address
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.error('Payment cancelled')
          }
        }
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.on('payment.failed', handlePaymentError)
      razorpayInstance.open()

    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  if (!mounted || !session) {
    return (
      <div className="mx-auto px-4 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-black/5 rounded w-48"></div>
          <div className="h-64 bg-black/5 rounded"></div>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return null
  }

  return (
    <div className="mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black tracking-tight">Secure Checkout</h1>
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
        </div>
        
        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-black' : 'text-black/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-black bg-black text-white' : 'border-black/30'}`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-black/20 mx-4"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-black' : 'text-black/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-black bg-black text-white' : 'border-black/30'}`}>
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Shipping Information */}
          {currentStep >= 1 && (
            <div className="bg-white border border-black/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">Shipping Information</h2>
                {currentStep > 1 && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                    Edit
                  </Button>
                )}
              </div>

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">PIN Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-black mb-4">Shipping Method</h3>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="space-y-3">
                        {shippingOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-3 p-4 border border-black/10 rounded">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{option.name}</div>
                                  <div className="text-sm text-black/60">{option.days}</div>
                                </div>
                                <div className="font-semibold">
                                  {subtotal > 2000 && option.id === 'standard' ? 'FREE' : `₹${option.price}`}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button onClick={handleNextStep} className="bg-black hover:bg-black/90">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {currentStep > 1 && (
                <div className="text-sm space-y-1">
                  <div className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</div>
                  <div>{shippingAddress.address}</div>
                  <div>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</div>
                  <div>{shippingAddress.phone}</div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep >= 2 && (
            <div className="bg-white border border-black/10 p-6">
              <h2 className="text-xl font-semibold text-black mb-6">Payment</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 border border-black/10 rounded bg-blue-50">
                  <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">Secure Payment via Razorpay</div>
                    <div className="text-sm text-blue-700">Pay securely with credit/debit cards, UPI, net banking & more</div>
                  </div>
                </div>

                <div className="text-xs text-black/60 bg-gray-50 p-3 rounded">
                  🔒 Your payment information is encrypted and secure. We support all major payment methods through Razorpay's secure gateway.
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    disabled={loading || !razorpayLoaded}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-black/10 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-black mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="relative w-16 h-16 bg-black/5 rounded flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">{item.name}</div>
                    <div className="text-sm text-black/60">₹{item.price.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/10 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST (18%)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-black/10 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {subtotal > 2000 && (
              <div className="mt-4 text-xs text-green-600 bg-green-50 p-2 rounded">
                🎉 You saved ₹{selectedShipping?.price} on shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}