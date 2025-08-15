import mongoose, { Schema, Document } from 'mongoose'

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

export interface IUser extends Document {
  _id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  password?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: string
  role: Role
  tags?: string[]
  status?: 'active' | 'inactive' | 'banned'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IAccount extends Document {
  _id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
}

export interface ISession extends Document {
  _id: string
  sessionToken: string
  userId: string
  expires: Date
}

export interface ICategory extends Document {
  _id: string
  name: string
  description?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface IProduct extends Document {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  discountPercentage?: number
  images: Array<{
    url: string
    publicId: string
    alt?: string
    isPrimary?: boolean
  }>
  categoryId: string
  stock: number
  lowStockThreshold: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  status: ProductStatus
  featured: boolean
  averageRating: number
  totalReviews: number
  createdAt: Date
  updatedAt: Date
}


export interface IOrder extends Document {
  _id: string
  userId: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: string
  items: Array<{
    productId: string
    name: string
    price: number
    comparePrice?: number
    quantity: number
    image: string
    sku: string
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: {
    type: string
    lastFourDigits?: string
  }
  totalAmount: number
  subtotal: number
  shippingCost: number
  taxAmount: number
  savings?: number
  shippingMethod: string
  orderNotes?: string
  trackingNumber?: string
  stripePaymentId?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  shippedAt?: Date
  deliveredAt?: Date
  refundId?: string
  refundAmount?: number
  refundedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IOrderItem extends Document {
  _id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}

export interface IReview extends Document {
  _id: string
  rating: number
  comment?: string
  userId: string
  productId: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICart extends Document {
  _id: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ICartItem extends Document {
  _id: string
  cartId: string
  productId: string
  quantity: number
}

export interface ICoupon extends Document {
  _id: string
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IWishlist extends Document {
  _id: string
  userId: string
  productIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface INewsletterSubscription extends Document {
  _id: string
  email: string
  name?: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
  source: 'website' | 'checkout' | 'import' | 'manual'
  tags: string[]
}


export interface IProductView extends Document {
  _id: string
  productId: string
  userId?: string
  sessionId: string
  ipAddress: string
  userAgent?: string
  referrer?: string
  viewedAt: Date
}

export interface ISetting extends Document {
  _id: string
  key: string
  value: any
  section: string
  createdAt: Date
  updatedAt: Date
}

export interface IReport extends Document {
  _id: string
  name: string
  type: 'sales' | 'inventory' | 'customer' | 'financial'
  generatedBy: string
  period: string
  status: 'generating' | 'ready' | 'failed'
  downloadUrl?: string
  data?: any
  createdAt: Date
  updatedAt: Date
}

export interface INewsletterCampaign extends Document {
  _id: string
  subject: string
  content: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  createdBy: string
  recipientCount: number
  openCount: number
  clickCount: number
  sentAt?: Date
  scheduledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IShippingZone extends Document {
  _id: string
  name: string
  countries: string[]
  states?: string[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IShippingRate extends Document {
  _id: string
  zoneId: string
  name: string
  description?: string
  method: 'flat_rate' | 'free' | 'weight_based' | 'order_total'
  cost: number
  minOrderAmount?: number
  maxOrderAmount?: number
  minWeight?: number
  maxWeight?: number
  estimatedDays: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IStoreSettings extends Document {
  _id: string
  storeName: string
  storeDescription?: string
  storeLogo?: string
  favicon?: string
  storeEmail: string
  storePhone?: string
  storeAddress?: string
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  taxId?: string
  vatNumber?: string
  registrationNumber?: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  privacyPolicy?: string
  termsOfService?: string
  returnPolicy?: string
  shippingPolicy?: string
  paymentMethods: {
    razorpay: boolean
  }
  currency: string
  timezone: string
  language: string
  dateFormat: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  password: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  dateOfBirth: { type: String },
  role: { type: String, enum: Object.values(Role), default: Role.USER },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  lastLoginAt: { type: Date }
}, {
  timestamps: true
})

const accountSchema = new Schema<IAccount>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: { type: String },
  access_token: { type: String },
  expires_at: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  id_token: { type: String },
  session_state: { type: String }
})

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true })

const sessionSchema = new Schema<ISession>({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true }
})

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String }
}, {
  timestamps: true
})

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  discountPercentage: { type: Number, default: 0 },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  categoryId: { type: String, required: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  sku: { type: String, required: true, unique: true },
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  tags: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.ACTIVE },
  featured: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, {
  timestamps: true
})


const orderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  paymentStatus: { type: String, default: 'PENDING' },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    sku: { type: String, required: true }
  }],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: { type: String, required: true },
    lastFourDigits: { type: String }
  },
  totalAmount: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  shippingMethod: { type: String, required: true },
  orderNotes: { type: String },
  trackingNumber: { type: String },
  stripePaymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  refundId: { type: String },
  refundAmount: { type: Number },
  refundedAt: { type: Date }
}, {
  timestamps: true
})

const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
})

const reviewSchema = new Schema<IReview>({
  rating: { type: Number, required: true },
  comment: { type: String },
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
})

const cartSchema = new Schema<ICart>({
  userId: { type: String, required: true, unique: true }
}, {
  timestamps: true
})

