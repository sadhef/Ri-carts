'use client'

import { ProductCard } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGridProps {
  products: any[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductGrid({
  products,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className='space-y-12'>
        <div className='rr-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className='space-y-4'>
              <div className='aspect-[3/4] bg-muted/50 animate-pulse' />
              <div className='h-4 bg-muted/50 animate-pulse' />
              <div className='h-4 bg-muted/50 animate-pulse w-2/3' />
              <div className='h-10 bg-muted/50 animate-pulse' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='text-center py-24'>
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-black/20 rounded" />
          </div>
          <div className="space-y-3">
            <h3 className='rr-heading-sm text-black'>No products found</h3>
            <p className='rr-body text-black/60 max-w-md mx-auto'>
              Try adjusting your search or filter criteria to discover more items.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-12'>
      {/* Product Grid */}
      <div className='rr-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center space-x-3 pt-12 border-t border-black/5'>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='border-black/20 text-black hover:bg-black hover:text-white rr-label px-6 py-2 rounded-sm transition-all duration-300'
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            PREVIOUS
          </Button>
          
          <div className='flex space-x-2'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={
                    currentPage === pageNum
                      ? 'bg-black text-white rr-label px-4 py-2 rounded-sm'
                      : 'border-black/20 text-black hover:bg-black hover:text-white rr-label px-4 py-2 rounded-sm transition-all duration-300'
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='border-black/20 text-black hover:bg-black hover:text-white rr-label px-6 py-2 rounded-sm transition-all duration-300'
          >
            NEXT
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
