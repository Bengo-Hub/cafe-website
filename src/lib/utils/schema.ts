import { SITE, telHref } from '@/lib/site';

export interface LocalBusinessSchema {
  '@context': string;
  '@type': string;
  name: string;
  image?: string | string[];
  url?: string;
  telephone?: string;
  email?: string;
  address?: {
    '@type': string;
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    '@type': string;
    latitude?: number;
    longitude?: number;
  };
  openingHoursSpecification?: Array<{
    '@type': string;
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  priceRange?: string;
  servesCuisine?: string | string[];
  acceptsReservations?: boolean;
}

export interface EventSchema {
  '@context': string;
  '@type': string;
  name: string;
  startDate: string;
  endDate?: string;
  eventAttendanceMode?: string;
  eventStatus?: string;
  location?: {
    '@type': string;
    name: string;
    address?: {
      '@type': string;
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
  };
  image?: string | string[];
  description?: string;
  offers?: {
    '@type': string;
    url?: string;
    price: string;
    priceCurrency: string;
    availability?: string;
  };
  organizer?: {
    '@type': string;
    name: string;
    url?: string;
  };
}

export function generateLocalBusinessSchema(): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE.name,
    image: [
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'}/images/services/events.jpg`,
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'}/images/logo/logo.jpeg`,
    ],
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com',
    telephone: telHref(SITE.phone).replace('tel:', ''),
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: SITE.town,
      addressRegion: 'Busia County',
      addressCountry: 'KE',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: SITE.opens,
        closes: SITE.closes,
      },
    ],
    priceRange: 'KES 300 - KES 2000',
    servesCuisine: ['International', 'African', 'Italian', 'Asian'],
    acceptsReservations: true,
  };
}

export function generateEventSchema(event: {
  name: string;
  description: string;
  date: string;
  time: string;
  price?: number;
}): EventSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Urban Loft Cafe',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Main Street',
        addressLocality: 'Busia',
        addressRegion: 'Busia County',
        addressCountry: 'KE',
      },
    },
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'}/images/events/placeholder-event.svg`,
    offers: {
      '@type': 'Offer',
      price: event.price?.toString() || '0',
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Urban Loft Cafe',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com',
    },
  };
}
