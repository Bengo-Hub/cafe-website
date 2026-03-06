# cafe-website -- Architecture

**Service**: cafe-website (Next.js 15)
**Deployed**: theurbanloftcafe.com
**Canonical tenant**: `urban-loft` | **Active outlet**: Busia
**Pages**: ~24 (public + staff portal)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS + Shadcn UI (Button, Card, Badge, Input, Label, Switch, Skeleton) |
| State | Zustand (auth, theme) + TanStack Query (server data) |
| Auth | NextAuth v5 (beta.30) with OIDC provider (`bengobox-auth`) |
| Forms | React Hook Form + Zod |
| Maps | Leaflet + react-leaflet |
| Animations | Framer Motion |
| Icons | Lucide React |
| PWA | @ducanh2912/next-pwa |
| Date | date-fns |
| Build | pnpm, standalone output |

---

## Role in the platform

The cafe-website is the **hub** for the BengoBox ecosystem. It follows a **display-only + redirect pattern**:

- **Read data** from microservice APIs for display (menus, orders, riders, inventory)
- **Redirect for mutations** to the owning service's UI (ordering PWA for cart/checkout)
- **Staff portal** at `/staff/*` provides operational dashboards by aggregating data from multiple services
- **No entity ownership** -- all entities belong to their respective microservices

---

## Directory layout

```
src/
  app/
    page.tsx                     -- Home
    about/ menu/ contact/ ...    -- Public pages
    events/ careers/ franchising/ loyalty/
    services/ services/hub/ services/events/
    track-order/
    login/ signup/
    auth/bridge/page.tsx         -- Post-login routing
    api/auth/[...nextauth]/      -- NextAuth route handler
    staff/
      layout.tsx                 -- Staff shell (sidebar, auth guard)
      page.tsx                   -- Dashboard
      orders/ menu/ inventory/ riders/ shifts/ analytics/ team/ settings/
  components/
    layout/                      -- Header, Footer, PageTransition
    providers/                   -- AppProviders, ThemeProvider
    sections/                    -- HeroSection, MenuItemCard, ServiceCard, etc.
    ui/                          -- Shadcn components (Badge, Button, Card, etc.)
  config/env.ts                  -- Centralized env config
  hooks/                         -- useAuth, useMenu
  lib/
    api/                         -- client.ts, orders.ts, riders.ts, inventory.ts, catalog.ts
    auth/config.ts               -- NextAuth OIDC config
    constants/menu-categories.ts
    dummy-data/                  -- menu, events, jobs, loyalty, orders, spaces, team, testimonials
    store/                       -- auth-store.ts, theme-store.ts
    utils/                       -- currency, date, string, schema
  types/                         -- index.ts, next-auth.d.ts
  auth.ts                        -- NextAuth instance
  middleware.ts                  -- Route protection
```

---

## Multi-tenancy model

| Concept | Implementation |
|---------|---------------|
| Tenant slug | `NEXT_PUBLIC_TENANT_SLUG` (default `urban-loft`) in `config/env.ts` |
| Tenant ID | `NEXT_PUBLIC_TENANT_ID` (default `tenant-urban-loft`) |
| API scoping | `X-Tenant-Slug` and `X-Tenant-ID` headers on all API calls |
| URL paths | `/api/v1/${TENANT}/...` in all service API modules |
| SSO | `tenant` param in OIDC authorize URL; `tenant_id`, `tenant_slug` in profile claims |

### Platform admin vs tenant admin

| Actor | Scope | UI behavior |
|-------|-------|------------|
| Platform admin | Cross-tenant (future) | Full staff sidebar; tenant switcher (post-MVP) |
| Tenant admin | Own tenant operations | Full staff sidebar minus platform-level settings |
| Staff member | Outlet-level operations | Restricted sidebar (orders, menu, shifts) |
| Customer | Public pages + loyalty | No staff access; `/staff/*` returns 403 redirect |

Current implementation: sidebar items `riders` and `team` are marked `adminOnly: true` but the layout does not yet conditionally hide them. This must be fixed for MVP.

---

## Multi-outlet awareness

Single outlet (Busia) for MVP. Outlet context is implicit in the tenant config.

Post-MVP: outlet selector in staff portal header; API calls scoped by `X-Outlet-ID` header; staff see only their assigned outlet's data.

---

## Auth architecture

### NextAuth v5 OIDC

- Provider: `bengobox-auth` (custom OIDC)
- Issuer: `NEXT_PUBLIC_AUTH_SERVICE_URL` (default `https://sso.codevertexitsolutions.com`)
- Auth UI: `NEXT_PUBLIC_AUTH_UI_URL` (default `https://accounts.codevertexitsolutions.com`)
- Client ID: `cafe-website`

### Flow

1. User clicks "Login" -> `signIn('bengobox-auth', { callbackUrl })`
2. NextAuth redirects to auth-service authorize endpoint
3. User authenticates at auth-ui (accounts.codevertexitsolutions.com)
4. Callback to `/api/auth/callback/bengobox-auth`
5. Bridge page (`/auth/bridge`) handles post-login routing:
   - Staff/admin roles -> `/staff/orders`
   - Customer roles -> `return_to` param or `/`
