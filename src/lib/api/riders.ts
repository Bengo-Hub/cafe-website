import { config } from '@/config/env';
import { api, getTenantSlug } from './client';

const LOGISTICS_URL = config.services.logistics;

// Types matching the logistics-api FleetMember ent schema

export type RiderStatus = 'pending' | 'approved' | 'active' | 'suspended';

export interface FleetMember {
  id: string;
  tenant_id: string;
  fleet_id: string;
  user_id: string;
  driver_code?: string;
  id_number?: string;
  license_no?: string;
  status: RiderStatus;
  id_passport_attachment?: string;
  rider_photo?: string;
  vehicle_id?: string;
  joined_at: string;
  suspended_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Edges (populated when WithVehicle / WithUser)
  edges?: {
    vehicle?: any;
    user?: any;
  };
}

/** @deprecated Use FleetMember instead */
export type Rider = FleetMember;

// --- Fleet ---

export async function fetchFleet() {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/fleet`;
  const resp = await api.get(url);
  return resp.data;
}

// --- Fleet Members (Riders) ---

/**
 * List fleet members, optionally filtered by status.
 * GET /api/v1/{tenant}/fleet/members?status=pending|active|suspended
 */
export async function fetchRiders(params?: {
  status?: string;
}): Promise<FleetMember[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/fleet/members${qs ? `?${qs}` : ''}`;
  const resp = await api.get<FleetMember[]>(url);
  return resp.data ?? [];
}

/**
 * Get a single fleet member by ID.
 * GET /api/v1/{tenant}/fleet/members/{memberId}
 */
export async function fetchRider(memberId: string): Promise<FleetMember> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/fleet/members/${memberId}`;
  const resp = await api.get<FleetMember>(url);
  return resp.data!;
}

/**
 * Invite a rider to the fleet. Creates a FleetMember in "pending" status.
 * POST /api/v1/{tenant}/fleet/members
 *
 * Supports two formats:
 * - Simplified: { email, id_number } — creates stub user if needed
 * - Legacy: { user_id, fleet_id?, id_number?, license_no? }
 */
export async function inviteRider(data: {
  email?: string;
  user_id?: string;
  fleet_id?: string;
  id_number?: string;
  license_no?: string;
}): Promise<FleetMember> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/fleet/members`;
  const resp = await api.post<FleetMember>(url, data);
  return resp.data!;
}

/**
 * Approve a pending fleet member → sets status to "active".
 * POST /api/v1/{tenant}/fleet/members/{memberId}/approve
 */
export async function approveRider(memberId: string): Promise<FleetMember> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/fleet/members/${memberId}/approve`;
  const resp = await api.post<FleetMember>(url);
  return resp.data!;
}

/**
 * Suspend an active fleet member.
 * POST /api/v1/{tenant}/fleet/members/{memberId}/suspend
 */
export async function suspendRider(memberId: string): Promise<FleetMember> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/fleet/members/${memberId}/suspend`;
  const resp = await api.post<FleetMember>(url);
  return resp.data!;
}
