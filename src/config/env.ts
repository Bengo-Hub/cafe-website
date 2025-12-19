export const config = {
  services: {
    auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8080',
    ordering: process.env.NEXT_PUBLIC_ORDERING_SERVICE_URL || 'http://localhost:8081',
    logistics: process.env.NEXT_PUBLIC_LOGISTICS_SERVICE_URL || 'http://localhost:8082',
    treasury: process.env.NEXT_PUBLIC_TREASURY_SERVICE_URL || 'http://localhost:8083',
    booking: process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || 'http://localhost:8084',
    notifications: process.env.NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL || 'http://localhost:8085',
  },
  
  features: {
    useDummyData: process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true' || true,
    enableRealTimeTracking: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_TRACKING === 'true',
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  },
  
  tenant: {
    slug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'urban-loft',
    id: process.env.NEXT_PUBLIC_TENANT_ID || 'tenant-urban-loft',
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
