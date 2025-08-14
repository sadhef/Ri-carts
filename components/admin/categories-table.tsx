'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  productCount: number
  createdAt: string
}

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(categoryId)
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Category deleted successfully')
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    } finally {
      setIsDeleting(null)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-black/60">
          <p className="text-lg font-medium text-black">No categories found</p>
          <p className="text-sm">Get started by creating your first category</p>
          <Button asChild className="mt-4 bg-black text-white hover:bg-black/90">
            <Link href="/admin/categories/new">
              Add Category
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-black/10">
          <TableHead className="text-black font-medium">Name</TableHead>
          <TableHead className="text-black font-medium">Description</TableHead>
          <TableHead className="text-black font-medium">Products</TableHead>
          <TableHead className="text-black font-medium">Created</TableHead>
          <TableHead className="text-right text-black font-medium">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id} className="border-black/10">
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/10 flex items-center justify-center text-black/40 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-black">{category.name}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="max-w-xs">
                <p className="text-sm text-black/60 truncate">
                  {category.description || 'No description'}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm font-medium text-black">
                {category.productCount} products
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-black/60">
                {format(new Date(category.createdAt), 'MMM d, yyyy')}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-black hover:bg-black hover:text-white"
                    disabled={isDeleting === category.id}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-black/10">
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/admin/categories/${category.id}/edit`}
                      className="cursor-pointer text-black hover:bg-black hover:text-white"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={isDeleting === category.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting === category.id ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}