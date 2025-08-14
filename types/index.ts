// Client-side type definitions
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

// Client-side interfaces (without MongoDB specific fields)
export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: string
  image?: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  categoryId: string
  stock: number
  lowStockThreshold?: number
  sku: string
  weight?: number
  images: string[]
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  status: ProductStatus
  featured?: boolean
  averageRating?: number
  ratingCount?: number
  createdAt: string
  updatedAt: string
  category?: Category
  reviews?: Review[]
}

export interface Category {
  id: string
  name: string
  description: string
  slug?: string
  parentId?: string
  image?: string
  metaTitle?: string
  metaDescription?: string
  status?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  helpful?: number
  verified?: boolean
  createdAt: string
  updatedAt: string
  user?: User
  product?: Product
}

export interface Order {
  id: string
  userId: string
  email: string
  status: OrderStatus
  total: number
  subtotal: number
  tax?: number
  shipping?: number
  discount?: number
  items: OrderItem[]
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  paymentStatus?: string
  paymentId?: string
  notes?: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  user?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  total: number
  createdAt: string
  updatedAt: string
  product?: Product
}

export interface Address {
  id: string
  userId?: string
  type?: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  address: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

// Cart types (client-only)
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  comparePrice?: number
  image: string
  quantity: number
  stock: number
  sku: string
}