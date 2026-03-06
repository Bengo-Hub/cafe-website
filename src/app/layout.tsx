import { Footer, Header } from '@/components/layout';
import PageTransition from '@/components/layout/PageTransition';
import { Providers } from '@/components/providers/Providers';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#ea8022',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'),
  title: {
    default: 'Urban Loft Cafe - Beyond Food',
    template: '%s | Urban Loft Cafe',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo/logo.jpeg',
    shortcut: '/images/logo/logo.jpeg',
    apple: '/images/logo/logo.jpeg',
  },
  description:
    'Eat. Work. Connect. Experience. Premium cafe, business hub, and event space in Busia, Kenya. Specialty coffee, coworking spaces, and memorable events.',
  keywords: [
    'cafe',
    'coffee shop',
    'restaurant',
    'business hub',
    'coworking space',
    'events venue',
    'Busia',
    'Busia',
    'Kenya',
    'Urban Loft',
    'specialty coffee',
    'workspace',
    'catering',
  ],
  authors: [{ name: 'Urban Loft Cafe' }],
  creator: 'Urban Loft Cafe',
  publisher: 'Urban Loft Cafe',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Urban Loft Cafe - Beyond Food',
    description: 'Eat. Work. Connect. Experience. Premium cafe, business hub, and event space.',
    url: '/',
    siteName: 'Urban Loft Cafe',
    images: [
      {
        url: '/images/hero/hero-food.jpg',
        width: 1920,
        height: 800,
        alt: 'Urban Loft Cafe',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urban Loft Cafe - Beyond Food',
    description: 'Eat. Work. Connect. Experience.',
    images: ['/images/hero/hero-food.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add when available
    // google: 'verification_token',
    // yandex: 'verification_token',
    // bing: 'verification_token',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
