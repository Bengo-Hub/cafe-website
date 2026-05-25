'use client';

import { Badge, Button, Card } from '@/components/ui';
import { useEvents } from '@/hooks/use-events';
import { updateEventAvailability } from '@/lib/api/events';
import { motion } from 'framer-motion';
import { Calendar, Eye, EyeOff, Globe, Loader2, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

function tagLabel(tags: string[] = []): string {
  if (tags.includes('special')) return 'Special';
  if (tags.includes('private')) return 'Private';
  if (tags.includes('weekly')) return 'Weekly';
  if (tags.includes('reservation')) return 'Reservation';
  return 'Event';
}

export default function EventsDashboard() {
  const { data: events = [], isLoading, refetch } = useEvents();
  const qc = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function togglePublish(event: { id: string; sku: string; name: string; isAvailable: boolean }) {
    setTogglingId(event.id);
    try {
      await updateEventAvailability(event.sku, !event.isAvailable);
      await qc.invalidateQueries({ queryKey: ['events'] });
      toast.success(`${event.name} ${event.isAvailable ? 'unpublished' : 'published'}`);
    } catch {
      toast.error('Failed to update event visibility');
    } finally {
      setTogglingId(null);
    }
  }

  const published = events.filter((e) => e.isAvailable).length;
  const total = events.length;

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

      {/* Events Table */}
      <Card className="magical-card border-none overflow-hidden">
        <div className="p-8 border-b border-brand-beige/10">
          <h2 className="text-2xl font-black text-primary-brand tracking-tight">Event Catalog</h2>
          <p className="text-xs text-secondary-brand opacity-60 mt-1 font-light">
            Toggle the eye icon to show or hide events on the public website. Events are sourced from the ordering catalog.
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
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest text-center">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-beige/10">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading events…</td></tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
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
                        <p className="font-black text-primary-brand">{event.name}</p>
                        {event.description && <p className="text-xs text-secondary-brand opacity-60 mt-0.5 font-light max-w-xs truncate">{event.description}</p>}
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
    </div>
  );
}
