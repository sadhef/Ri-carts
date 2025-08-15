export const typeDefs = `
  scalar DateTime

  enum Role {
    USER
    ADMIN
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  enum ProductStatus {
    ACTIVE
    INACTIVE
    DRAFT
    OUT_OF_STOCK
  }

  enum DiscountType {
    PERCENTAGE
    FIXED_AMOUNT
    FREE_SHIPPING
  }

  enum SortOrder {
    ASC
    DESC
  }

  # User Types
  type User {
    id: ID!
    name: String
    email: String!
    emailVerified: DateTime
    image: String
    phone: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    dateOfBirth: String
    role: Role!
    tags: [String!]
    status: String
    lastLoginAt: DateTime
    orderCount: Int
    totalSpent: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Product Types
  type ProductImage {
    url: String!
    publicId: String!
    alt: String
    isPrimary: Boolean
  }

  type ProductDimensions {
    length: Float!
    width: Float!
    height: Float!
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String!
    shortDescription: String
    price: Float!
    comparePrice: Float
    discountPercentage: Float
    images: [ProductImage!]!
    categoryId: String!
    category: Category
    stock: Int!
    lowStockThreshold: Int!
    sku: String!
    weight: Float
    dimensions: ProductDimensions
    tags: [String!]!
    metaTitle: String
    metaDescription: String
    status: ProductStatus!
    featured: Boolean!
    averageRating: Float!
    totalReviews: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    image: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Order Types
  type OrderItem {
    productId: String!
    name: String!
    price: Float!
    comparePrice: Float
    quantity: Int!
    image: String!
    sku: String!
  }

  type ShippingAddress {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    address: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  type PaymentMethod {
    type: String!
    lastFourDigits: String
  }

  type Order {
    id: ID!
    userId: String!
    user: User
    orderNumber: String!
    status: OrderStatus!
    paymentStatus: String!
    items: [OrderItem!]!
    shippingAddress: ShippingAddress!
    paymentMethod: PaymentMethod!
    totalAmount: Float!
    subtotal: Float!
    shippingCost: Float!
    taxAmount: Float!
    savings: Float
    shippingMethod: String!
    orderNotes: String
    trackingNumber: String
    stripePaymentId: String
    razorpayOrderId: String
    razorpayPaymentId: String
    shippedAt: DateTime
    deliveredAt: DateTime
    refundId: String
    refundAmount: Float
    refundedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Review Types
  type Review {
    id: ID!
    rating: Int!
    comment: String
    userId: String!
    user: User
    productId: String!
    product: Product
    isVerified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }


  # Coupon Types
  type Coupon {
    id: ID!
    code: String!
    name: String!
    description: String
    discountType: DiscountType!
    discountValue: Float!
    minOrderAmount: Float
    maxDiscountAmount: Float
    usageLimit: Int
    usedCount: Int!
    isActive: Boolean!
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Newsletter Types
  type NewsletterSubscriber {
    id: ID!
    email: String!
    name: String
    isActive: Boolean!
    subscribedAt: DateTime!
    unsubscribedAt: DateTime
    source: String!
    tags: [String!]!
  }

  # Connection Types
  type ProductConnection {
    products: [Product!]!
    total: Int!
    page: Int!
    perPage: Int!
  }

  type OrderConnection {
    orders: [Order!]!
    total: Int!
    page: Int!
    perPage: Int!
  }

  type ReviewConnection {
    reviews: [Review!]!
    total: Int!
    page: Int!
    perPage: Int!
  }

  type UserConnection {
    users: [User!]!
    total: Int!
    page: Int!
    perPage: Int!
  }

  # Input Types
  input ProductFilters {
    category: String
    search: String
    minPrice: Float
    maxPrice: Float
    tags: [String!]
    featured: Boolean
    status: ProductStatus
  }

  input OrderFilters {
    status: OrderStatus
    paymentStatus: String
    userId: String
    dateFrom: DateTime
    dateTo: DateTime
  }

  input ReviewFilters {
    productId: String
    userId: String
    rating: Int
    isVerified: Boolean
  }

  input UserFilters {
    role: Role
    status: String
    search: String
  }

  enum ProductSortField {
    name
    price
    createdAt
    averageRating
  }

  enum OrderSortField {
    createdAt
    totalAmount
    status
  }

  enum ReviewSortField {
    createdAt
    rating
  }

  input ProductSort {
    field: ProductSortField!
    order: SortOrder!
  }

  input OrderSort {
    field: OrderSortField!
    order: SortOrder!
  }

  input ReviewSort {
    field: ReviewSortField!
    order: SortOrder!
  }

  # Inputs for mutations
  input ProductInput {
    name: String!
    slug: String!
    description: String!
    shortDescription: String
    price: Float!
    comparePrice: Float
    categoryId: String!
    stock: Int!
    lowStockThreshold: Int!
    sku: String!
    weight: Float
    tags: [String!]!
    metaTitle: String
    metaDescription: String
    status: ProductStatus!
    featured: Boolean!
  }

  input CategoryInput {
    name: String!
    description: String
    image: String
  }

  input ReviewInput {
    rating: Int!
    comment: String
    productId: String!
    orderId: String
  }


  input OrderInput {
    items: [OrderItemInput!]!
    shippingAddress: ShippingAddressInput!
    paymentMethod: PaymentMethodInput!
    shippingMethod: String!
    orderNotes: String
  }

  input OrderItemInput {
    productId: String!
    name: String!
    price: Float!
    comparePrice: Float
    quantity: Int!
    image: String!
    sku: String!
  }

  input ShippingAddressInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    address: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  input PaymentMethodInput {
    type: String!
    lastFourDigits: String
  }

  input CouponInput {
    code: String!
    name: String!
    description: String
    discountType: DiscountType!
    discountValue: Float!
    minOrderAmount: Float
    maxDiscountAmount: Float
    usageLimit: Int
    isActive: Boolean!
    startDate: DateTime
    endDate: DateTime
  }

  # Shipping Input Types
  input ShippingZoneInput {
    name: String!
    countries: [String!]!
    states: [String!]
    isDefault: Boolean
  }

  input ShippingRateInput {
    zoneId: String!
    name: String!
    description: String
    method: String!
    cost: Float!
    minOrderAmount: Float
    maxOrderAmount: Float
    minWeight: Float
    maxWeight: Float
    estimatedDays: String!
    isActive: Boolean
  }

  # Newsletter Input Types
  input NewsletterCampaignInput {
    subject: String!
    content: String!
    scheduledAt: DateTime
  }

  input NewsletterSubscriberInput {
    email: String!
    name: String
  }

  input NewsletterSubscriberUpdateInput {
    name: String
    isActive: Boolean
  }

  # Settings Input Types
  input SettingsInput {
    storeName: String!
    storeDescription: String
    storeLogo: String
    favicon: String
    storeEmail: String!
    storePhone: String
    storeAddress: String
    businessName: String
    businessAddress: String
    businessPhone: String
    businessEmail: String
    taxId: String
    vatNumber: String
    registrationNumber: String
    facebookUrl: String
    twitterUrl: String
    instagramUrl: String
    linkedinUrl: String
    privacyPolicy: String
    termsOfService: String
    returnPolicy: String
    shippingPolicy: String
    paymentMethods: PaymentMethodsInput!
    currency: String!
    timezone: String!
    language: String!
    dateFormat: String!
  }

  input PaymentMethodsInput {
    razorpay: Boolean!
  }

  # Report Input Types
  input ReportGenerationInput {
    name: String!
    type: String!
    period: String!
  }

  # Shipping Types
  type ShippingZone {
    id: ID!
    name: String!
    countries: [String!]!
    states: [String!]
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ShippingRate {
    id: ID!
    zoneId: String!
    zoneName: String!
    name: String!
    description: String
    method: String!
    cost: Float!
    minOrderAmount: Float
    maxOrderAmount: Float
    minWeight: Float
    maxWeight: Float
    estimatedDays: String!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Newsletter Campaign Types
  type NewsletterCampaign {
    id: ID!
    subject: String!
    content: String!
    status: String!
    recipientCount: Int!
    openRate: Float
    clickRate: Float
    sentAt: DateTime
    scheduledAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type NewsletterStats {
    totalSubscribers: Int!
    activeSubscribers: Int!
    unsubscribeRate: Float!
    averageOpenRate: Float!
    averageClickRate: Float!
    recentGrowth: Float!
  }

  # Settings Types
  type StoreSettings {
    storeName: String!
    storeDescription: String
    storeLogo: String
    favicon: String
    storeEmail: String!
    storePhone: String
    storeAddress: String
    businessName: String
    businessAddress: String
    businessPhone: String
    businessEmail: String
    taxId: String
    vatNumber: String
    registrationNumber: String
    facebookUrl: String
    twitterUrl: String
    instagramUrl: String
    linkedinUrl: String
    privacyPolicy: String
    termsOfService: String
    returnPolicy: String
    shippingPolicy: String
    paymentMethods: PaymentMethods!
    currency: String!
    timezone: String!
    language: String!
    dateFormat: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type PaymentMethods {
    razorpay: Boolean!
  }

  # Analytics Types
  type SalesStats {
    totalRevenue: Float!
    totalOrders: Int!
    averageOrderValue: Float!
    revenueGrowth: Float!
    ordersGrowth: Float!
  }

  type ProductStats {
    totalProducts: Int!
    activeProducts: Int!
    lowStockProducts: Int!
    featuredProducts: Int!
  }

  type UserStats {
    totalUsers: Int!
    newUsersThisMonth: Int!
    activeUsers: Int!
    userGrowth: Float!
  }

  type ReviewStats {
    totalReviews: Int!
    averageRating: Float!
    reviewsThisMonth: Int!
    verifiedReviews: Int!
  }

  type Analytics {
    sales: SalesStats!
    products: ProductStats!
    users: UserStats!
    reviews: ReviewStats!
  }

  # Report Types
  type Report {
    id: ID!
    name: String!
    type: String!
    generatedAt: DateTime!
    period: String!
    status: String!
    downloadUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SalesReport {
    totalRevenue: Float!
    totalOrders: Int!
    averageOrderValue: Float!
    period: String!
    salesByMonth: [MonthlySales!]!
  }

  type MonthlySales {
    month: String!
    sales: Int!
    revenue: Float!
  }

  # Query Type
  type Query {
    # Product Queries
    products(
      page: Int = 1
      perPage: Int = 12
      filters: ProductFilters
      sort: ProductSort
    ): ProductConnection!
    
    product(id: ID!): Product
    productBySlug(slug: String!): Product
    relatedProducts(productId: ID!, limit: Int = 4): [Product!]!
    featuredProducts(limit: Int = 8): [Product!]!
    
    # Category Queries
    categories: [Category!]!
    category(id: ID!): Category
    
    # Order Queries
    orders(
      page: Int = 1
      perPage: Int = 10
      filters: OrderFilters
      sort: OrderSort
    ): OrderConnection!
    
    order(id: ID!): Order
    userOrders(userId: ID!, page: Int = 1, perPage: Int = 10): OrderConnection!
    
    # Review Queries
    reviews(
      page: Int = 1
      perPage: Int = 10
      filters: ReviewFilters
      sort: ReviewSort
    ): ReviewConnection!
    
    review(id: ID!): Review
    productReviews(productId: ID!, page: Int = 1, perPage: Int = 10): ReviewConnection!
    
    # User Queries
    users(
      page: Int = 1
      perPage: Int = 10
      filters: UserFilters
    ): UserConnection!
    
    user(id: ID!): User
    currentUser: User
    
    
    # Coupon Queries
    coupons: [Coupon!]!
    coupon(id: ID!): Coupon
    couponByCode(code: String!): Coupon
    
    # Newsletter Queries
    newsletterSubscribers: [NewsletterSubscriber!]!
    newsletterCampaigns: [NewsletterCampaign!]!
    newsletterStats: NewsletterStats!
    
    # Shipping Queries
    shippingZones: [ShippingZone!]!
    shippingRates: [ShippingRate!]!
    
    # Settings Queries
    settings: StoreSettings!
    
    # Reports Queries
    reports: [Report!]!
    salesReport(period: String!): SalesReport!
    
    # Analytics Queries
    analytics: Analytics!
  }

  # Mutation Type
  type Mutation {
    # Product Mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    
    # Category Mutations
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    
    # Order Mutations
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    updateOrderTracking(id: ID!, trackingNumber: String!): Order!
    refundOrder(id: ID!, amount: Float, reason: String): Order!
    
    # Review Mutations
    createReview(input: ReviewInput!): Review!
    updateReview(id: ID!, input: ReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    
    
    # Coupon Mutations
    createCoupon(input: CouponInput!): Coupon!
    updateCoupon(id: ID!, input: CouponInput!): Coupon!
    deleteCoupon(id: ID!): Boolean!
    
    # Newsletter Mutations
    subscribeNewsletter(email: String!, name: String): NewsletterSubscriber!
    unsubscribeNewsletter(email: String!): Boolean!
    createNewsletterCampaign(input: NewsletterCampaignInput!): NewsletterCampaign!
    updateNewsletterCampaign(id: ID!, input: NewsletterCampaignInput!): NewsletterCampaign!
    deleteNewsletterCampaign(id: ID!): Boolean!
    createNewsletterSubscriber(input: NewsletterSubscriberInput!): NewsletterSubscriber!
    updateNewsletterSubscriber(id: ID!, input: NewsletterSubscriberUpdateInput!): NewsletterSubscriber!
    deleteNewsletterSubscriber(id: ID!): Boolean!
    
    # Shipping Mutations
    createShippingZone(input: ShippingZoneInput!): ShippingZone!
    updateShippingZone(id: ID!, input: ShippingZoneInput!): ShippingZone!
    deleteShippingZone(id: ID!): Boolean!
    createShippingRate(input: ShippingRateInput!): ShippingRate!
    updateShippingRate(id: ID!, input: ShippingRateInput!): ShippingRate!
    deleteShippingRate(id: ID!): Boolean!
    
    # Settings Mutations
    updateSettings(input: SettingsInput!): StoreSettings!
    
    # Report Mutations
    generateReport(input: ReportGenerationInput!): Report!
    
    # User Mutations
    updateUserProfile(input: UserProfileInput!): User!
    updateUserRole(id: ID!, role: Role!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
    banUser(id: ID!): User!
    unbanUser(id: ID!): User!
  }

  input UserProfileInput {
    name: String
    phone: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    dateOfBirth: String
  }

  input UserInput {
    name: String
    phone: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    dateOfBirth: String
    role: Role
    tags: [String!]
    status: String
  }
`