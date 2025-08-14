export function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

# Disallow admin and dashboard areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /api/
Disallow: /checkout/success/

# Allow important pages
Allow: /products
Allow: /cart
Allow: /checkout

# Sitemap location
Sitemap: ${process.env.NEXTAUTH_URL || 'https://localhost:3000'}/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1
  `.trim()

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}