'use client';

import { useQuery } from '@tanstack/react-query';

export interface ERPEmployee {
  id: string;
  employee_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  job_title?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  status: 'active' | 'inactive' | 'terminated';
  hire_date?: string;
}

async function fetchERPStaff(): Promise<ERPEmployee[]> {
  const res = await fetch('/api/erp/staff');
  const json = await res.json();
  return json.results ?? json.data ?? [];
}

export function useERPStaff() {
  return useQuery<ERPEmployee[]>({
    queryKey: ['erp-staff'],
    queryFn: fetchERPStaff,
    staleTime: 5 * 60 * 1000,
  });
}
