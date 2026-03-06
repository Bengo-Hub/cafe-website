# Urban Loft Cafe Website - Implementation Plan

## Executive Summary

**System Purpose**: Premium, responsive business website for Urban Loft Cafe serving as the converging point for all microservices in the Urban Loft ecosystem. The website provides seamless SSO integration, allowing customers and staff to access all services (ordering, bookings, admin dashboards, etc.) with a single login experience.

**Key Capabilities**:
- Customer-facing website with SEO-optimized public pages
- Integrated online ordering (Redirects to ordering-service)
- Event, room, and conference bookings
- Business hub (co-working, offices) booking system
- Staff/admin panel with seamless service transitions
- Single Sign-On (SSO) integration across all services
- Real-time order tracking (Redirects to ordering-service)
- Responsive PWA-ready design (mobile-first)
- Loyalty program access
- Theme switching (Light/Dark mode)
- Auth-state aware navigation (Login/Signup/Profile)
- **Dashboard (admin/staff)**: Centralized management for cafe operations, staff, and orders at `/dashboard/*`.

**Inspired By**:
- https://artcaffemarket.co.ke/ - Modern café website design
- https://javahouseafrica.com/ - Premium brand experience
- [ubereats.com](https://www.ubereats.com/) - Uber Eats

---

## Branding & Identity

**Tagline**: BEYOND FOOD - Eat. Work. Connect. Experience.

**Brand Promise**: Great food. Premium service. Meaningful experiences. Every time.

**Core Values**:
- **Excellence**: Never compromising on food quality, service, or hygiene.
- **Gratitude**: Appreciating every customer and community member.
- **Respect**: Treating everyone with dignity and warmth.
- **Friendliness**: Creating a welcoming, "urban boho" atmosphere.
- **Community**: Being a hub for connection and collaboration.
- **Experience**: Curating peaceful, premium moments with mellow music and warm service.

**Visual Identity**:
- **Primary Color**: Urban Loft Orange (#ea8022)
- **Secondary Colors**: Gold (#ae6221), Brown (#663209), Taupe (#958c80)
- **Backgrounds**: Creamy Light (#f5f1ec), Dark Espresso (#2c1a02)
- **Typography**: Modern sans-serif (Helvetica Neue) for clarity and premium feel.

---

**Entity Ownership**: The cafe website is a frontend application that integrates with backend services. It does NOT own any entities - all data is managed by respective microservices:
- Orders → ordering-service
- Bookings → (implement booking service as a Go service)
- Payments → treasury-service
- User identity → auth-service
- Menu/catalog → ordering-service
- **Microservice Switching**: This website acts as the central hub. It redirects users to specialized services for specific tasks (e.g., Ordering, Tracking, Rider Management) to avoid logic duplication. All services share SSO via `auth-service`.
- **Display-Only Integration**: The cafe website pulls data (like sample dishes) for display purposes only. Any action that modifies state (adding to cart, updating an order, assigning a rider) is handled by redirecting the user to the owning microservice's UI.
- **Tenant & branding**: Tenant slug comes from the route (`/t/[slug]`) or `NEXT_PUBLIC_TENANT_SLUG`. Tenant name and optional branding (logo URL, primary/secondary colors) are loaded from auth-service `GET /api/v1/tenants/by-slug/{slug}` (public). Brand colors are applied to the theme via CSS variables; Settings includes a Branding section for org name, logo URL, and colors.

---

## Technology Stack

### Frontend Framework
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand or React Query (for server state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React or Heroicons
- **Animations**: Framer Motion
- **Loading States**: Next.js loading.tsx (page skeletons) + Spinner (API actions)

### PWA & Mobile
- **PWA**: Next.js PWA plugin (next-pwa)
- **Service Worker**: Workbox for caching strategies
- **Manifest**: Custom manifest.json for install prompt
- **Offline Support**: Cache-first for static assets, network-first for API calls

### Authentication & Session
- **SSO**: OAuth2/OIDC integration with auth-service
- **Session Storage**: Redis (shared across services)
- **Token Management**: NextAuth.js or custom OIDC client
- **Session Sharing**: Redis cache key pattern: `session:{session_id}`

### Maps & Location
- **Maps**: Mapbox or Google Maps API
- **Geocoding**: For address validation and delivery zones
- **Real-time Tracking**: WebSocket connection to logistics-service

### Deployment & Infrastructure
- **Hosting**: Contabo VPS via centralized devops-k8s/ devops workflows
- **CDN**: Cloudflare or Vercel Edge Network
- **Domain**: Custom domain with SSL
- **Monitoring**: Sentry for error tracking, Vercel Analytics

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Urban Loft Cafe Website (Next.js)              │
│                   Converging Point for All Services         │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ Auth Service │ │ Ordering   │ │ Logistics  │
    │   (SSO)      │ │  Service   │ │  Service   │
    └──────────────┘ └────────────┘ └────────────┘
            │               │               │
    ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ Treasury     │ │  Booking   │ │  Notify    │
    │  Service     │ │  Service   │ │  Service   │
    └──────────────┘ └────────────┘ └────────────┘
```

### SSO Integration Flow

```
1. User visits website → No login required for browsing
2. User clicks "Order Now" or "Login" → Redirects to auth-service
3. User authenticates (email/password, Google, Microsoft)
4. Auth-service redirects back with authorization code
5. Website exchanges code for JWT tokens
6. JWT stored in httpOnly cookie + Redis (session sharing)
7. User can now access:
   - Ordering service (no re-login)
   - Admin dashboards (no re-login)
   - Booking system (no re-login)
   - All services recognize same session
```

### Session Sharing Architecture

```
User Login → Auth-Service (SSO)
    ↓
JWT Token Issued
    ↓
Session Stored in Redis: session:{session_id}
    ↓
Cookie Set (httpOnly, secure, sameSite)
    ↓
All Services Validate JWT:
  - Ordering Service: Validates JWT → Allows access
  - Logistics Service: Validates JWT → Allows access
  - Booking Service: Validates JWT → Allows access
  - Admin Dashboards: Validates JWT → Allows access
```

---

## Pages & Features

### 1. Home Page (`/`)

**Features**:
- Hero section with tagline: "BEYOND FOOD - Eat. Work. Connect. Experience."
- Featured services preview (Café, Business Hub, Events)
- Menu highlights (featured items)
- Upcoming events banner
- Call-to-action buttons (Order Now, Book Event, Visit Hub)
- SEO-optimized meta tags

**Integration Points**:
- Menu items from ordering-service API
- Events from booking/events service
- No authentication required

---

### 2. About Us (`/about`)

**Content**:
- Our Story (Kiambu 2023, Busia 2024)
- Our Culture (food quality, service, hygiene, comfort)
- Our Values (Excellence, Gratitude, Respect, Friendliness, Community, Experience)
- Our Vision (leading East African lifestyle café brand)
- Team section (Director, GM, COO, Finance Manager, Team Members)

**Integration Points**:
- Team data from CMS or static content
- Image gallery from S3/CDN

---

### 3. Menu (`/menu`)

**Features**:
- Full menu display (categories, items, descriptions, prices)
- Filter by category (meals, beverages, specials)
- Search functionality
- Item details modal (nutrition info, dietary tags)
- **Action Redirects**: Clicking "Add to Cart", "Whitelist", or "View" redirects the user to the `ordering-service` PWA.
- No login required for browsing.

**Integration Points**:
- **Display**: Pulls sample main dishes and menu data from `ordering-service` API: `GET /api/v1/{tenant}/menu/items`.
- **Logic**: All cart and order management is delegated to the `ordering-service`.
- Images from S3/CDN.

**Data Flow**:
```
Website → Ordering Service API → Fetch Sample Dishes (Display Only)
User Action (Add to Cart) → Redirect to:
https://ordering.codevertexitsolutions.com/menu?item_id={id}&action=add-to-cart&tenant={tenant}
```

---

### 4. Services (`/services`)

**Service Listings**:

1. **The Café**
   - Premium dining description
   - Urban boho ambience
   - Perfect for families, professionals, travelers

2. **Service Training Center**
   - Customer service training
   - F&B service skills
   - Café operations training

3. **Business Hub**
   - Co-working spaces
   - Boardrooms
   - Executive offices
   - Conferencing halls
   - High-speed Wi-Fi
   - "Book Now" button → Booking system

4. **Executive Accommodation**
   - Business traveler accommodation
   - Comfort, privacy, productivity

**Integration Points**:
- Booking system for Business Hub and Accommodation
- Contact forms → notifications-service

---

### 5. Events & Themed Days (`/events`)

**Features**:
- Upcoming events calendar
- Event categories:
  - Pizza Day
  - Couples Night
  - Game Night
  - Chef's Special Day
  - Holiday themes
- Event booking form
- Event history/gallery

**Integration Points**:
- Booking system API
- Event management (future service or integrated)
- Payment via treasury-service (for paid events)

---

### 6. Loyalty Program (`/loyalty`)

**Features**:
- Program benefits:
  - Free meals after spending thresholds
  - Exclusive offers
  - Birthday treats
  - Priority bookings
  - Members-only event access
- Points balance (if logged in)
- Rewards catalog
- Enrollment form

**Integration Points**:
- Loyalty data from ordering-service: `GET /api/v1/{tenant}/loyalty/{user_id}`
- Requires SSO login

---

### 7. Order Tracking (Redirect)

**Features**:
- Redirects users to the `ordering-service` tracking page.
- Passes `order_id` and `tenant_slug` via query parameters.
- Seamless transition via shared SSO.

**Integration Points**:
- Redirect URL: `https://ordering.codevertexitsolutions.com/track?id={order_id}&tenant={tenant_slug}`

---

### 8. Contact (`/contact`)

**Features**:
- Contact information (phone, WhatsApp, email)
- Location map (Busia)
- Contact form (name, email, message)
- Business hours

**Integration Points**:
- Contact form → notifications-service (email)
- Map integration (Mapbox/Google Maps)

---

### 9. Careers (`/careers`)

**Features**:
- Open positions listing
- Job descriptions
- Application form
- Department filters (managers, service, baristas, chefs, etc.)

**Integration Points**:
- Job postings from CMS or static content
- Applications → notifications-service or HR system

---

### 10. Franchising (`/franchising`)

**Features**:
- Why franchise with Urban Loft
- Benefits list:
  - Replicable systems
  - Training support
  - Strong brand identity
  - Community-centered model
  - Flexible design
  - High customer loyalty
- Franchise inquiry form

**Integration Points**:
- Inquiry form → notifications-service

---

### 11. Admin/Staff Dashboard (`/admin/*`)

**Features** (after SSO login):
- Dashboard overview
- Service navigation:
  - Ordering Service Dashboard → Redirect to ordering-service admin
  - Logistics Dashboard → Redirect to logistics-service admin
  - POS Dashboard → Redirect to pos-service admin
  - Treasury Dashboard → Redirect to treasury-service admin
- Analytics summary
- Quick actions

**SSO Integration**:
- User logs in once via auth-service
- JWT token shared across all services
- No re-login required when navigating between services
- Role-based access control (RBAC) from auth-service

**Service Transitions**:
```
User in Cafe Website Admin
    ↓
Clicks "Ordering Dashboard"
    ↓
Redirects to ordering-service admin
    ↓
Ordering service validates JWT (from shared session)
    ↓
Allows access (no re-login)
```

---

## Service Integration Architecture

### 1. Ordering Service Integration

**Public Menu Browsing**:
```typescript
// No authentication required
const menuItems = await fetch(`${ORDERING_API}/api/v1/${tenantSlug}/menu/items`, {
  headers: {
    'X-Tenant-Slug': tenantSlug,
  },
});
```

**Order Placement**:
```typescript
// User clicks "Order" → Redirect to ordering-service PWA
const orderUrl = `${ORDERING_PWA_URL}?item=${itemId}&tenant=${tenantSlug}`;
window.location.href = orderUrl;

// Ordering service handles:
// - Cart management
// - Checkout
// - Payment (via treasury-service)
// - Order confirmation
```

**Order Tracking**:
```typescript
// After order placement, redirect back to website tracking page
const trackingUrl = `${WEBSITE_URL}/track-order?order_id=${orderId}`;
window.location.href = trackingUrl;

// Real-time tracking via WebSocket
const ws = new WebSocket(`${LOGISTICS_WS}/track/${orderId}?token=${jwtToken}`);
ws.onmessage = (event) => {
  const location = JSON.parse(event.data);
  updateMapMarker(location);
};
```

---

### 2. Auth Service Integration (SSO)

**Login Flow**:
```typescript
// User clicks "Login" or "Order Now" (requires auth)
const authUrl = `${AUTH_SERVICE_URL}/authorize?${new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: `${WEBSITE_URL}/auth/callback`,
  response_type: 'code',
  scope: 'openid profile email',
  state: generateState(),
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
})}`;

window.location.href = authUrl;
```

**Callback Handler**:
```typescript
// After auth-service redirects back
const { code, state } = await exchangeCodeForTokens(code);

// Store tokens in httpOnly cookie
setCookie('access_token', tokens.access_token, { httpOnly: true, secure: true });
setCookie('refresh_token', tokens.refresh_token, { httpOnly: true, secure: true });

// Store session in Redis (shared across services)
await redis.set(`session:${sessionId}`, JSON.stringify({
  access_token: tokens.access_token,
  user_id: tokens.user_id,
  tenant_id: tokens.tenant_id,
  expires_at: tokens.expires_at,
}), 'EX', 3600); // 1 hour TTL

// Redirect to intended destination
redirect(intendedUrl || '/');
```

**Session Validation**:
```typescript
// Middleware to validate JWT on protected routes
const token = getCookie('access_token');
if (!token) {
  redirect('/auth/login');
}

// Validate JWT via auth-service JWKS
const isValid = await validateJWT(token, JWKS_ENDPOINT);
if (!isValid) {
  redirect('/auth/login');
}

// Extract claims
const claims = decodeJWT(token);
// Use claims.user_id, claims.tenant_id, claims.roles
```

---

### 3. Logistics Service Integration (Order Tracking)

**WebSocket Connection**:
```typescript
// Real-time order tracking
const ws = new WebSocket(`${LOGISTICS_WS}/track/${orderId}?token=${accessToken}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'location_update':
      updateMapMarker(data.location);
      updateETA(data.eta);
      break;
    case 'status_update':
      updateOrderStatus(data.status);
      break;
    case 'rider_assigned':
      displayRiderInfo(data.rider);
      break;
  }
};

ws.onerror = () => {
  // Fallback to polling
  startPolling();
};
```

**Fallback Polling**:
```typescript
// If WebSocket fails, fallback to polling
const pollOrderStatus = async () => {
  const order = await fetch(`${ORDERING_API}/api/v1/${tenantSlug}/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const orderData = await order.json();
  updateOrderStatus(orderData.status);
  
  if (orderData.logistics_task_id) {
    const task = await fetch(`${LOGISTICS_API}/v1/${tenantSlug}/tasks/${orderData.logistics_task_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const taskData = await task.json();
    updateMapMarker(taskData.current_location);
  }
};

// Poll every 5 seconds
setInterval(pollOrderStatus, 5000);
```

---

### 4. Booking Service Integration

**Event/Room Booking**:
```typescript
// User selects event/room
const bookingData = {
  event_id: eventId,
  date: selectedDate,
  time_slot: selectedTime,
  attendees: attendeeCount,
  customer_id: userId, // From JWT
};

// Create booking
const booking = await fetch(`${BOOKING_API}/api/v1/${tenantSlug}/bookings`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData),
});

