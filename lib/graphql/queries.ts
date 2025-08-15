import { gql } from '@apollo/client'

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts(
    $page: Int
    $perPage: Int
    $filters: ProductFilters
    $sort: ProductSort
  ) {
    products(page: $page, perPage: $perPage, filters: $filters, sort: $sort) {
      products {
        id
        name
        slug
        description
        shortDescription
        price
        comparePrice
        discountPercentage
        images {
          url
          publicId
          alt
          isPrimary
        }
        categoryId
        category {
          id
          name
          description
          image
        }
        stock
        sku
        tags
        status
        featured
        averageRating
        totalReviews
        createdAt
        updatedAt
      }
      total
      page
      perPage
    }
  }
`

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      shortDescription
      price
      comparePrice
      discountPercentage
      images {
        url
        publicId
        alt
        isPrimary
      }
      categoryId
      category {
        id
        name
        description
        image
      }
      stock
      lowStockThreshold
      sku
      weight
      dimensions {
        length
        width
        height
      }
      tags
      metaTitle
      metaDescription
      status
      featured
      averageRating
      totalReviews
      createdAt
      updatedAt
    }
  }
`

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      name
      slug
      description
      shortDescription
      price
      comparePrice
      discountPercentage
      images {
        url
        publicId
        alt
        isPrimary
      }
      categoryId
      category {
        id
        name
        description
        image
      }
      stock
      lowStockThreshold
      sku
      weight
      dimensions {
        length
        width
        height
      }
      tags
      metaTitle
      metaDescription
      status
      featured
      averageRating
      totalReviews
      createdAt
      updatedAt
    }
  }
`

export const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($productId: ID!, $limit: Int) {
    relatedProducts(productId: $productId, limit: $limit) {
      id
      name
      slug
      price
      comparePrice
      images {
        url
        publicId
        alt
        isPrimary
      }
      category {
        id
        name
      }
      averageRating
      totalReviews
    }
  }
`

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($limit: Int) {
    featuredProducts(limit: $limit) {
      id
      name
      slug
      price
      comparePrice
      images {
        url
        publicId
        alt
        isPrimary
      }
      category {
        id
        name
      }
      averageRating
      totalReviews
    }
  }
`

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders(
    $page: Int
    $perPage: Int
    $filters: OrderFilters
    $sort: OrderSort
  ) {
    orders(page: $page, perPage: $perPage, filters: $filters, sort: $sort) {
      orders {
        id
        userId
        user {
          id
          name
          email
        }
        orderNumber
        status
        paymentStatus
        items {
          productId
          name
          price
          comparePrice
          quantity
          image
          sku
        }
        shippingAddress {
          firstName
          lastName
          email
          phone
          address
          city
          state
          zipCode
          country
        }
        paymentMethod {
          type
          lastFourDigits
        }
        totalAmount
        subtotal
        shippingCost
        taxAmount
        savings
        shippingMethod
        orderNotes
        trackingNumber
        createdAt
        updatedAt
      }
      total
      page
      perPage
    }
  }
`

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      userId
      user {
        id
        name
        email
      }
      orderNumber
      status
      paymentStatus
      items {
        productId
        name
        price
        comparePrice
        quantity
        image
        sku
      }
      shippingAddress {
        firstName
        lastName
        email
        phone
        address
        city
        state
        zipCode
        country
      }
      paymentMethod {
        type
        lastFourDigits
      }
      totalAmount
      subtotal
      shippingCost
      taxAmount
      savings
      shippingMethod
      orderNotes
      trackingNumber
      stripePaymentId
      razorpayOrderId
      razorpayPaymentId
      shippedAt
      deliveredAt
      refundId
      refundAmount
      refundedAt
      createdAt
      updatedAt
    }
  }
`

export const GET_USER_ORDERS = gql`
  query GetUserOrders($userId: ID!, $page: Int, $perPage: Int) {
    userOrders(userId: $userId, page: $page, perPage: $perPage) {
      orders {
        id
        orderNumber
        status
        paymentStatus
        totalAmount
        createdAt
        items {
          productId
          name
          price
          quantity
          image
        }
      }
      total
      page
      perPage
    }
  }
`

// Review Queries
export const GET_REVIEWS = gql`
  query GetReviews(
    $page: Int
    $perPage: Int
    $filters: ReviewFilters
    $sort: ReviewSort
  ) {
    reviews(page: $page, perPage: $perPage, filters: $filters, sort: $sort) {
      reviews {
        id
        rating
        comment
        userId
        user {
          id
          name
          image
        }
        productId
        product {
          id
          name
          slug
        }
        isVerified
        createdAt
        updatedAt
      }
      total
      page
      perPage
    }
  }
`

export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $page: Int, $perPage: Int) {
    productReviews(productId: $productId, page: $page, perPage: $perPage) {
      reviews {
        id
        rating
        comment
        userId
        user {
          id
          name
          image
        }
        isVerified
        createdAt
      }
      total
      page
      perPage
    }
  }
`

