# Sprint 6: Real Staff/Admin Portal

**Duration**: 2 weeks  
**Status**: In Progress 🏗️  
**Goal**: Implement the full operational Staff/Admin Portal with real-time service integrations and RBAC.

**App structure**: Dashboard (admin/staff) pages are in the `(dashboard)/` route group (auth-only), under `/dashboard/*`; public site pages are in `(site)/`. See [architecture](../architecture.md#directory-layout).

---

## Tasks

### 1. Foundation & UI (Completed)
- [x] Create staff dashboard layout with sidebar
- [x] Implement staff management (for admins) UI
- [x] Build order management interface with status timeline
- [x] Implement order status updates UI:
  - [x] Confirmed
  - [x] Preparing
  - [x] Ready
  - [x] Packaged
  - [x] Dispatched

### 2. Authentication & RBAC Integration
- [ ] Integrate with `auth-service` for Staff/Admin SSO
- [ ] Implement role-based access control (RBAC) in middleware
- [ ] Restrict "Team Management" and "Settings" to Admin role only
- [ ] Fetch staff profile and permissions on login
- [ ] Handle session expiration and re-authentication for sensitive actions

### 3. Service Redirection & Integration
- [ ] Implement redirection to `ordering-service` for order fulfillment and detailed management
- [ ] Implement redirection to `logistics-service` for rider assignments and fleet management
- [ ] Ensure SSO session persists across service transitions
- [ ] Pull high-level order data from `ordering-service` API for dashboard display
- [ ] Integrate with `notifications-service` for staff alerts (direct API, no UI)

### 4. Team & Staff Management
- [ ] Integrate with `auth-service` to manage staff accounts
- [ ] Implement staff role assignment (Barista, Chef, Admin, Staff)
- [ ] Build staff shift management system
- [ ] Implement attendance tracking (Clock-in/Clock-out)
- [ ] Add staff performance metrics (orders handled, prep time)

### 5. Inventory & Menu Management
- [ ] Integrate with `inventory-service` for real-time stock levels
- [ ] Implement "Out of Stock" toggle for menu items
- [ ] Build menu item editor (prices, descriptions, images)
- [ ] Add category management (Meals, Beverages, Specials)

### 6. Analytics & Reporting
- [ ] Embed Superset dashboards for sales analytics
- [ ] Implement custom reporting for daily/weekly revenue
- [ ] Add "Top Selling Items" visualization
- [ ] Build staff productivity reports

### 7. Notifications & Communication
- [ ] Integrate with `notifications-service` for staff alerts
- [ ] Implement internal messaging/announcements for staff
- [ ] Add push notifications for critical alerts (e.g., low stock, delayed orders)

---

## Definition of Done
- [ ] Staff can manage orders in real-time with status updates
- [ ] Admins can manage staff roles and permissions
- [ ] RBAC is enforced across all `/dashboard` routes
- [ ] Real-time notifications work for new orders
- [ ] Inventory levels are reflected in the portal
- [ ] Analytics dashboards are accessible to admins
- [ ] Code passes security and performance reviews

---

## Dependencies
- `auth-service` (SSO & RBAC)
- `ordering-service` (Orders & Menu)
- `inventory-service` (Stock)
- `notifications-service` (Alerts)
- `superset` (Analytics)

---

## Related Documents
- [Plan.md](../plan.md)
- [SERVICE-DEPENDENCIES.md](../SERVICE-DEPENDENCIES.md)
- [Sprint 4: Authentication & Order Tracking](./sprint-4-auth-tracking.md)
