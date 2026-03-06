# cafe-website -- UX/UI Specification

**Target users**: Customers (public pages), staff/admins (dashboard)
**Device targets**: Mobile-first (public), desktop-first (dashboard)
**Design system**: Shadcn UI + Tailwind CSS + Framer Motion transitions

---

## Public pages

### Layout

- **Header**: Logo, nav links (Home, Menu, Services, Events, About, Contact), auth buttons (Login/Signup or user avatar), theme toggle, mobile hamburger menu
- **Footer**: Contact info, social links, quick links, newsletter signup
- **Page transitions**: Framer Motion fade/slide on route change
- **Max width**: 1280px content, full-bleed hero sections

### Home (`/`)

- Hero carousel (full-width images with overlay text, CTA buttons)
- Featured menu items grid (from ordering-service or dummy data)
- Services overview (cards linking to /services, /services/hub, /services/events)
- Testimonials section
- CTA: "Order Now" -> redirects to ordering PWA

### Menu (`/menu`)

- Category filter tabs (horizontal scroll)
- Search bar
- Menu item grid (cards with image, name, price, dietary tags)
- Click item: modal with full details, nutrition info, "Order Now" redirect
- **MVP critical**: Replace `dummyMenuItems` with ordering-service catalog API (`GET /api/v1/{tenant}/menu/items`)

### Services (`/services`)

- Service cards: Ordering, Events, Business Hub
- Each links to sub-page or external service

### Track Order (`/track-order`)

- Order ID input field
- Redirects to ordering-service tracking or shows inline status
- Map integration for delivery tracking (logistics-service WebSocket, post-MVP)

### Login/Signup (`/login`, `/signup`)

- Redirect to auth-ui (accounts.codevertexitsolutions.com)
- Login: `signIn('bengobox-auth')` via NextAuth
- Signup: redirect to auth-ui registration page

---

## Dashboard (`/dashboard/*`)

### Layout

- **Sidebar** (240px, collapsible):
  - Logo
  - Nav sections: Dashboard, Orders, Menu, Inventory, Riders (admin only), Shifts, Analytics, Team (admin only), Settings
  - Active item highlight
  - User avatar + role at bottom
  - Logout button
- **Header** (56px): Page title, breadcrumbs, tenant badge (`urban-loft`), notification bell (placeholder)
- **Content**: Max-width 1280px, responsive padding

### Dashboard home (`/dashboard`)

- **Stat cards** (4 columns): Total Orders Today, Revenue Today, Active Riders, Low Stock Items
- **Recent orders table**: Last 10 orders with status, total, time
- **Quick actions**: New Order (redirect to POS), View Menu, Invite Rider

**MVP**: Replace hardcoded stats with real data aggregated from ordering-service and logistics-service.

### Orders (`/dashboard/orders`)

- **Filters**: Status tabs (All, Pending, Preparing, Ready, Completed, Cancelled), date range picker, search by order number
- **Data table**: Order number, customer name, type (delivery/pickup/dine-in), status badge, total, time, actions
- **Actions**: View detail, update status (dropdown), cancel (with confirmation)
- **Order detail**: Side panel or full page with line items, payments, status timeline, delivery info

**Data source**: `fetchAdminOrders()` from ordering-service via `lib/api/orders.ts`

### Menu management (`/dashboard/menu`)

- **Category sidebar** (left): List of categories with item count, "Add Category" button
- **Item grid/list** (right): Items in selected category
- **Item card**: Image, name, price, availability toggle, featured badge, edit/delete actions
- **Add/Edit item**: Form with name, description, price, category, image upload, dietary tags, modifiers
- **Bulk actions**: Toggle availability for multiple items

**Data source**: `fetchMenuItems()`, `createMenuItem()`, `updateMenuItem()` from ordering-service catalog via `lib/api/catalog.ts`

### Inventory (`/staff/inventory`)

- **Filters**: Category, stock status (All, Low Stock, Out of Stock)
- **Data table**: Item name, SKU, current stock, status badge, last updated
- **Status badges**: In Stock (green), Low Stock (amber), Out of Stock (red)

