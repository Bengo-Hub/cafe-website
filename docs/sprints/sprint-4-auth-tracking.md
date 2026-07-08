# Sprint 4: Authentication, Order Tracking & Staff Portal

**Duration**: 2 weeks
**Status**: ✅ SSO Complete (January 2026)
**Goal**: Implement SSO authentication, real-time order tracking, and the Staff/Admin Portal

---

## Tasks

### 1. SSO Authentication Setup
- [x] Install NextAuth.js or custom OIDC client
- [x] Configure OAuth2/OIDC settings (Custom Provider)
- [x] Setup auth-service endpoints in config
- [x] Create authentication provider wrapper (src/auth.ts)
- [x] Implement session management (JWT + Session callbacks)

### 2. Login Flow
- [x] Create login page (`/auth/login`)
- [x] Implement "Login with Email" form (Dummy)
- [x] Add "Sign in with Codevertex SSO" button
- [ ] Add "Login with Google" button
- [ ] Add "Login with Microsoft" button
- [x] Build authorization redirect handler (NextAuth)
- [x] Generate PKCE code challenge/verifier (NextAuth)
- [x] Implement state parameter for CSRF protection (NextAuth)
- [x] Handle authorization code exchange (NextAuth)
- [x] Store tokens in httpOnly cookies (NextAuth)
- [x] Add LoadingSpinner to login button during authentication
- [ ] Show spinner during OAuth redirects

### 3. Auth Callback Handler (`/auth/callback`)
- [x] Create callback route handler (api/auth/[...nextauth])
- [x] Validate state parameter (NextAuth)
- [x] Exchange authorization code for tokens (NextAuth)
- [x] Validate JWT signature (JWKS) (NextAuth)
- [x] Extract user claims (user_id, tenant_id, roles)
- [ ] Store session in Redis (if available, or in-memory)
- [x] Set httpOnly cookies (access_token, refresh_token)
- [x] Redirect to intended URL or home

### 4. Session Management
- [x] Implement middleware for protected routes
- [x] Check JWT validity on each request
- [x] Auto-refresh expired tokens
- [x] Handle token refresh flow
- [ ] Clear session on logout
- [ ] Implement logout endpoint (`/auth/logout`)
- [ ] Redirect to auth-service logout URL

### 5. User Profile & Context
- [x] Create user context (Zustand Store + NextAuth Session)
- [ ] Fetch user profile from `/auth/me`
- [x] Display user info in navigation
- [x] Add profile dropdown menu
- [x] Show logout button
- [ ] Implement "My Orders" link
- [ ] Add "My Bookings" link (future)

### 6. Protected Routes
- **App structure**: Public pages live in `(site)/`; dashboard (admin/staff) auth-only pages live in `(dashboard)/` (under `/dashboard/*`).
- [x] Protect `/admin/*` routes (Middleware)
- [x] Protect `/dashboard/*` routes (Middleware)
- [ ] Protect `/track-order` (optional)
- [x] Protect `/loyalty` page (Middleware)
- [x] Redirect unauthenticated users to login
- [x] Store intended URL for post-login redirect

### 7. Order Tracking (Redirect)
- [x] Implement redirect to `ordering-service` tracking page
- [x] Pass `order_id` and `tenant_slug` in query parameters
- [x] Ensure SSO session persists across redirect
- [x] Users can enter Order ID on `cafe-website` and get redirected to `ordering-service`
- [x] `ordering-service` handles timeline and live driver coordinates from `logistics-service`

### 8. Menu Integration (Display Only)
- [ ] Pull sample main dishes from `ordering-service` API for display
- [ ] Implement redirect to `ordering-service` when user clicks "Add to Cart", "Whitelist", or "View"
- [ ] Pass `item_id` and `action` to `ordering-service` for state management

### 10. Rider Information & Payouts
- [ ] Display rider name and photo
- [ ] Show rider phone number
- [ ] Add "Call Rider" button
- [ ] Display vehicle information
- [ ] **Integration**: Logistics-service calculates rider payouts
- [ ] **Integration**: Ordering-service manages customer feedback and ratings
- [ ] Show rider rating (if available)

### 11. Fallback Polling
- [ ] Implement REST API fallback if WebSocket fails
- [ ] Poll order status every 5 seconds
- [ ] Poll logistics task for location updates
- [ ] Update UI with latest data
- [ ] Show connection status indicator

### 12. Components
- [ ] Create LoginForm component
- [ ] Build AuthProvider component
- [ ] Implement ProtectedRoute wrapper
- [ ] Create UserMenu component
- [ ] Build OrderStatusTimeline component
- [ ] Create MapView component (OpenStreetMap)
- [ ] Create GoogleMapView component (optional)
- [ ] Implement RiderInfo component
- [ ] Build WebSocketManager hook

