# Sprint 8: POS Integration — cafe-website

**Status:** 🔴 Not Started  
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
NEXT_PUBLIC_POS_UI_URL=https://pos.codevertexitsolutions.com
POS_API_URL=https://posapi.codevertexitsolutions.com
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

Update `next.config.mjs` to allow `pos.codevertexitsolutions.com` in frame-src:

```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `frame-src 'self' https://pos.codevertexitsolutions.com;`
  }
]
```

pos-ui must also send `X-Frame-Options: ALLOWFROM https://cafecodevertex.codevertexitsolutions.com` or set `frame-ancestors` CSP.

---

## devops-k8s Changes

Add to `apps/cafe-website/values.yaml`:
```yaml
env:
  NEXT_PUBLIC_POS_UI_URL: "https://pos.codevertexitsolutions.com"
  POS_API_URL: "https://posapi.codevertexitsolutions.com"
  # POS_API_KEY set via sealed secret
```

---

## Tasks

- [ ] Create `src/app/(dashboard)/dashboard/kds/page.tsx`
- [ ] Create `src/app/(dashboard)/dashboard/pos/page.tsx`
- [ ] Add KDS + POS links to sidebar navigation
- [ ] Create `src/lib/api/pos-sessions.ts`
- [ ] Update `src/app/api/shifts/route.ts` → call pos-sessions.ts
- [ ] Update `src/hooks/use-shifts.ts` — verify interface compatibility
- [ ] Create `src/lib/api/pos-staff.ts`
- [ ] Update Team page to show POS role column alongside Supabase data
- [ ] Update `next.config.mjs` with frame-src CSP header
- [ ] Add env vars to `devops-k8s apps/cafe-website/values.yaml`
- [ ] Run `pnpm build` and fix all errors
- [ ] Push to staging, merge to main
