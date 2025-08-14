# Production Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables
Create environment variables in your Vercel dashboard:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
AUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# Razorpay (Production Keys)
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Email
EMAIL=your-business-email@domain.com
PASSWORD=your_app_password

# Optional Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=your_verification_code
```

### 2. Production Database Setup
1. Create a MongoDB Atlas cluster for production
2. Set up proper database indexes for performance
3. Configure database user with minimal required permissions
4. Enable database monitoring and alerts

### 3. Security Configuration
- ✅ HTTPS enforced via Vercel
- ✅ Security headers configured
- ✅ Rate limiting implemented
- ✅ Authentication middleware active
- ✅ Admin route protection
- ✅ Environment variables secured

## Deployment Steps

### 1. Connect to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### 2. Configure Project Settings
- Set Node.js version to 18.x or higher
- Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm ci`

### 3. Domain Configuration
1. Add custom domain in Vercel dashboard
2. Configure DNS records:
   - A record: `@` -> Vercel IP
   - CNAME: `www` -> `your-domain.vercel.app`
3. Update NEXTAUTH_URL to production domain

### 4. Post-deployment Verification
1. Check health endpoint: `https://your-domain.com/api/health`
2. Verify database connection
3. Test authentication flows
4. Validate payment processing
5. Check error monitoring

## Performance Optimization

### 1. Image Optimization
- ✅ Next.js Image component configured
- ✅ WebP/AVIF formats enabled
- ✅ Cloudinary integration active

### 2. Caching Strategy
- ✅ Static assets cached for 1 year
- ✅ API routes no-cache headers
- ✅ Database connection pooling

### 3. Bundle Optimization
- ✅ Package imports optimized
- ✅ Standalone output configured
- ✅ Compression enabled

## Monitoring & Maintenance

### 1. Health Checks
- Monitor `/api/health` endpoint
- Set up uptime monitoring (recommended: UptimeRobot)
- Configure alerts for downtime

### 2. Error Tracking
- Monitor Vercel deployment logs
- Set up error reporting service (Sentry recommended)
- Monitor performance metrics

### 3. Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up connection alerts
- Regular backup verification

## SEO & Analytics

### 1. Search Engine Optimization
- ✅ Sitemap generation configured
- ✅ Robots.txt configured
- ✅ Meta tags optimized
- ✅ Structured data ready

### 2. Analytics Setup
1. Create Google Analytics 4 property
2. Add GA_MEASUREMENT_ID to environment variables
3. Verify tracking implementation

## Security Best Practices

### 1. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular security audits

### 2. Access Control
- Use strong passwords
- Enable 2FA on all accounts
- Regular access reviews

### 3. Data Protection
- Regular database backups
- PII data encryption
- GDPR compliance measures

## Troubleshooting

### Common Issues
1. **Build failures**: Check TypeScript errors and dependencies
2. **Database connection**: Verify MongoDB URI and network access
3. **Authentication errors**: Check AUTH_SECRET and NEXTAUTH_URL
4. **Payment issues**: Verify Razorpay keys and webhooks

### Debug Commands
```bash
# Local production build test
npm run build
npm run start

# Type checking
npm run type-check

# Lint check
npm run lint
```

## Support
For deployment support, contact the development team or check the project documentation.