# Dummy Data Structures

This document defines all dummy data structures used during cafe-website development until backend services are fully integrated.

## Menu Data

```typescript
// src/lib/dummy-data/menu.ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  dietaryTags?: ('vegetarian' | 'vegan' | 'gluten-free' | 'halal')[];
  featured?: boolean;
}

export const dummyMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Urban Loft Burger',
    description: 'Premium beef patty, caramelized onions, aged cheddar, special sauce',
    price: 850,
    category: 'mains',
    image: '/images/menu/burger.jpg',
    available: true,
    featured: true,
  },
  {
    id: 'item-2',
    name: 'Grilled Chicken Salad',
    description: 'Fresh greens, grilled chicken breast, avocado, cherry tomatoes',
    price: 720,
    category: 'salads',
    image: '/images/menu/salad.jpg',
    available: true,
    dietaryTags: ['gluten-free', 'halal'],
    featured: true,
  },
  {
    id: 'item-3',
    name: 'Espresso',
    description: 'Rich, bold espresso shot from Ethiopian single-origin beans',
    price: 180,
    category: 'beverages',
    image: '/images/menu/espresso.jpg',
    available: true,
  },
  {
    id: 'item-4',
    name: 'Margherita Pizza',
    description: 'Wood-fired pizza with fresh mozzarella, tomatoes, basil',
    price: 950,
    category: 'mains',
    image: '/images/menu/pizza.jpg',
    available: true,
    dietaryTags: ['vegetarian'],
  },
  {
    id: 'item-5',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and microfoam',
    price: 250,
    category: 'beverages',
    image: '/images/menu/cappuccino.jpg',
    available: true,
  },
  {
    id: 'item-6',
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, roasted vegetables, tahini dressing, chickpeas',
    price: 680,
    category: 'salads',
    image: '/images/menu/buddha-bowl.jpg',
    available: true,
    dietaryTags: ['vegan', 'gluten-free'],
  },
];

export const menuCategories = [
  { id: 'all', name: 'All Items' },
  { id: 'mains', name: 'Main Courses' },
  { id: 'salads', name: 'Salads & Bowls' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'desserts', name: 'Desserts' },
];
```

---

## Events Data

```typescript
// src/lib/dummy-data/events.ts
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  image: string;
  category: string;
  price?: number;
  available_slots?: number;
}

export const dummyEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Pizza Day',
    description: 'Unlimited wood-fired pizzas every Friday. Book your table now!',
    date: '2025-12-20',
    time: '18:00 - 22:00',
    image: '/images/events/pizza-day.jpg',
    category: 'weekly',
    price: 1500,
    available_slots: 45,
  },
  {
    id: 'event-2',
    name: 'Couples Night',
    description: 'Romantic dinner for two with live music and special menu',
    date: '2025-12-21',
    time: '19:00 - 23:00',
    image: '/images/events/couples-night.jpg',
    category: 'special',
    price: 3500,
    available_slots: 20,
  },
  {
    id: 'event-3',
    name: 'Game Night',
    description: 'Board games, trivia, and good food with friends',
    date: '2025-12-22',
    time: '17:00 - 21:00',
    image: '/images/events/game-night.jpg',
    category: 'weekly',
    price: 800,
    available_slots: 60,
  },
];
```

---

## Booking Spaces Data

```typescript
// src/lib/dummy-data/spaces.ts
export interface BookableSpace {
  id: string;
  name: string;
  description: string;
  capacity: number;
  hourly_rate: number;
  daily_rate: number;
  amenities: string[];
  image: string;
  category: 'coworking' | 'boardroom' | 'office' | 'conference' | 'accommodation';
}

export const dummySpaces: BookableSpace[] = [
  {
    id: 'space-1',
    name: 'Executive Boardroom',
    description: 'Premium boardroom with video conferencing facilities',
    capacity: 12,
    hourly_rate: 2500,
    daily_rate: 15000,
    amenities: ['Wi-Fi', 'Projector', 'Whiteboard', 'Video Conference', 'Coffee/Tea'],
    image: '/images/spaces/boardroom.jpg',
    category: 'boardroom',
  },
  {
    id: 'space-2',
    name: 'Co-working Desk',
    description: 'Hot desk in our vibrant co-working space',
    capacity: 1,
    hourly_rate: 200,
    daily_rate: 1000,
    amenities: ['Wi-Fi', 'Power Outlets', 'Coffee/Tea'],
    image: '/images/spaces/coworking.jpg',
    category: 'coworking',
  },
  {
    id: 'space-3',
    name: 'Conference Hall',
    description: 'Large conference hall for seminars and workshops',
    capacity: 80,
    hourly_rate: 5000,
    daily_rate: 35000,
    amenities: ['Wi-Fi', 'Projector', 'Sound System', 'Stage', 'Catering Available'],
    image: '/images/spaces/conference.jpg',
    category: 'conference',
  },
];
```

---

## Order Tracking Data

```typescript
// src/lib/dummy-data/orders.ts
export interface Order {
  id: string;
  customer_name: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
  created_at: string;
  logistics_task?: LogisticsTask;
}

export interface LogisticsTask {
  rider_name: string;
  rider_phone: string;
  vehicle: string;
  current_location: { lat: number; lng: number };
  eta_minutes: number;
}

export const dummyOrder: Order = {
  id: 'order-12345',
  customer_name: 'John Doe',
  items: ['Urban Loft Burger', 'Cappuccino'],
  total: 1100,
  status: 'out_for_delivery',
  created_at: '2025-12-18T14:30:00Z',
  logistics_task: {
    rider_name: 'James Ochieng',
    rider_phone: '+254712345678',
    vehicle: 'Motorcycle - KCA 123B',
    current_location: { lat: 0.4607, lng: 34.1638 }, // Busia coordinates
    eta_minutes: 15,
  },
};
```

