'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_PRODUCTS } from '@/lib/graphql/queries'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort')

  // Build GraphQL variables
  const filters: any = {}
  if (category) filters.category = category
  if (search) filters.search = search
  if (minPrice) filters.minPrice = parseFloat(minPrice)
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice)

  let sortObj: any = undefined
  if (sort) {
    switch (sort) {
      case 'price_asc':
        sortObj = { field: 'price', order: 'ASC' }
        break
      case 'price_desc':
        sortObj = { field: 'price', order: 'DESC' }
        break
      case 'name_asc':
        sortObj = { field: 'name', order: 'ASC' }
        break
      case 'name_desc':
        sortObj = { field: 'name', order: 'DESC' }
        break
      case 'createdAt_asc':
        sortObj = { field: 'createdAt', order: 'ASC' }
        break
      case 'createdAt_desc':
      case 'newest':
        sortObj = { field: 'createdAt', order: 'DESC' }
        break
    }
  }

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      page: currentPage,
      perPage: 12,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: sortObj,
    },
  })

  const products = data?.products?.products || []
  const totalPages = data?.products ? Math.ceil(data.products.total / data.products.perPage) : 1

  return (
    <div className='rr-container py-12'>
      <div className='mb-16'>
        <h1 className='rr-heading-lg text-black mb-4'>
          {search ? `Search: "${search}"` : category ? `${category} Collection` : 'All Products'}
        </h1>
        <p className='rr-body text-black/60'>
          {loading ? 'Loading our collection...' : error ? 'Error loading products' : `${data?.products?.total || 0} products available`}
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
