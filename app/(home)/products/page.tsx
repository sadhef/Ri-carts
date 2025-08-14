'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          ...(category && { category }),
          ...(search && { search }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(sort && { sort }),
        })

        const response = await fetch(`/api/products?${queryParams}`)
        const data = await response.json()

        setProducts(data.products)
        setTotalPages(Math.ceil(data.total / data.perPage))
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, search, minPrice, maxPrice, sort, currentPage])

  return (
    <div className='rr-container py-12'>
      <div className='mb-16'>
        <h1 className='rr-heading-lg text-black mb-4'>
          {search ? `Search: "${search}"` : category ? `${category} Collection` : 'All Products'}
        </h1>
        <p className='rr-body text-black/60'>
          {loading ? 'Loading our collection...' : `${products.length} products available`}
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-12'>
        <aside className='w-full lg:w-72 lg:flex-shrink-0'>
          <div className='lg:sticky lg:top-32'>
            <ProductSidebar />
          </div>
        </aside>
        
        <main className='flex-1 min-w-0'>
          <ProductGrid
            products={products}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  )
}
