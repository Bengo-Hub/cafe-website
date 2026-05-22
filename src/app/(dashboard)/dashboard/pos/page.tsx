'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { Loader2, ShoppingCart } from 'lucide-react';

const POS_UI_URL = process.env.NEXT_PUBLIC_POS_UI_URL ?? 'https://pos.codevertexitsolutions.com';

export default function POSPage() {
  const tenantSlug = useAuthStore((s) => s.user?.tenant_slug);

  if (!tenantSlug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <ShoppingCart className="h-12 w-12 opacity-30" />
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading POS Terminal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full -m-6 lg:-m-10">
      <iframe
        src={`${POS_UI_URL}/${tenantSlug}`}
        className="w-full h-full border-0"
        title="POS Terminal"
        allow="fullscreen"
      />
    </div>
  );
}
