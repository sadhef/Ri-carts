import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import { auth } from '@/auth'
import { SessionProvider } from '@/components/providers/session-provider'
import { CartProvider } from '@/components/providers/cart-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'RI-CART - Modern E-commerce Platform',
    template: '%s | RI-CART'
  },
  description: 'Discover amazing products with personalized recommendations. Shop electronics, fashion, home goods and more with fast shipping and secure checkout.',
  keywords: ['ecommerce', 'shopping', 'electronics', 'fashion', 'home goods', 'online store', 'personalized shopping'],
  authors: [{ name: 'RI-CART Team' }],
  creator: 'RI-CART',
  publisher: 'RI-CART',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'RI-CART - Modern E-commerce Platform',
    description: 'Discover amazing products with personalized recommendations. Shop electronics, fashion, home goods and more.',
    siteName: 'RI-CART',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RI-CART - Modern E-commerce Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RI-CART - Modern E-commerce Platform',
    description: 'Discover amazing products with personalized recommendations.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
