'use client'

import { useQuery } from '@apollo/client'
import { Product } from '@/types'
import { ProductCard } from '@/components/ui/product-card'
import { GET_RELATED_PRODUCTS } from '@/lib/graphql/queries'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface ProductRelatedProps {
  categoryId: string
  currentProductId: string
}

export function ProductRelated({
  categoryId,
  currentProductId,
}: ProductRelatedProps) {
  const { data, loading, error } = useQuery(GET_RELATED_PRODUCTS, {
    variables: {
      productId: currentProductId,
      limit: 6
    },
    errorPolicy: 'all'
  })

  const products = data?.relatedProducts || []

  if (loading) {
    return <div>Loading related products...</div>
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold'>Related Products</h2>
      <Carousel className='w-full'>
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className='md:basis-1/2 lg:basis-1/3'
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
