'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoriesTable } from '@/components/admin/categories-table'
import { useQuery } from '@apollo/client'
import { GET_CATEGORIES } from '@/lib/graphql/queries'

function CategoriesContent() {
  const { data, loading, error } = useQuery(GET_CATEGORIES)
  
  if (loading) return <CategoriesPageSkeleton />
  if (error) {
    console.error('Error fetching categories:', error)
    return <div>Error loading categories</div>
  }

  const categories = data?.categories || []

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
        <CategoriesTable categories={categories} />
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesPageSkeleton />}>
      <CategoriesContent />
    </Suspense>
  )
}

function CategoriesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-black/5 rounded animate-pulse" />
          <div className="h-4 w-48 bg-black/5 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-black/5 rounded animate-pulse" />
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-10 w-64 bg-black/5 rounded animate-pulse" />
      </div>
      <div className="border border-black/10 p-6 bg-white">
        <div className="h-4 w-32 bg-black/5 rounded animate-pulse mb-6" />
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
      </div>
    </div>
  )
}