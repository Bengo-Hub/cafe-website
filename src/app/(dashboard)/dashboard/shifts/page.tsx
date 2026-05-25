'use client';

import { Button, Card } from '@/components/ui';
import { Calendar, Clock, LogIn, LogOut, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  useAttendance,
  useClockIn,
  useClockOut,
  useOpenAttendanceRecord,
} from '@/hooks/use-attendance';
import { format, isAfter, startOfWeek } from 'date-fns';

export default function StaffShifts() {
  const { user } = useAuthStore();
  const employeeId = user?.id;

  const { data: records = [], isLoading } = useAttendance(employeeId);
  const openRecord = useOpenAttendanceRecord(employeeId);
  const isClockedIn = !!openRecord;

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  async function handleClockAction() {
    if (!isClockedIn && employeeId) {
      await clockInMutation.mutateAsync(employeeId);
    } else if (openRecord) {
      await clockOutMutation.mutateAsync(openRecord.id);
    }
  }

  function formatShiftTime(record: { clock_in: string; clock_out?: string | null }) {
    const start = format(new Date(record.clock_in), 'hh:mm a');
    const end = record.clock_out ? format(new Date(record.clock_out), 'hh:mm a') : 'Ongoing';
    return `${start} – ${end}`;
  }

  function calculateHours(record: { clock_in: string; clock_out?: string | null; total_hours?: number | null }) {
    if (record.total_hours != null) return `${record.total_hours.toFixed(1)}h`;
    if (!record.clock_out) return '—';
    const diff = (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / 3_600_000;
    return `${diff.toFixed(1)}h`;
  }

  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekRecords = records.filter((r) => isAfter(new Date(r.clock_in), weekStartDate));
  const totalHours = weekRecords.reduce((sum, r) => {
    if (r.total_hours != null) return sum + r.total_hours;
    if (!r.clock_out) return sum;
    return sum + (new Date(r.clock_out).getTime() - new Date(r.clock_in).getTime()) / 3_600_000;
  }, 0);
  const overtime = Math.max(0, totalHours - 40);
  const daysWorked = new Set(weekRecords.map((r) => r.clock_in.split('T')[0])).size;
  const weekProgress = Math.min(100, (totalHours / 40) * 100);

  const isPending = clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Shifts & Attendance</h1>
          <p className="text-secondary-brand font-light">Track your working hours and manage your schedule.</p>
        </div>
        <Button
          onClick={handleClockAction}
          disabled={isPending}
          className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
            isClockedIn
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
          }`}
        >
          {isClockedIn ? (
            <><LogOut className="h-4 w-4 mr-2" />Clock Out</>
          ) : (
            <><LogIn className="h-4 w-4 mr-2" />Clock In</>
          )}
        </Button>
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
                <div className="flex items-center gap-3 mt-2">
                  <div className={`h-3 w-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <h2 className="text-2xl font-black text-primary-brand">{isClockedIn ? 'Currently Working' : 'Off Duty'}</h2>
                </div>
              </div>
              {isClockedIn && openRecord && (
                <div className="p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
                  <p className="text-xs font-bold text-brand-orange uppercase tracking-widest">Clocked in at</p>
                  <p className="text-xl font-black text-primary-brand mt-1">{format(new Date(openRecord.clock_in), 'hh:mm a')}</p>
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
            <div className="p-8 border-b border-brand-beige/10 flex items-center justify-between">
              <h2 className="text-xl font-black text-primary-brand">Shift History</h2>
              <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-brand-orange">View Full History</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-beige/5">
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Date</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Shift Time</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Status</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-beige/5">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-secondary-brand">Loading attendance records…</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-secondary-brand">No attendance records found.</td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-brand-orange/5 transition-colors">
                        <td className="p-6 font-bold text-primary-brand">{format(new Date(record.clock_in), 'MMM dd, yyyy')}</td>
                        <td className="p-6 text-secondary-brand text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 opacity-40" />
                            {formatShiftTime(record)}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            record.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-brand-gold/10 text-brand-gold'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-6 font-black text-primary-brand">{calculateHours(record)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
