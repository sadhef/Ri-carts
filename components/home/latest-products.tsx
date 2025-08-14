'use client'

import { ProductCard } from '@/components/ui/product-card'

interface LatestProductsProps {
  products: any[]
}

export function LatestProducts({ products }: LatestProductsProps) {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="rr-body text-black/60">No products available at the moment.</p>
        <p className="rr-body-sm text-black/40 mt-3">Please check back later for new arrivals!</p>
      </div>
    )
  }

  return (
    <div className='rr-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
