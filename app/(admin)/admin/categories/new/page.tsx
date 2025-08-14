'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    slug: ''
  })

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
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Category created successfully!')
        router.push('/admin/categories')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-black tracking-tight">Add Category</h1>
            <p className="text-black/60">Create a new product category</p>
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
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}