### 13. Dummy Integration
- [ ] Use dummy order data from lib/dummy-data
- [ ] Simulate WebSocket messages with setInterval
- [ ] Mock rider location updates
- [ ] Generate dummy JWT tokens for testing
- [ ] Mock auth-service endpoints (until ready)

### 14. Error Handling
- [ ] Handle auth errors (invalid token, expired)
- [ ] Show error messages on login failures
- [ ] Handle WebSocket disconnections
- [ ] Show offline indicator
- [ ] Handle order not found errors
- [ ] Implement retry logic for failed requests

### 15. Security
- [ ] Validate all auth responses
- [ ] Sanitize user inputs
- [ ] Prevent XSS attacks
- [ ] Use httpOnly cookies for tokens
- [ ] Set secure and sameSite flags
- [ ] Implement CSRF protection
- [ ] Never expose tokens in console or errors

### 16. Testing
- [ ] Test login flow end-to-end
- [ ] Test token refresh
- [ ] Test logout flow
- [ ] Test protected route access
- [ ] Test WebSocket connection/disconnection
- [ ] Test map marker updates
- [ ] Test fallback polling
- [ ] Write unit tests for auth utilities

---

## Definition of Done
- [ ] Users can log in via auth-service (or dummy auth)
- [ ] JWT tokens stored securely in httpOnly cookies
- [ ] Protected routes redirect to login
- [ ] User profile displays in navigation
- [ ] Order tracking page shows order details
- [ ] Map displays rider location (real-time or simulated)
- [ ] WebSocket connection works with fallback
- [ ] Google Maps integration works if API key set
- [ ] Logout clears session
- [ ] All auth flows are secure
- [ ] Code passes security review
- [ ] No tokens exposed in client-side logs

---

## Dependencies
- Sprint 3 completed
- NextAuth.js or custom OIDC client
- React Leaflet (OpenStreetMap)
- @react-google-maps/api (optional)
- Auth-service endpoints (or dummy implementation)
- Ordering-service API
- Logistics-service WebSocket endpoint
- Redis for session storage (optional)

---

## Notes
- Use dummy auth-service until it's fully operational
- WebSocket can be simulated with setInterval for development
- Prefer OpenStreetMap (free) but support Google Maps
- Ensure tokens are never exposed to client-side JavaScript
- Follow OAuth2/OIDC best practices (PKCE, state parameter)
- Test on mobile devices for map interaction

---

## Critical Gaps Identified (January 2026 Audit)

### HIGH PRIORITY

**1. Complete Logout Flow** (Status: ✅ COMPLETED - January 2026)
- [x] Implement logout via `use-auth.ts` hook
- [x] Clear NextAuth session (`signOut({ redirect: false })`)
- [x] Clear Zustand auth store
- [x] Redirect to auth-service logout endpoint (`SSO_URLS.getLogoutUrl()`)
- [x] SSO logout URL clears server-side session and redirects back

**Implementation Files:**
- `src/lib/auth/config.ts` - `SSO_URLS.getLogoutUrl()` with `post_logout_redirect_uri`
- `src/hooks/use-auth.ts` - `logout()` function with proper SSO redirect
- `src/app/(dashboard)/layout.tsx` - Logout button wired to `useAuth().logout`

**2. Treasury Service API Verification** (Status: ⚠️ Needs Documentation)
- [ ] Verify treasury-api endpoints match cafe-website expectations
- [ ] Document payment intent creation flow
- [ ] Add webhook handling for payment confirmations
- [ ] Document error cases and retry logic

**3. Redis Session Storage** (Status: 🏗️ Optional but Recommended)
- [ ] Configure Redis connection settings
- [ ] Document key patterns: `session:{session_id}`
- [ ] Set appropriate TTL (match token expiry)
- [ ] Implement fallback to in-memory if Redis unavailable

**4. Role-Based Access Control (RBAC)** (Status: 🏗️ In Progress)
- [ ] Implement RBAC middleware for dashboard (admin/staff) routes
- [ ] Document role-to-permission mapping:
  - `customer`: Place orders, view loyalty, track orders
  - `staff`: Manage orders, view dashboard
  - `admin`: Full access to staff portal
- [ ] Add role checking in protected route middleware

### MEDIUM PRIORITY

**5. Error Handling & Resilience**
- [ ] Add circuit breaker for auth-service calls
- [ ] Document retry policies for service failures
- [ ] Implement graceful degradation (read-only mode)
- [ ] Add user-facing error messages for common failures

**6. Booking Service Dependency** (Status: ❌ Blocking)
- Booking service does NOT exist yet
- Events, room bookings, conference hall features blocked
- Mitigation: Use contact forms + static content until service created

---

## Related Documents
- [Plan.md](../plan.md)
- [SERVICE-DEPENDENCIES.md](../SERVICE-DEPENDENCIES.md)
- [Auth Service Integration](../../../../auth-service/auth-api/docs/integrations.md)
- [Sprint 3](./sprint-3-service-pages.md)
