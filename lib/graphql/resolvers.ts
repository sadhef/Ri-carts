import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'
import { auth } from '@/auth'
import { 
  Product, 
  Category, 
  User, 
  Order, 
  Review, 
  Coupon, 
  NewsletterSubscription,
  ShippingZone,
  ShippingRate,
  NewsletterCampaign,
  StoreSettings,
  Report
} from '@/lib/models'
import { 
  serializeProduct, 
  serializeCategory, 
  serializeUser, 
  serializeOrder, 
  serializeReview, 
  serializeCoupon, 
  serializeNewsletterSubscription,
  serializeShippingZone,
  serializeShippingRate,
  serializeNewsletterCampaign,
  serializeStoreSettings
} from '@/lib/serialize'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const ITEMS_PER_PAGE = 12

// DateTime scalar resolver
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (value: any) => value instanceof Date ? value.toISOString() : value,
  parseValue: (value: any) => new Date(value),
  parseLiteral: (ast: any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
})

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    // Product Queries
    products: async (_: any, { page = 1, perPage = ITEMS_PER_PAGE, filters, sort }: any) => {
      try {
        await connectToDatabase()
        
        const filter: any = {}

        if (filters) {
          if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            filter.price = {}
            if (filters.minPrice !== undefined) filter.price.$gte = filters.minPrice
            if (filters.maxPrice !== undefined) filter.price.$lte = filters.maxPrice
          }

          if (filters.category) {
            if (filters.category.match(/^[0-9a-fA-F]{24}$/)) {
              filter.categoryId = filters.category
            } else {
              const categoryDoc = await Category.findOne({ 
                name: { $regex: new RegExp(`^${filters.category}$`, 'i') } 
              }).lean()
              if (categoryDoc) {
                filter.categoryId = categoryDoc._id.toString()
              } else {
                return { products: [], total: 0, perPage, page }
              }
            }
          }

          if (filters.search) {
            filter.$or = [
              { name: { $regex: filters.search, $options: 'i' } },
              { description: { $regex: filters.search, $options: 'i' } }
            ]
          }

          if (filters.tags && filters.tags.length > 0) {
            filter.tags = { $in: filters.tags }
          }

          if (filters.featured !== undefined) {
            filter.featured = filters.featured
          }

          if (filters.status) {
            filter.status = filters.status
          }
        }

        let sortObj: any = { createdAt: -1 }
        if (sort) {
          const order = sort.order === 'ASC' ? 1 : -1
          sortObj = { [sort.field]: order }
        }

        const total = await Product.countDocuments(filter)
        const products = await Product.find(filter)
          .sort(sortObj)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean()

        const productsWithCategory = await Promise.all(
          products.map(async (product) => {
            const category = await Category.findById(product.categoryId).lean()
            return {
              ...serializeProduct(product),
              category: category ? serializeCategory(category) : null
            }
          })
        )

        return { products: productsWithCategory, total, perPage, page }
      } catch (error) {
        console.error('Products GraphQL Error:', error)
        throw new Error('Failed to fetch products')
      }
    },

    product: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const product = await Product.findById(id).lean()
        if (!product) return null

        const category = await Category.findById(product.categoryId).lean()
        return {
          ...serializeProduct(product),
          category: category ? serializeCategory(category) : null
        }
      } catch (error) {
        console.error('Product GraphQL Error:', error)
        throw new Error('Failed to fetch product')
      }
    },

    productBySlug: async (_: any, { slug }: any) => {
      try {
        await connectToDatabase()
        const product = await Product.findOne({ slug }).lean()
        if (!product) return null

        const category = await Category.findById(product.categoryId).lean()
        return {
          ...serializeProduct(product),
          category: category ? serializeCategory(category) : null
        }
      } catch (error) {
        console.error('ProductBySlug GraphQL Error:', error)
        throw new Error('Failed to fetch product')
      }
    },

    relatedProducts: async (_: any, { productId, limit = 4 }: any) => {
      try {
        await connectToDatabase()
        
        const currentProduct = await Product.findById(productId).lean()
        if (!currentProduct) return []

        const relatedProducts = await Product.find({
          categoryId: currentProduct.categoryId,
          _id: { $ne: productId },
          status: 'ACTIVE'
        }).limit(limit).lean()

        const productsWithCategory = await Promise.all(
          relatedProducts.map(async (product) => {
            const category = await Category.findById(product.categoryId).lean()
            return {
              ...serializeProduct(product),
              category: category ? serializeCategory(category) : null
            }
          })
        )

        return productsWithCategory
      } catch (error) {
        console.error('Related Products GraphQL Error:', error)
        throw new Error('Failed to fetch related products')
      }
    },

    featuredProducts: async (_: any, { limit = 8 }: any) => {
      try {
        await connectToDatabase()
        
        const featuredProducts = await Product.find({
          featured: true,
          status: 'ACTIVE'
        }).sort({ createdAt: -1 }).limit(limit).lean()

        const productsWithCategory = await Promise.all(
          featuredProducts.map(async (product) => {
            const category = await Category.findById(product.categoryId).lean()
            return {
              ...serializeProduct(product),
              category: category ? serializeCategory(category) : null
            }
          })
        )

        return productsWithCategory
      } catch (error) {
        console.error('Featured Products GraphQL Error:', error)
        throw new Error('Failed to fetch featured products')
      }
    },

    // Category Queries
    categories: async () => {
      try {
        await connectToDatabase()
        const categories = await Category.find({}).lean()
        return categories.map(serializeCategory)
      } catch (error) {
        console.error('Categories GraphQL Error:', error)
        throw new Error('Failed to fetch categories')
      }
    },

    category: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const category = await Category.findById(id).lean()
        return category ? serializeCategory(category) : null
      } catch (error) {
        console.error('Category GraphQL Error:', error)
        throw new Error('Failed to fetch category')
      }
    },

    // Order Queries
    orders: async (_: any, { page = 1, perPage = 10, filters, sort }: any) => {
      try {
        await connectToDatabase()
        
        const filter: any = {}

        if (filters) {
          if (filters.status) filter.status = filters.status
          if (filters.paymentStatus) filter.paymentStatus = filters.paymentStatus
          if (filters.userId) filter.userId = filters.userId
          if (filters.dateFrom || filters.dateTo) {
            filter.createdAt = {}
            if (filters.dateFrom) filter.createdAt.$gte = new Date(filters.dateFrom)
            if (filters.dateTo) filter.createdAt.$lte = new Date(filters.dateTo)
          }
        }

        let sortObj: any = { createdAt: -1 }
        if (sort) {
          const order = sort.order === 'ASC' ? 1 : -1
          sortObj = { [sort.field]: order }
        }

        const total = await Order.countDocuments(filter)
        const orders = await Order.find(filter)
          .sort(sortObj)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean()

        const ordersWithUser = await Promise.all(
          orders.map(async (order) => {
            const user = await User.findById(order.userId).lean()
            return {
              ...serializeOrder(order),
              user: user ? serializeUser(user) : null
            }
          })
        )

        return { orders: ordersWithUser, total, perPage, page }
      } catch (error) {
        console.error('Orders GraphQL Error:', error)
        throw new Error('Failed to fetch orders')
      }
    },

    order: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const order = await Order.findById(id).lean()
        if (!order) return null

        const user = await User.findById(order.userId).lean()
        return {
          ...serializeOrder(order),
          user: user ? serializeUser(user) : null
        }
      } catch (error) {
        console.error('Order GraphQL Error:', error)
        throw new Error('Failed to fetch order')
      }
    },

    userOrders: async (_: any, { userId, page = 1, perPage = 10 }: any) => {
      try {
        await connectToDatabase()
        
        const filter = { userId }
        const total = await Order.countDocuments(filter)
        const orders = await Order.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean()

        const ordersWithUser = await Promise.all(
          orders.map(async (order) => {
            const user = await User.findById(order.userId).lean()
            return {
              ...serializeOrder(order),
              user: user ? serializeUser(user) : null
            }
          })
        )

        return { orders: ordersWithUser, total, perPage, page }
      } catch (error) {
        console.error('User Orders GraphQL Error:', error)
        throw new Error('Failed to fetch user orders')
      }
    },

    // Review Queries
    reviews: async (_: any, { page = 1, perPage = 10, filters, sort }: any) => {
      try {
        await connectToDatabase()
        
        const filter: any = {}

        if (filters) {
          if (filters.productId) filter.productId = filters.productId
          if (filters.userId) filter.userId = filters.userId
          if (filters.rating) filter.rating = filters.rating
          if (filters.isVerified !== undefined) filter.isVerified = filters.isVerified
        }

        let sortObj: any = { createdAt: -1 }
        if (sort) {
          const order = sort.order === 'ASC' ? 1 : -1
          sortObj = { [sort.field]: order }
        }

        const total = await Review.countDocuments(filter)
        const reviews = await Review.find(filter)
          .sort(sortObj)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean()

        const reviewsWithUserAndProduct = await Promise.all(
          reviews.map(async (review) => {
            const user = await User.findById(review.userId).lean()
            const product = await Product.findById(review.productId).lean()
            return {
              ...serializeReview(review),
              user: user ? serializeUser(user) : null,
              product: product ? serializeProduct(product) : null
            }
          })
        )

        return { reviews: reviewsWithUserAndProduct, total, perPage, page }
      } catch (error) {
        console.error('Reviews GraphQL Error:', error)
        throw new Error('Failed to fetch reviews')
      }
    },

    review: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const review = await Review.findById(id).lean()
        if (!review) return null

        const user = await User.findById(review.userId).lean()
        const product = await Product.findById(review.productId).lean()
        return {
          ...serializeReview(review),
          user: user ? serializeUser(user) : null,
          product: product ? serializeProduct(product) : null
        }
      } catch (error) {
        console.error('Review GraphQL Error:', error)
        throw new Error('Failed to fetch review')
      }
    },

    productReviews: async (_: any, { productId, page = 1, perPage = 10 }: any) => {
      try {
        await connectToDatabase()
        
        const filter = { productId }
        const total = await Review.countDocuments(filter)
        const reviews = await Review.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean()

        const reviewsWithUser = await Promise.all(
          reviews.map(async (review) => {
            const user = await User.findById(review.userId).lean()
            return {
              ...serializeReview(review),
              user: user ? serializeUser(user) : null
            }
          })
        )

        return { reviews: reviewsWithUser, total, perPage, page }
      } catch (error) {
        console.error('Product Reviews GraphQL Error:', error)
        throw new Error('Failed to fetch product reviews')
      }
    },

    // User Queries
    users: async (_: any, { page = 1, perPage = 10, filters }: any) => {
      try {
        await connectToDatabase()
        
        const filter: any = {}

        if (filters) {
          if (filters.role) filter.role = filters.role
          if (filters.status) filter.status = filters.status
          if (filters.search) {
            filter.$or = [
              { name: { $regex: filters.search, $options: 'i' } },
              { email: { $regex: filters.search, $options: 'i' } }
            ]
          }
        }

        const total = await User.countDocuments(filter)
        const users = await User.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean()

        // Calculate order statistics for each user
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const orders = await Order.find({ userId: user._id.toString() }).lean()
            const orderCount = orders.length
            const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            
            return {
              ...serializeUser(user),
              orderCount,
              totalSpent
            }
          })
        )

        return { users: usersWithStats, total, perPage, page }
      } catch (error) {
        console.error('Users GraphQL Error:', error)
        throw new Error('Failed to fetch users')
      }
    },

    user: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const user = await User.findById(id).lean()
        return user ? serializeUser(user) : null
      } catch (error) {
        console.error('User GraphQL Error:', error)
        throw new Error('Failed to fetch user')
      }
    },

    currentUser: async (_: any, __: any, context: any) => {
      try {
        const session = await auth()
        if (!session?.user?.email) return null

        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email }).lean()
        return user ? serializeUser(user) : null
      } catch (error) {
        console.error('Current User GraphQL Error:', error)
        return null
      }
    },



    // Coupon Queries
    coupons: async () => {
      try {
        await connectToDatabase()
        const coupons = await Coupon.find({}).lean()
        return coupons.map(serializeCoupon)
      } catch (error) {
        console.error('Coupons GraphQL Error:', error)
        throw new Error('Failed to fetch coupons')
      }
    },

    coupon: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const coupon = await Coupon.findById(id).lean()
        return coupon ? serializeCoupon(coupon) : null
      } catch (error) {
        console.error('Coupon GraphQL Error:', error)
        throw new Error('Failed to fetch coupon')
      }
    },

    couponByCode: async (_: any, { code }: any) => {
      try {
        await connectToDatabase()
        const coupon = await Coupon.findOne({ code, isActive: true }).lean()
        return coupon ? serializeCoupon(coupon) : null
      } catch (error) {
        console.error('Coupon By Code GraphQL Error:', error)
        throw new Error('Failed to fetch coupon')
      }
    },

    // Newsletter Queries
    newsletterSubscribers: async () => {
      try {
        await connectToDatabase()
        
        // First, fix any existing records with null/undefined source
        await NewsletterSubscription.updateMany(
          { 
            $or: [
              { source: null },
              { source: { $exists: false } },
              { source: '' }
            ]
          },
          { 
            $set: { source: 'website' }
          }
        )
        
        // Fix any records with null/undefined tags
        await NewsletterSubscription.updateMany(
          { 
            $or: [
              { tags: null },
              { tags: { $exists: false } }
            ]
          },
          { 
            $set: { tags: [] }
          }
        )
        
        // Fix any records with null/undefined isActive
        await NewsletterSubscription.updateMany(
          { 
            $or: [
              { isActive: null },
              { isActive: { $exists: false } }
            ]
          },
          { 
            $set: { isActive: true }
          }
        )
        
        const subscribers = await NewsletterSubscription.find({}).lean()
        return subscribers.map(serializeNewsletterSubscription)
      } catch (error) {
        console.error('Newsletter Subscribers GraphQL Error:', error)
        throw new Error('Failed to fetch newsletter subscribers')
      }
    },

    newsletterCampaigns: async () => {
      try {
        await connectToDatabase()
        const campaigns = await NewsletterCampaign.find({}).sort({ createdAt: -1 }).lean()
        return campaigns.map(serializeNewsletterCampaign)
      } catch (error) {
        console.error('Newsletter Campaigns GraphQL Error:', error)
        throw new Error('Failed to fetch newsletter campaigns')
      }
    },

    newsletterStats: async () => {
      try {
        await connectToDatabase()
        
        const totalSubscribers = await NewsletterSubscription.countDocuments({})
        const activeSubscribers = await NewsletterSubscription.countDocuments({ isActive: true })
        const inactiveSubscribers = totalSubscribers - activeSubscribers
        const unsubscribeRate = totalSubscribers > 0 ? (inactiveSubscribers / totalSubscribers * 100) : 0
        
        const campaigns = await NewsletterCampaign.find({}).lean()
        const totalSent = campaigns.filter(c => c.status === 'sent').length
        const averageOpenRate = totalSent > 0 ? campaigns.reduce((sum, c) => sum + (c.openCount / Math.max(c.recipientCount, 1) * 100), 0) / totalSent : 0
        const averageClickRate = totalSent > 0 ? campaigns.reduce((sum, c) => sum + (c.clickCount / Math.max(c.openCount, 1) * 100), 0) / totalSent : 0
        
        const currentMonth = new Date()
        currentMonth.setDate(1)
        const currentMonthSubscribers = await NewsletterSubscription.countDocuments({ subscribedAt: { $gte: currentMonth } })
        const previousMonth = new Date(currentMonth)
        previousMonth.setMonth(previousMonth.getMonth() - 1)
        const previousMonthSubscribers = await NewsletterSubscription.countDocuments({ 
          subscribedAt: { $gte: previousMonth, $lt: currentMonth } 
        })
        const recentGrowth = previousMonthSubscribers > 0 ? 
          ((currentMonthSubscribers - previousMonthSubscribers) / previousMonthSubscribers * 100) : 
          (currentMonthSubscribers > 0 ? 100 : 0)

        return {
          totalSubscribers,
          activeSubscribers,
          unsubscribeRate: Number(unsubscribeRate.toFixed(2)),
          averageOpenRate: Number(averageOpenRate.toFixed(2)),
          averageClickRate: Number(averageClickRate.toFixed(2)),
          recentGrowth: Number(recentGrowth.toFixed(2))
        }
      } catch (error) {
        console.error('Newsletter Stats GraphQL Error:', error)
        throw new Error('Failed to fetch newsletter stats')
      }
    },

    // Shipping Queries
    shippingZones: async () => {
      try {
        await connectToDatabase()
        const zones = await ShippingZone.find({}).sort({ isDefault: -1, createdAt: -1 }).lean()
        return zones.map(serializeShippingZone)
      } catch (error) {
        console.error('Shipping Zones GraphQL Error:', error)
        throw new Error('Failed to fetch shipping zones')
      }
    },

    shippingRates: async () => {
      try {
        await connectToDatabase()
        const rates = await ShippingRate.find({}).sort({ createdAt: -1 }).lean()
        
        const ratesWithZoneNames = await Promise.all(
          rates.map(async (rate) => {
            const zone = await ShippingZone.findById(rate.zoneId).lean()
            return {
              ...serializeShippingRate(rate),
              zoneName: zone ? zone.name : 'Unknown Zone'
            }
          })
        )

        return ratesWithZoneNames
      } catch (error) {
        console.error('Shipping Rates GraphQL Error:', error)
        throw new Error('Failed to fetch shipping rates')
      }
    },

    // Settings Queries
    settings: async () => {
      try {
        await connectToDatabase()
        
        let settings = await StoreSettings.findOne({}).lean()
        
        if (!settings) {
          // Create default settings if none exist
          const defaultSettings = new StoreSettings({
            storeName: 'My Store',
            storeEmail: 'store@example.com',
            currency: 'INR',
            timezone: 'UTC',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            paymentMethods: { razorpay: true }
          })
          await defaultSettings.save()
          settings = defaultSettings.toObject()
        }
        
        // Ensure all required fields have values (fix potential null issues)
        const validatedSettings = {
          ...settings,
          storeName: settings.storeName || 'My Store',
          storeEmail: settings.storeEmail || 'store@example.com',
          currency: settings.currency || 'INR',
          timezone: settings.timezone || 'UTC',
          language: settings.language || 'en',
          dateFormat: settings.dateFormat || 'MM/DD/YYYY',
          paymentMethods: settings.paymentMethods || { razorpay: true }
        }
        
        return serializeStoreSettings(validatedSettings)
      } catch (error) {
        console.error('Settings GraphQL Error:', error)
        throw new Error('Failed to fetch settings')
      }
    },

    // Reports Queries
    reports: async () => {
      try {
        await connectToDatabase()
        const reports = await Report.find({}).sort({ createdAt: -1 }).lean()
        return reports.map(report => ({
          ...report,
          id: report._id.toString(),
          generatedAt: report.createdAt?.toISOString(),
          createdAt: report.createdAt?.toISOString(),
          updatedAt: report.updatedAt?.toISOString()
        }))
      } catch (error) {
        console.error('Reports GraphQL Error:', error)
        throw new Error('Failed to fetch reports')
      }
    },

    salesReport: async (_: any, { period }: any) => {
      try {
        await connectToDatabase()
        
        const endDate = new Date()
        let startDate = new Date()
        
        switch (period) {
          case 'week':
            startDate.setDate(endDate.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(endDate.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(endDate.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
          default:
            startDate.setMonth(endDate.getMonth() - 1)
        }

        const orders = await Order.find({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'CANCELLED' }
        }).lean()

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
        const totalOrders = orders.length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Generate monthly sales data
        const salesByMonth = []
        const currentMonth = new Date(endDate)
        
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1)
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0)
          
          const monthOrders = orders.filter(order => 
            order.createdAt >= monthStart && order.createdAt <= monthEnd
          )
          
          salesByMonth.unshift({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            sales: monthOrders.length,
            revenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0)
          })
        }

        return {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          period,
          salesByMonth: salesByMonth.slice(-6) // Last 6 months
        }
      } catch (error) {
        console.error('Sales Report GraphQL Error:', error)
        throw new Error('Failed to generate sales report')
      }
    },

    // Analytics Queries
    analytics: async () => {
      try {
        await connectToDatabase()

        // Calculate sales stats
        const orders = await Order.find({ status: { $ne: 'CANCELLED' } }).lean()
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
        const totalOrders = orders.length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Calculate growth (simplified - comparing to previous month)
        const currentMonth = new Date()
        currentMonth.setDate(1)
        const previousMonth = new Date(currentMonth)
        previousMonth.setMonth(previousMonth.getMonth() - 1)

        const currentMonthOrders = await Order.find({
          createdAt: { $gte: currentMonth },
          status: { $ne: 'CANCELLED' }
        }).lean()
        const previousMonthOrders = await Order.find({
          createdAt: { $gte: previousMonth, $lt: currentMonth },
          status: { $ne: 'CANCELLED' }
        }).lean()

        const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        const previousRevenue = previousMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0)

        const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
        const ordersGrowth = previousMonthOrders.length > 0 ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100 : 0

        // Product stats
        const totalProducts = await Product.countDocuments({})
        const activeProducts = await Product.countDocuments({ status: 'ACTIVE' })
        const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } })
        const featuredProducts = await Product.countDocuments({ featured: true })

        // User stats
        const totalUsers = await User.countDocuments({})
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: currentMonth } })
        const activeUsers = await User.countDocuments({ status: 'active' })
        const previousMonthUsers = await User.countDocuments({ 
          createdAt: { $gte: previousMonth, $lt: currentMonth } 
        })
        const userGrowth = previousMonthUsers > 0 ? ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers) * 100 : 0

        // Review stats
        const totalReviews = await Review.countDocuments({})
        const reviewsThisMonth = await Review.countDocuments({ createdAt: { $gte: currentMonth } })
        const verifiedReviews = await Review.countDocuments({ isVerified: true })
        const reviews = await Review.find({}).lean()
        const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

        return {
          sales: {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            revenueGrowth,
            ordersGrowth
          },
          products: {
            totalProducts,
            activeProducts,
            lowStockProducts,
            featuredProducts
          },
          users: {
            totalUsers,
            newUsersThisMonth,
            activeUsers,
            userGrowth
          },
          reviews: {
            totalReviews,
            averageRating,
            reviewsThisMonth,
            verifiedReviews
          }
        }
      } catch (error) {
        console.error('Analytics GraphQL Error:', error)
        throw new Error('Failed to fetch analytics')
      }
    },

  },

  Mutation: {
    // Product Mutations
    createProduct: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        const product = new Product(input)
        await product.save()
        
        const category = await Category.findById(product.categoryId).lean()
        return {
          ...serializeProduct(product.toObject()),
          category: category ? serializeCategory(category) : null
        }
      } catch (error) {
        console.error('Create Product GraphQL Error:', error)
        throw new Error('Failed to create product')
      }
    },

    updateProduct: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        const product = await Product.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!product) throw new Error('Product not found')
        
        const category = await Category.findById(product.categoryId).lean()
        return {
          ...serializeProduct(product),
          category: category ? serializeCategory(category) : null
        }
      } catch (error) {
        console.error('Update Product GraphQL Error:', error)
        throw new Error('Failed to update product')
      }
    },

    deleteProduct: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const result = await Product.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Product GraphQL Error:', error)
        throw new Error('Failed to delete product')
      }
    },

    // Category Mutations
    createCategory: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        const category = new Category(input)
        await category.save()
        return serializeCategory(category.toObject())
      } catch (error) {
        console.error('Create Category GraphQL Error:', error)
        throw new Error('Failed to create category')
      }
    },

    updateCategory: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        const category = await Category.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!category) throw new Error('Category not found')
        return serializeCategory(category)
      } catch (error) {
        console.error('Update Category GraphQL Error:', error)
        throw new Error('Failed to update category')
      }
    },

    deleteCategory: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const result = await Category.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Category GraphQL Error:', error)
        throw new Error('Failed to delete category')
      }
    },

    // Order Mutations
    createOrder: async (_: any, { input }: any) => {
      try {
        console.log('CreateOrder Input:', JSON.stringify(input, null, 2))
        
        await connectToDatabase()
        
        const session = await auth()
        let user = null
        
        if (session?.user?.email) {
          user = await User.findOne({ email: session.user.email }).lean()
        }
        
        // For testing purposes, create a default user if not authenticated
        if (!user) {
          user = {
            _id: '507f1f77bcf86cd799439011', // Default test user ID
            email: 'test@example.com',
            name: 'Test User'
          }
        }

        // Validate required fields
        if (!input.items || input.items.length === 0) {
          throw new Error('Order items are required')
        }
        
        if (!input.shippingAddress) {
          throw new Error('Shipping address is required')
        }
        
        if (!input.paymentMethod) {
          throw new Error('Payment method is required')
        }

        // Calculate order totals
        const subtotal = input.items.reduce((total: number, item: any) => {
          return total + (item.price * item.quantity)
        }, 0)
        
        const shippingCost = 10 // Fixed shipping cost
        const taxAmount = subtotal * 0.1 // 10% tax
        const totalAmount = subtotal + shippingCost + taxAmount

        const orderData = {
          ...input,
          userId: user._id.toString(),
          orderNumber: `ORDER-${Date.now()}`,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          shippingCost,
          taxAmount,
          totalAmount,
        }

        const order = new Order(orderData)
        await order.save()
        
        return {
          ...serializeOrder(order.toObject()),
          user: serializeUser(user)
        }
      } catch (error) {
        console.error('Create Order GraphQL Error:', error)
        throw new Error('Failed to create order')
      }
    },

    updateOrderStatus: async (_: any, { id, status }: any) => {
      try {
        await connectToDatabase()
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean()
        if (!order) throw new Error('Order not found')
        
        const user = await User.findById(order.userId).lean()
        return {
          ...serializeOrder(order),
          user: user ? serializeUser(user) : null
        }
      } catch (error) {
        console.error('Update Order Status GraphQL Error:', error)
        throw new Error('Failed to update order status')
      }
    },

    // Newsletter Mutations
    subscribeNewsletter: async (_: any, { email, name }: any) => {
      try {
        await connectToDatabase()
        
        const existingSubscriber = await NewsletterSubscription.findOne({ email }).lean()
        if (existingSubscriber) {
          if (existingSubscriber.isActive) {
            throw new Error('Email already subscribed')
          } else {
            // Reactivate subscription
            const updated = await NewsletterSubscription.findByIdAndUpdate(
              existingSubscriber._id, 
              { isActive: true, unsubscribedAt: null },
              { new: true }
            ).lean()
            return serializeNewsletterSubscription(updated!)
          }
        }

        const subscription = new NewsletterSubscription({
          email,
          name,
          isActive: true,
          subscribedAt: new Date(),
          source: 'website',
          tags: []
        })
        await subscription.save()
        
        return serializeNewsletterSubscription(subscription.toObject())
      } catch (error) {
        console.error('Subscribe Newsletter GraphQL Error:', error)
        throw new Error('Failed to subscribe to newsletter')
      }
    },

    unsubscribeNewsletter: async (_: any, { email }: any) => {
      try {
        await connectToDatabase()
        const result = await NewsletterSubscription.findOneAndUpdate(
          { email },
          { isActive: false, unsubscribedAt: new Date() }
        )
        return !!result
      } catch (error) {
        console.error('Unsubscribe Newsletter GraphQL Error:', error)
        throw new Error('Failed to unsubscribe from newsletter')
      }
    },

    // Review Mutations
    createReview: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user) {
          throw new Error('User not found')
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
          userId: user._id.toString(),
          productId: input.productId
        }).lean()
        
        if (existingReview) {
          throw new Error('You have already reviewed this product')
        }

        // Create the review
        const review = new Review({
          ...input,
          userId: user._id.toString(),
          isVerified: !!input.orderId // Mark as verified if orderId is provided
        })
        
        await review.save()

        // Update product rating statistics
        const reviews = await Review.find({ productId: input.productId }).lean()
        const totalReviews = reviews.length
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

        await Product.findByIdAndUpdate(input.productId, {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews
        })

        return serializeReview(review.toObject())
      } catch (error) {
        console.error('Create Review GraphQL Error:', error)
        throw new Error(error.message || 'Failed to create review')
      }
    },

    updateReview: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user) {
          throw new Error('User not found')
        }

        // Check if the review belongs to the user
        const existingReview = await Review.findById(id).lean()
        if (!existingReview) {
          throw new Error('Review not found')
        }

        if (existingReview.userId !== user._id.toString()) {
          throw new Error('You can only update your own reviews')
        }

        const review = await Review.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!review) throw new Error('Review not found')

        // Update product rating statistics
        const reviews = await Review.find({ productId: review.productId }).lean()
        const totalReviews = reviews.length
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

        await Product.findByIdAndUpdate(review.productId, {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews
        })

        return serializeReview(review)
      } catch (error) {
        console.error('Update Review GraphQL Error:', error)
        throw new Error(error.message || 'Failed to update review')
      }
    },

    deleteReview: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const result = await Review.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Review GraphQL Error:', error)
        throw new Error('Failed to delete review')
      }
    },

    // User Mutations
    updateUserProfile: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email })
        if (!user) {
          throw new Error('User not found')
        }

        // Update user fields
        Object.keys(input).forEach(key => {
          if (input[key] !== undefined) {
            user[key] = input[key]
          }
        })

        await user.save()
        
        return serializeUser(user.toObject())
      } catch (error) {
        console.error('Update User Profile GraphQL Error:', error)
        throw new Error('Failed to update user profile')
      }
    },

    updateUser: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const user = await User.findById(id)
        if (!user) {
          throw new Error('User not found')
        }

        // Update user fields
        Object.keys(input).forEach(key => {
          if (input[key] !== undefined) {
            user[key] = input[key]
          }
        })

        await user.save()
        
        return serializeUser(user.toObject())
      } catch (error) {
        console.error('Update User GraphQL Error:', error)
        throw new Error('Failed to update user')
      }
    },

    deleteUser: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const sessionUser = await User.findOne({ email: session.user.email }).lean()
        if (!sessionUser || sessionUser.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        // Prevent self-deletion
        if (sessionUser._id.toString() === id) {
          throw new Error('Cannot delete yourself')
        }

        const result = await User.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete User GraphQL Error:', error)
        throw new Error('Failed to delete user')
      }
    },

    banUser: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const sessionUser = await User.findOne({ email: session.user.email }).lean()
        if (!sessionUser || sessionUser.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        // Prevent self-ban
        if (sessionUser._id.toString() === id) {
          throw new Error('Cannot ban yourself')
        }

        const user = await User.findByIdAndUpdate(
          id, 
          { status: 'banned' }, 
          { new: true }
        ).lean()
        
        if (!user) throw new Error('User not found')
        return serializeUser(user)
      } catch (error) {
        console.error('Ban User GraphQL Error:', error)
        throw new Error('Failed to ban user')
      }
    },

    unbanUser: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const sessionUser = await User.findOne({ email: session.user.email }).lean()
        if (!sessionUser || sessionUser.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const user = await User.findByIdAndUpdate(
          id, 
          { status: 'active' }, 
          { new: true }
        ).lean()
        
        if (!user) throw new Error('User not found')
        return serializeUser(user)
      } catch (error) {
        console.error('Unban User GraphQL Error:', error)
        throw new Error('Failed to unban user')
      }
    },

    // Newsletter Campaign Mutations
    createNewsletterCampaign: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const subscriberCount = await NewsletterSubscription.countDocuments({ isActive: true })
        
        const campaign = new NewsletterCampaign({
          ...input,
          createdBy: user._id.toString(),
          recipientCount: subscriberCount,
          status: input.scheduledAt ? 'scheduled' : 'draft'
        })
        await campaign.save()
        
        return serializeNewsletterCampaign(campaign.toObject())
      } catch (error) {
        console.error('Create Newsletter Campaign GraphQL Error:', error)
        throw new Error('Failed to create newsletter campaign')
      }
    },

    updateNewsletterCampaign: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const campaign = await NewsletterCampaign.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!campaign) throw new Error('Campaign not found')
        
        return serializeNewsletterCampaign(campaign)
      } catch (error) {
        console.error('Update Newsletter Campaign GraphQL Error:', error)
        throw new Error('Failed to update newsletter campaign')
      }
    },

    deleteNewsletterCampaign: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const result = await NewsletterCampaign.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Newsletter Campaign GraphQL Error:', error)
        throw new Error('Failed to delete newsletter campaign')
      }
    },

    createNewsletterSubscriber: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input.email)) {
          throw new Error('Invalid email format')
        }
        
        const existingSubscriber = await NewsletterSubscription.findOne({ email: input.email }).lean()
        if (existingSubscriber) {
          if (existingSubscriber.isActive) {
            throw new Error('Email already subscribed')
          } else {
            // Reactivate existing subscriber
            const updated = await NewsletterSubscription.findByIdAndUpdate(
              existingSubscriber._id, 
              { 
                isActive: true, 
                unsubscribedAt: null, 
                name: input.name || existingSubscriber.name,
                subscribedAt: new Date() // Update subscription date
              },
              { new: true }
            ).lean()
            return serializeNewsletterSubscription(updated!)
          }
        }

        // Create new subscriber
        const subscriptionData = {
          email: input.email.toLowerCase().trim(),
          name: input.name ? input.name.trim() : undefined,
          isActive: true,
          subscribedAt: new Date(),
          source: 'manual',
          tags: []
        }

        const subscription = new NewsletterSubscription(subscriptionData)
        await subscription.save()
        
        return serializeNewsletterSubscription(subscription.toObject())
      } catch (error) {
        console.error('Create Newsletter Subscriber GraphQL Error:', error)
        if (error.message === 'Invalid email format' || error.message === 'Email already subscribed') {
          throw error
        }
        throw new Error('Failed to create newsletter subscriber')
      }
    },

    updateNewsletterSubscriber: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const subscriber = await NewsletterSubscription.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!subscriber) throw new Error('Subscriber not found')
        
        return serializeNewsletterSubscription(subscriber)
      } catch (error) {
        console.error('Update Newsletter Subscriber GraphQL Error:', error)
        throw new Error('Failed to update newsletter subscriber')
      }
    },

    deleteNewsletterSubscriber: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        const result = await NewsletterSubscription.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Newsletter Subscriber GraphQL Error:', error)
        throw new Error('Failed to delete newsletter subscriber')
      }
    },

    // Shipping Zone Mutations
    createShippingZone: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        if (input.isDefault) {
          await ShippingZone.updateMany({}, { isDefault: false })
        }

        const zone = new ShippingZone(input)
        await zone.save()
        
        return serializeShippingZone(zone.toObject())
      } catch (error) {
        console.error('Create Shipping Zone GraphQL Error:', error)
        throw new Error('Failed to create shipping zone')
      }
    },

    updateShippingZone: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        if (input.isDefault) {
          await ShippingZone.updateMany({ _id: { $ne: id } }, { isDefault: false })
        }

        const zone = await ShippingZone.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!zone) throw new Error('Zone not found')
        
        return serializeShippingZone(zone)
      } catch (error) {
        console.error('Update Shipping Zone GraphQL Error:', error)
        throw new Error('Failed to update shipping zone')
      }
    },

    deleteShippingZone: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const zone = await ShippingZone.findById(id).lean()
        if (zone?.isDefault) {
          throw new Error('Cannot delete default zone')
        }

        await ShippingRate.deleteMany({ zoneId: id })
        const result = await ShippingZone.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Shipping Zone GraphQL Error:', error)
        throw new Error('Failed to delete shipping zone')
      }
    },

    // Shipping Rate Mutations
    createShippingRate: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const zone = await ShippingZone.findById(input.zoneId).lean()
        if (!zone) {
          throw new Error('Shipping zone not found')
        }

        const rate = new ShippingRate(input)
        await rate.save()
        
        const serializedRate = serializeShippingRate(rate.toObject())
        return {
          ...serializedRate,
          zoneName: zone.name
        }
      } catch (error) {
        console.error('Create Shipping Rate GraphQL Error:', error)
        throw new Error('Failed to create shipping rate')
      }
    },

    updateShippingRate: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const rate = await ShippingRate.findByIdAndUpdate(id, input, { new: true }).lean()
        if (!rate) throw new Error('Rate not found')
        
        const zone = await ShippingZone.findById(rate.zoneId).lean()
        const serializedRate = serializeShippingRate(rate)
        return {
          ...serializedRate,
          zoneName: zone ? zone.name : 'Unknown Zone'
        }
      } catch (error) {
        console.error('Update Shipping Rate GraphQL Error:', error)
        throw new Error('Failed to update shipping rate')
      }
    },

    deleteShippingRate: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const result = await ShippingRate.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Shipping Rate GraphQL Error:', error)
        throw new Error('Failed to delete shipping rate')
      }
    },

    // Report Mutations
    generateReport: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const report = new Report({
          name: input.name,
          type: input.type,
          generatedBy: user._id.toString(),
          period: input.period,
          status: 'generating'
        })
        
        await report.save()
        
        // In a real implementation, you would trigger background job here
        // For now, we'll mark it as ready immediately
        report.status = 'ready'
        report.downloadUrl = `/api/reports/${report._id}/download`
        await report.save()

        return {
          id: report._id.toString(),
          name: report.name,
          type: report.type,
          status: report.status,
          generatedAt: report.createdAt?.toISOString(),
          period: report.period,
          downloadUrl: report.downloadUrl,
          createdAt: report.createdAt?.toISOString(),
          updatedAt: report.updatedAt?.toISOString()
        }
      } catch (error) {
        console.error('Generate Report GraphQL Error:', error)
        throw new Error('Failed to generate report')
      }
    },

    // Settings Mutations
    updateSettings: async (_: any, { input }: any) => {
      try {
        console.log('BACKEND RECEIVED INPUT:', JSON.stringify(input, null, 2))
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        let settings = await StoreSettings.findOne({})
        
        if (!settings) {
          // Create new settings with required defaults
          const settingsData = {
            ...input,
            storeName: input.storeName || 'My Store',
            storeEmail: input.storeEmail || 'store@example.com',
            currency: input.currency || 'INR',
            timezone: input.timezone || 'UTC',
            language: input.language || 'en',
            dateFormat: input.dateFormat || 'MM/DD/YYYY',
            paymentMethods: input.paymentMethods || { razorpay: true }
          }
          settings = new StoreSettings(settingsData)
        } else {
          // Update existing settings
          Object.keys(input).forEach(key => {
            if (input[key] !== undefined) {
              if (key === 'paymentMethods' && typeof input[key] === 'object') {
                // Handle nested object properly
                settings[key] = {
                  ...settings[key],
                  ...input[key]
                }
              } else {
                settings[key] = input[key]
              }
            }
          })
        }
        
        await settings.save()
        
        // Ensure the returned data has all required fields
        const settingsObject = settings.toObject()
        const validatedSettings = {
          ...settingsObject,
          storeName: settingsObject.storeName || 'My Store',
          storeEmail: settingsObject.storeEmail || 'store@example.com',
          currency: settingsObject.currency || 'INR',
          timezone: settingsObject.timezone || 'UTC',
          language: settingsObject.language || 'en',
          dateFormat: settingsObject.dateFormat || 'MM/DD/YYYY',
          paymentMethods: settingsObject.paymentMethods || { razorpay: true }
        }
        
        return serializeStoreSettings(validatedSettings)
      } catch (error) {
        console.error('Update Settings GraphQL Error:', error)
        throw new Error('Failed to update settings')
      }
    },

    // Coupon Mutations
    createCoupon: async (_: any, { input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: input.code.toUpperCase() }).lean()
        if (existingCoupon) {
          throw new Error('Coupon code already exists')
        }

        const coupon = new Coupon({
          ...input,
          code: input.code.toUpperCase(),
          usedCount: 0
        })
        await coupon.save()
        
        return serializeCoupon(coupon.toObject())
      } catch (error) {
        console.error('Create Coupon GraphQL Error:', error)
        throw new Error(error.message || 'Failed to create coupon')
      }
    },

    updateCoupon: async (_: any, { id, input }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        // Check if another coupon with the same code exists (excluding current coupon)
        if (input.code) {
          const existingCoupon = await Coupon.findOne({ 
            code: input.code.toUpperCase(), 
            _id: { $ne: id } 
          }).lean()
          if (existingCoupon) {
            throw new Error('Coupon code already exists')
          }
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
          id, 
          { 
            ...input,
            code: input.code ? input.code.toUpperCase() : undefined
          }, 
          { new: true }
        ).lean()
        
        if (!updatedCoupon) {
          throw new Error('Coupon not found')
        }
        
        return serializeCoupon(updatedCoupon)
      } catch (error) {
        console.error('Update Coupon GraphQL Error:', error)
        throw new Error(error.message || 'Failed to update coupon')
      }
    },

    deleteCoupon: async (_: any, { id }: any) => {
      try {
        await connectToDatabase()
        
        const session = await auth()
        if (!session?.user?.email) {
          throw new Error('Authentication required')
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Admin access required')
        }

        const result = await Coupon.findByIdAndDelete(id)
        return !!result
      } catch (error) {
        console.error('Delete Coupon GraphQL Error:', error)
        throw new Error('Failed to delete coupon')
      }
    },
  },
}