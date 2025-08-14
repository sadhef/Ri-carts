import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoriesTable } from '@/components/admin/categories-table'
import connectToDatabase from '@/lib/mongodb'
import { Category, Product } from '@/lib/models'
import { serializeCategory } from '@/lib/serialize'

async function getCategories() {
  try {
    await connectToDatabase()
    
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean()

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          categoryId: category._id.toString() 
        })
        
        return {
          ...serializeCategory(category),
          productCount
        }
      })
    )

    return categoriesWithCount
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Categories</h1>
          <p className="text-black/60">Manage your product categories</p>
        </div>
        <Button asChild className="bg-black text-white hover:bg-black/90">
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
          <Input 
            placeholder="Search categories..." 
            className="pl-9 border-black/20 focus:border-black focus:ring-0" 
          />
        </div>
      </div>

      <div className="border border-black/10 p-6 bg-white">
        <h2 className="font-semibold text-black mb-6 text-sm tracking-wide uppercase">Category List</h2>
        <Suspense fallback={<CategoriesTableSkeleton />}>
          <CategoriesTable categories={categories} />
        </Suspense>
      </div>
    </div>
  )
}

function CategoriesTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <div className="h-12 w-12 bg-black/5 rounded-lg animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-black/5 rounded animate-pulse" />
          </div>
          <div className="h-4 w-48 bg-black/5 rounded animate-pulse" />
          <div className="h-4 w-20 bg-black/5 rounded animate-pulse" />
          <div className="h-4 w-24 bg-black/5 rounded animate-pulse" />
          <div className="h-8 w-8 bg-black/5 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}