'use client';

import { Badge, Button, Card } from '@/components/ui';
import { useTeam } from '@/hooks/use-team';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Mail,
    MoreVertical,
    Plus,
    Search,
    Shield,
    UserPlus,
    Users
} from 'lucide-react';

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface POSUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

function usePOSUsers() {
  return useQuery<POSUser[]>({
    queryKey: ['pos-staff', 'users'],
    queryFn: async () => {
      const res = await fetch('/api/pos-staff?type=users');
      const json = await res.json();
      return json.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export default function TeamManagement() {
  const { data: teamMembers = [], isLoading, isError } = useTeam();
  const { data: posUsers = [] } = usePOSUsers();

  // Build a lookup from email → POS role
  const posRoleByEmail = new Map<string, string>();
  for (const u of posUsers) {
    if (u.email && u.role) posRoleByEmail.set(u.email.toLowerCase(), u.role);
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Team Management</h1>
          <p className="text-secondary-brand font-light">Manage your cafe staff, roles, and permissions.</p>
        </div>

        <Button className="h-14 px-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-orange/20">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
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
            <p className="text-3xl font-black text-primary-brand">{isLoading ? '—' : teamMembers.length}</p>
          </div>
        </Card>
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Admins</p>
            <p className="text-3xl font-black text-primary-brand">{isLoading ? '—' : teamMembers.filter((m) => m.role?.toLowerCase().includes('admin')).length}</p>
          </div>
        </Card>
        <Card className="magical-card border-none p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Plus className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">New Hires</p>
            <p className="text-3xl font-black text-primary-brand">—</p>
          </div>
        </Card>
      </div>

      {/* Team List */}
      <Card className="magical-card border-none overflow-hidden">
        <div className="p-8 border-b border-brand-beige/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-2xl font-black text-primary-brand tracking-tight">Staff Directory</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-brand opacity-40" />
            <input
              type="text"
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
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Role</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">POS Role</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Contact</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-black text-secondary-brand uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-beige/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading team…</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-destructive">Failed to load team. Check Supabase configuration.</td>
                </tr>
              ) : teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No team members yet. Add your first member above.</td>
                </tr>
              ) : (
                teamMembers.map((member) => {
                  const posRole = member.email
                    ? posRoleByEmail.get(member.email.toLowerCase())
                    : undefined;
                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-brand-beige/5 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black text-sm">
                            {initials(member.name)}
                          </div>
                          <div>
                            <p className="font-black text-primary-brand">{member.name}</p>
                            <p className="text-xs text-secondary-brand opacity-60">ID: {member.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge className={
                          member.role?.toLowerCase().includes('admin') ? 'bg-brand-orange/10 text-brand-orange' :
                          member.role?.toLowerCase().includes('barista') ? 'bg-brand-gold/10 text-brand-gold' :
                          'bg-blue-500/10 text-blue-500'
                        }>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="p-6">
                        {posRole ? (
                          <Badge className="bg-purple-500/10 text-purple-500">{posRole}</Badge>
                        ) : (
                          <span className="text-xs text-secondary-brand opacity-40">—</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-2 text-xs text-secondary-brand">
                              <Mail className="h-3 w-3 opacity-40" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm font-bold text-primary-brand">Active</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <Button variant="ghost" size="icon" className="text-secondary-brand hover:text-primary-brand">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
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
