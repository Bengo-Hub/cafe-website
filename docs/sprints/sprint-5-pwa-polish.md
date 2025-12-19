# Sprint 5: PWA, SEO & Production Polish

**Duration**: 1 week  
**Status**: Not Started  
**Goal**: Transform website into PWA, optimize SEO, and prepare for production deployment

---

## Tasks

### 1. PWA Configuration
- [ ] Install next-pwa package
- [ ] Configure next.config.js for PWA
- [ ] Create manifest.json with Urban Loft branding
- [ ] Set app name, short name, description
- [ ] Configure theme color (#8B4513 - brown)
- [ ] Set background color (#FFFFFF)
- [ ] Add start_url and scope
- [ ] Set display mode to "standalone"

### 2. App Icons
- [ ] Create app icon 192x192 (maskable)
- [ ] Create app icon 512x512 (maskable)
- [ ] Create favicon.ico
- [ ] Create apple-touch-icon.png
- [ ] Add icons to public/icons/ directory
- [ ] Update manifest.json with icon paths
- [ ] Test icons on mobile devices

### 3. Service Worker
- [ ] Configure Workbox caching strategies
- [ ] Implement cache-first for static assets
- [ ] Setup network-first for API calls
- [ ] Configure stale-while-revalidate for menu data
- [ ] Set network-only for order tracking
- [ ] Add offline fallback page
- [ ] Configure cache expiration policies
- [ ] Test service worker registration

### 4. Offline Support
- [ ] Create offline fallback page (`/offline`)
- [ ] Cache critical pages (home, menu, about)
- [ ] Show offline indicator when network fails
- [ ] Queue form submissions when offline (optional)
- [ ] Test menu browsing offline
- [ ] Handle API errors gracefully when offline

### 5. Install Prompt
- [ ] Implement custom install banner
- [ ] Show banner after user engagement (scroll, interact)
- [ ] Add "Add to Home Screen" button
- [ ] Handle beforeinstallprompt event
- [ ] Track install analytics
- [ ] Show install instructions for iOS
- [ ] Hide banner after installation

### 6. SEO Optimization
- [ ] Audit all meta tags (title, description)
- [ ] Verify Open Graph tags on all pages
- [ ] Add Twitter Card tags
- [ ] Implement JSON-LD structured data:
  - [ ] LocalBusiness schema (home page)
  - [ ] Restaurant schema
  - [ ] Menu schema (menu page)
  - [ ] Event schema (events page)
  - [ ] JobPosting schema (careers page)
  - [ ] Organization schema
- [ ] Create dynamic sitemap.xml
- [ ] Configure robots.txt
- [ ] Add canonical URLs
- [ ] Implement breadcrumb navigation

### 7. Performance Optimization
- [ ] Measure Core Web Vitals (Lighthouse)
- [ ] Optimize Largest Contentful Paint (LCP < 2.5s)
- [ ] Minimize First Input Delay (FID < 100ms)
- [ ] Reduce Cumulative Layout Shift (CLS < 0.1)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Code split by route
- [ ] Minimize JavaScript bundle
- [ ] Defer non-critical CSS
- [ ] Optimize font loading
- [ ] Enable compression (gzip/brotli)

### 8. Image Optimization
- [ ] Convert all images to WebP format
- [ ] Create responsive image sizes
- [ ] Implement Next.js Image component everywhere
- [ ] Add blur placeholders for images
- [ ] Lazy load below-the-fold images
- [ ] Optimize hero images
- [ ] Compress all image assets
- [ ] Setup CDN for images (Cloudflare/Vercel)

### 9. Responsive Design Polish
- [ ] Test on iPhone (Safari, Chrome)
- [ ] Test on Android (Chrome, Samsung Browser)
- [ ] Test on iPad
- [ ] Test on various desktop browsers
- [ ] Fix any layout issues
- [ ] Ensure touch targets are 44x44px minimum
- [ ] Test hamburger menu on mobile
- [ ] Verify all forms work on mobile

### 10. Accessibility Audit
- [ ] Run Lighthouse accessibility audit
- [ ] Fix all WCAG violations
- [ ] Add missing ARIA labels
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Ensure keyboard navigation works
- [ ] Verify color contrast ratios
- [ ] Add skip-to-content link
- [ ] Test focus management

### 11. Error Handling & Monitoring
- [ ] Install Sentry for error tracking
- [ ] Configure Sentry DSN
- [ ] Add error boundaries to critical components
- [ ] Log client-side errors
- [ ] Setup performance monitoring
- [ ] Add custom error pages (404, 500)
- [ ] Test error scenarios

### 12. Analytics
- [ ] Install Vercel Analytics or Google Analytics
- [ ] Track page views
- [ ] Track button clicks (Order Now, Book Event)
- [ ] Track form submissions
- [ ] Monitor Core Web Vitals
- [ ] Track PWA install events
- [ ] Setup conversion goals

### 13. Build & Deployment
- [ ] Create production build script
- [ ] Configure environment variables for production
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Deploy to Contabo VPS or Vercel
- [ ] Configure custom domain with SSL
- [ ] Setup CDN (Cloudflare)
- [ ] Configure Nginx reverse proxy
- [ ] Test production deployment

### 14. Testing & QA
- [ ] Run full E2E test suite
- [ ] Test all user flows
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Test PWA installation
- [ ] Test offline mode
- [ ] Performance testing (Lighthouse)
- [ ] Security testing (HTTPS, CSP headers)

### 15. Documentation
- [ ] Update README with deployment instructions
- [ ] Document environment variables
- [ ] Create deployment guide
- [ ] Document PWA testing steps
- [ ] Add troubleshooting guide
- [ ] Document monitoring setup

### 16. Launch Checklist
- [ ] All pages functional and tested
- [ ] PWA installable on mobile
- [ ] SEO meta tags complete
- [ ] Performance score > 90 (Lighthouse)
- [ ] Accessibility score > 95
- [ ] All forms working
- [ ] Maps integration working
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Analytics tracking
- [ ] Error monitoring active
- [ ] Backups configured

---

## Definition of Done
- [ ] Website installable as PWA on iOS and Android
- [ ] Lighthouse scores: Performance > 90, SEO > 95, Accessibility > 95
- [ ] Works offline (menu browsing, cached pages)
- [ ] All images optimized and lazy loaded
- [ ] Service worker caches assets correctly
- [ ] Deployed to production with custom domain
- [ ] SSL certificate active
- [ ] Analytics and error monitoring configured
- [ ] All tests passing
- [ ] Documentation complete

---

## Dependencies
- Sprint 4 completed
- next-pwa package
- Sentry account (error tracking)
- Analytics account (Vercel/GA)
- CDN setup (Cloudflare)
- Domain name registered
- SSL certificate
- Production server access

---

## Notes
- PWA should work seamlessly across all devices
- Focus on performance and user experience
- Test install prompt on actual mobile devices
- Ensure offline experience is smooth
- Follow Google's PWA checklist
- Monitor Core Web Vitals post-launch

---

## Related Documents
- [Plan.md](../plan.md)
- [Sprint 4](./sprint-4-auth-tracking.md)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Core Web Vitals](https://web.dev/vitals/)
