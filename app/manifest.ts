import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RI-CART - E-commerce Store',
    short_name: 'RI-CART',
    description: 'Modern e-commerce platform with advanced features',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    categories: ['shopping', 'business'],
    shortcuts: [
      {
        name: 'Products',
        short_name: 'Products',
        description: 'Browse our product catalog',
        url: '/products',
        icons: [{ src: '/icons/products-icon.png', sizes: '96x96' }]
      },
      {
        name: 'Cart',
        short_name: 'Cart',
        description: 'View shopping cart',
        url: '/cart',
        icons: [{ src: '/icons/cart-icon.png', sizes: '96x96' }]
      }
    ]
  }
}