// User Queries
export const GET_USERS = gql`
  query GetUsers($page: Int, $perPage: Int, $filters: UserFilters) {
    users(page: $page, perPage: $perPage, filters: $filters) {
      users {
        id
        name
        email
        role
        status
        phone
        city
        country
        lastLoginAt
        orderCount
        totalSpent
        tags
        createdAt
      }
      total
      page
      perPage
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      image
      phone
      address
      city
      state
      zipCode
      country
      dateOfBirth
      role
      tags
      status
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`

// User Queries  
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      email
      image
      phone
      address
      city
      state
      zipCode
      country
      dateOfBirth
      role
      status
      createdAt
      updatedAt
    }
  }
`


// Coupon Queries
export const GET_COUPONS = gql`
  query GetCoupons {
    coupons {
      id
      code
      name
      description
      discountType
      discountValue
      minOrderAmount
      maxDiscountAmount
      usageLimit
      usedCount
      isActive
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
`

export const GET_COUPON_BY_CODE = gql`
  query GetCouponByCode($code: String!) {
    couponByCode(code: $code) {
      id
      code
      name
      description
      discountType
      discountValue
      minOrderAmount
      maxDiscountAmount
      usageLimit
      usedCount
      isActive
      startDate
      endDate
    }
  }
`

// Newsletter Queries
export const GET_NEWSLETTER_SUBSCRIBERS = gql`
  query GetNewsletterSubscribers {
    newsletterSubscribers {
      id
      email
      name
      isActive
      subscribedAt
      unsubscribedAt
      source
      tags
    }
  }
`

// Analytics Queries
export const GET_ANALYTICS = gql`
  query GetAnalytics {
    analytics {
      sales {
        totalRevenue
        totalOrders
        averageOrderValue
        revenueGrowth
        ordersGrowth
      }
      products {
        totalProducts
        activeProducts
        lowStockProducts
        featuredProducts
      }
      users {
        totalUsers
        newUsersThisMonth
        activeUsers
        userGrowth
      }
      reviews {
        totalReviews
        averageRating
        reviewsThisMonth
        verifiedReviews
      }
    }
  }
`

// Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      slug
      description
      price
      category {
        id
        name
      }
      stock
      status
      featured
      createdAt
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      slug
      description
      price
      category {
        id
        name
      }
      stock
      status
      featured
      updatedAt
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      image
      createdAt
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      description
      image
      updatedAt
    }
  }
`

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      paymentStatus
      totalAmount
      items {
        productId
        name
        price
        quantity
        image
      }
      createdAt
    }
  }
`

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`

export const SUBSCRIBE_NEWSLETTER = gql`
  mutation SubscribeNewsletter($email: String!, $name: String) {
    subscribeNewsletter(email: $email, name: $name) {
      id
      email
      name
      isActive
      subscribedAt
    }
  }
`

export const UNSUBSCRIBE_NEWSLETTER = gql`
  mutation UnsubscribeNewsletter($email: String!) {
    unsubscribeNewsletter(email: $email)
  }
`

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: ReviewInput!) {
    updateReview(id: $id, input: $input) {
      id
      rating
      comment
      isVerified
      updatedAt
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      image
      phone
      address
      city
      state
      zipCode
      country
      dateOfBirth
      role
      tags
      status
      updatedAt
    }
  }
`

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      userId
      productId
      isVerified
      createdAt
    }
  }
`


export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CouponInput!) {
    createCoupon(input: $input) {
      id
      code
      name
      description
      discountType
      discountValue
      minOrderAmount
      maxDiscountAmount
      usageLimit
      usedCount
      isActive
      startDate
      endDate
      createdAt
    }
  }
`

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: ID!, $input: CouponInput!) {
    updateCoupon(id: $id, input: $input) {
      id
      code
      name
      description
      discountType
      discountValue
      minOrderAmount
      maxDiscountAmount
      usageLimit
      usedCount
      isActive
      startDate
      endDate
      updatedAt
    }
  }
`

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id)
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`

// Shipping Zone Queries and Mutations
export const GET_SHIPPING_ZONES = gql`
  query GetShippingZones {
    shippingZones {
      id
      name
      countries
      states
      isDefault
      createdAt
      updatedAt
    }
  }
`

export const CREATE_SHIPPING_ZONE = gql`
  mutation CreateShippingZone($input: ShippingZoneInput!) {
    createShippingZone(input: $input) {
      id
      name
      countries
      states
      isDefault
      createdAt
    }
  }
`

export const UPDATE_SHIPPING_ZONE = gql`
  mutation UpdateShippingZone($id: ID!, $input: ShippingZoneInput!) {
    updateShippingZone(id: $id, input: $input) {
      id
      name
      countries
      states
      isDefault
      updatedAt
    }
  }
`

export const DELETE_SHIPPING_ZONE = gql`
  mutation DeleteShippingZone($id: ID!) {
    deleteShippingZone(id: $id)
  }
`

// Shipping Rate Queries and Mutations
export const GET_SHIPPING_RATES = gql`
  query GetShippingRates {
    shippingRates {
      id
      zoneId
      zoneName
      name
      description
      method
      cost
      minOrderAmount
      maxOrderAmount
      minWeight
      maxWeight
      estimatedDays
      isActive
      createdAt
      updatedAt
    }
  }
