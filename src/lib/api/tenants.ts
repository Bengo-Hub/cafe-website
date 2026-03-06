/**
 * Tenant API – public tenant/brand data from auth-service.
 * GET /api/v1/tenants/by-slug/{slug} is public (no auth).
 */

import { config } from '@/config/env';

export interface TenantBrandMetadata {
  logo_url?: string;
  logoUrl?: string;
  primary_color?: string;
  primaryColor?: string;
  secondary_color?: string;
  secondaryColor?: string;
  org_name?: string;
  orgName?: string;
}

export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  status?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TenantBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  orgName: string;
}

const AUTH_BASE = config.services.auth;

function parseBrandFromTenant(t: TenantResponse): TenantBrand {
  const meta = (t.metadata || {}) as TenantBrandMetadata;
  const logoUrl =
    meta.logo_url ?? meta.logoUrl ?? null;
  const primaryColor =
    (meta.primary_color ?? meta.primaryColor) ?? null;
  const secondaryColor =
    (meta.secondary_color ?? meta.secondaryColor) ?? null;
  const orgName =
    (meta.org_name ?? meta.orgName) ?? t.name ?? '';

  return {
    id: t.id,
    name: t.name ?? '',
    slug: t.slug ?? '',
    logoUrl: typeof logoUrl === 'string' ? logoUrl : null,
    primaryColor: typeof primaryColor === 'string' ? primaryColor : null,
    secondaryColor: typeof secondaryColor === 'string' ? secondaryColor : null,
    orgName: typeof orgName === 'string' ? orgName : (t.name ?? ''),
  };
}

/**
 * Fetch tenant by slug from auth-service (public endpoint).
 * Use for tenant name, slug, and optional branding (logo, colors) from metadata.
 */
export async function fetchTenantBySlug(slug: string): Promise<TenantBrand | null> {
  const url = `${AUTH_BASE}/api/v1/tenants/by-slug/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Tenant fetch failed: ${res.status}`);
    }
    const data = (await res.json()) as TenantResponse;
    return parseBrandFromTenant(data);
  } catch {
    return null;
  }
}
