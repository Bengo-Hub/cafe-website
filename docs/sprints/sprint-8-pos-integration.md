# Sprint 8: POS Integration — cafe-website

**Status:** ✅ Complete  
**Period:** July–August 2026  
**Goal:** Embed KDS and POS terminal via iframe, migrate shift management from Supabase to pos-api, add pos-api staff client

---

## Context

cafe-website currently manages shifts via Supabase and has no KDS page. Staff management is also Supabase-backed. The integration plan:
1. Add `/dashboard/kds` page embedding pos-ui KDS via iframe
2. Add `/dashboard/pos` page embedding pos-ui POS terminal via iframe
3. Migrate shift management API calls from Supabase to pos-api device session endpoints
4. Add `src/lib/api/pos-staff.ts` client for RBAC-aware staff queries

This approach (iframe embedding) was explicitly chosen to avoid duplicating POS UI logic in cafe-website.

---

## Environment Variables to Add

```bash
NEXT_PUBLIC_POS_UI_URL=https://pos.codevertexafrica.com
POS_API_URL=https://posapi.codevertexafrica.com
POS_API_KEY=<from auth-api S2S>
```

---

## Part A: KDS & POS Iframe Pages

### A1: KDS Page

```typescript
// src/app/(dashboard)/dashboard/kds/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kitchen Display' }

export default function KDSPage({ params }: { params: { orgSlug: string } }) {
  const posUiUrl = process.env.NEXT_PUBLIC_POS_UI_URL
  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <iframe
        src={`${posUiUrl}/${params.orgSlug}/kds`}
        className="w-full h-full border-0"
        title="Kitchen Display System"
        allow="fullscreen"
      />
    </div>
  )
}
```

### A2: POS Terminal Page

```typescript
// src/app/(dashboard)/dashboard/pos/page.tsx
export default function POSPage({ params }: { params: { orgSlug: string } }) {
  const posUiUrl = process.env.NEXT_PUBLIC_POS_UI_URL
  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <iframe
        src={`${posUiUrl}/${params.orgSlug}`}
        className="w-full h-full border-0"
        title="POS Terminal"
        allow="fullscreen"
      />
    </div>
  )
}
```

### A3: Navigation Links

Add to sidebar navigation (gated by staff role):
```typescript
// Sidebar nav items to add:
{ label: 'Kitchen Display', href: '/dashboard/kds', icon: 'ChefHat', roles: ['admin', 'manager', 'kitchen', 'bar'] }
{ label: 'POS Terminal', href: '/dashboard/pos', icon: 'ShoppingCart', roles: ['admin', 'manager', 'cashier'] }
```

---

## Part B: Shift Management Migration

### B1: Current State

`src/app/api/shifts/route.ts` — reads/writes Supabase `shifts` table directly.  
`src/hooks/use-shifts.ts` — wraps the above API route.

### B2: Target State

Replace Supabase calls with pos-api device session endpoints:

```typescript
// src/lib/api/pos-sessions.ts
const POS_API_URL = process.env.POS_API_URL
const POS_API_KEY = process.env.POS_API_KEY

export async function openSession(tenantSlug: string, deviceId: string, openingFloat: number) {
  return fetch(`${POS_API_URL}/v1/${tenantSlug}/pos/devices/${deviceId}/sessions/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': POS_API_KEY! },
    body: JSON.stringify({ opening_float: openingFloat })
  }).then(r => r.json())
}

