'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_CATEGORIES } from '@/lib/graphql/queries'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
}

export function ProductSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get('sort') || 'default'
  )

  const { data, loading, error } = useQuery(GET_CATEGORIES)
  const categories = data?.categories || []

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (selectedCategory && selectedCategory !== 'all')
      params.set('category', selectedCategory)
    if (selectedSort && selectedSort !== 'default')
      params.set('sort', selectedSort)

    router.push(`/products?${params.toString()}`)
  }

  const handleReset = () => {
    setSelectedCategory('all')
    setSelectedSort('default')
    router.push('/products')
  }

  return (
    <div className='space-y-6 p-6 border border-black/10 bg-white'>
      <div>
        <h3 className='font-semibold text-black mb-4 text-sm tracking-wide uppercase'>Filters</h3>
      </div>

      <div className='space-y-3'>
        <label className='text-sm font-medium text-black'>Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='border-black/20 focus:border-black focus:ring-0'>
            <SelectValue placeholder='Select category' />
          </SelectTrigger>
          <SelectContent className='bg-white border-black/10'>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-3'>
        <label className='text-sm font-medium text-black'>Sort By</label>
        <Select value={selectedSort} onValueChange={setSelectedSort}>
          <SelectTrigger className='border-black/20 focus:border-black focus:ring-0'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent className='bg-white border-black/10'>
            <SelectItem value='default'>Default</SelectItem>
            <SelectItem value='price_asc'>Price: Low to High</SelectItem>
            <SelectItem value='price_desc'>Price: High to Low</SelectItem>
            <SelectItem value='name_asc'>Name: A to Z</SelectItem>
            <SelectItem value='name_desc'>Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2 pt-4 border-t border-black/10'>
        <Button 
          onClick={handleFilter} 
          className='w-full bg-black text-white hover:bg-black/90 font-medium'
        >
          Apply Filters
        </Button>
        <Button 
          onClick={handleReset} 
          variant='outline' 
          className='w-full border-black/20 text-black hover:bg-black hover:text-white'
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
