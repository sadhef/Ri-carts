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
    isVerified: Boolean(review.isVerified),
    createdAt: review.createdAt?.toISOString(),
    updatedAt: review.updatedAt?.toISOString(),
  }
}

// Specific function for serializing users
export function serializeUser(user: any) {
  if (!user) return null
  
  return {
    _id: user._id?.toString(),
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified?.toISOString(),
    image: user.image,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    zipCode: user.zipCode,
    country: user.country,
    dateOfBirth: user.dateOfBirth,
    role: user.role,
    tags: Array.isArray(user.tags) ? user.tags : [],
    status: user.status,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  }
}

// Specific function for serializing orders
export function serializeOrder(order: any) {
  if (!order) return null
  
  return {
    _id: order._id?.toString(),
    id: order._id?.toString(),
    userId: order.userId?.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    items: Array.isArray(order.items) ? order.items : [],
    shippingAddress: order.shippingAddress,
    paymentMethod: {
      type: order.paymentMethod?.type || 'razorpay',
      lastFourDigits: order.paymentMethod?.lastFourDigits || null
    },
    totalAmount: Number(order.totalAmount),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost || 0),
    taxAmount: Number(order.taxAmount || 0),
    savings: order.savings ? Number(order.savings) : undefined,
    shippingMethod: order.shippingMethod,
    orderNotes: order.orderNotes,
    trackingNumber: order.trackingNumber,
    stripePaymentId: order.stripePaymentId,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    shippedAt: order.shippedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    refundId: order.refundId,
    refundAmount: order.refundAmount ? Number(order.refundAmount) : undefined,
    refundedAt: order.refundedAt?.toISOString(),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
  }
}


// Specific function for serializing coupons
export function serializeCoupon(coupon: any) {
  if (!coupon) return null
  
  return {
    _id: coupon._id?.toString(),
    id: coupon._id?.toString(),
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined,
    maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
    usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
    usedCount: Number(coupon.usedCount || 0),
    isActive: Boolean(coupon.isActive),
    startDate: coupon.startDate?.toISOString(),
    endDate: coupon.endDate?.toISOString(),
    createdAt: coupon.createdAt?.toISOString(),
    updatedAt: coupon.updatedAt?.toISOString(),
  }
}

// Specific function for serializing newsletter subscriptions
export function serializeNewsletterSubscription(subscription: any) {
  if (!subscription) return null
  
  return {
    _id: subscription._id?.toString(),
    id: subscription._id?.toString(),
    email: subscription.email,
    name: subscription.name,
    isActive: Boolean(subscription.isActive),
    subscribedAt: subscription.subscribedAt?.toISOString(),
    unsubscribedAt: subscription.unsubscribedAt?.toISOString(),
    source: subscription.source || 'website', // Default to 'website' if null/undefined
    tags: Array.isArray(subscription.tags) ? subscription.tags : [],
  }
}

// Utility function to get image URL from various formats
export function getImageUrl(image: any): string {
  if (!image) return '/placeholder.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image.url) return image.url
  return '/placeholder.jpg'
}

// Specific function for serializing shipping zones
export function serializeShippingZone(zone: any) {
  if (!zone) return null
  
  return {
    _id: zone._id?.toString(),
    id: zone._id?.toString(),
    name: zone.name,
    countries: Array.isArray(zone.countries) ? zone.countries : [],
    states: Array.isArray(zone.states) ? zone.states : [],
    isDefault: Boolean(zone.isDefault),
    createdAt: zone.createdAt?.toISOString(),
    updatedAt: zone.updatedAt?.toISOString(),
  }
}

// Specific function for serializing shipping rates
export function serializeShippingRate(rate: any) {
  if (!rate) return null
  
  return {
    _id: rate._id?.toString(),
    id: rate._id?.toString(),
    zoneId: rate.zoneId?.toString(),
    zoneName: rate.zoneName || '',
    name: rate.name,
    description: rate.description,
    method: rate.method,
    cost: Number(rate.cost || 0),
    minOrderAmount: rate.minOrderAmount ? Number(rate.minOrderAmount) : undefined,
    maxOrderAmount: rate.maxOrderAmount ? Number(rate.maxOrderAmount) : undefined,
    minWeight: rate.minWeight ? Number(rate.minWeight) : undefined,
    maxWeight: rate.maxWeight ? Number(rate.maxWeight) : undefined,
    estimatedDays: rate.estimatedDays,
    isActive: Boolean(rate.isActive),
    createdAt: rate.createdAt?.toISOString(),
    updatedAt: rate.updatedAt?.toISOString(),
  }
}

// Specific function for serializing newsletter campaigns
export function serializeNewsletterCampaign(campaign: any) {
  if (!campaign) return null
  
  const openRate = campaign.recipientCount > 0 ? (campaign.openCount / campaign.recipientCount * 100) : 0
  const clickRate = campaign.openCount > 0 ? (campaign.clickCount / campaign.openCount * 100) : 0
  
  return {
    _id: campaign._id?.toString(),
    id: campaign._id?.toString(),
    subject: campaign.subject,
    content: campaign.content,
    status: campaign.status,
    recipientCount: Number(campaign.recipientCount || 0),
    openRate: Number(openRate.toFixed(2)),
    clickRate: Number(clickRate.toFixed(2)),
    sentAt: campaign.sentAt?.toISOString(),
    scheduledAt: campaign.scheduledAt?.toISOString(),
    createdAt: campaign.createdAt?.toISOString(),
    updatedAt: campaign.updatedAt?.toISOString(),
  }
}

// Specific function for serializing store settings
export function serializeStoreSettings(settings: any) {
  if (!settings) return null
  
  return {
    _id: settings._id?.toString(),
    id: settings._id?.toString(),
    storeName: settings.storeName || 'My Store', // Required field - ensure default
    storeDescription: settings.storeDescription,
    storeLogo: settings.storeLogo,
    favicon: settings.favicon,
    storeEmail: settings.storeEmail || 'store@example.com', // Required field - ensure default
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    businessName: settings.businessName,
    businessAddress: settings.businessAddress,
    businessPhone: settings.businessPhone,
    businessEmail: settings.businessEmail,
    taxId: settings.taxId,
    vatNumber: settings.vatNumber,
    registrationNumber: settings.registrationNumber,
    facebookUrl: settings.facebookUrl,
    twitterUrl: settings.twitterUrl,
    instagramUrl: settings.instagramUrl,
    linkedinUrl: settings.linkedinUrl,
    privacyPolicy: settings.privacyPolicy,
    termsOfService: settings.termsOfService,
    returnPolicy: settings.returnPolicy,
    shippingPolicy: settings.shippingPolicy,
    paymentMethods: {
      razorpay: Boolean(settings.paymentMethods?.razorpay ?? true)
    },
    currency: settings.currency || 'INR', // Required field - ensure default
    timezone: settings.timezone || 'UTC', // Required field - ensure default
    language: settings.language || 'en', // Required field - ensure default
    dateFormat: settings.dateFormat || 'MM/DD/YYYY', // Required field - ensure default
    createdAt: settings.createdAt?.toISOString(),
    updatedAt: settings.updatedAt?.toISOString(),
  }
}

// Utility function to get the first image URL from a product
export function getProductImageUrl(product: any): string {
  if (!product?.images || !Array.isArray(product.images) || product.images.length === 0) {
    return '/placeholder.jpg'
  }
  return getImageUrl(product.images[0])
}