// If payment required, redirect to payment
if (booking.requires_payment) {
  const paymentIntent = await createPaymentIntent(booking.amount);
  redirectToPayment(paymentIntent);
}
```

---

### 5. Treasury Service Integration (Payments)

**Payment Intent Creation**:
```typescript
// For paid bookings or event tickets
const paymentIntent = await fetch(`${TREASURY_API}/api/v1/${tenantSlug}/payments/intents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: bookingAmount,
    currency: 'KES',
    payment_method: 'mpesa', // or 'card', 'wallet'
    metadata: {
      booking_id: bookingId,
      event_id: eventId,
    },
  }),
});

// Redirect to payment (M-Pesa STK Push or card form)
if (paymentIntent.payment_method === 'mpesa') {
  // M-Pesa STK Push initiated
  await initiateSTKPush(paymentIntent.client_secret);
} else {
  // Redirect to card payment form
  redirectToCardForm(paymentIntent.client_secret);
}
```

---

## PWA Requirements

### Installation Prompt

**Auto-prompt on Mobile**:
- Trigger install prompt after user engages with site (scrolls, interacts)
- Show custom install banner for mobile users
- "Add to Home Screen" instructions

**Manifest Configuration**:
```json
{
  "name": "Urban Loft Cafe",
  "short_name": "Urban Loft",
  "description": "Beyond Food - Eat. Work. Connect. Experience.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#8B4513",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Offline Support

**Caching Strategy**:
- **Static Assets**: Cache-first (images, CSS, JS)
- **API Calls**: Network-first with cache fallback
- **Menu Data**: Cache for 1 hour (stale-while-revalidate)
- **Order Tracking**: Network-only (real-time data)

**Service Worker**:
```typescript
// Cache static assets
workbox.precaching.precacheAndRoute(self.__precacheManifest);

// Cache menu data with stale-while-revalidate
workbox.routing.registerRoute(
  /\/api\/v1\/.*\/menu\/items/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'menu-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 3600, // 1 hour
      }),
    ],
  })
);

