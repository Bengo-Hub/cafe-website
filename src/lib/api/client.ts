import { config } from '@/config/env';
import { useAuthStore } from '@/lib/store/auth-store';

/** Only send X-Tenant-ID when it is a valid UUID (from auth-api /me or env). */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Tenant slug for URL paths (from auth /me when available, else env). */
export function getTenantSlug(): string {
  if (typeof window !== 'undefined') {
    const slug = useAuthStore.getState().user?.tenant_slug;
    if (slug) return slug;
  }
  return config.tenant.slug;
}

/** Tenant headers using auth-api /me tenant_id (UUID) and tenant_slug. Only sends X-Tenant-ID when value is a valid UUID. Exported for use by orders, catalog, riders, inventory. */
export function getTenantHeaders(): Record<string, string> {
  const slug = getTenantSlug();
  let tenantId: string | undefined;

  if (typeof window !== 'undefined') {
    const user = useAuthStore.getState().user;
    if (user?.tenant_id && UUID_REGEX.test(user.tenant_id)) {
      tenantId = user.tenant_id;
    }
    if (!tenantId && config.tenant.id && UUID_REGEX.test(config.tenant.id)) {
      tenantId = config.tenant.id;
    }
  } else if (config.tenant.id && UUID_REGEX.test(config.tenant.id)) {
    tenantId = config.tenant.id;
  }

  return {
    'X-Tenant-Slug': slug,
    ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
  };
}

function tenantHeaders(): Record<string, string> {
  return getTenantHeaders();
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiClient<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { timeout, retryAttempts } = config.api;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...tenantHeaders(),
          ...authHeader(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'API request failed', data);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      lastError = error as Error;
      if (attempt < retryAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('API request failed');
}

export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    apiClient<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiClient<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
};
