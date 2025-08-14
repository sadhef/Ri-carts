'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/use-cart'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '@/lib/serialize'

interface ProductCardProps {
  product: any
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const cart = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }
    
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      image: getProductImageUrl(product),
      quantity: 1,
      stock: product.stock || 0,
      sku: product.sku || product.id,
    })

    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className={cn('group rr-card-hover', className)}>
      <Link href={`/products/${product.id}`} className="block">
        <div className='relative aspect-[3/4] overflow-hidden rr-image-overlay mb-6' style={{ backgroundColor: 'var(--rr-light-bg)' }}>
          <Image
            src={getProductImageUrl(product)}
            alt={product.name}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            className='object-cover rr-image-zoom'
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(248, 247, 244, 0.9)' }}>
              <span className="rr-product-badge">SOLD OUT</span>
            </div>
          )}
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="rr-product-badge">
              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </div>
          )}
        </div>
        
        <div className='space-y-4'>
          <h3 className='rr-body leading-tight line-clamp-2 group-hover:opacity-70 transition-opacity duration-300' style={{ color: 'var(--rr-dark-text)' }}>
            {product.name}
          </h3>
          
          <div className='space-y-2'>
            <div className='flex items-baseline gap-3'>
              <span className='rr-body font-medium' style={{ color: 'var(--rr-pure-black)' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className='rr-body-sm line-through' style={{ color: 'var(--rr-medium-gray)' }}>
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {product.stock <= 5 && product.stock > 0 && (
              <span className='text-xs uppercase tracking-wider font-medium block' style={{ color: 'var(--rr-medium-gray)' }}>
                ONLY {product.stock} LEFT
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <button 
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className='w-full mt-6 rr-button-secondary'
      >
        {product.stock === 0 ? 'SOLD OUT' : 'ADD TO CART'}
      </button>
    </div>
  )
}
