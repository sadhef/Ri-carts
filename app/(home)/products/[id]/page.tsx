import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product, Category, Order } from '@/lib/models'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'
import { ReviewsSection } from '@/components/reviews/reviews-section'
import { ProductRelated } from '@/components/products/product-related'
import { serializeProduct, serializeCategory } from '@/lib/serialize'

type tParams = Promise<{ id: string }>

interface ProductPageProps {
  params: tParams
}

async function getProduct(id: string) {
  await connectToDatabase()
  
  const product = await Product.findById(id).populate('categoryId').lean()
  
  if (!product) {
    notFound()
  }

  // Properly serialize the product data
  const serializedProduct = serializeProduct(product)
  
  // Handle the populated category
  const category = product.categoryId ? serializeCategory(product.categoryId) : null
  
  return {
    ...serializedProduct,
    category
  }
}

async function checkUserCanReview(productId: string, userId: string) {
  if (!userId) return { canReview: false, orderId: null }
  
  // Check if user has purchased this product and it's delivered
  const order = await Order.findOne({
    userId,
    status: { $in: ['DELIVERED', 'SHIPPED'] },
    'items.productId': productId
  }).lean()
  
  if (!order) return { canReview: false, orderId: null }
  
  return { canReview: true, orderId: order._id.toString() }
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params
  const product = await getProduct(id)
  const session = await auth()
  
  // Check if current user can review this product
  const reviewData = session?.user?.id 
    ? await checkUserCanReview(product.id, session.user.id)
    : { canReview: false, orderId: null }

  return (
    <div className='container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16'>
        {/* Product Gallery */}
        <div className='order-1'>
          <ProductGallery images={product.images} />
        </div>

        {/* Product Information */}
        <div className='order-2'>
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className='mb-12 md:mb-16'>
        <ReviewsSection
          productId={product.id}
          productName={product.name}
          averageRating={product.averageRating || 0}
          totalReviews={product.totalReviews || 0}
          userCanReview={reviewData.canReview}
          userOrderId={reviewData.orderId || undefined}
        />
      </div>

      {/* Related Products */}
      <div>
        <ProductRelated
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      </div>
    </div>
  )
}