export async function closeSession(tenantSlug: string, deviceId: string, closingAmount: number, notes?: string) {
  return fetch(`${POS_API_URL}/v1/${tenantSlug}/pos/devices/${deviceId}/sessions/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': POS_API_KEY! },
    body: JSON.stringify({ closing_amount: closingAmount, notes })
  }).then(r => r.json())
}

export async function getSessions(tenantSlug: string, deviceId: string) {
  return fetch(`${POS_API_URL}/v1/${tenantSlug}/pos/devices/${deviceId}/sessions`, {
    headers: { 'X-API-Key': POS_API_KEY! }
  }).then(r => r.json())
}
```

Update `src/app/api/shifts/route.ts` to call `pos-sessions.ts` instead of Supabase.  
Update `src/hooks/use-shifts.ts` — interface stays the same, underlying data source changes.

---

## Part C: POS Staff Client

```typescript
// src/lib/api/pos-staff.ts
export async function getPOSUsers(tenantSlug: string) {
  return fetch(`${POS_API_URL}/v1/${tenantSlug}/users`, {
    headers: { 'X-API-Key': POS_API_KEY! }
  }).then(r => r.json())
}

export async function getPOSRoles(tenantSlug: string) {
  return fetch(`${POS_API_URL}/v1/${tenantSlug}/rbac/roles`, {
    headers: { 'X-API-Key': POS_API_KEY! }
  }).then(r => r.json())
}

export async function assignPOSRole(tenantSlug: string, userId: string, roleId: string) {
  return fetch(`${POS_API_URL}/v1/${tenantSlug}/rbac/user-roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': POS_API_KEY! },
    body: JSON.stringify({ user_id: userId, role_id: roleId })
  }).then(r => r.json())
}
```

Use `pos-staff.ts` in the Team page to show POS role assignments alongside Supabase team data (parallel display, not replacement, for now).

---

## Part D: Iframe Security (CSP)

Update `next.config.mjs` to allow `pos.codevertexafrica.com` in frame-src:

```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `frame-src 'self' https://pos.codevertexafrica.com;`
  }
]
```

pos-ui must also send `X-Frame-Options: ALLOWFROM https://theurbanloftcafe.com` or set `frame-ancestors` CSP.

---

## devops-k8s Changes

Add to `apps/cafe-website/values.yaml`:
```yaml
env:
  NEXT_PUBLIC_POS_UI_URL: "https://pos.codevertexafrica.com"
  POS_API_URL: "https://posapi.codevertexafrica.com"
  # POS_API_KEY set via sealed secret
```

---

## Tasks

- [x] Create `src/app/(dashboard)/dashboard/kds/page.tsx` — iframe + SubscriptionGate(feature="kds")
- [x] Create `src/app/(dashboard)/dashboard/pos/page.tsx` — iframe + SubscriptionGate(feature="pos_terminal")
- [x] Add KDS + POS links to sidebar navigation (no permission gate; page content gated)
- [x] Create `src/lib/api/pos-sessions.ts` — openSession/closeSession/getSessions via pos-api
- [x] Update `src/app/api/shifts/route.ts` → call pos-sessions.ts (graceful degradation if pos-api unavailable)
- [x] Update `src/hooks/use-shifts.ts` — interface compatible (getShifts/clockIn/clockOut unchanged)
- [x] Create `src/lib/api/pos-staff.ts` — getPOSUsers/getPOSRoles/assignPOSRole
- [x] Create `src/app/api/pos-staff/route.ts` — Route Handler proxying POS staff queries
- [x] Update Team page to show POS role column (matched by email from /api/pos-staff)
- [x] Update `next.config.mjs` with frame-src CSP header for pos.codevertexafrica.com
- [x] Add `POS_API_URL` env var to `devops-k8s apps/cafe-website/values.yaml` (POS_API_KEY via sealed secret)
- [x] Run `pnpm build` — zero TypeScript errors
- [x] Push to master (commits 4170072, 8ca86a3)

## Subscription Gating (added)

- [x] `ORDERING_GROWTH` + `ORDERING_GROWTH_YEARLY`: added `pos_terminal` feature
- [x] `ORDERING_PROFESSIONAL` + `ORDERING_PROFESSIONAL_YEARLY`: added `pos_terminal` + `kds`
- [x] `POS_DEVICE_5` + `POS_DEVICE_5_YEARLY`: added `kds`
- [x] `POS_DEVICE_10` + `POS_DEVICE_10_YEARLY` + `POS_LICENSE_COMPLETE`: added `kds`
- [x] Starter plan has no `pos_terminal` or `kds` — shows upgrade prompt
- [x] Seeded to production via subscriptions-api entrypoint (b0ca1c65, CI run 26299974055)
