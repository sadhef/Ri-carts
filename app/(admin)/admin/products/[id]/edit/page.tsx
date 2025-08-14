import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product, Category } from '@/lib/models'
import { serializeProduct, serializeCategory } from '@/lib/serialize'
import { ProductForm } from '@/components/admin/product-form'

type Params = {
  id: string
}

interface EditProductPageProps {
  params: Promise<Params>
}

async function getProduct(id: string) {
  try {
    await connectToDatabase()
    
    const product = await Product.findById(id).lean()
    
    if (!product) {
      notFound()
    }

    return serializeProduct(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}

async function getCategories() {
  try {
    await connectToDatabase()
    
    const categories = await Category.find().lean()
    
    return categories.map(category => serializeCategory(category))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    notFound()
  }

  const resolvedParams = await params
  const [product, categories] = await Promise.all([
    getProduct(resolvedParams.id),
    getCategories()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600">Update product information and settings.</p>
      </div>

      <ProductForm 
        initialData={product}
        categories={categories}
        isEditing={true}
      />
    </div>
  )
}