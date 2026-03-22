'use client';

import { Badge, Button, Card, Pagination } from '@/components/ui';
import {
  type FleetMember,
  type RiderStatus,
  approveRider,
  fetchRiders,
  inviteRider,
  suspendRider,
} from '@/lib/api/riders';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Bike,
  Check,
  Loader2,
  RefreshCw,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const RIDERS_PAGE_SIZE = 15;

const STATUS_CONFIG: Record<RiderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  approved: { label: 'Approved', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-500/10' },
  suspended: { label: 'Suspended', color: 'text-red-500', bg: 'bg-red-500/10' },
};

const STATUS_FILTERS = [
  { value: '', label: 'All Riders' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

export default function RiderManagement() {
  const queryClient = useQueryClient();
  const [riderPage, setRiderPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', id_number: '' });

  const { data: riders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-riders', statusFilter],
    queryFn: () => fetchRiders({ status: statusFilter || undefined }),
    refetchInterval: 30_000,
  });

  const invite = useMutation({
    mutationFn: () =>
      inviteRider({
        email: inviteForm.email,
        id_number: inviteForm.id_number || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      setShowInvite(false);
      setInviteForm({ email: '', id_number: '' });
    },
  });

  const approve = useMutation({
    mutationFn: (memberId: string) => approveRider(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-riders'] }),
  });

  const suspend = useMutation({
    mutationFn: (memberId: string) => suspendRider(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-riders'] }),
  });

  const pendingCount = riders.filter((r) => r.status === 'pending').length;
  const activeCount = riders.filter((r) => r.status === 'active').length;

  // Client-side pagination
  const paginatedRiders = useMemo(() => {
    const start = (riderPage - 1) * RIDERS_PAGE_SIZE;
    return riders.slice(start, start + RIDERS_PAGE_SIZE);
  }, [riders, riderPage]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
            Rider Management
          </h1>
          <p className="font-light text-secondary-brand">
            Invite, approve, and manage delivery riders.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-brand-beige/10 text-primary-brand"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowInvite(true)}
            className="h-10 rounded-xl bg-brand-orange text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Rider
          </Button>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border border-brand-beige/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">Total</p>
          <p className="text-2xl font-black text-primary-brand">{riders.length}</p>
        </Card>
        <Card className="border border-brand-beige/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600">Active</p>
          <p className="text-2xl font-black text-green-600">{activeCount}</p>
        </Card>
        <Card className="border border-brand-beige/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Pending</p>
          <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
        </Card>
        <Card className="border border-brand-beige/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-red-500">Suspended</p>
          <p className="text-2xl font-black text-red-500">
            {riders.filter((r) => r.status === 'suspended').length}
          </p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
              statusFilter === f.value
                ? 'bg-foreground text-background'
                : 'bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rider list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
          <p className="font-bold text-primary-brand">Failed to load riders</p>
          <Button onClick={() => refetch()} className="mt-3 rounded-xl bg-brand-orange text-white">
            Retry
          </Button>
        </div>
      ) : riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bike className="mb-3 h-10 w-10 text-secondary-brand opacity-30" />
          <p className="font-bold text-primary-brand">No riders found</p>
          <p className="text-sm text-secondary-brand">Invite your first rider to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedRiders.map((rider: FleetMember) => {
            const cfg = STATUS_CONFIG[rider.status] || STATUS_CONFIG.pending;
            return (
              <Card key={rider.id} className="flex flex-col gap-4 border border-brand-beige/10 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 font-black text-brand-orange">
                    {rider.driver_code?.[0]?.toUpperCase() || rider.user_id?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-black text-primary-brand">
                      {rider.driver_code || rider.user_id.slice(0, 8)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-brand">
                      {rider.id_number && (
                        <span>ID: {rider.id_number}</span>
                      )}
                      {rider.license_no && (
                        <span>License: {rider.license_no}</span>
                      )}
                      {rider.joined_at && (
                        <span>Joined: {new Date(rider.joined_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={`${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>

                  {rider.status === 'pending' && (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-green-500 px-3 text-xs text-white hover:bg-green-600"
                      onClick={() => approve.mutate(rider.id)}
                      disabled={approve.isPending}
                    >
                      <Check className="mr-1 h-3 w-3" /> Approve
                    </Button>
                  )}

                  {rider.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-red-500/20 px-3 text-xs text-red-500 hover:bg-red-500/10"
                      onClick={() => suspend.mutate(rider.id)}
                      disabled={suspend.isPending}
                    >
                      <Ban className="mr-1 h-3 w-3" /> Suspend
                    </Button>
                  )}

                  {rider.status === 'suspended' && (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-green-500 px-3 text-xs text-white hover:bg-green-600"
                      onClick={() => approve.mutate(rider.id)}
                      disabled={approve.isPending}
                    >
                      <UserCheck className="mr-1 h-3 w-3" /> Reactivate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Riders pagination */}
      <Pagination
        page={riderPage}
        pageSize={RIDERS_PAGE_SIZE}
        total={riders.length}
        onPageChange={setRiderPage}
        itemLabel="riders"
      />

      {/* Invite Dialog */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-brand-dark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-primary-brand">Invite Rider</h3>
              <button onClick={() => setShowInvite(false)} className="rounded-lg p-1 hover:bg-brand-beige/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Rider Email *"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full rounded-xl border border-brand-beige/10 bg-brand-beige/5 p-3 text-sm focus:border-brand-orange/50 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="ID / Passport Number"
                value={inviteForm.id_number}
                onChange={(e) => setInviteForm({ ...inviteForm, id_number: e.target.value })}
                className="w-full rounded-xl border border-brand-beige/10 bg-brand-beige/5 p-3 text-sm focus:border-brand-orange/50 focus:outline-none"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-brand-orange text-white"
                onClick={() => invite.mutate()}
                disabled={!inviteForm.email.trim() || invite.isPending}
              >
                {invite.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Invite
              </Button>
            </div>
            {invite.isError && (
              <p className="mt-2 text-center text-sm text-red-500">{(invite.error as Error).message}</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
