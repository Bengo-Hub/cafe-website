'use client';

import { Badge, Button, Card } from '@/components/ui';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { SubscriptionGate } from '@/components/subscription/subscription-gate';
import { useEvents } from '@/hooks/use-events';
import { useSubscription } from '@/hooks/use-subscription';
import { updateEventAvailability, updateEventBanner, type CatalogEvent } from '@/lib/api/events';
import { fetchOutlets } from '@/lib/api/catalog';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Calendar, Eye, EyeOff, Globe, Image as ImageIcon, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function tagLabel(tags: string[] = []): string {
  if (tags.includes('special')) return 'Special';
  if (tags.includes('private')) return 'Private';
  if (tags.includes('weekly')) return 'Weekly';
  if (tags.includes('reservation')) return 'Reservation';
  return 'Event';
}

export default function EventsDashboard() {
  const { data: eventsPage, isLoading, refetch } = useEvents(1, 200);
  const events = eventsPage?.data ?? [];
  const qc = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { hasFeature, getLimit, isPlatformOwner } = useSubscription();
  const [bannerTarget, setBannerTarget] = useState<CatalogEvent | null>(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  const { data: outletsData } = useQuery({
    queryKey: ['outlets'],
    queryFn: fetchOutlets,
    staleTime: 5 * 60 * 1000,
  });
  const defaultOutletId: string = outletsData?.data?.[0]?.id ?? '';

  const canPublishEvents = isPlatformOwner || hasFeature('cafe_website_events');
  const maxPublished = isPlatformOwner ? Infinity : (getLimit('cafe_website_max_events_published') as number);

  async function togglePublish(event: CatalogEvent) {
    if (!canPublishEvents) {
      toast.error('Upgrade your plan to publish events on the website.');
      return;
    }
    const currentPublished = events.filter((e) => e.isAvailable).length;
    if (!event.isAvailable && maxPublished !== -1 && currentPublished >= maxPublished) {
      toast.error(`Your plan allows up to ${maxPublished} published events. Upgrade to publish more.`);
      return;
    }
    if (!defaultOutletId) {
      toast.error('No outlet found — cannot update event visibility.');
      return;
    }
    setTogglingId(event.id);
    try {
      await updateEventAvailability(event, !event.isAvailable, defaultOutletId);
      await qc.invalidateQueries({ queryKey: ['events'] });
      toast.success(`${event.name} ${event.isAvailable ? 'unpublished' : 'published'}`);
    } catch {
      toast.error('Failed to update event visibility');
    } finally {
      setTogglingId(null);
    }
  }

  function openBannerModal(event: CatalogEvent) {
    setBannerTarget(event);
    setBannerUrl(event.imageUrl ?? '');
  }

  async function saveBanner() {
    if (!bannerTarget || !defaultOutletId) {
      toast.error('No outlet found — cannot update banner.');
      return;
    }
    setSavingBanner(true);
    try {
      await updateEventBanner(bannerTarget, bannerUrl, defaultOutletId);
      await qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Banner updated');
      setBannerTarget(null);
      setBannerUrl('');
    } catch {
      toast.error('Failed to update banner');
    } finally {
      setSavingBanner(false);
    }
  }

  const published = events.filter((e) => e.isAvailable).length;
  const total = events.length;
  const atLimit = maxPublished !== -1 && maxPublished !== Infinity && published >= maxPublished;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Events Management</h1>
          <p className="text-secondary-brand font-light">Control which events are visible on the public website and manage bookings.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => refetch()} variant="outline" className="h-14 px-6 rounded-2xl border-brand-beige/20 font-black uppercase tracking-widest text-xs">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-orange/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Total Events</p>
            <p className="text-3xl font-black text-primary-brand">{isLoading ? '—' : total}</p>
          </div>
        </Card>
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Published</p>
            <p className="text-3xl font-black text-primary-brand">{isLoading ? '—' : published}</p>
          </div>
        </Card>
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-gray-500/10 flex items-center justify-center text-gray-400">
            <EyeOff className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Hidden</p>
            <p className="text-3xl font-black text-primary-brand">{isLoading ? '—' : total - published}</p>
          </div>
        </Card>
      </div>

      {atLimit && (
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-primary-brand">Event publish limit reached</p>
            <p className="text-sm text-secondary-brand font-light mt-1">
              You have published {published} of {maxPublished} events allowed on your plan.
              Upgrade to Growth or Professional to publish more events, or unpublish existing ones.
            </p>
          </div>
        </div>
      )}

      <SubscriptionGate feature="cafe_website_events">
        <Card className="magical-card border-none overflow-hidden">
          <div className="p-8 border-b border-brand-beige/10">
            <h2 className="text-2xl font-black text-primary-brand tracking-tight">Event Catalog</h2>
            <p className="text-xs text-secondary-brand opacity-60 mt-1 font-light">
              Toggle the eye icon to show or hide events on the public website. Use the image icon to set a banner photo.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-beige/5">
                  <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Event</th>
                  <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Type</th>
                  <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Price</th>
                  <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">SKU</th>
                  <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest text-center">Banner</th>
                  <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest text-center">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/10">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading events…</td></tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <p className="font-bold text-primary-brand">No events found in catalog</p>
                      <p className="text-sm text-secondary-brand mt-1 font-light">Add service catalog items with tag &quot;event&quot; in the ordering backend.</p>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => {
                    const isToggling = togglingId === event.id;
                    return (
                      <motion.tr key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-brand-beige/5 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            {event.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={event.imageUrl} alt={event.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-brand-beige/10 flex items-center justify-center shrink-0">
                                <ImageIcon className="h-4 w-4 text-secondary-brand opacity-40" />
                              </div>
                            )}
                            <div>
                              <p className="font-black text-primary-brand">{event.name}</p>
                              {event.description && <p className="text-xs text-secondary-brand opacity-60 mt-0.5 font-light max-w-xs truncate">{event.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <Badge className="bg-brand-orange/10 text-brand-orange">{tagLabel(event.tags)}</Badge>
                        </td>
                        <td className="p-6 font-bold text-primary-brand">
                          {event.basePrice > 0 ? `${event.currency} ${event.basePrice.toLocaleString()}` : 'Free'}
                        </td>
                        <td className="p-6 text-xs text-secondary-brand font-mono opacity-60">{event.sku}</td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => openBannerModal(event)}
                            title="Set banner photo"
                            className={`h-10 w-10 rounded-xl inline-flex items-center justify-center transition-all ${
                              event.imageUrl
                                ? 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'
                                : 'bg-brand-beige/5 text-secondary-brand opacity-40 hover:opacity-80'
                            }`}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => togglePublish(event)}
                            disabled={isToggling}
                            title={event.isAvailable ? 'Unpublish from website' : 'Publish to website'}
                            className={`h-10 w-10 rounded-xl inline-flex items-center justify-center transition-all ${
                              event.isAvailable
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                : 'bg-brand-beige/5 text-secondary-brand opacity-40 hover:opacity-80'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : event.isAvailable ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </SubscriptionGate>

      {/* Banner Upload Modal */}
      <AnimatePresence>
        {bannerTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-md p-10 shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => { setBannerTarget(null); setBannerUrl(''); }}
                className="absolute right-8 top-8 h-10 w-10 rounded-full bg-brand-beige/5 flex items-center justify-center text-secondary-brand hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <h2 className="text-2xl font-black text-primary-brand">Event Banner</h2>
                <p className="text-secondary-brand font-light text-sm mt-1">
                  Upload a banner photo for <span className="font-bold text-primary-brand">{bannerTarget.name}</span>. This image will show on the public events page.
                </p>
              </div>

              <ImageUpload
                label="Banner Photo"
                value={bannerUrl}
                onChange={setBannerUrl}
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setBannerTarget(null); setBannerUrl(''); }}
                  className="flex-1 h-11 rounded-xl border border-brand-beige/20 bg-brand-beige/5 text-sm font-bold text-primary-brand hover:bg-brand-beige/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBanner}
                  disabled={savingBanner || !bannerUrl}
                  className="flex-1 h-11 rounded-xl bg-brand-orange text-white text-sm font-black uppercase tracking-widest hover:bg-brand-orange/90 transition-colors disabled:opacity-60"
                >
                  {savingBanner ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Banner'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
