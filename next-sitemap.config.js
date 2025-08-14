/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/dashboard/*',
    '/auth/*',
    '/api/*',
    '/checkout/success/*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/api/',
          '/checkout/success/'
        ]
      }
    ],
    additionalSitemaps: []
  },
  transform: async (config, path) => {
    // Custom priority based on page importance
    const priorities = {
      '/': 1.0,
      '/products': 0.9,
      '/cart': 0.7,
      '/checkout': 0.7
    }

    return {
      loc: path,
      changefreq: 'daily',
      priority: priorities[path] || 0.5,
      lastmod: new Date().toISOString()
    }
  }
}