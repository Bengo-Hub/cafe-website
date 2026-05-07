'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Loader2, MonitorPlay } from 'lucide-react';

const POS_UI_URL = process.env.NEXT_PUBLIC_POS_UI_URL ?? 'https://pos.codevertexitsolutions.com';

export default function KDSPage() {
  const tenantSlug = useAuthStore((s) => s.user?.tenant_slug);

  useEffect(() => {
    if (tenantSlug) {
      window.location.replace(`${POS_UI_URL}/${tenantSlug}/kds`);
    }
  }, [tenantSlug]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
      <MonitorPlay className="h-12 w-12 opacity-30" />
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Opening Kitchen Display...</span>
      </div>
    </div>
  );
}
