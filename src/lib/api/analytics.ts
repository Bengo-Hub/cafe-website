import { api } from './client';

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

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await api.get('/admin/orders/summary');
    return response.data;
  },
  getInventoryStats: async (): Promise<InventoryStats> => {
    const response = await api.get('/inventory/summary');
    return response.data;
  }
};
