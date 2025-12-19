# Sprint 2: Core Pages (Home, About, Menu)

**Duration**: 1 week  
**Status**: Completed ✅ (December 19, 2025)  
**Goal**: Build customer-facing pages with responsive design and SEO optimization

---

## Tasks

### 1. Home Page (`/`)
- [x] Create hero section with tagline "BEYOND FOOD - Eat. Work. Connect. Experience."
- [x] Add hero background image with overlay
- [x] Implement CTA buttons (Order Now, Book Event, Visit Hub)
- [x] Create "Featured Services" section with cards (Café, Business Hub, Events)
- [x] Build "Menu Highlights" section using dummy menu items
- [x] Add "Upcoming Events" banner with event cards
- [x] Implement customer testimonials section
- [x] Add newsletter signup form
- [x] Optimize hero image loading (lazy load)
- [x] Add smooth scroll animations (Framer Motion)
- [x] Implement loading.tsx skeleton for page transitions

### 2. About Page (`/about`)
- [x] Create "Our Story" section (Kiambu 2023, Busia 2024)
- [x] Add timeline component for brand history
- [x] Build "Our Culture" section with icons and descriptions
- [x] Create "Our Values" cards (Excellence, Gratitude, Respect, etc.)
- [x] Implement "Our Vision" statement with imagery
- [x] Add team members section using dummy team data
- [x] Create individual team member cards with hover effects
- [x] Add image gallery/carousel
- [x] Implement responsive grid layouts
- [x] Add page transitions
- [x] Implement loading.tsx skeleton for page transitions

### 3. Menu Page (`/menu`)
- [x] Create menu category filter buttons
- [x] Implement "All Items" default view
- [x] Build menu item grid with responsive cards
- [x] Add search bar with real-time filtering
- [x] Create filter by dietary tags (vegetarian, vegan, etc.)
- [x] Implement item details modal on click
- [x] Show item image, description, price in modal
- [x] Add "Order Now" button (links to ordering-service)
- [x] Display dietary tags as badges
- [x] Add "Featured" badge for featured items
- [x] Implement lazy loading for menu images
- [x] Create empty state when no items match filt
- [x] Implement loading.tsx skeleton with grid layout
- [x] Add LoadingSpinner to search/filter actionser
- [x] Add sorting options (name, price, category)

### 4. SEO Optimization (All Pages)
- [x] Add Open Graph meta tags for social sharing
- [x] Implement Twitter Card tags
- [x] Create JSON-LD structured data for LocalBusiness
- [x] Add Menu schema markup on menu page
- [x] Configure dynamic meta titles and descriptions
- [x] Setup proper heading hierarchy (h1, h2, h3)
- [x] Add alt text to all images
- [x] Create sitemap.xml
- [x] Configure robots.txt
- [x] Add canonical URLs

### 5. Responsive Design
- [x] Test all pages on mobile (< 640px)
- [x] Test on tablet (640px - 1024px)
- [x] Test on desktop (> 1024px)
- [x] Ensure touch-friendly buttons (min 44x44px)
- [x] Optimize images for different screen sizes
- [x] Test navigation menu on mobile
- [x] Verify hamburger menu functionality

### 6. Performance Optimization
- [x] Implement image optimization with Next.js Image
- [x] Add WebP format for images
- [x] Configure lazy loading for below-fold content
- [x] Minimize JavaScript bundle size
- [x] Code split by route
- [x] Optimize fonts loading
- [x] Measure Core Web Vitals (LCP, FID, CLS)

### 7. Components
- [x] Create HeroSection component
- [x] Build ServiceCard component
- [x] Implement MenuItemCard component
- [x] Create MenuItemModal component
- [x] Build CategoryFilter component
- [x] Create SearchBar component
- [x] Implement TeamMemberCard component
- [x] Build ValueCard component

### 8. Data Integration
- [x] Use dummy menu data from `lib/dummy-data/menu.ts`
- [x] Use dummy team data from `lib/dummy-data/team.ts`
- [x] Use dummy events data for home page preview
- [x] Implement data fetching functions with dummy flag
- [x] Add loading states for all data fetches
- [x] Handle error states gracefully

### 9. Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Add focus states to buttons and links
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add skip-to-content link

### 10. Testing
- [ ] Write unit tests for MenuItemCard component
- [ ] Test search/filter functionality
- [ ] Write E2E test for menu browsing flow
- [ ] Test responsive behavior on different viewports
- [ ] Test image loading and optimization

---

## Definition of Done
- [ ] Home page loads in < 3 seconds on 3G
- [ ] About page displays complete company information
- [ ] Menu page shows all items with filtering and search
- [ ] All pages are fully responsive (mobile, tablet, desktop)
- [ ] SEO meta tags present on all pages
- [ ] Images optimized and lazy loaded
- [ ] No accessibility violations
- [ ] Code passes linting and type checking
- [ ] All components have proper TypeScript types
- [ ] Pages tested on Chrome, Firefox, Safari

---

## Dependencies
- Sprint 1 completed
- Dummy data files created
- Image assets available (or placeholders)
- Framer Motion installed
- Next.js Image component configured

---

## Notes
- Use real images where available, placeholders otherwise
- Focus on mobile-first design
- Ensure fast page loads
- All external links should open in new tab
- Menu items link to ordering-service (dummy URL for now)
- Keep designs clean and modern (inspired by reference sites)

---

## Related Documents
- [Plan.md](../plan.md)
- [DUMMY-DATA.md](../DUMMY-DATA.md)
- [Sprint 1](./sprint-1-foundation.md)