**Data source**: `fetchMenuItems()` + `fetchBulkAvailability()` from inventory-service via `lib/api/inventory.ts`

### Riders (`/dashboard/riders`) -- admin only

- **Status tabs**: All, Pending, Active, Suspended
- **Data table**: Name, phone, status badge, fleet, vehicle, joined date, actions
- **Actions**: View detail, approve (if pending), suspend (if active), reject (if pending)
- **Invite rider**: Form with email, phone, fleet assignment
- **Rider detail**: Profile info, vehicle info, activity log

**Data source**: `fetchRiders()`, `inviteRider()`, `approveRider()`, `suspendRider()`, `rejectRider()` from logistics-service via `lib/api/riders.ts`

### Shifts (`/dashboard/shifts`)

- **Current shift**: Clock in/out button, shift duration timer
- **Shift history**: Table with date, clock in, clock out, duration, status
- **Staff on duty**: List of currently clocked-in staff

**Data source**: Currently hardcoded. MVP: connect to pos-service shift endpoints if available, else keep static.

### Analytics (`/dashboard/analytics`)

- **Stat cards**: Revenue this week, orders this week, average order value, top selling item
- **Charts placeholder**: "Analytics dashboard coming soon" with Superset embed placeholder
- **Top items table**: Item name, quantity sold, revenue

**Data source**: Currently hardcoded. MVP: basic stats from ordering-service order aggregation.

### Team (`/dashboard/team`) -- admin only

- **Staff directory**: Name, role, email, phone, status
- **Invite user**: Button to redirect to auth-ui admin panel

**Data source**: Currently hardcoded. Post-MVP: auth-service user list.

### Settings (`/dashboard/settings`)

- **Tabs**: Profile, Security, Preferences
- **Profile**: Name, email, phone (read-only from SSO)
- **Security**: Password change (redirect to auth-ui), 2FA toggle
- **Preferences**: Theme (light/dark/system), language, notification preferences

**Data source**: Currently hardcoded. Post-MVP: auth-service profile API.

---

## Component inventory

### Shared UI (Shadcn)

Badge, Button, Card, Input, Label, LoadingSpinner, Skeleton, Switch

### Layout

Header (responsive, mobile menu), Footer, PageTransition (Framer Motion)

### Sections (public pages)

HeroSection, HeroCarousel, MenuItemCard, MenuItemModal, ServiceCard, ValueCard, TeamMemberCard, CategoryFilter, SearchBar

### Staff components (to build for MVP)

| Component | Purpose |
|-----------|---------|
| StaffDataTable | Reusable data table with pagination, sorting, filters |
| StatusBadge | Color-coded status indicators |
| StatCard | Dashboard metric card |
| SidePanel | Slide-out detail panel for orders, riders |
| ConfirmDialog | Confirmation for destructive actions |
| FormDrawer | Side drawer for create/edit forms |

---

## Status color system

| Status | Color | Context |
|--------|-------|---------|
| Active / In Stock / Completed | Green | Orders, riders, inventory |
| Pending / Preparing | Yellow | Orders, rider approval |
| Ready / Assigned | Blue | Orders, delivery |
| Suspended / Cancelled / Out of Stock | Red | Riders, orders, inventory |
| Low Stock | Amber | Inventory |

---

## Responsive breakpoints

### Public pages

| Breakpoint | Layout |
|-----------|--------|
| >= 1280px | Full layout, 4-column grids |
| 768-1279px | 2-column grids, condensed header |
| < 768px | Single column, hamburger menu, stacked cards |

### Staff portal

| Breakpoint | Layout |
|-----------|--------|
| >= 1280px | Full sidebar + content |
| 768-1279px | Collapsed sidebar (icons) + content |
| < 768px | Hidden sidebar (sheet overlay), stacked layout |

---

## Loading and error states

- **Page load**: Full-page skeleton matching layout structure
- **Data table load**: 5 skeleton rows
- **Menu grid load**: 8 skeleton cards
- **API error**: Inline error banner with retry button
- **Empty state**: Illustration + description + CTA
- **Service unavailable**: Graceful degradation -- show cached data or "temporarily unavailable" message
- **Offline** (public): Show cached menu if available; forms show "Please check your connection"
