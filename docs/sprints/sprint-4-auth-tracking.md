# Sprint 4: Authentication & Order Tracking

**Duration**: 1-2 weeks  
**Status**: Not Started  
**Goal**: Implement SSO authentication and real-time order tracking with maps

---

## Tasks

### 1. SSO Authentication Setup
- [ ] Install NextAuth.js or custom OIDC client
- [ ] Configure OAuth2/OIDC settings
- [ ] Setup auth-service endpoints in config
- [ ] Create authentication provider wrapper
- [ ] Implement session management

### 2. Login Flow
- [ ] Create login page (`/auth/login`)
- [ ] Implement "Login with Email" form
- [ ] Add "Login with Google" button
- [ ] Add "Login with Microsoft" button
- [ ] Build authorization redirect handler
- [ ] Generate PKCE code challenge/verifier
- [ ] Implement state parameter for CSRF protection
- [ ] Handle authorization code exchange
- [ ] Store tokens in httpOnly cookies
- [ ] Add LoadingSpinner to login button during authentication
- [ ] Show spinner during OAuth redirects

### 3. Auth Callback Handler (`/auth/callback`)
- [ ] Create callback route handler
- [ ] Validate state parameter
- [ ] Exchange authorization code for tokens
- [ ] Validate JWT signature (JWKS)
- [ ] Extract user claims (user_id, tenant_id, roles)
- [ ] Store session in Redis (if available, or in-memory)
- [ ] Set httpOnly cookies (access_token, refresh_token)
- [ ] Redirect to intended URL or home

### 4. Session Management
- [ ] Implement middleware for protected routes
- [ ] Check JWT validity on each request
- [ ] Auto-refresh expired tokens
- [ ] Handle token refresh flow
- [ ] Clear session on logout
- [ ] Implement logout endpoint (`/auth/logout`)
- [ ] Redirect to auth-service logout URL

### 5. User Profile & Context
- [ ] Create user context (React Context)
- [ ] Fetch user profile from `/auth/me`
- [ ] Display user info in navigation
- [ ] Add profile dropdown menu
- [ ] Show logout button
- [ ] Implement "My Orders" link
- [ ] Add "My Bookings" link (future)

### 6. Protected Routes
- [ ] Protect `/admin/*` routes
- [ ] Protect `/track-order` (optional)
- [ ] Protect `/loyalty` page
- [ ] Redirect unauthenticated users to login
- [ ] Store intended URL for post-login redirect

### 7. Order Tracking Page (`/track-order`)
- [ ] Create order tracking page layout
- [ ] Accept order_id as query parameter
- [ ] Fetch order details from ordering-service (dummy)
- [ ] Display order status timeline
- [ ] Show order items and total
- [ ] Create status badges (pending, preparing, out for delivery)
- [ ] Display estimated delivery time
- [x] Implement loading.tsx skeleton with map and details
- [ ] Add LoadingSpinner during order fetch

### 8. Real-Time Tracking (Maps)
- [ ] Install react-leaflet for OpenStreetMap
- [ ] Create map component with order location
- [ ] Add marker for rider location
- [ ] Add marker for delivery destination
- [ ] Implement WebSocket connection to logistics-service
- [ ] Handle location_update messages
- [ ] Update marker position in real-time
- [ ] Calculate and display ETA
- [ ] Show distance to destination

### 9. Google Maps Integration (Optional)
- [ ] Install @react-google-maps/api
- [ ] Create GoogleMap component
- [ ] Detect map provider from env (OSM vs Google)
- [ ] Prioritize Google Maps if API key is set
- [ ] Implement same features as OpenStreetMap
- [ ] Style map with custom colors

### 10. Rider Information
- [ ] Display rider name and photo
- [ ] Show rider phone number
- [ ] Add "Call Rider" button
- [ ] Display vehicle information
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

## Related Documents
- [Plan.md](../plan.md)
- [SERVICE-DEPENDENCIES.md](../SERVICE-DEPENDENCIES.md)
- [Auth Service Integration](../../../../auth-service/auth-api/docs/integrations.md)
- [Sprint 3](./sprint-3-service-pages.md)
