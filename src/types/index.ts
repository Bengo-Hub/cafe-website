export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  tenantId: string;
  roles: string[];
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export type { Event } from '@/lib/dummy-data/events';
export type { Job, JobType } from '@/lib/dummy-data/jobs';
export type { LoyaltyAccount, LoyaltyTier, Reward } from '@/lib/dummy-data/loyalty';
export type { DietaryTag, MenuCategory, MenuItem } from '@/lib/dummy-data/menu';
export type { LogisticsTask, Order, OrderItem, OrderStatus } from '@/lib/dummy-data/orders';
export type { BookableSpace } from '@/lib/dummy-data/spaces';
export type { TeamMember } from '@/hooks/use-team';

