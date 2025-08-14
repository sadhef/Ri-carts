'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug?: string
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    slug: ''
  })

  useEffect(() => {
    async function loadCategory() {
      try {
        const resolvedParams = await params
        setCategoryId(resolvedParams.id)
        
        const response = await fetch(`/api/admin/categories/${resolvedParams.id}`)
        if (response.ok) {
          const category: Category = await response.json()
          setFormData({
            name: category.name || '',
            description: category.description || '',
            image: category.image || '',
            slug: category.slug || ''
          })
        } else {
          toast.error('Failed to load category')
          router.push('/admin/categories')
        }
      } catch (error) {
        console.error('Error loading category:', error)
        toast.error('Failed to load category')
        router.push('/admin/categories')
      } finally {
        setFetchLoading(false)
      }
    }

    loadCategory()
  }, [params, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug from name
      ...(field === 'name' && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Category updated successfully!')
        router.push('/admin/categories')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-black/60">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading category...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild className="border-black/20 text-black hover:bg-black hover:text-white">
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">Edit Category</h1>
            <p className="text-black/60">Update category information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="border border-black/10 p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black font-medium">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter category name"
                required
                className="border-black/20 focus:border-black focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-black font-medium">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="category-slug"
                className="border-black/20 focus:border-black focus:ring-0"
              />
              <p className="text-xs text-black/60">Auto-generated from name, or customize</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter category description"
              rows={4}
              className="border-black/20 focus:border-black focus:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-black font-medium">Image URL</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="border-black/20 focus:border-black focus:ring-0"
            />
            <p className="text-xs text-black/60">Optional: Add a category image URL</p>
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div className="space-y-2">
              <Label className="text-black font-medium">Image Preview</Label>
              <div className="w-32 h-32 border border-black/10 rounded-lg overflow-hidden">
                <img
                  src={formData.image}
                  alt="Category preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-black/10">
            <Button variant="outline" type="button" asChild className="border-black/20 text-black hover:bg-black hover:text-white">
              <Link href="/admin/categories">
                Cancel
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white hover:bg-black/90 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Category
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}