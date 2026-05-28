'use client';

import { Button, Card } from '@/components/ui';
import { Calendar, Clock, Loader2, LogIn, LogOut, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCurrentPOSSession,
  getPOSSessionHistory,
  openPOSSession,
  closePOSSession,
  type POSDeviceSession,
} from '@/lib/api/pos-sessions-client';
import { format, isAfter, startOfWeek } from 'date-fns';

function calcDurationHours(session: POSDeviceSession): number {
  const start = new Date(session.opened_at).getTime();
  const end = session.closed_at ? new Date(session.closed_at).getTime() : Date.now();
  return (end - start) / 3_600_000;
}

function formatShiftTime(session: POSDeviceSession): string {
  const start = format(new Date(session.opened_at), 'hh:mm a');
  const end = session.closed_at ? format(new Date(session.closed_at), 'hh:mm a') : 'Ongoing';
  return `${start} – ${end}`;
}

function formatDuration(session: POSDeviceSession): string {
  const hours = calcDurationHours(session);
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StaffShifts() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [openingFloat, setOpeningFloat] = useState('');
  const [closingFloat, setClosingFloat] = useState('');
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery<POSDeviceSession | null>({
    queryKey: ['pos-current-session'],
    queryFn: getCurrentPOSSession,
    refetchInterval: 30_000,
    retry: false,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<POSDeviceSession[]>({
    queryKey: ['pos-session-history'],
    queryFn: getPOSSessionHistory,
    staleTime: 60_000,
  });

  const hasActiveShift = session?.session_status === 'open';

  const openMutation = useMutation({
    mutationFn: () => openPOSSession(parseFloat(openingFloat) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-current-session'] });
      queryClient.invalidateQueries({ queryKey: ['pos-session-history'] });
      setOpeningFloat('');
      toast.success('Shift started');
    },
    onError: (err: Error) => toast.error(`Failed to start shift: ${err.message}`),
  });

  const closeMutation = useMutation({
    mutationFn: () => closePOSSession(parseFloat(closingFloat) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-current-session'] });
      queryClient.invalidateQueries({ queryKey: ['pos-session-history'] });
      setClosingFloat('');
      setShowCloseDialog(false);
      toast.success('Shift closed');
    },
    onError: (err: Error) => toast.error(`Failed to close shift: ${err.message}`),
  });

  // Weekly summary from history
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekSessions = history.filter((s) => isAfter(new Date(s.opened_at), weekStart));
  const totalHours = weekSessions.reduce((sum, s) => sum + calcDurationHours(s), 0);
  const overtime = Math.max(0, totalHours - 40);
  const daysWorked = new Set(weekSessions.map((s) => s.opened_at.split('T')[0])).size;
  const weekProgress = Math.min(100, (totalHours / 40) * 100);

  const isPending = openMutation.isPending || closeMutation.isPending;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Shifts</h1>
          <p className="text-secondary-brand font-light">Open and close your POS shift, track working hours.</p>
        </div>
        {!sessionLoading && (
          hasActiveShift ? (
            <Button
              onClick={() => setShowCloseDialog(true)}
              disabled={isPending}
              className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" /> Close Shift
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="50"
                placeholder="Opening float (KES)"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                className="h-14 w-48 rounded-2xl border border-brand-beige/10 bg-white px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
              />
              <Button
                onClick={() => openMutation.mutate()}
                disabled={isPending}
                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
              >
                {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Start Shift
              </Button>
            </div>
          )
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Current Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 magical-card border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Clock className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Current Status</p>
                {sessionLoading ? (
                  <div className="flex items-center gap-3 mt-2">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                    <span className="text-secondary-brand text-sm">Loading…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-2">
                    <div className={`h-3 w-3 rounded-full ${hasActiveShift ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <h2 className="text-2xl font-black text-primary-brand">
                      {hasActiveShift ? 'Shift Active' : 'No Active Shift'}
                    </h2>
                  </div>
                )}
              </div>
              {hasActiveShift && session && (
                <div className="p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
                  <p className="text-xs font-bold text-brand-orange uppercase tracking-widest">Started at</p>
                  <p className="text-xl font-black text-primary-brand mt-1">
                    {format(new Date(session.opened_at), 'hh:mm a')}
                  </p>
                  <p className="text-xs text-brand-orange/70 mt-1">Duration: {formatDuration(session)}</p>
                  <p className="text-xs text-brand-orange/70">Float: KES {session.float_amount.toLocaleString()}</p>
                </div>
              )}
              <div className="space-y-4 pt-4 border-t border-brand-beige/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-secondary-brand">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  <span className="text-sm font-bold text-primary-brand">{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-secondary-brand">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <span className="text-sm font-bold text-primary-brand">{user?.tenant_slug ?? 'Main Branch'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 magical-card border-none bg-brand-dark text-white">
            <h3 className="text-lg font-black mb-6">Weekly Summary</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-brand-beige/60 text-sm">Total Hours</p>
                <p className="text-xl font-black">{totalHours.toFixed(1)}h</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-brand-beige/60 text-sm">Overtime</p>
                <p className="text-xl font-black text-brand-orange">{overtime.toFixed(1)}h</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-brand-beige/60 text-sm">Days Worked</p>
                <p className="text-xl font-black">{daysWorked}/5</p>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-orange h-full transition-all duration-700" style={{ width: `${weekProgress}%` }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Shift History */}
        <div className="lg:col-span-2">
          <Card className="magical-card border-none overflow-hidden">
            <div className="p-8 border-b border-brand-beige/10">
              <h2 className="text-xl font-black text-primary-brand">Shift History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-beige/5">
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Date</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Shift Time</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Status</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Duration</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40 text-right">Float</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-beige/5">
                  {historyLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-secondary-brand">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-secondary-brand">No shift history found.</td></tr>
                  ) : (
                    history.map((s) => (
                      <tr key={s.id} className="hover:bg-brand-orange/5 transition-colors">
                        <td className="p-6 font-bold text-primary-brand">
                          {format(new Date(s.opened_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-6 text-secondary-brand text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 opacity-40" />
                            {formatShiftTime(s)}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            s.session_status === 'open'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-brand-beige/10 text-secondary-brand'
                          }`}>
                            {s.session_status === 'open' ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="p-6 font-black text-primary-brand">{formatDuration(s)}</td>
                        <td className="p-6 text-right text-sm text-secondary-brand">
                          KES {s.float_amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Close Shift Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-2xl font-black text-primary-brand">Close Shift</h3>
              <p className="text-secondary-brand font-light mt-1">Enter the closing float to end your shift.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Closing Float (KES)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="0.00"
                value={closingFloat}
                onChange={(e) => setClosingFloat(e.target.value)}
                className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-brand-beige/20"
                onClick={() => setShowCloseDialog(false)}
                disabled={closeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
              >
                {closeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Close Shift
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
