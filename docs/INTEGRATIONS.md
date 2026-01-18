# Cafe Website - Complete Service Integrations Guide

**Date**: January 2026
**Version**: 2.0
**Purpose**: Comprehensive documentation of all microservice integrations for the Urban Loft Cafe Website, including communication patterns, integration order, and implementation details.

---

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Service Integration Order](#service-integration-order)
3. [Communication Patterns](#communication-patterns)
4. [Detailed Service Integrations](#detailed-service-integrations)
5. [Event-Driven Architecture](#event-driven-architecture)
6. [Security & Authentication](#security--authentication)
7. [Error Handling & Resilience](#error-handling--resilience)
8. [Implementation Checklist](#implementation-checklist)

---

## Integration Overview

The Urban Loft Cafe Website serves as the **converging point** for all BengoBox microservices. It integrates with backend services to provide:

- **SSO Authentication** via auth-service
- **Online Ordering** via ordering-service (redirect pattern)
- **Real-time Order Tracking** via logistics-service (WebSocket)
- **Payment Processing** via treasury-service (for bookings)
- **Notifications** via notifications-service (forms, alerts)
- **Menu Display** via ordering-service (REST API)

### Integration Philosophy

The cafe website follows a **display-only integration pattern**:
- **Read Data**: Pull data from microservices for display purposes
- **Redirect for Actions**: Any action that modifies state redirects to the owning microservice's UI
- **No Entity Ownership**: All entities are owned by respective microservices

---

## Service Integration Order

Based on the [roadmap.md](../../../docs/roadmap.md) and service dependencies, integrations should be implemented in this order:

### Phase 1: Authentication Foundation (Priority: CRITICAL)
| Order | Service | Integration Type | Status |
|-------|---------|-----------------|--------|
| 1 | **Auth Service** | OAuth2/OIDC SSO | ✅ Available |

**Why First?**: All protected routes and user features require SSO authentication.

### Phase 2: Core Display Features (Priority: HIGH)
| Order | Service | Integration Type | Status |
|-------|---------|-----------------|--------|
| 2 | **Ordering Service** | REST API (menu display) | ✅ Available |
| 3 | **Notifications Service** | REST API (forms) | ✅ Available |

**Why Second?**: Menu browsing and contact forms are core website features.

### Phase 3: Enhanced Features (Priority: MEDIUM)
| Order | Service | Integration Type | Status |
|-------|---------|-----------------|--------|
| 4 | **Logistics Service** | WebSocket (tracking) | ✅ Available |
| 5 | **Treasury Service** | REST API (bookings) | ⚠️ Needs Verification |

**Why Third?**: Order tracking and payment for bookings enhance user experience.

### Phase 4: Staff Portal (Priority: LOW)
| Order | Service | Integration Type | Status |
|-------|---------|-----------------|--------|
| 6 | **Inventory Service** | REST API (optional) | ⚠️ Optional |
| 7 | **POS Service** | Redirect | ⚠️ Optional |

**Why Last?**: Staff features can launch after core customer features.

### Critical Gap: Booking Service
| Service | Status | Mitigation |
|---------|--------|------------|
| **Booking Service** | ❌ NOT AVAILABLE | Use contact forms + static content |

---

## Communication Patterns

### Pattern Selection Matrix

| Use Case | Pattern | Technology | Service |
|----------|---------|------------|---------|
| User authentication | OAuth2/OIDC | Redirect + JWT | auth-service |
| Menu browsing | REST API | HTTP GET | ordering-service |
| Order placement | Redirect | URL redirect | ordering-service PWA |
| Order tracking | WebSocket | WS + Polling fallback | logistics-service |
| Contact forms | REST API | HTTP POST | notifications-service |
| Payment (bookings) | REST API | HTTP POST | treasury-service |
| Staff dashboards | Redirect | URL redirect | All services |

### When to Use Each Pattern

**REST API (Synchronous)**:
- Data display (menus, events, availability)
- Form submissions (contact, careers, franchising)
- Payment intent creation

**Redirect Pattern**:
- Order placement → ordering-service PWA
- Order tracking → ordering-service tracking page
- Staff dashboards → respective service UIs

**WebSocket (Real-Time)**:
- Live order tracking (rider location)
- ETA updates

**Event-Driven (NATS)**:
- Not directly used by cafe-website (backend-to-backend only)

---

## Detailed Service Integrations

### 1. Auth Service (SSO)

**Status**: ✅ **FULLY AVAILABLE**
**Integration Priority**: 1 (CRITICAL)
**Production URL**: `https://sso.codevertexitsolutions.com/`

#### Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/.well-known/openid-configuration` | GET | OIDC discovery | No |
| `/.well-known/jwks.json` | GET | JWT validation keys | No |
| `/api/v1/auth/authorize` | GET | Authorization flow | No |
| `/api/v1/auth/token` | POST | Token exchange | No |
| `/api/v1/auth/refresh` | POST | Token refresh | No |
| `/api/v1/auth/userinfo` | GET | User info | Yes |
| `/api/v1/auth/me` | GET | Current session | Yes |
| `/api/v1/auth/logout` | POST | Logout | Yes |

#### SSO Flow Implementation

```typescript
// 1. Initiate Login
const authUrl = new URL(`${AUTH_SERVICE_URL}/api/v1/auth/authorize`);
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', `${WEBSITE_URL}/auth/callback`);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('state', generateState());
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

// 2. Handle Callback
// POST /api/v1/auth/token with authorization code
// Store tokens in httpOnly cookies

// 3. Validate JWT on Protected Routes
// Use JWKS from auth-service for validation
```

#### Session Sharing Architecture

```
User Login → Auth-Service (SSO)
    ↓
JWT Token Issued (access_token, refresh_token)
    ↓
Cookie Set (httpOnly, secure, sameSite=lax)
    ↓
Redis Session: session:{session_id}
    ↓
All Services Validate JWT:
  - Ordering Service → Allows access
  - Logistics Service → Allows access
  - Treasury Service → Allows access
```

#### Configuration

```env
# Auth Service Configuration
AUTH_SERVICE_URL=https://sso.codevertexitsolutions.com
AUTH_CLIENT_ID=cafe-website
AUTH_CLIENT_SECRET=<stored-encrypted>
AUTH_REDIRECT_URI=https://cafe.codevertexitsolutions.com/auth/callback
AUTH_JWKS_ENDPOINT=https://sso.codevertexitsolutions.com/api/v1/.well-known/jwks.json
```

---

### 2. Ordering Service

**Status**: ✅ **FULLY AVAILABLE**
**Integration Priority**: 2 (HIGH)
**Production URL**: `https://orderapi.codevertexitsolutions.com/`
**PWA URL**: `https://ordersapp.codevertexitsolutions.com/`

#### Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/v1/{tenant}/menu/items` | GET | Menu listing | No |
| `/api/v1/{tenant}/menu/categories` | GET | Menu categories | No |
| `/api/v1/{tenant}/menu/items/{id}` | GET | Item details | No |
| `/api/v1/{tenant}/orders/{id}` | GET | Order status | Yes |
| `/api/v1/{tenant}/loyalty/{user_id}` | GET | Loyalty points | Yes |

#### Integration Pattern: Display + Redirect

**Menu Display (REST API)**:
```typescript
// Public menu browsing - no auth required
const response = await fetch(
  `${ORDERING_API}/api/v1/${tenantSlug}/menu/items`,
  {
    headers: {
      'X-Tenant-Slug': tenantSlug,
      'Accept-Language': locale, // 'en' or 'sw'
    },
  }
);
```

**Order Placement (Redirect)**:
```typescript
// Redirect to ordering-service PWA for cart and checkout
const orderUrl = new URL(`${ORDERING_PWA_URL}/menu`);
orderUrl.searchParams.set('item_id', itemId);
orderUrl.searchParams.set('action', 'add-to-cart');
orderUrl.searchParams.set('tenant', tenantSlug);
window.location.href = orderUrl.toString();
```

**Order Tracking (Redirect)**:
```typescript
// Redirect to ordering-service tracking page
const trackUrl = new URL(`${ORDERING_PWA_URL}/track`);
trackUrl.searchParams.set('id', orderId);
trackUrl.searchParams.set('tenant', tenantSlug);
window.location.href = trackUrl.toString();
```

#### Data Flow

```
Cafe Website                          Ordering Service
     │                                      │
     │──── GET /menu/items ────────────────▶│
     │◀──── Menu items JSON ────────────────│
     │                                      │
     │──── User clicks "Add to Cart" ──────▶│
     │          (REDIRECT)                  │
     │                                      │
     │◀──── Ordering PWA handles cart ──────│
```

#### Configuration

```env
# Ordering Service Configuration
ORDERING_API_URL=https://orderapi.codevertexitsolutions.com
ORDERING_PWA_URL=https://ordersapp.codevertexitsolutions.com
DEFAULT_TENANT_SLUG=urban-cafe
```

---

### 3. Logistics Service

**Status**: ✅ **FULLY AVAILABLE**
**Integration Priority**: 4 (MEDIUM)
**Production URL**: `https://logistics.codevertexitsolutions.com/` (API TBD)

#### Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/v1/{tenant}/tasks/{task_id}` | GET | Task details | Yes |
| `/ws/track/{order_id}` | WebSocket | Real-time tracking | Yes |
| `/v1/{tenant}/fleet-members` | GET | Rider list (staff portal) | Yes |

#### WebSocket Real-Time Tracking

```typescript
// WebSocket connection for live tracking
const ws = new WebSocket(
  `${LOGISTICS_WS_URL}/track/${orderId}?token=${accessToken}`
);

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
  // Fallback to REST polling
  startPolling();
};
```

#### Polling Fallback

```typescript
// Fallback polling when WebSocket fails
const pollOrderStatus = async () => {
  const task = await fetch(
    `${LOGISTICS_API}/v1/${tenantSlug}/tasks/${taskId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const taskData = await task.json();
  updateMapMarker(taskData.current_location);
  updateETA(taskData.eta);
};

// Poll every 5 seconds
setInterval(pollOrderStatus, 5000);
```

#### Configuration

```env
# Logistics Service Configuration
LOGISTICS_API_URL=https://logistics.codevertexitsolutions.com
LOGISTICS_WS_URL=wss://logistics.codevertexitsolutions.com
```

---

### 4. Treasury Service

**Status**: ⚠️ **NEEDS VERIFICATION**
**Integration Priority**: 5 (MEDIUM)
**Production URL**: `https://booksapi.codevertexitsolutions.com/`

#### Endpoints Used (Expected)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/v1/{tenant}/payments/intents` | POST | Create payment | Yes |
| `/api/v1/{tenant}/payments/{id}` | GET | Payment status | Yes |
| `/api/v1/{tenant}/payments/webhook` | POST | Payment callback | No (HMAC verified) |

#### Payment Flow for Bookings

```typescript
// Create payment intent for event/room booking
const paymentIntent = await fetch(
  `${TREASURY_API}/api/v1/${tenantSlug}/payments/intents`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: bookingAmount,
      currency: 'KES',
      payment_method: 'mpesa', // or 'card'
      metadata: {
        booking_id: bookingId,
        event_id: eventId,
        booking_type: 'event', // or 'room', 'conference'
      },
    }),
  }
);

// Handle M-Pesa STK Push
if (paymentIntent.payment_method === 'mpesa') {
  await initiateSTKPush(paymentIntent.client_secret);
}
```

#### Configuration

```env
# Treasury Service Configuration
TREASURY_API_URL=https://booksapi.codevertexitsolutions.com
```

---

### 5. Notifications Service

**Status**: ✅ **FULLY AVAILABLE**
**Integration Priority**: 3 (HIGH)
**Production URL**: `https://notifications.codevertexitsolutions.com/`

#### Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/v1/{tenantId}/notifications/messages` | POST | Send notification | Yes (API key) |

#### Form Submission Flow

```typescript
// Contact form submission
const sendContactForm = async (formData) => {
  const response = await fetch(
    `${NOTIFICATIONS_API}/v1/${tenantId}/notifications/messages`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': NOTIFICATIONS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'email',
        template: 'contact_form',
        recipient: {
          email: 'info@urbanloftcafe.co.ke',
        },
        data: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          submitted_at: new Date().toISOString(),
        },
      }),
    }
  );
  return response.ok;
};
```

#### Use Cases

| Form | Template | Recipients |
|------|----------|------------|
| Contact | `contact_form` | info@urbanloftcafe.co.ke |
| Careers | `job_application` | hr@urbanloftcafe.co.ke |
| Franchising | `franchise_inquiry` | franchise@urbanloftcafe.co.ke |
| Events | `event_inquiry` | events@urbanloftcafe.co.ke |

#### Configuration

```env
# Notifications Service Configuration
NOTIFICATIONS_API_URL=https://notifications.codevertexitsolutions.com
NOTIFICATIONS_API_KEY=<stored-encrypted>
```

---

### 6. Inventory Service (Optional)

**Status**: ⚠️ **OPTIONAL INTEGRATION**
**Integration Priority**: 6 (LOW)

#### Endpoints Used (Optional)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/v1/{tenant}/inventory/items/{sku}` | GET | Stock availability | Yes |

#### Integration Pattern

```typescript
// Optional: Show real-time availability on menu items
const checkAvailability = async (sku: string) => {
  const response = await fetch(
    `${INVENTORY_API}/v1/${tenantSlug}/inventory/items/${sku}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await response.json();
  return data.available > 0;
};
```

#### Mitigation (Without Integration)

Show all menu items as available. Actual availability checked by ordering-service at checkout time.

---

### 7. Booking Service (NOT AVAILABLE)

**Status**: ❌ **CRITICAL GAP**

#### Required Endpoints (Future)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/{tenant}/bookings` | GET/POST | List/Create bookings |
| `/api/v1/{tenant}/events` | GET | List events |
| `/api/v1/{tenant}/spaces` | GET | List bookable spaces |
| `/api/v1/{tenant}/spaces/{id}/availability` | GET | Check availability |

#### Mitigation Strategy

1. **Events Page**: Use static content + contact forms
2. **Room Bookings**: Contact form → manual processing
3. **Conference Halls**: Contact form → manual processing
4. **Future**: Implement as Go microservice following ordering-service pattern

---

## Event-Driven Architecture

### Events Relevant to Cafe Website

The cafe website does not directly consume or publish NATS events (that's backend-to-backend). However, understanding the event flow helps with integration:

#### Order Lifecycle Events

```
cafe.order.created
    ↓
cafe.order.ready (triggers logistics task)
    ↓
logistics.task.assigned (rider assigned)
    ↓
logistics.task.en_route (rider en route)
    ↓
logistics.task.completed (delivered)
```

#### How Website Uses Events

- **WebSocket**: Logistics service broadcasts real-time updates
- **REST Polling**: Fallback to query order/task status
- **No Direct NATS**: Website doesn't connect to NATS directly

---

## Security & Authentication

### Authentication Strategy

| Scenario | Method | Details |
|----------|--------|---------|
| User authentication | OAuth2/OIDC | Redirect to auth-service |
| JWT validation | JWKS | Validate tokens via auth-service JWKS |
| API key auth | Header | For service-to-service (notifications) |
| Session sharing | Redis | Shared session across all services |

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "user@example.com",
  "roles": ["customer", "staff"],
  "permissions": ["order.create", "order.view"],
  "exp": 1704067200,
  "iss": "https://sso.codevertexitsolutions.com"
}
```

### Protected Routes

| Route Pattern | Auth Required | Roles |
|---------------|---------------|-------|
| `/` | No | Public |
| `/menu` | No | Public |
| `/about`, `/contact`, etc. | No | Public |
| `/loyalty` | Yes | Customer |
| `/track-order` | No (redirect) | - |
| `/admin/*` | Yes | Admin, Staff |
| `/staff/*` | Yes | Staff |

### Security Best Practices

1. **httpOnly Cookies**: Store tokens in httpOnly, secure cookies
2. **CSRF Protection**: Use CSRF tokens for forms
3. **CORS**: Configure strict CORS policies
4. **Rate Limiting**: Implement rate limiting on form endpoints
5. **Input Validation**: Validate all user inputs

---

## Error Handling & Resilience

### Retry Policies

```typescript
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 500) {
        await delay(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      return response; // Client error, don't retry
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
};
```

### Service Unavailability Fallbacks

| Service | Fallback Strategy |
|---------|-------------------|
| Auth Service | Show login error, retry button |
| Ordering Service | Show cached menu, redirect disabled |
| Logistics Service | Polling fallback, static ETA message |
| Treasury Service | Show "payment unavailable" message |
| Notifications Service | Queue form submissions locally |

### Error Boundaries

```typescript
// React error boundary for service failures
class ServiceErrorBoundary extends Component {
  state = { hasError: false, service: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, service: error.service };
  }

  render() {
    if (this.state.hasError) {
      return <ServiceUnavailable service={this.state.service} />;
    }
    return this.props.children;
  }
}
```

---

## Implementation Checklist

### Phase 1: Authentication (Sprint 4)

- [ ] Configure auth-service OIDC client
- [ ] Implement `/auth/callback` route
- [ ] Set up JWT validation middleware
- [ ] Implement token refresh flow
- [ ] Configure Redis session storage
- [ ] Add login/logout UI components
- [ ] Test SSO flow end-to-end

### Phase 2: Menu Integration (Sprint 2)

- [ ] Create API client for ordering-service
- [ ] Implement menu fetching with caching
- [ ] Add localization support (EN/SW)
- [ ] Create menu page with filtering
- [ ] Implement search functionality
- [ ] Add "Order Now" redirect buttons
- [ ] Test menu display on mobile

### Phase 3: Order Tracking (Sprint 4)

- [ ] Create order tracking page
- [ ] Implement WebSocket connection
- [ ] Add polling fallback
- [ ] Integrate Mapbox/Google Maps
- [ ] Show rider location and ETA
- [ ] Handle connection errors gracefully
- [ ] Test on slow networks

### Phase 4: Forms & Notifications (Sprint 3)

- [ ] Create contact form component
- [ ] Implement notifications API client
- [ ] Add form validation (React Hook Form + Zod)
- [ ] Configure email templates
- [ ] Add success/error feedback
- [ ] Test form submissions

### Phase 5: Staff Portal (Sprint 6)

- [ ] Implement RBAC checks
- [ ] Create staff dashboard layout
- [ ] Add service redirect links
- [ ] Implement analytics embedding
- [ ] Test role-based access

---

## References

- [Microservices Architecture](../../../docs/microservice-architecture.md)
- [Cross-Service Data Ownership](../../../docs/CROSS-SERVICE-DATA-OWNERSHIP.md)
- [Auth Integration Guide](../../../docs/AUTH-INTEGRATION-GUIDE.md)
- [Roadmap](../../../docs/roadmap.md)
- [Ordering Service Integration](../../../ordering-service/ordering-backend/docs/integrations.md)
- [Logistics Service Integration](../../../logistics-service/logistics-api/docs/integrations.md)
- [Treasury Service Integration](../../../finance-service/treasury-api/docs/integrations.md)
