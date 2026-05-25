'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const TEAM_STALE_MS = 2 * 60 * 1000;

export interface TeamMember {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export function useTeam(tenantId?: string) {
  const queryClient = useQueryClient();
  const tenant = tenantId ?? 'urban-loft';
  const query = useQuery({
    queryKey: ['team', tenant],
    queryFn: async (): Promise<TeamMember[]> => {
      const res = await fetch(`/api/team?tenant_id=${encodeURIComponent(tenant)}`, {
        headers: { 'x-tenant-id': tenant },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to fetch team');
      return json.data ?? [];
    },
    staleTime: TEAM_STALE_MS,
    gcTime: TEAM_STALE_MS * 2,
  });
  const createMutation = useMutation({
    mutationFn: async (member: Omit<TeamMember, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant },
        body: JSON.stringify(member),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create');
      return data as TeamMember;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', tenant] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenant },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to remove from website');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', tenant] }),
  });

  return { ...query, createMutation, deleteMutation };
}
