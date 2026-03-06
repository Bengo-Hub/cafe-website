# cafe-website -- Architecture

**Service**: cafe-website (Next.js 15)
**Deployed**: theurbanloftcafe.com
**Canonical tenant**: `urban-loft` | **Active outlet**: Busia
**Pages**: ~24 (public + dashboard)

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
- **Dashboard** at `/dashboard/*` provides operational dashboards by aggregating data from multiple services
- **No entity ownership** -- all entities belong to their respective microservices

---

## Directory layout

Route groups (parentheses do not affect the URL):

- **`(site)`** — **Public pages**. No auth required: home, menu, about, contact, events, careers, franchising, loyalty, services, login, signup, auth/bridge.
- **`(dashboard)`** — **Dashboard (admin/staff) auth-only pages**. Protected by middleware; require SSO. Dashboard shell (sidebar, auth guard) and pages: dashboard, orders, menu (management), inventory, riders, shifts, analytics, team, settings, track-order. Resolve under `/dashboard/*` (e.g. `/dashboard`, `/dashboard/menu`, `/dashboard/orders`).

```
src/
  app/
    page.tsx                        -- Home (root)
    (site)/                         -- Public pages
      about/ menu/ contact/ events/ careers/ franchising/ loyalty/
      services/ services/hub/ services/events/
      login/ signup/
      auth/bridge/page.tsx          -- Post-login routing
    (dashboard)/                    -- Dashboard auth-only (layout = sidebar + guard)
      layout.tsx                    -- Dashboard shell (sidebar, auth guard)
      dashboard/
        page.tsx                    -- Dashboard home
        orders/ menu/ inventory/ riders/ shifts/ analytics/ team/ settings/
        track-order/
    api/auth/[...nextauth]/         -- NextAuth route handler
  components/
    layout/                      -- Header, Footer, PageTransition
    providers/                   -- AppProviders, ThemeProvider
    sections/                    -- HeroSection, MenuItemCard, ServiceCard, etc.
    ui/                          -- Shadcn components (Badge, Button, Card, etc.)
  config/env.ts                  -- Centralized env config
  hooks/                         -- useAuth, useMenu, useMe (auth-api /me + RBAC)
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
| Tenant slug | Route `/t/[slug]` (when used) or `NEXT_PUBLIC_TENANT_SLUG` (default `urban-loft`) via `useTenantSlug()`; config in `config/env.ts` |
| Tenant ID | `NEXT_PUBLIC_TENANT_ID` (default `tenant-urban-loft`) |
| Tenant/brand | Auth-api `GET /api/v1/tenants/by-slug/{slug}` (public); logo/colors from tenant metadata; `TenantBrandProvider` applies CSS vars |
| API scoping | `X-Tenant-Slug` and `X-Tenant-ID` headers on all API calls |
| URL paths | `/api/v1/${TENANT}/...` in all service API modules |
| SSO | `tenant` param in OIDC authorize URL; `tenant_id`, `tenant_slug` in profile claims |

### Platform admin vs tenant admin

| Actor | Scope | UI behavior |
|-------|-------|------------|
| Platform admin | Cross-tenant (future) | Full dashboard sidebar; tenant switcher (post-MVP) |
| Tenant admin | Own tenant operations | Full dashboard sidebar minus platform-level settings |
| Staff member | Outlet-level operations | Restricted sidebar (orders, menu, shifts) |
| Customer | Public pages + loyalty | No dashboard access; `/dashboard/*` returns 403 redirect |

Current implementation: sidebar items `riders` and `team` are marked `adminOnly: true` and are conditionally hidden for non-admin users in the dashboard layout.

---

## Multi-outlet awareness

Single outlet (Busia) for MVP. Outlet context is implicit in the tenant config.

Post-MVP: outlet selector in dashboard header; API calls scoped by `X-Outlet-ID` header; staff see only their assigned outlet's data.

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
   - Staff/admin roles -> `/dashboard/orders`
   - Customer roles -> `return_to` param or `/`
6. JWT callback stores `access_token`, `refresh_token`, `expires_at`
7. Token refresh via `refreshAccessToken()` when expired

### Profile mapping

Claims mapped from OIDC profile: `sub`, `name`, `email`, `picture`, `role`, `roles`, `tenant_id`, `tenant_slug`, `phone`.

### RBAC (roles and permissions)

- **Source**: Auth-api `GET /api/v1/auth/me` returns user profile, `roles`, and `permissions` (cached with TanStack Query, staleTime 5 min via `useMe()` hook).
- **Usage**: Dashboard layout uses `useMe()` for nav visibility and route protection; when `/me` data is available it takes precedence over session roles; otherwise falls back to NextAuth session.
- **Helpers**: `hasRole(user, role)`, `hasStaffOrAdminRole(user)`, `hasPermission(user, permission)` in `lib/auth/roles.ts`.
- **403**: Non-staff users visiting `/dashboard/*` are redirected to `/unauthorized`. A dedicated 403 page exists at `app/unauthorized/page.tsx`. 404 is handled by `app/not-found.tsx`.

### Middleware route protection

- **Public**: `/`, `/about`, `/menu`, `/services`, `/services/*`, `/events`, `/careers`, `/franchising`, `/contact`, `/loyalty`, `/unauthorized` (403 page)
- **Auth pages** (redirect if logged in): `/login`, `/signup`
- **Protected** (redirect to `/login` if not authenticated): everything else, including `/dashboard/*`

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

### Data fetching (TanStack Query)

All API data fetching is done via TanStack Query (`useQuery` / `useMutation`). No components call `fetch` or `axios` directly; they use hooks that wrap API module functions (e.g. `useMenu`, `useMe`, and inline `useQuery`/`useMutation` in dashboard pages). API modules (`lib/api/*.ts`) use the shared `api` client from `lib/api/client.ts`, which reads the access token from the auth store.

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
- Role-based sidebar visibility in dashboard
- Replace dummy menu data with ordering-service API on public `/menu` page

### Must-have (dashboard)

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

- Multi-outlet selector in dashboard
- Real-time order tracking (WebSocket from logistics-service)
- Booking integration (when booking-service is built)
- Loyalty points display from ordering-service
- Push notifications
- Localization (EN/SW)
