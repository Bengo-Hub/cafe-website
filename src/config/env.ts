// Production base URLs (used when NEXT_PUBLIC_* are not set, e.g. Docker build without build-args)
const PRODUCTION = {
  auth: 'https://sso.codevertexafrica.com',
  ordering: 'https://orderingapi.codevertexafrica.com',
  orderingPwa: 'https://ordering.codevertexafrica.com',
  logistics: 'https://logisticsapi.codevertexafrica.com',
  treasury: 'https://booksapi.codevertexafrica.com',
  // Event/room bookings are handled by the ordering backend (guest checkout against inventory SERVICE items) — matches the POS/inventory architecture; there is no separate booking service.
  booking: 'https://orderingapi.codevertexafrica.com',
  notifications: 'https://notificationsapi.codevertexafrica.com',
  inventory: 'https://inventoryapi.codevertexafrica.com',
  pos: 'https://posapi.codevertexafrica.com',
  erp: 'https://erp.codevertexafrica.com',
  site: 'https://theurbanloftcafe.com',
};

export const config = {
  services: {
    auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || PRODUCTION.auth,
    ordering: process.env.NEXT_PUBLIC_ORDERING_SERVICE_URL || PRODUCTION.ordering,
    orderingPwa: process.env.NEXT_PUBLIC_ORDERING_PWA_URL || PRODUCTION.orderingPwa,
    logistics: process.env.NEXT_PUBLIC_LOGISTICS_SERVICE_URL || PRODUCTION.logistics,
    treasury: process.env.NEXT_PUBLIC_TREASURY_SERVICE_URL || PRODUCTION.treasury,
    booking: process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || PRODUCTION.booking,
    notifications: process.env.NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL || PRODUCTION.notifications,
    inventory: process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || PRODUCTION.inventory,
    pos: process.env.NEXT_PUBLIC_POS_API_URL || PRODUCTION.pos,
    erp: process.env.NEXT_PUBLIC_ERP_API_URL || PRODUCTION.erp,
  },
  
  features: {
    enableRealTimeTracking: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_TRACKING === 'true',
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  },
  
  tenant: {
    slug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'urban-loft',
    // Use UUID from auth/tenant API when available; omit or use valid UUID so public menu can resolve by slug (X-Tenant-Slug + URL path).
    id: process.env.NEXT_PUBLIC_TENANT_ID || '',
  },
  
  maps: {
    provider: (process.env.NEXT_PUBLIC_MAP_PROVIDER as 'osm' | 'google') || 'osm',
    googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  
  api: {
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
  },
};