---

## Loyalty Program Data

```typescript
// src/lib/dummy-data/loyalty.ts
export interface LoyaltyAccount {
  user_id: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  next_reward_at: number;
  lifetime_spent: number;
  rewards: Reward[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  available: boolean;
}

export const dummyLoyaltyAccount: LoyaltyAccount = {
  user_id: 'user-1',
  points: 2500,
  tier: 'silver',
  next_reward_at: 5000,
  lifetime_spent: 25000,
  rewards: [
    {
      id: 'reward-1',
      name: 'Free Coffee',
      description: 'Any coffee of your choice',
      points_required: 500,
      available: true,
    },
    {
      id: 'reward-2',
      name: 'Free Main Course',
      description: 'Any main course from our menu',
      points_required: 2000,
      available: true,
    },
    {
      id: 'reward-3',
      name: 'Free Lunch for Two',
      description: 'Complete lunch meal for two people',
      points_required: 5000,
      available: false,
    },
  ],
};
```

---

## Team Data

```typescript
// src/lib/dummy-data/team.ts
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Sarah Mwangi',
    role: 'Director',
    bio: 'Visionary leader with 15+ years in hospitality management',
    image: '/images/team/director.jpg',
  },
  {
    id: 'team-2',
    name: 'Michael Omondi',
    role: 'General Manager',
    bio: 'Operations expert ensuring excellence in every detail',
    image: '/images/team/gm.jpg',
  },
  {
    id: 'team-3',
    name: 'Grace Wanjiru',
    role: 'COO',
    bio: 'Driving operational efficiency and customer satisfaction',
    image: '/images/team/coo.jpg',
  },
];
```

---

## Careers/Jobs Data

```typescript
// src/lib/dummy-data/careers.ts
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  description: string;
  requirements: string[];
  posted_date: string;
}

export const dummyJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Barista',
    department: 'Service',
    location: 'Busia',
    type: 'full-time',
    description: 'Join our team as a senior barista and craft exceptional coffee experiences',
    requirements: [
      '3+ years barista experience',
      'Latte art skills',
      'Customer service excellence',
      'Knowledge of coffee origins and roasting',
    ],
    posted_date: '2025-12-10',
  },
  {
    id: 'job-2',
    title: 'Head Chef',
    department: 'Kitchen',
    location: 'Busia',
    type: 'full-time',
    description: 'Lead our kitchen team in creating innovative and delicious menu items',
    requirements: [
      '5+ years chef experience',
      'Menu development expertise',
      'Kitchen management skills',
      'Food safety certifications',
    ],
    posted_date: '2025-12-08',
  },
];
```

---

## Payment Intent Data

```typescript
// src/lib/dummy-data/payments.ts
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  payment_method: 'mpesa' | 'card' | 'wallet';
  metadata: {
    booking_id?: string;
    event_id?: string;
    order_id?: string;
  };
  client_secret: string;
}

export const dummyPaymentIntent: PaymentIntent = {
  id: 'pi_dummy_12345',
  amount: 1500,
  currency: 'KES',
  status: 'pending',
  payment_method: 'mpesa',
  metadata: {
    event_id: 'event-1',
  },
  client_secret: 'pi_dummy_12345_secret',
};
```

---

## Environment Configuration

```typescript
// src/config/env.ts
export const config = {
  // Service URLs (dummy for development)
  services: {
    auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8080',
    ordering: process.env.NEXT_PUBLIC_ORDERING_SERVICE_URL || 'http://localhost:8081',
    logistics: process.env.NEXT_PUBLIC_LOGISTICS_SERVICE_URL || 'http://localhost:8082',
    treasury: process.env.NEXT_PUBLIC_TREASURY_SERVICE_URL || 'http://localhost:8083',
    booking: process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || 'http://localhost:8084',
    notifications: process.env.NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL || 'http://localhost:8085',
  },
  
  // Feature flags
  features: {
    useDummyData: process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true' || true,
    enableRealTimeTracking: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_TRACKING === 'true',
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  },
  
  // Tenant configuration
  tenant: {
    slug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'urban-loft',
    id: process.env.NEXT_PUBLIC_TENANT_ID || 'tenant-urban-loft',
  },
  
  // Maps
  maps: {
    provider: process.env.NEXT_PUBLIC_MAP_PROVIDER || 'osm', // 'osm' or 'google'
    googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
};
```

---

## Usage in Components

```typescript
// Example: Using dummy data with feature flag
import { dummyMenuItems } from '@/lib/dummy-data/menu';
import { config } from '@/config/env';

export async function getMenuItems() {
  if (config.features.useDummyData) {
    return dummyMenuItems;
  }
  
  // Real API call
  const response = await fetch(`${config.services.ordering}/api/v1/${config.tenant.slug}/menu/items`);
  return response.json();
}
```

---

## Notes

- All dummy data should be replaceable via feature flags
- Keep dummy data realistic and comprehensive
- Use TypeScript interfaces to ensure consistency
- Dummy images should be replaced with actual assets later
- All IDs should follow UUID format in production
