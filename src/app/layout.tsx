import { Footer, Header } from '@/components/layout';
import { Providers } from '@/components/providers/Providers';
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler';
import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { Toaster } from 'sonner';
import '@bengo-hub/shared-ui-lib/contact/style.css';
import './globals.css';

// One family in two widths: condensed for headings (menu-board style), normal for text.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#2c1c12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'),
  title: {
    default: 'Urban Loft Cafe, Busia',
    template: '%s | Urban Loft Cafe',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo/logo.jpeg',
    shortcut: '/images/logo/logo.jpeg',
    apple: '/images/logo/logo.jpeg',
  },
  description:
    'Cafe and restaurant in Busia, Kenya, open every day from 7:30 AM to 10 PM. Breakfast, coffee, full meals, a work hub, rooms and event space. Order online or book a table.',
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
    title: 'Urban Loft Cafe, Busia',
    description: 'Cafe and restaurant in Busia, open every day. Order online or book a table.',
    url: '/',
    siteName: 'Urban Loft Cafe',
    images: [
      {
        url: '/images/services/events.jpg',
        width: 4064,
        height: 3048,
        alt: 'Urban Loft Cafe',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urban Loft Cafe, Busia',
    description: 'Cafe and restaurant in Busia, open every day.',
    images: ['/images/services/events.jpg'],
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
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <ChunkErrorHandler />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
