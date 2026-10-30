import { config } from '@/config/env';

/**
 * Table reservations go to pos-api's public endpoints (the same ones the POS's embeddable
 * table-booking widget uses), so a booking made on the website lands in the POS reservations list
 * for staff to confirm and seat. The public routes take the tenant's UUID, not its slug.
 */

const POS_BASE = `${config.services.pos}/api/v1`;

export interface PosOutlet {
  id: string;
  name: string;
  use_case?: string;
}

interface TableAvailability {
  id: string;
  capacity: number;
  booked_slots: { start: string; end: string }[];
}

export async function fetchOutlets(tenantId: string): Promise<PosOutlet[]> {
  const res = await fetch(`${POS_BASE}/${tenantId}/pos/outlets`);
  if (!res.ok) return [];
  const body = await res.json();
  return (Array.isArray(body) ? body : body.data ?? []) as PosOutlet[];
}

/**
 * How many tables can seat the party at `start` for `minutes` (no overlapping booking). The POS
 * assigns the actual table; this only tells the guest whether the time is likely to work.
 */
export async function freeTables(
  tenantId: string,
  outletId: string,
  date: string,
  partySize: number,
  start: Date,
  minutes: number,
): Promise<number> {
  const q = new URLSearchParams({ date, party_size: String(partySize), outlet_id: outletId });
  const res = await fetch(`${POS_BASE}/${tenantId}/pos/reservations/available?${q}`);
  if (!res.ok) throw new Error('Could not check tables right now.');
  const body = await res.json();
  const tables: TableAvailability[] = body.tables ?? [];
  const end = start.getTime() + minutes * 60_000;
  return tables.filter(
    (t) =>
      t.capacity >= partySize &&
      !t.booked_slots.some((s) => new Date(s.start).getTime() < end && new Date(s.end).getTime() > start.getTime()),
  ).length;
}

export interface ReservationRequest {
  outletId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  scheduledAt: Date;
  durationMinutes: number;
  specialRequests?: string;
}

export async function createReservation(tenantId: string, r: ReservationRequest): Promise<void> {
  const res = await fetch(`${POS_BASE}/${tenantId}/pos/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      outlet_id: r.outletId,
      guest_name: r.guestName,
      guest_phone: r.guestPhone,
      ...(r.guestEmail ? { guest_email: r.guestEmail } : {}),
      party_size: r.partySize,
      scheduled_at: r.scheduledAt.toISOString(),
      duration_minutes: r.durationMinutes,
      ...(r.specialRequests ? { special_requests: r.specialRequests } : {}),
      source: 'website',
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? String(body.error) : 'The booking could not be made. Please call us.');
  }
}