const cartItemSchema = new Schema<ICartItem>({
  cartId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true }
})

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, enum: Object.values(DiscountType), required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number },
  maxDiscountAmount: { type: Number },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }
}, {
  timestamps: true
})

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: String, required: true, unique: true },
  productIds: [{ type: String }]
}, {
  timestamps: true
})

const newsletterSubscriptionSchema = new Schema<INewsletterSubscription>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  source: { type: String, enum: ['website', 'checkout', 'import', 'manual'], default: 'website' },
  tags: { type: [String], default: [] }
})

const productViewSchema = new Schema<IProductView>({
  productId: { type: String, required: true },
  userId: { type: String },
  sessionId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  referrer: { type: String },
  viewedAt: { type: Date, default: Date.now }
})

const settingSchema = new Schema<ISetting>({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  section: { type: String, required: true }
}, {
  timestamps: true
})

settingSchema.index({ key: 1, section: 1 }, { unique: true })

const reportSchema = new Schema<IReport>({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['sales', 'inventory', 'customer', 'financial'] },
  generatedBy: { type: String, required: true },
  period: { type: String, required: true },
  status: { type: String, required: true, enum: ['generating', 'ready', 'failed'], default: 'generating' },
  downloadUrl: { type: String },
  data: { type: Schema.Types.Mixed }
}, {
  timestamps: true
})

const newsletterCampaignSchema = new Schema<INewsletterCampaign>({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, required: true, enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'], default: 'draft' },
  createdBy: { type: String, required: true },
  recipientCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  sentAt: { type: Date },
  scheduledAt: { type: Date }
}, {
  timestamps: true
})

const shippingZoneSchema = new Schema<IShippingZone>({
  name: { type: String, required: true },
  countries: { type: [String], required: true },
  states: { type: [String] },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
})

const shippingRateSchema = new Schema<IShippingRate>({
  zoneId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  method: { type: String, enum: ['flat_rate', 'free', 'weight_based', 'order_total'], required: true },
  cost: { type: Number, default: 0 },
  minOrderAmount: { type: Number },
  maxOrderAmount: { type: Number },
  minWeight: { type: Number },
  maxWeight: { type: Number },
  estimatedDays: { type: String, default: '3-5' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

const storeSettingsSchema = new Schema<IStoreSettings>({
  storeName: { type: String, required: true },
  storeDescription: { type: String },
  storeLogo: { type: String },
  favicon: { type: String },
  storeEmail: { type: String, required: true },
  storePhone: { type: String },
  storeAddress: { type: String },
  businessName: { type: String },
  businessAddress: { type: String },
  businessPhone: { type: String },
  businessEmail: { type: String },
  taxId: { type: String },
  vatNumber: { type: String },
  registrationNumber: { type: String },
  facebookUrl: { type: String },
  twitterUrl: { type: String },
  instagramUrl: { type: String },
  linkedinUrl: { type: String },
  privacyPolicy: { type: String },
  termsOfService: { type: String },
  returnPolicy: { type: String },
  shippingPolicy: { type: String },
  paymentMethods: {
    razorpay: { type: Boolean, default: true }
  },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' }
}, {
  timestamps: true
})

export const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema)
export const Account = mongoose.models?.Account || mongoose.model<IAccount>('Account', accountSchema)
export const Session = mongoose.models?.Session || mongoose.model<ISession>('Session', sessionSchema)
export const Category = mongoose.models?.Category || mongoose.model<ICategory>('Category', categorySchema)
export const Product = mongoose.models?.Product || mongoose.model<IProduct>('Product', productSchema)
export const Order = mongoose.models?.Order || mongoose.model<IOrder>('Order', orderSchema)
export const OrderItem = mongoose.models?.OrderItem || mongoose.model<IOrderItem>('OrderItem', orderItemSchema)
export const Review = mongoose.models?.Review || mongoose.model<IReview>('Review', reviewSchema)
export const Cart = mongoose.models?.Cart || mongoose.model<ICart>('Cart', cartSchema)
export const CartItem = mongoose.models?.CartItem || mongoose.model<ICartItem>('CartItem', cartItemSchema)
export const Coupon = mongoose.models?.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema)
export const Wishlist = mongoose.models?.Wishlist || mongoose.model<IWishlist>('Wishlist', wishlistSchema)
export const NewsletterSubscription = mongoose.models?.NewsletterSubscription || mongoose.model<INewsletterSubscription>('NewsletterSubscription', newsletterSubscriptionSchema)
export const ProductView = mongoose.models?.ProductView || mongoose.model<IProductView>('ProductView', productViewSchema)
export const Setting = mongoose.models?.Setting || mongoose.model<ISetting>('Setting', settingSchema)
export const Report = mongoose.models?.Report || mongoose.model<IReport>('Report', reportSchema)
export const NewsletterCampaign = mongoose.models?.NewsletterCampaign || mongoose.model<INewsletterCampaign>('NewsletterCampaign', newsletterCampaignSchema)
export const ShippingZone = mongoose.models?.ShippingZone || mongoose.model<IShippingZone>('ShippingZone', shippingZoneSchema)
export const ShippingRate = mongoose.models?.ShippingRate || mongoose.model<IShippingRate>('ShippingRate', shippingRateSchema)
export const StoreSettings = mongoose.models?.StoreSettings || mongoose.model<IStoreSettings>('StoreSettings', storeSettingsSchema)