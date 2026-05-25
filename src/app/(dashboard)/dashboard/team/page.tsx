'use client';

import { Badge, Button, Card } from '@/components/ui';
import { useERPStaff } from '@/hooks/use-erp-staff';
import { useSubscription } from '@/hooks/use-subscription';
import { useTeam } from '@/hooks/use-team';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Search,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamManagement() {
  const { data: erpStaff = [], isLoading: erpLoading, isError } = useERPStaff();
  const { data: websiteTeam = [], createMutation, deleteMutation } = useTeam();
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { hasFeature, getLimit, isPlatformOwner } = useSubscription();

  const canShowcaseTeam = isPlatformOwner || hasFeature('cafe_website_team_showcase');
  const maxDisplayed = isPlatformOwner ? Infinity : (getLimit('cafe_website_max_team_displayed') as number);
  const atDisplayLimit = maxDisplayed !== -1 && maxDisplayed !== Infinity && websiteTeam.length >= maxDisplayed;

  // Build lookup: ERP employee id → website team member
  const websiteByEmail = new Map(websiteTeam.map((m) => [m.email?.toLowerCase(), m]));

  const filtered = erpStaff.filter(
    (e) =>
      !search ||
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.job_title?.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleWebsiteVisibility(employee: (typeof erpStaff)[0]) {
    if (!canShowcaseTeam) {
      toast.error('Upgrade your plan to showcase team members on your website.');
      return;
    }
    const existing = websiteByEmail.get(employee.email?.toLowerCase());
    if (!existing && atDisplayLimit) {
      toast.error(`Your plan allows up to ${maxDisplayed} team members on the website. Upgrade to show more.`);
      return;
    }
    setTogglingId(employee.id);
    try {
      if (existing) {
        await deleteMutation.mutateAsync(existing.id);
        toast.success(`${employee.full_name} removed from website`);
      } else {
        await createMutation.mutateAsync({
          name: employee.full_name,
          role: employee.job_title?.name ?? 'Staff',
          bio: null,
          image_url: null,
          email: employee.email ?? null,
          linkedin_url: null,
          twitter_url: null,
          display_order: websiteTeam.length,
        });
        toast.success(`${employee.full_name} added to website`);
      }
    } catch {
      toast.error('Failed to update website visibility');
    } finally {
      setTogglingId(null);
    }
  }

  const activeCount = erpStaff.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Team Management</h1>
          <p className="text-secondary-brand font-light">Manage staff and control who appears on your public website.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-orange/20">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Total Staff</p>
            <p className="text-3xl font-black text-primary-brand">{erpLoading ? '—' : erpStaff.length}</p>
          </div>
        </Card>
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Active Staff</p>
            <p className="text-3xl font-black text-primary-brand">{erpLoading ? '—' : activeCount}</p>
          </div>
        </Card>
        <Card className={`magical-card border-none p-8 flex items-center gap-6 ${atDisplayLimit ? 'border border-amber-500/30' : ''}`}>
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${atDisplayLimit ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {atDisplayLimit ? <AlertTriangle className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">On Website</p>
            <p className="text-3xl font-black text-primary-brand">
              {websiteTeam.length}
              {maxDisplayed !== Infinity && maxDisplayed !== -1 && (
                <span className="text-sm font-medium text-secondary-brand opacity-60 ml-2">/ {maxDisplayed}</span>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="magical-card border-none overflow-hidden">
        <div className="p-8 border-b border-brand-beige/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-primary-brand tracking-tight">Staff Directory</h2>
            <p className="text-xs text-secondary-brand opacity-60 mt-1 font-light">Toggle the eye icon to show/hide staff on your public About page.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-brand opacity-40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or role..."
              className="h-12 pl-12 pr-6 rounded-xl bg-brand-beige/5 border border-brand-beige/10 text-primary-brand focus:outline-none focus:border-brand-orange/50 transition-all w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-beige/5">
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Member</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Department</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Contact</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest text-center">Website</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-beige/10">
              {erpLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading staff from HR system…</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-destructive">Failed to load staff from ERP. Check your connection.</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No staff found.</td>
                </tr>
              ) : (
                filtered.map((employee) => {
                  const isOnWebsite = websiteByEmail.has(employee.email?.toLowerCase());
                  const isToggling = togglingId === employee.id;
                  return (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-brand-beige/5 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black text-sm">
                            {initials(employee.full_name)}
                          </div>
                          <div>
                            <p className="font-black text-primary-brand">{employee.full_name}</p>
                            <p className="text-xs text-secondary-brand opacity-60">{employee.job_title?.name ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        {employee.department?.name ? (
                          <Badge className="bg-blue-500/10 text-blue-500">{employee.department.name}</Badge>
                        ) : (
                          <span className="text-xs text-secondary-brand opacity-40">—</span>
                        )}
                      </td>
                      <td className="p-6">
                        {employee.email && (
                          <div className="flex items-center gap-2 text-xs text-secondary-brand">
                            <Mail className="h-3 w-3 opacity-40" />
                            {employee.email}
                          </div>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm font-bold text-primary-brand capitalize">{employee.status}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <button
                          onClick={() => toggleWebsiteVisibility(employee)}
                          disabled={isToggling}
                          title={isOnWebsite ? 'Remove from website' : 'Show on website'}
                          className={`h-10 w-10 rounded-xl inline-flex items-center justify-center transition-all ${
                            isOnWebsite
                              ? 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'
                              : 'bg-brand-beige/5 text-secondary-brand opacity-40 hover:opacity-80 hover:bg-brand-beige/10'
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isOnWebsite ? (
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
