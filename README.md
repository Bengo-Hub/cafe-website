# Urban Loft Cafe Website

Premium, responsive business website serving as the converging point for all Urban Loft microservices. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Overview

**Purpose**: Customer-facing website with seamless SSO integration for ordering, bookings, events, and admin dashboards.

**Key Features**:
- Customer website with SEO-optimized pages
- Online ordering integration (ordering-service)
- Event and space bookings
- Real-time order tracking with maps
- SSO authentication across all services
- PWA-ready with offline support
- Mobile-first responsive design
- Loyalty program access

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **State**: Zustand / React Query
- **Forms**: React Hook Form + Zod
- **Maps**: OpenStreetMap (Leaflet) + Google Maps
- **PWA**: next-pwa + Workbox
- **Auth**: NextAuth.js / Custom OIDC

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd cafe-website

# Install dependencies
pnpm install

# Copy environment file
cp .env.local.example .env.local

# Update environment variables
# Edit .env.local with your configuration

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Service URLs
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8080
NEXT_PUBLIC_ORDERING_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_LOGISTICS_SERVICE_URL=http://localhost:8082
NEXT_PUBLIC_TREASURY_SERVICE_URL=http://localhost:8083
NEXT_PUBLIC_BOOKING_SERVICE_URL=http://localhost:8084
NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL=http://localhost:8085

# Feature Flags
NEXT_PUBLIC_USE_DUMMY_DATA=true
NEXT_PUBLIC_ENABLE_REAL_TIME_TRACKING=false
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# Tenant
NEXT_PUBLIC_TENANT_SLUG=urban-loft
NEXT_PUBLIC_TENANT_ID=tenant-urban-loft

# Maps
NEXT_PUBLIC_MAP_PROVIDER=osm
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Analytics
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GA_TRACKING_ID=
```

## Project Structure

```
cafe-website/
├── src/
│   ├── app/                 # Next.js 15 App Router pages
│   │   ├── (auth)/         # Auth routes (login, callback)
│   │   ├── (public)/       # Public routes (home, menu, about)
│   │   ├── admin/          # Protected admin routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Layout components (header, footer)
│   │   └── features/      # Feature-specific components
│   ├── lib/               # Utilities and helpers
│   │   ├── dummy-data/    # Dummy data for development
│   │   ├── api/           # API client functions
│   │   └── utils/         # Helper functions
│   ├── hooks/             # Custom React hooks
│   ├── store/             # State management (Zustand)
│   ├── config/            # Configuration files
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
│   ├── icons/            # PWA icons
│   ├── images/           # Images and graphics
│   └── manifest.json     # PWA manifest
├── docs/                  # Documentation
│   ├── sprints/          # Sprint documents
│   ├── plan.md           # Implementation plan
│   ├── SERVICE-DEPENDENCIES.md
│   └── DUMMY-DATA.md
└── tests/                # Tests (unit, integration, E2E)
```

## Development

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Service Integrations

### Available Services
- ✅ **Auth Service** - SSO authentication (OAuth2/OIDC)
- ✅ **Ordering Service** - Menu browsing, orders
- ✅ **Logistics Service** - Real-time order tracking
- ✅ **Notifications Service** - Email/SMS notifications
- ⚠️ **Treasury Service** - Payment processing
- ❌ **Booking Service** - Event/space bookings (not implemented yet)

### Development Mode
When `NEXT_PUBLIC_USE_DUMMY_DATA=true`, the website uses dummy data instead of real API calls. This allows development without running all backend services.

## Deployment

### Production Build

```bash
# Create production build
pnpm build

# Test production build locally
pnpm start
```

### Deployment Targets
- Contabo VPS (via devops-k8s)
- Vercel (alternative)
- Docker container

### CI/CD
- GitHub Actions workflows
- ArgoCD for Kubernetes deployment
- Automated testing on pull requests

## PWA Support

The website is installable as a Progressive Web App:
- Offline menu browsing
- Home screen installation
- Push notifications (future)
- Background sync (future)

## Testing

```bash
# Unit tests
pnpm test

# E2E tests with Playwright
pnpm test:e2e

# Lighthouse audit
pnpm lighthouse
```

## Documentation

- [Implementation Plan](./docs/plan.md)
- [Service Dependencies](./docs/SERVICE-DEPENDENCIES.md)
- [Dummy Data Structures](./docs/DUMMY-DATA.md)
- [Sprint 1: Foundation](./docs/sprints/sprint-1-foundation.md)
- [Sprint 2: Core Pages](./docs/sprints/sprint-2-core-pages.md)
- [Sprint 3: Service Pages](./docs/sprints/sprint-3-service-pages.md)
- [Sprint 4: Auth & Tracking](./docs/sprints/sprint-4-auth-tracking.md)
- [Sprint 5: PWA & Polish](./docs/sprints/sprint-5-pwa-polish.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

Proprietary - Urban Loft Cafe / BengoBox

## Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Inspired By**: Art Caffe, Java House, Uber Eats  
**Tagline**: BEYOND FOOD - Eat. Work. Connect. Experience.
