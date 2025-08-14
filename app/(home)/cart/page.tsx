'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/store/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CartPage() {
  const cart = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleQuantityChange = (productId: string, newQuantity: number, stock: number) => {
    if (newQuantity > stock) {
      toast.error(`Only ${stock} items available in stock`)
      return
    }
    cart.updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    cart.removeItem(productId)
    toast.success(`${productName} removed from cart`)
  }

  if (!mounted) {
    return (
      <div className="rr-container py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted/50 rounded w-64"></div>
          <div className="h-96 bg-muted/50 rounded"></div>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="rr-container rr-section-spacing">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="h-12 w-12 text-black/40" />
          </div>
          <h1 className="rr-heading-lg text-black mb-6">Your cart is empty</h1>
          <p className="rr-body text-black/60 mb-12 max-w-md mx-auto">
            Discover our collection of contemporary fashion pieces and start building your perfect wardrobe.
          </p>
          <Button asChild className="bg-black text-white hover:bg-black/90 rr-label px-8 py-3 rounded-sm transition-all duration-300">
            <Link href="/products">
              EXPLORE COLLECTION
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rr-container py-12">
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="rr-heading-lg text-black mb-3">Shopping Cart</h1>
            <p className="rr-body text-black/60">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Button variant="outline" asChild className="border-black/20 text-black hover:bg-black hover:text-white rr-label px-6 py-3 rounded-sm transition-all duration-300 lg:self-start">
            <Link href="/products">
              <ArrowLeft className="mr-3 h-4 w-4" />
              CONTINUE SHOPPING
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="border border-black/5 p-8 bg-white rr-card-hover">
              <div className="flex gap-6">
                <div className="relative w-24 h-32 flex-shrink-0 bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <Link
                    href={`/products/${item.productId}`}
                    className="rr-body text-black hover:text-black/70 block truncate transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                  <p className="rr-body-sm text-black/60">SKU: {item.sku}</p>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="rr-body-sm font-medium text-black">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.comparePrice && item.comparePrice > item.price && (
                      <span className="rr-body-sm text-black/40 line-through">
                        ${item.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.stock)}
                      disabled={item.quantity <= 1}
                      className="h-10 w-10 p-0 border-black/20 hover:bg-black hover:text-white rounded-sm transition-all duration-300"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1
                        handleQuantityChange(item.productId, newQuantity, item.stock)
                      }}
                      className="w-20 text-center border-black/20 focus:border-black focus:ring-0 rr-body-sm rounded-sm"
                      min="1"
                      max={item.stock}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.stock)}
                      disabled={item.quantity >= item.stock}
                      className="h-10 w-10 p-0 border-black/20 hover:bg-black hover:text-white rounded-sm transition-all duration-300"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <span className="rr-body-sm text-black/60 ml-4">
                      {item.stock} available
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.productId, item.name)}
                    className="text-black/60 hover:text-black p-2 rounded-sm transition-colors duration-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>

                  <div className="text-right">
                    <p className="rr-body-sm font-medium text-black">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border border-black/5 p-8 bg-white lg:sticky lg:top-32">
            <h2 className="rr-label text-black mb-8">ORDER SUMMARY</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="rr-body text-black/60">Subtotal ({cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''})</span>
                <span className="rr-body font-medium text-black">${cart.subtotal.toFixed(2)}</span>
              </div>
              
              {cart.savings > 0 && (
                <div className="flex justify-between items-center text-black">
                  <span className="rr-body">You save</span>
                  <span className="rr-body font-medium">-${cart.savings.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="rr-body text-black/60">Shipping</span>
                <span className="rr-body-sm text-black/60">Calculated at checkout</span>
              </div>
              
              <div className="border-t border-black/5 pt-6">
                <div className="flex justify-between items-center">
                  <span className="rr-body font-medium text-black">Total</span>
                  <span className="rr-heading-sm text-black">${cart.total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-black text-white hover:bg-black/90 rr-label py-4 rounded-sm transition-all duration-300 mt-8">
                <Link href="/checkout">
                  PROCEED TO CHECKOUT
                </Link>
              </Button>
              
              <div className="rr-body-sm text-black/60 text-center pt-4">
                Free shipping on orders over $50
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
