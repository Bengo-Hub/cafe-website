/**
 * Auth API – current user (roles + permissions) from auth-service.
 * GET /api/v1/auth/me requires Bearer token; returns user profile, roles, and permissions.
 */

import { config } from '@/config/env';
import { api } from './client';

const AUTH_BASE = config.services.auth;

export interface MeResponse {
  id: string;
  email?: string;
  status?: string;
  profile?: Record<string, unknown>;
  roles: string[];
  permissions: string[];
  [key: string]: unknown;
}

/**
 * Fetch current user with roles and permissions from auth-service.
 * Uses api client so Authorization is read from auth store.
 */
export async function fetchMe(): Promise<MeResponse> {
  const url = `${AUTH_BASE.replace(/\/$/, '')}/api/v1/auth/me`;
  const res = await api.get<MeResponse>(url);
  if (!res.data) {
    throw new Error('Invalid /me response');
  }
  const data = res.data as Record<string, unknown>;
  return {
    ...data,
    roles: Array.isArray(data.roles) ? (data.roles as string[]) : [],
    permissions: Array.isArray(data.permissions) ? (data.permissions as string[]) : [],
  } as MeResponse;
}
