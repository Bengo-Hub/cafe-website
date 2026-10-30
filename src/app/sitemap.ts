import { MetadataRoute } from 'next';

// Public pages only. The menu lives in the online store (ordering service), which has its own pages.
const PAGES: [path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number][] = [
  ['', 'daily', 1],
  ['/reserve', 'monthly', 0.9],
  ['/events', 'weekly', 0.8],
  ['/about', 'monthly', 0.7],
  ['/services', 'monthly', 0.7],
  ['/services/hub', 'monthly', 0.7],
  ['/services/events', 'monthly', 0.7],
  ['/services/accommodation', 'monthly', 0.7],
  ['/loyalty', 'monthly', 0.6],
  ['/contact', 'monthly', 0.6],
  ['/faq', 'monthly', 0.5],
  ['/careers', 'monthly', 0.5],
  ['/franchising', 'yearly', 0.4],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com';
  return PAGES.map(([path, changeFrequency, priority]) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
