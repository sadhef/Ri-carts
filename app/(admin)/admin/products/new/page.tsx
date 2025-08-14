import { ProductForm } from '@/components/admin/product-form'
import connectToDatabase from '@/lib/mongodb'
import { Category } from '@/lib/models'

async function getCategories() {
  try {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return categories.map(category => ({
      id: category._id.toString(),
      name: category.name
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Create a new product for your store</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}