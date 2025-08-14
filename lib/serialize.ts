// Utility function to serialize MongoDB documents for client components
export function serializeDocument(doc: any): any {
  if (!doc) return null
  
  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(serializeDocument)
  }
  
  // Handle objects
  if (typeof doc === 'object' && doc !== null) {
    const serialized: any = {}
    
    for (const key in doc) {
      if (doc.hasOwnProperty(key)) {
        const value = doc[key]
        
        // Convert ObjectId to string
        if (key === '_id' && value) {
          serialized[key] = value.toString()
          serialized.id = value.toString() // Also add as id
        }
        // Convert dates to ISO strings
        else if (value instanceof Date) {
          serialized[key] = value.toISOString()
        }
        // Handle nested objects/arrays
        else if (typeof value === 'object' && value !== null) {
          // Check if it's an ObjectId object with a toString method
          if (value.toString && typeof value.toString === 'function' && value._bsontype === 'ObjectID') {
            serialized[key] = value.toString()
          } else {
            serialized[key] = serializeDocument(value)
          }
        }
        // Handle primitive values
        else {
          serialized[key] = value
        }
      }
    }
    
    return serialized
  }
  
  return doc
}

// Specific function for serializing products
export function serializeProduct(product: any) {
  if (!product) return null
  
  // Handle images - properly serialize image objects
  const images = Array.isArray(product.images) 
    ? product.images.map((img: any) => {
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img !== null) {
          // If it's an image object with _id, serialize it properly
          return {
            url: img.url,
            publicId: img.publicId,
            alt: img.alt,
            isPrimary: img.isPrimary,
            _id: img._id?.toString(), // Convert ObjectId to string
          }
        }
        return img.url || img
      })
    : []

  // Convert any ObjectIds to strings using the general serialization function
  const baseSerializedProduct = serializeDocument(product)

  return {
    ...baseSerializedProduct,
    _id: product._id?.toString(),
    id: product._id?.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
    categoryId: product.categoryId?.toString(),
    stock: Number(product.stock),
    lowStockThreshold: Number(product.lowStockThreshold),
    images,
    sku: product.sku,
    weight: product.weight ? Number(product.weight) : undefined,
    status: product.status,
    featured: Boolean(product.featured),
    averageRating: Number(product.averageRating || 0),
    ratingCount: Number(product.totalReviews || 0),
    tags: Array.isArray(product.tags) ? product.tags : [],
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  }
}

// Specific function for serializing categories
export function serializeCategory(category: any) {
  if (!category) return null
  
  return {
    _id: category._id?.toString(),
    id: category._id?.toString(),
    name: category.name,
    description: category.description,
    image: category.image,
    createdAt: category.createdAt?.toISOString(),
    updatedAt: category.updatedAt?.toISOString(),
  }
}

// Specific function for serializing reviews
export function serializeReview(review: any) {
  if (!review) return null
  
  return {
    _id: review._id?.toString(),
    id: review._id?.toString(),
    productId: review.productId?.toString(),
    userId: review.userId?.toString(),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt?.toISOString(),
    updatedAt: review.updatedAt?.toISOString(),
  }
}

// Utility function to get image URL from various formats
export function getImageUrl(image: any): string {
  if (!image) return '/placeholder.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image.url) return image.url
  return '/placeholder.jpg'
}

// Utility function to get the first image URL from a product
export function getProductImageUrl(product: any): string {
  if (!product?.images || !Array.isArray(product.images) || product.images.length === 0) {
    return '/placeholder.jpg'
  }
  return getImageUrl(product.images[0])
}