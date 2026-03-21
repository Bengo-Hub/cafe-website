import { config } from '@/config/env';
import { apiClient, getTenantHeaders, getTenantSlug } from './client';

const ORDERING_URL = config.services.ordering;
const INVENTORY_URL = config.services.inventory;

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('cafe-auth-storage');
  if (!stored) return {};
  try {
    const { state } = JSON.parse(stored);
    return state?.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};
  } catch {
    return {};
  }
}

function headers(): Record<string, string> {
  return { ...authHeaders(), ...getTenantHeaders() };
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  revenueTrend: number;
  trend: { date: string; revenue: number }[];
  topSellingItems: { nameSnapshot: string; quantity: number }[];
  ordersByStatus: Record<string, number>;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}

const slug = () => getTenantSlug();

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const url = `${ORDERING_URL}/api/v1/${slug()}/admin/orders/summary`;
    const res = await apiClient<AnalyticsSummary>(url, { headers: headers() });
    if (!res.data) throw new Error('Failed to fetch analytics summary');
    return res.data;
  },
  getInventoryStats: async (): Promise<InventoryStats> => {
    const url = `${INVENTORY_URL}/v1/${slug()}/inventory/summary`;
    const res = await apiClient<InventoryStats>(url, { headers: headers() });
    if (!res.data) throw new Error('Failed to fetch inventory stats');
    return res.data;
  },
};
