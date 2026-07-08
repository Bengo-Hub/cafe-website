# Cafe Website - Service Dependencies Analysis

**Last Updated**: January 2026
**Related Document**: [Complete Integrations Guide](./INTEGRATIONS.md)

## Service Integration Overview

The Urban Loft Cafe Website integrates with multiple Codevertex microservices. This document analyzes each dependency, identifies gaps, and provides mitigation strategies.

### Quick Reference: Integration Priority Order

| Priority | Service | Status | Required For |
|----------|---------|--------|--------------|
| 1 | Auth Service | ✅ Available | SSO, protected routes |
| 2 | Ordering Service | ✅ Available | Menu display, order placement |
| 3 | Notifications Service | ✅ Available | Contact forms, alerts |
| 4 | Logistics Service | ✅ Available | Order tracking |
| 5 | Treasury Service | ⚠️ Verify | Event/room payments |
| 6 | Booking Service | ❌ Missing | Events, rooms, conferences |

## Integrated Services

### 1. Auth Service (SSO) ✅
**Status**: Available  
**Integration Type**: OAuth2/OIDC

**Endpoints Used**:
- `GET /.well-known/openid-configuration` - OIDC discovery
- `GET /.well-known/jwks.json` - JWT validation keys
- `GET /api/v1/auth/authorize` - Authorization flow
- `POST /api/v1/auth/token` - Token exchange
- `GET /api/v1/auth/userinfo` - User info
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Current user session

**Data Flows**:
- SSO login/logout
- JWT token validation
- Session management via Redis
- User identity resolution

**Gaps**: None - service is fully functional

---

### 2. Ordering Service ✅
**Status**: Available  
**Integration Type**: REST API + WebSocket

**Endpoints Used**:
- `GET /api/v1/{tenant}/menu/items` - Menu listing
- `GET /api/v1/{tenant}/menu/categories` - Menu categories
- `GET /api/v1/{tenant}/menu/items/{id}` - Item details
- `GET /api/v1/{tenant}/orders/{order_id}` - Order status
- `GET /api/v1/{tenant}/loyalty/{user_id}` - Loyalty points

**Data Flows**:
- Public menu browsing (no auth)
- Order placement (redirect to ordering-service PWA)
- Order tracking
- Loyalty program display

**Gaps**: None - service is fully functional

---

### 3. Logistics Service ✅
**Status**: Available  
**Integration Type**: REST API + WebSocket

**Endpoints Used**:
- `GET /v1/{tenant}/tasks/{task_id}` - Task details
- `WS /track/{order_id}` - Real-time location tracking
- `GET /v1/{tenant}/billing/payouts` - Rider payout information (for staff portal)

**Data Flows**:
- Real-time order tracking via WebSocket
- Rider location updates
- ETA calculations
- Fallback polling if WebSocket fails
- **Rider Payouts**: Logistics-service is responsible for calculating rider/driver payout amounts based on distance, time, and base rates.

**Gaps**: None - service is fully functional

---

### 4. Finance Service(treasury-api) ⚠️
**Status**: Available (needs verification)  
**Integration Type**: REST API

**Endpoints Used** (Expected):
- `POST /api/v1/{tenant}/payments/intents` - Create payment
- `GET /api/v1/{tenant}/payments/{payment_id}` - Payment status
- `POST /api/v1/{tenant}/payments/webhook` - Payment webhook
- `POST /api/v1/{tenant}/payouts` - Execute rider payouts (triggered by logistics-service)

**Data Flows**:
- Payment intents for bookings/events
- M-Pesa STK Push
- Card payment processing
- Payment status updates
- **Payout Execution**: Treasury-service executes the actual payouts to riders after calculation by logistics-service.

**Gaps**: 
- Need to verify treasury-service API endpoints
- Need to document payment webhook handling
- Need M-Pesa configuration details

---

### 6. Staff/Admin Portal Integration (New)
**Status**: In Progress 🏗️
**Integration Type**: REST API (Ordering & Logistics)

**Capabilities**:
- **Staff Management**: Admin-only interface to manage cafe staff roles and assignments.
- **Order Management**: Staff interface to manage the lifecycle of online orders.
- **Status Updates**: Staff can update order status (Confirmed, Preparing, Ready, Packaged, Dispatched).
- **Rider Coordination**: View assigned riders and their real-time status.
- **Customer Feedback**: View ratings and feedback for orders and riders.

**Data Flows**:
- Fetch active orders from `ordering-service`.
- Update order status in `ordering-service`.
- Fetch rider status from `logistics-service`.
- Fetch customer feedback from `ordering-service`.
- `POST /api/v1/notifications/sms` - Send SMS

