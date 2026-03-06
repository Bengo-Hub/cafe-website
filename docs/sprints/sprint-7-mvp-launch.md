# Sprint 7 -- MVP Launch

**Timeline**: March 3 - March 17, 2026
**Goal**: Replace all dummy data in the cafe-website with real microservice API integrations, fix auth token flow, enforce role-based access in the staff portal, and ship as the central hub of the BengoBox MVP.

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

The staff portal API modules read `accessToken` from localStorage (`cafe-auth-storage`), but the Zustand auth store does not persist it. NextAuth manages tokens server-side.

- [ ] Option A (recommended): Persist `accessToken` in Zustand auth store after NextAuth session callback
- [ ] Update `lib/store/auth-store.ts` to include `accessToken` and `refreshToken` in persisted state
- [ ] Update `lib/api/client.ts` to read token from updated store
- [ ] Test: API calls from staff pages successfully authenticate against backend services
- [ ] Test: Token refresh works when access token expires

### D2: Role-based sidebar (Day 1)

- [ ] Read `roles` from NextAuth session in staff layout
- [ ] Conditionally hide `adminOnly` sidebar items (Riders, Team) for non-admin users
- [ ] Add role check utility: `hasRole(session, 'admin' | 'staff' | 'manager')`
- [ ] Redirect non-staff users who navigate to `/staff/*` to home page
- [ ] Test: Customer role cannot access staff portal
- [ ] Test: Staff role sees limited sidebar; admin role sees full sidebar

### D3: Public menu -- real API (Days 2-3)

- [ ] Update `hooks/use-menu.ts` to call ordering-service catalog API by default
- [ ] Set `NEXT_PUBLIC_USE_DUMMY_DATA=false` in production
- [ ] Fetch categories from `GET /api/v1/urban-loft/menu/categories` (or catalog endpoint)
- [ ] Fetch items from `GET /api/v1/urban-loft/menu/items`
- [ ] Map ordering-service response to existing `MenuItem` interface
- [ ] Maintain fallback to dummy data if API call fails (graceful degradation)
- [ ] Update MenuItemCard to handle real image URLs (with fallback placeholder)
- [ ] Update CategoryFilter to use real categories
- [ ] Test: Public menu page shows real items from ordering-service
- [ ] Test: Search and category filter work with real data

### D4: Staff orders -- real API (Days 3-5)

- [ ] Verify `lib/api/orders.ts` endpoints work against ordering-service
- [ ] Wire `fetchAdminOrders()` into orders page with TanStack Query
- [ ] Implement status filter tabs with API query params
- [ ] Implement order detail side panel with real line items
- [ ] Wire `updateOrderStatus()` for status transitions
- [ ] Wire `cancelOrder()` with confirmation dialog
- [ ] Add pagination (server-side)
- [ ] Add date range filter
- [ ] Handle empty state ("No orders yet")
- [ ] Test: Orders list loads from ordering-service
- [ ] Test: Status update reflects immediately (optimistic + refetch)

### D5: Staff menu management -- real API (Days 5-6)

- [ ] Verify `lib/api/catalog.ts` endpoints work against ordering-service
- [ ] Wire `fetchCategories()` and `fetchMenuItems()` into menu page
- [ ] Implement category CRUD (create, rename, delete)
- [ ] Implement item CRUD (create with image upload, edit, delete)
- [ ] Availability toggle (real API call, optimistic update)
- [ ] Featured toggle
- [ ] Handle image upload to ordering-service or storage
- [ ] Test: Menu items reflect real catalog from ordering-service
- [ ] Test: Create/edit/delete item persists to backend

### D6: Staff inventory -- real API (Day 7)

- [ ] Verify `lib/api/inventory.ts` endpoints work against inventory-service
- [ ] Wire `fetchMenuItems()` + `fetchBulkAvailability()` into inventory page
- [ ] Map response to table with SKU, stock level, status
- [ ] Low-stock and out-of-stock badges
- [ ] Handle API unavailability gracefully ("Inventory data unavailable")
- [ ] Test: Stock levels display from inventory-service

### D7: Staff riders -- real API (Days 7-8)

- [ ] Verify `lib/api/riders.ts` endpoints work against logistics-service
- [ ] Wire `fetchRiders()` into riders page with TanStack Query
- [ ] Implement status filter tabs
- [ ] Wire `inviteRider()` form
- [ ] Wire `approveRider()`, `suspendRider()`, `rejectRider()` actions
- [ ] Rider detail panel with profile and vehicle info
- [ ] Test: Rider list loads from logistics-service
- [ ] Test: Invite, approve, suspend flows work end-to-end

### D8: Dashboard -- real stats (Day 9)

- [ ] Fetch today's order count and revenue from ordering-service (`GET /admin/orders?date=today`)
- [ ] Fetch active rider count from logistics-service (`GET /admin/riders?status=active`)
- [ ] Fetch low-stock item count from inventory-service
- [ ] Wire stat cards to real data
- [ ] Recent orders table: last 10 orders from ordering-service
- [ ] Handle partial failures (show available stats, "unavailable" for failed services)
- [ ] Test: Dashboard shows real numbers

### D9: Polish and deploy (Days 10-12)

- [ ] Remove all remaining hardcoded/dummy data from staff pages (shifts, analytics, team, settings can stay as placeholders with "Coming soon" labels)
- [ ] Audit all API error handling -- no unhandled promise rejections
- [ ] Verify responsive layout on mobile (public) and desktop (staff)
- [ ] Test auth flow end-to-end (login -> bridge -> staff portal -> API calls -> logout)
- [ ] Test role-based access (customer vs staff vs admin)
- [ ] Verify SEO metadata on public pages (title, description, Open Graph)
- [ ] Verify sitemap.ts and robots.ts are correct
- [ ] Production environment variables configured
- [ ] Deploy to theurbanloftcafe.com
- [ ] Smoke test all staff pages with real backend services
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
| Auth token gap blocks all staff API calls | Staff portal non-functional | D1 is Day 1 priority; no other work starts until this is resolved |
| Ordering-service API response shape differs from dummy data | Menu/orders pages break | Map API responses through adapter functions; keep dummy data as fallback |
| Inventory-service not deployed or missing endpoints | Inventory page empty | Show "Inventory data unavailable" with graceful degradation |
| Image URLs from ordering-service are relative or broken | Menu items show broken images | Fallback placeholder image; construct full URLs from service base |
| NextAuth session/token timing issues | Intermittent 401 errors | Implement proactive token refresh; retry on 401 |

---

## Definition of done

- [ ] Public `/menu` page displays real items from ordering-service
- [ ] Staff portal requires authentication (non-staff redirected)
- [ ] Sidebar respects role-based visibility
- [ ] Staff orders page: list, detail, status update, cancel -- all real API
- [ ] Staff menu page: list, create, edit, delete items -- all real API
- [ ] Staff inventory page: stock levels from inventory-service (or graceful fallback)
- [ ] Staff riders page: list, invite, approve, suspend -- all real API
- [ ] Dashboard stat cards: real data from at least ordering + logistics
- [ ] No dummy data served in production (except placeholder pages: shifts, analytics, team, settings)
- [ ] Auth flow works end-to-end (login -> staff portal -> API -> logout)
- [ ] Deployed to theurbanloftcafe.com
- [ ] No console errors in production build
