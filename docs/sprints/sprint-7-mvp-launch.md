# Sprint 7 -- MVP Launch

**Timeline**: March 3 - March 17, 2026
**Goal**: Replace all dummy data in the cafe-website with real microservice API integrations, fix auth token flow, enforce role-based access in the dashboard, and ship as the central hub of the BengoBox MVP.

---

## Progress

- **2026-03-06 (SSO-only, no NextAuth)**: Replaced NextAuth with direct SSO (PKCE): login/signup pages redirect to auth-service `/api/v1/authorize`; callback at `/auth/callback` exchanges code for tokens and fetches profile; Zustand auth store persists session/user; `cafe-website` OAuth client in auth-api seed uses redirect_uris `{origin}/auth/callback` and is public (PKCE). Removed NextAuth dependency and `/api/auth/*` route; dashboard layout redirects unauthenticated users to `/login` (which redirects to SSO). See `docs/architecture.md` Auth section.
- **2026-03-06 (RBAC + TanStack Query)**: RBAC from auth-api: added `GET /api/v1/auth/me` integration via `lib/api/auth.ts` and `useMe()` hook with TanStack Query (staleTime 5 min). Dashboard layout uses `useMe()` for roles/permissions; nav visibility and route protection use auth-api data when available. Added `hasPermission()` in `lib/auth/roles.ts`. Unauthorized (403) page at `/unauthorized` and 404 at `not-found.tsx`; non-staff users hitting dashboard redirect to `/unauthorized`. All data fetching in the app uses TanStack Query (useQuery/useMutation); no raw fetch/axios in components.
- **2026-03-06 (later)**: Tenant/brand: tenant slug from route (`/t/[slug]`) or `NEXT_PUBLIC_TENANT_SLUG` fallback via `useTenantSlug()`. Auth-api `GET /api/v1/tenants/by-slug/{slug}` (public) used to load tenant name/slug and optional branding (logo URL, primary/secondary colors from tenant metadata). `TenantBrandProvider` applies brand colors to CSS variables; Header and dashboard sidebar use tenant org name/logo when available. Settings page: added Branding section (org name, logo URL, brand colors). Menu: graceful fallback to empty list when catalog API fails. D3 items ticked: fallback on API fail, MenuItemCard image fallback (in mapper), CategoryFilter uses real categories.
- **2026-03-06**: D1 auth token fix and D2 role-based dashboard implemented. Auth store now persists `accessToken` and `refreshToken`; session callback (via use-auth) syncs tokens into the store. API client reads token from auth store for `Authorization` header. Dashboard layout: `hasRole` / `hasStaffOrAdminRole` helpers added; sidebar hides Riders/Team for non-admin; non-staff users visiting `/dashboard/*` are redirected to `/`. Doc ticks updated for D1, D2, and already-done D3/D5 items.
- **2026-03 (MVP path)**: Granular RBAC: sidebar items gated by permission (orders:read, menu:read, inventory:read, riders:read, users:read) from auth-api GET /me; fallback when permissions array empty for staff. Role-based post-login redirect (staff→/dashboard, others→/profile). Profile page at /profile (fix 404). All dashboard data fetches via TanStack Query (useMe 5 min TTL, use-menu, orders/menu/riders/inventory pages use useQuery/useMutation).
- **2026-03 (SSO + public menu + dashboard completion)**: Public menu 401 fix: added `lib/api/public-menu.ts` calling `/menu/categories` and `/menu/items` (no auth); `use-menu.ts` now uses public endpoints for site menu. Profile: Preferences (theme), Settings (link to auth-ui), responsive layout; desktop navbar: user dropdown with Profile + Logout. Orders: pagination, date range, status filters, detail panel, update/cancel wired. Dashboard: stat cards and recent orders from `fetchAdminOrders` (today's count/revenue, last 10 orders). Menu management: category create, item CRUD, availability/featured toggles. Inventory: fetch + bulk availability, SKU/stock/badges. Riders: fetch, status tabs, invite/approve/suspend/reject. Auth-api: canonical permissions (`catalog:view`, `catalog:manage`) in seed and JWT; ordering-backend: JIT provisioning, Staff role includes catalog permissions.

---

## Completed sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| 1 | Foundation (Next.js 15, Tailwind, Shadcn) | Done |
| 2 | Core pages (home, menu, about, contact) | Done |
| 3 | Service pages (services, hub, events) | Done |
| 4 | Auth + order tracking (SSO, bridge, middleware) | Done |
| 5 | PWA polish (manifest, SW, performance) | Done |
| 6 | Staff portal (layout, pages, dummy data) | Done |

---

## Deliverables

### D1: Auth token fix (Day 1) -- CRITICAL

The dashboard API modules read `accessToken` from the Zustand auth store (`cafe-auth-storage`). SSO callback persists session (accessToken, refreshToken) and user in the store.

- [x] Persist `accessToken` (and session/user) in Zustand auth store after SSO callback
- [x] Update `lib/store/auth-store.ts` to include `accessToken` and `refreshToken` in persisted state
- [x] Update `lib/api/client.ts` to read token from updated store
- [ ] Test: API calls from dashboard pages successfully authenticate against backend services
- [ ] Test: Token refresh works when access token expires

### D2: Role-based sidebar (Day 1)

- [x] Read `roles` from auth store (populated by SSO callback and /me) in dashboard layout
- [x] Fetch roles (and permissions) from auth-api `GET /api/v1/auth/me` via `useMe()` with TanStack Query (staleTime 5 min)
- [x] Conditionally hide `adminOnly` sidebar items (Riders, Team) for non-admin users
- [x] Add role check utility: `hasRole(session, 'admin' | 'staff' | 'manager')` and `hasPermission()`
- [x] Redirect non-staff users who navigate to `/dashboard/*` to `/unauthorized` (403 page)
- [x] 404 and unauthorized (403) pages exist and are used where appropriate
- [ ] Test: Customer role cannot access dashboard
- [ ] Test: Staff role sees limited sidebar; admin role sees full sidebar

### D3: Public menu -- real API (Days 2-3)

- [x] Update `hooks/use-menu.ts` to call ordering-service **public** menu API (`lib/api/public-menu.ts`: `/menu/categories`, `/menu/items` — no auth)
- [ ] Set `NEXT_PUBLIC_USE_DUMMY_DATA=false` in production
- [x] Fetch categories from `GET /api/v1/{tenant}/menu/categories`
- [x] Fetch items from `GET /api/v1/{tenant}/menu/items`
- [x] Map ordering-service response to existing `MenuItem` interface
- [x] Maintain fallback to empty list if API call fails (graceful degradation)
- [x] Update MenuItemCard to handle real image URLs (with fallback placeholder)
- [x] Update CategoryFilter to use real categories
- [ ] Test: Public menu page shows real items from ordering-service
- [ ] Test: Search and category filter work with real data

### D4: Staff orders -- real API (Days 3-5)

- [x] Verify `lib/api/orders.ts` endpoints work against ordering-service
- [x] Wire `fetchAdminOrders()` into orders page with TanStack Query
- [x] Implement status filter tabs with API query params
- [x] Implement order detail side panel with real line items
- [x] Wire `updateOrderStatus()` for status transitions
- [x] Wire `cancelOrder()` with confirmation dialog
- [x] Add pagination (server-side)
- [x] Add date range filter (`date_from`, `date_to`)
- [x] Handle empty state ("No orders yet")
- [ ] Test: Orders list loads from ordering-service
- [ ] Test: Status update reflects immediately (optimistic + refetch)

### D5: Staff menu management -- real API (Days 5-6)

- [x] Verify `lib/api/catalog.ts` endpoints work against ordering-service
- [x] Wire `fetchCategories()` and `fetchMenuItems()` into menu page
- [x] Implement category CRUD (create; rename/delete via updateCategory/deleteCategory)
- [x] Implement item CRUD (create, edit, delete)
- [x] Availability toggle (real API call, optimistic update)
- [x] Featured toggle
- [ ] Handle image upload to ordering-service or storage
- [ ] Test: Menu items reflect real catalog from ordering-service
- [ ] Test: Create/edit/delete item persists to backend

### D6: Staff inventory -- real API (Day 7)

- [x] Verify `lib/api/inventory.ts` endpoints work against inventory-service
- [x] Wire `fetchMenuItems()` + `fetchBulkAvailability()` into inventory page
- [x] Map response to table with SKU, stock level, status
- [x] Low-stock and out-of-stock badges
- [x] Handle API unavailability gracefully ("Inventory data unavailable")
- [ ] Test: Stock levels display from inventory-service

### D7: Staff riders -- real API (Days 7-8)

- [x] Verify `lib/api/riders.ts` endpoints work against logistics-service
- [x] Wire `fetchRiders()` into riders page with TanStack Query
- [x] Implement status filter tabs
- [x] Wire `inviteRider()` form
- [x] Wire `approveRider()`, `suspendRider()`, `rejectRider()` actions
- [x] Rider detail panel with profile and vehicle info
- [ ] Test: Rider list loads from logistics-service
- [ ] Test: Invite, approve, suspend flows work end-to-end

### D8: Dashboard -- real stats (Day 9)

- [x] Fetch today's order count and revenue from ordering-service (`GET /admin/orders` with `date_from`/`date_to`)
- [ ] Fetch active rider count from logistics-service (`GET /admin/riders?status=active`)
- [ ] Fetch low-stock item count from inventory-service
- [x] Wire stat cards to real data (orders today, preparing, ready, revenue)
- [x] Recent orders table: last 10 orders from ordering-service
- [x] Handle partial failures (loading/empty states)
- [ ] Test: Dashboard shows real numbers

### D9: Polish and deploy (Days 10-12)

- [ ] Remove all remaining hardcoded/dummy data from staff pages (shifts, analytics, team, settings can stay as placeholders with "Coming soon" labels)
- [ ] Audit all API error handling -- no unhandled promise rejections
- [ ] Verify responsive layout on mobile (public) and desktop (dashboard)
- [ ] Test auth flow end-to-end (login -> bridge -> dashboard -> API calls -> logout)
- [ ] Test role-based access (customer vs staff vs admin)
- [ ] Verify SEO metadata on public pages (title, description, Open Graph)
- [ ] Verify sitemap.ts and robots.ts are correct
- [ ] Production environment variables configured
- [ ] Deploy to theurbanloftcafe.com
- [ ] Smoke test all dashboard pages with real backend services
- [ ] Smoke test public menu with real ordering-service data

---

## API dependencies

| Service | Endpoints | Staff page | Status |
|---------|-----------|-----------|--------|
| ordering-service | `GET /api/v1/{t}/admin/orders`, `PUT .../status`, `DELETE .../cancel` | Orders | API ready |
| ordering-service | `GET/POST/PUT/DELETE /api/v1/{t}/catalog/categories`, `.../items` | Menu | API ready |
| ordering-service | `GET /api/v1/{t}/menu/items`, `GET .../categories` | Public menu | API ready |
| inventory-service | `GET /v1/{t}/inventory/items/{sku}`, bulk availability | Inventory | Needs verification |
| logistics-service | `GET /api/v1/{t}/admin/riders`, invite, approve, suspend, reject | Riders | API deployed |
| auth-service | SSO, JWKS, token refresh | Auth | Deployed |

---

## Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Auth token gap blocks all dashboard API calls | Dashboard non-functional | D1 is Day 1 priority; no other work starts until this is resolved |
| Ordering-service API response shape differs from dummy data | Menu/orders pages break | Map API responses through adapter functions; keep dummy data as fallback |
| Inventory-service not deployed or missing endpoints | Inventory page empty | Show "Inventory data unavailable" with graceful degradation |
| Image URLs from ordering-service are relative or broken | Menu items show broken images | Fallback placeholder image; construct full URLs from service base |
| NextAuth session/token timing issues | Intermittent 401 errors | Implement proactive token refresh; retry on 401 |

---

## Definition of done

- [x] Public `/menu` page displays real items from ordering-service (via public `/menu/*` API, no auth)
- [x] Staff portal requires authentication (non-staff redirected)
- [x] Sidebar respects role-based visibility
- [x] Staff orders page: list, detail, status update, cancel -- all real API
- [x] Staff menu page: list, create, edit, delete items -- all real API
- [x] Staff inventory page: stock levels from inventory-service (or graceful fallback)
- [x] Staff riders page: list, invite, approve, suspend -- all real API
- [x] Dashboard stat cards: real data from ordering (orders today, revenue, recent orders)
- [ ] No dummy data served in production (except placeholder pages: shifts, analytics, team, settings)
- [ ] Auth flow works end-to-end (login -> dashboard -> API -> logout)
- [ ] Deployed to theurbanloftcafe.com
- [ ] No console errors in production build