`

export const CREATE_SHIPPING_RATE = gql`
  mutation CreateShippingRate($input: ShippingRateInput!) {
    createShippingRate(input: $input) {
      id
      zoneId
      zoneName
      name
      description
      method
      cost
      minOrderAmount
      maxOrderAmount
      minWeight
      maxWeight
      estimatedDays
      isActive
      createdAt
    }
  }
`

export const UPDATE_SHIPPING_RATE = gql`
  mutation UpdateShippingRate($id: ID!, $input: ShippingRateInput!) {
    updateShippingRate(id: $id, input: $input) {
      id
      zoneId
      zoneName
      name
      description
      method
      cost
      minOrderAmount
      maxOrderAmount
      minWeight
      maxWeight
      estimatedDays
      isActive
      updatedAt
    }
  }
`

export const DELETE_SHIPPING_RATE = gql`
  mutation DeleteShippingRate($id: ID!) {
    deleteShippingRate(id: $id)
  }
`

// Settings Queries and Mutations
export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      storeName
      storeDescription
      storeLogo
      favicon
      storeEmail
      storePhone
      storeAddress
      businessName
      businessAddress
      businessPhone
      businessEmail
      taxId
      vatNumber
      registrationNumber
      facebookUrl
      twitterUrl
      instagramUrl
      linkedinUrl
      privacyPolicy
      termsOfService
      returnPolicy
      shippingPolicy
      paymentMethods {
        razorpay
      }
      currency
      timezone
      language
      dateFormat
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($input: SettingsInput!) {
    updateSettings(input: $input) {
      storeName
      storeEmail
      currency
    }
  }
`

// Newsletter Queries and Mutations
export const GET_NEWSLETTER_CAMPAIGNS = gql`
  query GetNewsletterCampaigns {
    newsletterCampaigns {
      id
      subject
      content
      status
      recipientCount
      openRate
      clickRate
      sentAt
      scheduledAt
      createdAt
    }
  }
`

export const CREATE_NEWSLETTER_CAMPAIGN = gql`
  mutation CreateNewsletterCampaign($input: NewsletterCampaignInput!) {
    createNewsletterCampaign(input: $input) {
      id
      subject
      content
      status
      recipientCount
      createdAt
    }
  }
`

export const UPDATE_NEWSLETTER_CAMPAIGN = gql`
  mutation UpdateNewsletterCampaign($id: ID!, $input: NewsletterCampaignInput!) {
    updateNewsletterCampaign(id: $id, input: $input) {
      id
      subject
      content
      status
      updatedAt
    }
  }
`

export const DELETE_NEWSLETTER_CAMPAIGN = gql`
  mutation DeleteNewsletterCampaign($id: ID!) {
    deleteNewsletterCampaign(id: $id)
  }
`

export const GET_NEWSLETTER_STATS = gql`
  query GetNewsletterStats {
    newsletterStats {
      totalSubscribers
      activeSubscribers
      unsubscribeRate
      averageOpenRate
      averageClickRate
      recentGrowth
    }
  }
`

export const UPDATE_NEWSLETTER_SUBSCRIBER = gql`
  mutation UpdateNewsletterSubscriber($id: ID!, $input: NewsletterSubscriberUpdateInput!) {
    updateNewsletterSubscriber(id: $id, input: $input) {
      id
      email
      name
      isActive
      updatedAt
    }
  }
`

export const DELETE_NEWSLETTER_SUBSCRIBER = gql`
  mutation DeleteNewsletterSubscriber($id: ID!) {
    deleteNewsletterSubscriber(id: $id)
  }
`

export const CREATE_NEWSLETTER_SUBSCRIBER = gql`
  mutation CreateNewsletterSubscriber($input: NewsletterSubscriberInput!) {
    createNewsletterSubscriber(input: $input) {
      id
      email
      name
      isActive
      subscribedAt
      source
    }
  }
`

// Reports and Analytics Queries
export const GET_REPORTS = gql`
  query GetReports {
    reports {
      id
      name
      type
      generatedAt
      period
      status
      downloadUrl
    }
  }
`

export const GET_SALES_REPORT = gql`
  query GetSalesReport($period: String!) {
    salesReport(period: $period) {
      totalRevenue
      totalOrders
      averageOrderValue
      growthRate
      topProducts {
        name
        sales
        revenue
      }
      salesByMonth {
        month
        sales
        revenue
      }
    }
  }
`

export const GENERATE_REPORT = gql`
  mutation GenerateReport($input: ReportGenerationInput!) {
    generateReport(input: $input) {
      id
      name
      type
      status
      createdAt
    }
  }
`

// Dashboard Analytics Query
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($userId: ID) {
    dashboardStats(userId: $userId) {
      totalOrders
      pendingOrders
      totalSpent
      recentOrders {
        id
        orderNumber
        status
        totalAmount
        items {
          productId
          name
          quantity
        }
        createdAt
      }
    }
  }
`

// User Profile Queries (Specific for Profile Page)
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      email
      phone
      address
      city
      state
      zipCode
      country
      dateOfBirth
      updatedAt
    }
  }
`