6. JWT callback stores `access_token`, `refresh_token`, `expires_at`
7. Token refresh via `refreshAccessToken()` when expired

### Profile mapping

Claims mapped from OIDC profile: `sub`, `name`, `email`, `picture`, `role`, `roles`, `tenant_id`, `tenant_slug`, `phone`.

### Middleware route protection

- **Public**: `/`, `/about`, `/menu`, `/services`, `/services/*`, `/events`, `/careers`, `/franchising`, `/contact`, `/loyalty`
- **Auth pages** (redirect if logged in): `/login`, `/signup`
- **Protected** (redirect to `/login` if not authenticated): everything else, including `/staff/*`

---

## Data integration pattern

### Current state (dummy data)

Public pages use dummy data from `lib/dummy-data/`:
- `dummyMenuItems` (menu.ts) -- 20+ categories, MenuItem interface
- Events, jobs, loyalty, orders, spaces, team, testimonials

Feature flag: `NEXT_PUBLIC_USE_DUMMY_DATA` controls whether `useMenu()` returns dummy data or calls ordering-service API.

### Target state (MVP)

| Staff page | Data source | API module | Status |
|-----------|-------------|-----------|--------|
| Orders | ordering-service | `lib/api/orders.ts` | Implemented (API calls ready) |
| Menu | ordering-service | `lib/api/catalog.ts` | Implemented (CRUD ready) |
| Inventory | inventory-service | `lib/api/inventory.ts` | Implemented (stock queries ready) |
| Riders | logistics-service | `lib/api/riders.ts` | Implemented (list, invite, approve) |
| Dashboard | Multiple services | Hardcoded | Needs real data |
| Shifts | pos-service / local | Hardcoded | Needs real data |
| Analytics | Superset embed | Hardcoded | Placeholder |
| Team | auth-service | Hardcoded | Needs real data |
| Settings | Local + auth-service | Hardcoded | Needs real data |

### API client

`lib/api/client.ts` provides:
- Tenant headers injection (`X-Tenant-Slug`, `X-Tenant-ID`)
- Retry with exponential backoff (3 attempts)
- Request timeout
- `ApiError` class for structured error handling
- Methods: `api.get`, `api.post`, `api.put`, `api.delete`

### Auth token gap

API modules read `accessToken` from `localStorage.getItem('cafe-auth-storage')`. However, the Zustand auth store only persists `user` and `isAuthenticated`, not `accessToken`. This needs to be fixed -- the access token from the NextAuth session must be made available to client-side API calls.

Options:
1. Persist `accessToken` in the Zustand store
2. Use NextAuth `getSession()` server-side and pass token via props
3. Create an API route proxy that attaches the server-side token

---

## Service URLs

| Service | Env variable | Default |
|---------|-------------|---------|
| Auth | `NEXT_PUBLIC_AUTH_SERVICE_URL` | `https://sso.codevertexitsolutions.com` |
| Auth UI | `NEXT_PUBLIC_AUTH_UI_URL` | `https://accounts.codevertexitsolutions.com` |
| Ordering | `NEXT_PUBLIC_ORDERING_SERVICE_URL` | `https://orderapi.codevertexitsolutions.com` |
| Ordering PWA | `NEXT_PUBLIC_ORDERING_PWA_URL` | `https://ordersapp.codevertexitsolutions.com` |
| Logistics | `NEXT_PUBLIC_LOGISTICS_SERVICE_URL` | `https://logisticsapi.codevertexitsolutions.com` |
| Inventory | `NEXT_PUBLIC_INVENTORY_SERVICE_URL` | (not set) |
| Treasury | `NEXT_PUBLIC_TREASURY_SERVICE_URL` | `https://booksapi.codevertexitsolutions.com` |
| Notifications | `NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL` | `https://notifications.codevertexitsolutions.com` |

---

## MVP scope (March 17, 2026)

### Must-fix

- Auth token availability for client-side API calls (the token gap described above)
- Role-based sidebar visibility in staff portal
- Replace dummy menu data with ordering-service API on public `/menu` page

### Must-have (staff portal)

- Orders page: real data from ordering-service (list, status update, cancel)
- Menu page: real data from ordering-service catalog (categories, items, CRUD)
- Riders page: real data from logistics-service (list, invite, approve, suspend)
- Inventory page: real data from inventory-service (stock levels, low-stock flags)
- Dashboard: aggregate stats from orders + riders (basic counts and totals)

### Nice-to-have

- Shifts page with real pos-service data
- Analytics with Superset iframe embed
- Team page with auth-service user list
- Settings page with outlet config

### Post-MVP

- Multi-outlet selector in staff portal
- Real-time order tracking (WebSocket from logistics-service)
- Booking integration (when booking-service is built)
- Loyalty points display from ordering-service
- Push notifications
- Localization (EN/SW)
