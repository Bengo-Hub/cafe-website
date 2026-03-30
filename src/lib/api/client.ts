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

/** Tenant headers using auth-api /me tenant_id (UUID) and tenant_slug. Only sends X-Tenant-ID when value is a valid UUID. Exported for use by orders, catalog, riders, inventory. Platform owners skip tenant headers — scope resolved from JWT. */
export function getTenantHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const user = useAuthStore.getState().user;
    if (user?.is_platform_owner || user?.tenant_slug === 'codevertex') {
      return {};
    }
  }

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

let on401Callback: (() => void) | null = null;
let onSubscription403Callback: ((data: any) => void) | null = null;

/** Register a callback to run when any API response is 401 (e.g. clear session / redirect to auth). */
export function setOn401(callback: (() => void) | null) {
  on401Callback = callback;
}

/** Register a callback for subscription-related 403 errors (code=subscription_inactive, upgrade=true). */
export function setOnSubscription403(callback: ((data: any) => void) | null) {
  onSubscription403Callback = callback;
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
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...tenantHeaders(),
          ...authHeader(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // 401: attempt token refresh before triggering logout
        if (response.status === 401 && !url.includes('/auth/me')) {
          const { refreshAccessToken } = await import('@/lib/auth/token-refresh');
          const newToken = await refreshAccessToken();

          if (newToken) {
            // Retry the original request with the refreshed token
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);

            const retryResponse = await fetch(url, {
              ...options,
              signal: retryController.signal,
              headers: {
                ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                ...tenantHeaders(),
                Authorization: `Bearer ${newToken}`,
                ...options.headers,
              },
            });

            clearTimeout(retryTimeoutId);
            const retryData = await retryResponse.json();

            if (retryResponse.ok) {
              return { data: retryData, status: retryResponse.status };
            }

            // Retry still failed — if 401 again, now fire the logout callback
            if (retryResponse.status === 401 && on401Callback) {
              on401Callback();
            }
            throw new ApiError(retryResponse.status, retryData.message || 'API request failed after token refresh', retryData);
          }

          // Refresh failed entirely — fire logout callback
          if (on401Callback) {
            on401Callback();
          }
        }

        if (response.status === 403 && onSubscription403Callback) {
          if (data?.code === 'subscription_inactive' || data?.upgrade === true) {
            onSubscription403Callback(data);
          }
        }
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
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
};
