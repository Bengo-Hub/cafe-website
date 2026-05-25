'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface AttendanceRecord {
  id: string;
  employee: string;
  employee_name?: string;
  clock_in: string;
  clock_out?: string | null;
  total_hours?: number | null;
  status: 'ongoing' | 'completed' | 'absent';
  work_shift?: string | null;
  notes?: string;
  date?: string;
}

function weekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

async function fetchAttendance(employeeId?: string): Promise<AttendanceRecord[]> {
  const params = new URLSearchParams({ start_date: weekStart() });
  if (employeeId) params.set('employee_id', employeeId);
  const res = await fetch(`/api/erp/attendance?${params.toString()}`);
  const json = await res.json();
  return json.results ?? json.data ?? [];
}

async function clockIn(employeeId: string): Promise<AttendanceRecord> {
  const res = await fetch('/api/erp/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee: employeeId, clock_in: new Date().toISOString() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Clock-in failed');
  return data;
}

async function clockOut(recordId: string): Promise<AttendanceRecord> {
  const params = new URLSearchParams({ id: recordId });
  const res = await fetch(`/api/erp/attendance?${params.toString()}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clock_out: new Date().toISOString() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Clock-out failed');
  return data;
}

export function useAttendance(employeeId?: string) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', employeeId],
    queryFn: () => fetchAttendance(employeeId),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useOpenAttendanceRecord(employeeId?: string) {
  const { data = [] } = useAttendance(employeeId);
  const today = todayStr();
  return data.find(
    (r) => r.status === 'ongoing' && r.clock_out == null && (r.date === today || r.clock_in?.startsWith(today))
  ) ?? null;
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clockIn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clockOut,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}