**Data Flows**:
- Contact form submissions
- Career application notifications
- Franchise inquiry notifications
- Booking confirmations

**Gaps**: None - service is fully functional

---

### 6. Booking Service ❌
**Status**: NOT AVAILABLE - Needs Creation  
**Integration Type**: REST API (planned)

**Required Endpoints**:
- `GET /api/v1/{tenant}/bookings` - List bookings
- `GET /api/v1/{tenant}/bookings/{id}` - Booking details
- `POST /api/v1/{tenant}/bookings` - Create booking
- `PUT /api/v1/{tenant}/bookings/{id}` - Update booking
- `DELETE /api/v1/{tenant}/bookings/{id}` - Cancel booking
- `GET /api/v1/{tenant}/events` - List events
- `GET /api/v1/{tenant}/events/{id}` - Event details
- `GET /api/v1/{tenant}/spaces` - List bookable spaces
- `GET /api/v1/{tenant}/spaces/{id}/availability` - Check availability

**Required Entities**:
- Bookings (event reservations, room bookings)
- Events (Pizza Day, Couples Night, etc.)
- Spaces (conference halls, boardrooms, offices)
- Time slots and availability

**Data Flows**:
- Event browsing
- Space/room booking
- Availability checking
- Payment integration for paid events

**Gaps**: 
- **CRITICAL**: Booking service does not exist
- Need to create as Go microservice following ordering-service pattern
- Requires database schema design
- Needs SSO integration with auth-service

**Mitigation**: 
1. Use dummy booking data in cafe-website
2. Create static event listings
3. Contact forms as temporary booking requests
4. Plan booking-service as future Go+Chi service

---

### 7. Inventory Service ⚠️
**Status**: Available (optional integration)  
**Integration Type**: REST API

**Endpoints Used** (Optional):
- `GET /api/v1/{tenant}/items/{id}/availability` - Stock status

**Data Flows**:
- Real-time menu item availability
- Out-of-stock indicators

**Gaps**: 
- Integration is optional (not critical)
- Can show all items as available initially

**Mitigation**: Show all menu items as available until integration needed

---

## Integration Gaps Summary

### Critical Gaps
1. **Booking Service** - Does not exist, needs creation
   - **Impact**: Event bookings, space reservations, accommodation booking
   - **Timeline**: Plan as separate Go service (6-8 weeks development)
   - **Mitigation**: Use contact forms and static content

### Medium Priority
2. **Treasury Service Documentation** - API endpoints need verification
   - **Impact**: Payment processing for paid events/bookings
   - **Mitigation**: Use dummy payment flow, manual confirmation

### Low Priority
3. **Inventory Service Integration** - Optional real-time availability
   - **Impact**: Menu item availability display
   - **Mitigation**: Show all items as available

---

## Plan.md Gap Analysis

### Missing from Plan
1. ✅ Service dependency matrix (now documented)
2. ✅ Fallback strategies for unavailable services
3. ✅ Dummy data structures for development
4. ⚠️ Booking service creation timeline
5. ⚠️ Error handling for service outages
6. ⚠️ API versioning strategy
7. ⚠️ Rate limiting considerations

### Recommendations for Plan.md
1. Add dedicated section on service availability fallbacks
2. Document dummy data structures
3. Add error boundary implementation plan
4. Include API client retry/circuit breaker strategy
5. Add monitoring/alerting for service dependencies
6. Document booking-service as future dependency

---

## Development Strategy

### Phase 1: Foundation (Use Dummy Data)
- Implement all pages with dummy/static data
- No actual service calls except auth-service
- Focus on UI/UX and layout

### Phase 2: Available Service Integration
- Integrate auth-service (SSO)
- Integrate ordering-service (menu)
- Integrate logistics-service (tracking)
- Integrate notifications-service (forms)

### Phase 3: Partial Integration
- Use treasury-service with dummy payment flow
- Static event listings (no booking-service)
- Contact forms for booking requests

### Phase 4: Full Integration
- Wait for booking-service creation
- Complete treasury-service integration
- Add inventory-service (optional)

---

## Dummy Data Requirements

See [DUMMY-DATA.md](./DUMMY-DATA.md) for comprehensive dummy data structures.

---

## References
- [Auth Service Integration Guide](../../../auth-service/auth-api/docs/integrations.md)
- [Ordering Service Integration](../../../ordering-service/ordering-backend/docs/integrations.md)
- [Logistics Service Integration](../../../logistics-service/logistics-api/docs/integrations.md)
- [Cross-Service Data Ownership](../../../docs/CROSS-SERVICE-DATA-OWNERSHIP.md)
