import Link from 'next/link'
import Image from 'next/image'
import connectToDatabase from '@/lib/mongodb'
import { Product, Review, Category } from '@/lib/models'
import { LatestProducts } from '@/components/home/latest-products'
import { SimpleSlideshow } from '@/components/home/simple-slideshow'
import { serializeProduct, serializeReview, serializeCategory } from '@/lib/serialize'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

async function getLatestProducts() {
  try {
    await connectToDatabase()
    
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()
    
    if (!products || products.length === 0) {
      console.log('No products found in database')
      return []
    }
    
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        try {
          const reviews = await Review.find({ productId: product._id.toString() }).lean()
          
          return {
            ...serializeProduct(product),
            reviews: reviews.map(review => serializeReview(review))
          }
        } catch (error) {
          console.error('Error fetching reviews for product:', product._id, error)
          return serializeProduct(product)
        }
      })
    )
    
    return productsWithReviews
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return []
  }
}

async function getCategories() {
  try {
    await connectToDatabase()
    
    const categories = await Category.find().lean()
    return categories.map(category => serializeCategory(category))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function HomePage() {
  const latestProducts = await getLatestProducts()
  const categories = await getCategories()
  
  // Find category objects by name
  const menCategory = categories.find(cat => cat.name.toLowerCase() === 'men')
  const womenCategory = categories.find(cat => cat.name.toLowerCase() === 'women') 
  const accessoriesCategory = categories.find(cat => cat.name.toLowerCase() === 'accessories')

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--rr-light-bg)' }}>
      {/* Hero Slideshow */}
      <SimpleSlideshow />


      {/* Latest Products Section */}
      <section className='rr-section-spacing border-t' style={{ borderColor: 'var(--rr-light-gray)' }}>
        <div className='rr-container'>
          <div className='flex flex-col lg:flex-row lg:justify-between lg:items-end mb-16 gap-6'>
            <div className='space-y-4'>
              <h2 className='rr-heading-lg' style={{ color: 'var(--rr-pure-black)' }}>New Arrivals</h2>
              <p className='rr-body max-w-md' style={{ color: 'var(--rr-dark-text)' }}>
                Discover our latest collection of contemporary fashion pieces designed for the modern wardrobe
              </p>
            </div>
            <Link href='/products' className='lg:self-end'>
              <button className='rr-button-secondary flex items-center'>
                EXPLORE ALL
                <ArrowRight className='ml-3 h-4 w-4' />
              </button>
            </Link>
          </div>
          <LatestProducts products={latestProducts} />
        </div>
      </section>

      {/* Featured Banner */}
      <section className='rr-section-spacing'>
        <div className='rr-container'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
            {/* Left Image Banner */}
            <Link href='/products?category=Men' className='group block rr-card-hover'>
              <div className='relative aspect-[4/5] overflow-hidden rr-image-overlay' style={{ backgroundColor: 'var(--rr-light-gray)' }}>
                <Image
                  src='https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&h=1000&fit=crop&crop=center'
                  alt="Men's Collection"
                  fill
                  className='object-cover rr-image-zoom'
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className='absolute bottom-8 left-8 right-8'>
                  <h3 className='rr-heading-md mb-3' style={{ color: 'white' }}>
                    Men's Essentials
                  </h3>
                  <p className='rr-body text-white/90 mb-4'>
                    Contemporary designs for the modern gentleman
                  </p>
                  <button className='rr-button-primary'>
                    EXPLORE MEN
                  </button>
                </div>
              </div>
            </Link>

            {/* Right Side - Stacked Images */}
            <div className='space-y-8'>
              <Link href='/products?category=Women' className='group block rr-card-hover'>
                <div className='relative aspect-[16/9] overflow-hidden rr-image-overlay' style={{ backgroundColor: 'var(--rr-light-gray)' }}>
                  <Image
                    src='https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=450&fit=crop&crop=center'
                    alt="Women's Collection"
                    fill
                    className='object-cover rr-image-zoom'
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                  <div className='absolute left-8 top-1/2 -translate-y-1/2'>
                    <h3 className='rr-heading-sm mb-2' style={{ color: 'white' }}>
                      Women's Collection
                    </h3>
                    <p className='rr-body-sm text-white/90 mb-4'>
                      Elegant sophistication
                    </p>
                    <button className='rr-button-secondary' style={{ backgroundColor: 'rgba(248, 247, 244, 0.9)', color: 'var(--rr-pure-black)' }}>
                      SHOP WOMEN
                    </button>
                  </div>
                </div>
              </Link>

              <Link href='/products?category=Accessories' className='group block rr-card-hover'>
                <div className='relative aspect-[16/9] overflow-hidden rr-image-overlay' style={{ backgroundColor: 'var(--rr-light-gray)' }}>
                  <Image
                    src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=450&fit=crop&crop=center'
                    alt="Accessories"
                    fill
                    className='object-cover rr-image-zoom'
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
                  <div className='absolute right-8 top-1/2 -translate-y-1/2 text-right'>
                    <h3 className='rr-heading-sm mb-2' style={{ color: 'white' }}>
                      Premium Accessories
                    </h3>
                    <p className='rr-body-sm text-white/90 mb-4'>
                      Complete your style
                    </p>
                    <button className='rr-button-secondary' style={{ backgroundColor: 'rgba(248, 247, 244, 0.9)', color: 'var(--rr-pure-black)' }}>
                      DISCOVER
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Lifestyle Banner */}
      <section className='py-0'>
        <div className='relative aspect-[21/8] lg:aspect-[21/6] overflow-hidden'>
          <Image
            src='https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&h=700&fit=crop&crop=center'
            alt="Lifestyle Fashion"
            fill
            className='object-cover'
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className='absolute bottom-16 left-1/2 -translate-x-1/2 text-center'>
            <h2 className='text-3xl lg:text-5xl font-extralight text-white mb-4 tracking-wide'>
              Effortless Elegance
            </h2>
            <p className='text-white/90 text-lg lg:text-xl mb-8 max-w-2xl mx-auto font-light'>
              Where comfort meets sophistication in every thread
            </p>
            <Link href='/products?category=Women'>
              <button className='rr-button-primary text-lg px-8 py-4'>
                EXPLORE WOMEN
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className='py-16' style={{ backgroundColor: 'var(--rr-light-gray)' }}>
        <div className='rr-container'>
          <div className='relative aspect-[21/9] lg:aspect-[21/6] overflow-hidden rr-image-overlay'>
            <Image
              src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=600&fit=crop&crop=center'
              alt="Season Sale"
              fill
              className='object-cover'
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
            <div className='absolute left-8 lg:left-16 top-1/2 -translate-y-1/2'>
              <p className='rr-label mb-4' style={{ color: 'var(--rr-dark-text)' }}>
                SEASON SALE
              </p>
              <h2 className='text-3xl lg:text-5xl font-light mb-4 tracking-tight' style={{ color: 'var(--rr-pure-black)' }}>
                Up to 50% Off
              </h2>
              <p className='rr-body-lg mb-6 max-w-md' style={{ color: 'var(--rr-dark-text)' }}>
                Discover exceptional pieces at unbeatable prices. Limited time offer.
              </p>
              <Link href='/products'>
                <button className='rr-button-primary'>
                  SHOP SALE
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Image Section */}
      <section className='py-0'>
        <div className='grid grid-cols-1 lg:grid-cols-2'>
          {/* Men's Section */}
          <div className='relative aspect-[4/5] lg:aspect-[1/1] overflow-hidden group'>
            <Image
              src='https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&h=800&fit=crop&crop=center'
              alt="Men's Collection"
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-700'
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className='absolute bottom-12 left-12 right-12'>
              <h3 className='text-2xl lg:text-3xl font-light text-white mb-4 tracking-wide'>
                Modern Menswear
              </h3>
              <p className='text-white/90 mb-6 text-lg font-light'>
                Sharp tailoring for contemporary style
              </p>
              <Link href='/products?category=Men'>
                <button className='rr-button-secondary' style={{ backgroundColor: 'rgba(248, 247, 244, 0.9)', color: 'var(--rr-pure-black)' }}>
                  SHOP MEN
                </button>
              </Link>
            </div>
          </div>

          {/* Accessories Section */}
          <div className='relative aspect-[4/5] lg:aspect-[1/1] overflow-hidden group'>
            <Image
              src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&crop=center'
              alt="Accessories Collection"
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-700'
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className='absolute bottom-12 left-12 right-12'>
              <h3 className='text-2xl lg:text-3xl font-light text-white mb-4 tracking-wide'>
                Signature Accessories
              </h3>
              <p className='text-white/90 mb-6 text-lg font-light'>
                Details that make the difference
              </p>
              <Link href='/products?category=Accessories'>
                <button className='rr-button-secondary' style={{ backgroundColor: 'rgba(248, 247, 244, 0.9)', color: 'var(--rr-pure-black)' }}>
                  DISCOVER
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & Brand Story Section */}
      <section className='rr-section-spacing' style={{ backgroundColor: 'var(--rr-pure-black)' }}>
        <div className='rr-container'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center'>
            <div className='space-y-8'>
              <div>
                <h2 className='text-3xl lg:text-4xl font-light text-white mb-6 tracking-wide'>
                  Join Our Story
                </h2>
                <p className='text-white/80 text-lg font-light leading-relaxed mb-8'>
                  Be the first to discover new collections, exclusive events, and style insights. 
                  Join a community that celebrates contemporary fashion and timeless design.
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-4'>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className='flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors'
                />
                <button className='px-8 py-4 bg-white text-black font-medium hover:bg-white/90 transition-colors'>
                  SUBSCRIBE
                </button>
              </div>
            </div>
            <div className='relative aspect-[4/5] overflow-hidden'>
              <Image
                src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&crop=center'
                alt="Brand Story"
                fill
                className='object-cover'
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