// Network-only for order tracking
workbox.routing.registerRoute(
  /\/api\/v1\/.*\/orders\/.*/,
  new workbox.strategies.NetworkOnly()
);
```

### Mobile-First Responsive Design

**Breakpoints**:
- Mobile: < 640px (primary focus)
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Key Considerations**:
- Touch-friendly buttons (min 44x44px)
- Fast loading (< 3 seconds on 3G)
- Optimized images (WebP format, lazy loading)
- Simplified navigation (hamburger menu)

---

## SEO Optimization

### Meta Tags
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD) for:
  - LocalBusiness schema
  - Menu schema
  - Event schema
  - Organization schema

### Performance
- Core Web Vitals optimization
- Image optimization (WebP, lazy loading)
- Code splitting
- Minimal JavaScript bundle

### 6. Order Tracking (`/track-order`)

**Features**:
- Simple entry form for Order ID.
- **Redirect Logic**: Upon submission, redirects to the `ordering-service` tracking page.
- **Deep Linking**: Accepts `id` query parameter for direct redirection.

**Data Flow**:
```
User enters Order ID → Redirect to:
https://ordering.codevertexitsolutions.com/track?id={order_id}&tenant={tenant}
```

---

### 7. Dashboard (`/dashboard`, `/admin`)

**Features**:
- Centralized dashboard for cafe operations.
- **Service Redirection**: Any task requiring deep integration with a microservice (e.g., assigning a rider, managing inventory) redirects the dashboard user to the specific service's UI.
- **Unified SSO**: Seamless transitions between services without re-authentication.

**Integration Points**:
- **Ordering**: Redirects to `ordering-service` for order fulfillment.
- **Logistics**: Redirects to `logistics-service` for rider assignments and fleet management.
- **Notifications**: Direct integration for sending alerts (no UI required).

---

## Implementation Sprints

See detailed sprint documents in [docs/sprints/](./sprints/) directory.

### Sprint 1: Foundation & Setup (Week 1)
- [ ] Next.js 15 project setup with TypeScript
- [ ] Tailwind CSS configuration
- [ ] Basic routing and layout components
- [ ] Dummy data structures
- [ ] Environment configuration
- [ ] Testing setup

**Document**: [sprint-1-foundation.md](./sprints/sprint-1-foundation.md)

### Sprint 2: Core Pages (Week 2)
- [ ] Home page with hero section
- [ ] About page
- [ ] Menu page with filtering and search
- [ ] SEO optimization
- [ ] Responsive design implementation

**Document**: [sprint-2-core-pages.md](./sprints/sprint-2-core-pages.md)

### Sprint 3: Service & Feature Pages (Week 3)
- [ ] Services page
- [ ] Events page with calendar
- [ ] Loyalty program page
- [ ] Contact page with map
- [ ] Careers page
- [ ] Franchising page

**Document**: [sprint-3-service-pages.md](./sprints/sprint-3-service-pages.md)

### Sprint 4: Authentication & Order Tracking (Weeks 4-5)
- [ ] SSO integration with auth-service
- [ ] Login/logout flows
- [ ] Order tracking redirector page
- [ ] Integration with `ordering-service` for tracking handoff

**Document**: [sprint-4-auth-tracking.md](./sprints/sprint-4-auth-tracking.md)

### Sprint 5: PWA & Production Polish (Week 6)
- [ ] PWA implementation (manifest, service worker)
- [ ] Offline support
- [ ] Performance optimization
- [ ] Full SEO optimization
- [ ] Production deployment
- [ ] Monitoring setup

**Document**: [sprint-5-pwa-polish.md](./sprints/sprint-5-pwa-polish.md)

### Sprint 6: Real Staff/Admin Portal (Weeks 7-8)
- [x] Base layout and dashboard UI
- [x] Order Management UI with status workflow
- [x] Team Management UI
- [ ] Service redirection logic for order fulfillment and logistics
- [x] RBAC implementation (Staff vs Admin permissions) — roles/permissions from auth-api `/me`, nav/route/404/unauthorized by permission
- [ ] Analytics dashboard (Superset embedding)
- [ ] Staff shift and attendance tracking

**Document**: [sprint-6-staff-portal.md](./sprints/sprint-6-staff-portal.md)

---

## Runtime Ports & Environments

- **Local development**: Website runs on port **3000**
- **Production**: Behind reverse proxy (Nginx/Ingress) on port **80/443**

---

## Service Integration Status (January 2026)

### Integration Priority and Status

| Priority | Service | Status | Blocks |
|----------|---------|--------|--------|
| 1 | Auth Service (SSO) | ✅ **Integrated** | Sprint 4 ✅ |
| 2 | Ordering Service | ✅ Available | Sprint 2 (menu display) |
| 3 | Notifications Service | ✅ Available | Sprint 3 (forms) |
| 4 | Logistics Service | ✅ Available | Sprint 4 (tracking) |
| 5 | Treasury Service | ⚠️ Verify | Sprint 4 (payments) |
| 6 | Booking Service | ❌ Missing | Sprint 3 (events) |

### SSO Integration Completed (January 2026)

**Files Implemented:**
- `src/lib/auth/config.ts` - SSO URLs with production defaults, NextAuth OIDC provider configuration
- `src/hooks/use-auth.ts` - SSO login/logout hooks with proper session clearing
- `src/app/login/page.tsx` - Redirects to SSO login
- `src/app/signup/page.tsx` - Redirects to SSO signup with return URL
- `src/app/(dashboard)/layout.tsx` - Dashboard with SSO logout integration

**SSO Features:**
- ✅ OIDC provider integration with auth-service
- ✅ JWT token validation via JWKS
- ✅ Access token refresh flow
- ✅ SSO logout (clears NextAuth session + redirects to SSO logout endpoint)
- ✅ Production URLs as defaults (`https://sso.codevertexitsolutions.com`)
- ✅ Return URL support for post-login/signup redirects

### Critical Integration Gaps

1. **Booking Service** - Not implemented. Use contact forms as mitigation.
2. **Treasury Payment Integration** - Verify API availability for event bookings.

See [INTEGRATIONS.md](./INTEGRATIONS.md) for detailed integration documentation.

---

## References

- [Complete Service Integrations Guide](./INTEGRATIONS.md)
- [Service Dependencies Analysis](./SERVICE-DEPENDENCIES.md)
- [Urban Loft Cafe Profile](./urban-loft-cafe-profile.md)
- [Inception Report](../../resources/Urban%20Cafe%20Food%20Delivery%20System%20Inception%20Report.docx.md)
- [Cross-Service Data Ownership](../../../docs/CROSS-SERVICE-DATA-OWNERSHIP.md)
- [Microservices Architecture](../../../docs/microservice-architecture.md)
- [Auth Integration Guide](../../../docs/AUTH-INTEGRATION-GUIDE.md)
- [Ordering Service Integration](../../../ordering-service/ordering-backend/docs/integrations.md)
- [Logistics Service Integration](../../../logistics-service/logistics-api/docs/integrations.md)
- [Treasury Service Integration](../../../finance-service/treasury-api/docs/integrations.md)

