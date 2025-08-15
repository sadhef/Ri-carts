'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { ProductForm } from '@/components/admin/product-form'
import { GET_PRODUCT } from '@/lib/graphql/queries'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditProductPage() {
  const params = useParams()
  const productId = params?.id as string

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !data?.product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Product not found or error loading product.</p>
        </div>
      </div>
    )
  }

  const product = data.product

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600">Update product information and settings.</p>
      </div>

      <ProductForm 
        initialData={product}
        isEditing={true}
      />
    </div>
  )
}