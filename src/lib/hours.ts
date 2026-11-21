/**
 * Opening hours. auth-api keeps them for the tenant (metadata `opening_hours`, edited in
 * Accounts > Branding) with the tenant's `timezone`; the online store, POS and this site all read
 * the same record. SITE.opens/closes are only the fallback while the record loads or when the
 * tenant has not set hours.
 */
import { SITE, clock } from './site';

export type Period = { open: string; close: string };
export type WeeklyHours = Record<string, Period[]>;

export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export const FALLBACK_TIMEZONE = 'Africa/Nairobi';

/** "07:30" as minutes after midnight, or -1. */
export function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return -1;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h > 24 || mm > 59 || (h === 24 && mm > 0)) return -1;
  return h * 60 + mm;
}

function period(v: unknown): Period | null {
  if (!v || typeof v !== 'object') return null;
  const { open, close } = v as Record<string, unknown>;
  if (typeof open !== 'string' || typeof close !== 'string') return null;
  if (toMinutes(open) < 0 || toMinutes(close) < 0 || open === close) return null;
  return { open, close };
}

/** The schedule from tenant metadata, or null when none is set. A day left out is closed. */
export function parseOpeningHours(raw: unknown): WeeklyHours | null {
  if (!raw || typeof raw !== 'object') return null;
  const out: WeeklyHours = {};
  let seen = false;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const day = k.toLowerCase();
    if (!(DAYS as readonly string[]).includes(day)) continue;
    seen = true;
    const list = Array.isArray(v) ? v : [v];
    const periods = list.map(period).filter((p): p is Period => p !== null);
    if (periods.length) out[day] = periods;
  }
  return seen ? out : null;
}

/** The site's own fallback: every day from SITE.opens to SITE.closes. */
export const FALLBACK_HOURS: WeeklyHours = Object.fromEntries(
  DAYS.map((d) => [d, [{ open: SITE.opens, close: SITE.closes }]]),
);

/** The day's weekday name and minutes after midnight in the tenant's zone. */
function zoned(now: Date, timeZone: string): { day: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { day: get('weekday').toLowerCase(), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** The same single period every day, or null when days differ or a day is closed. */
export function everyDay(hours: WeeklyHours): Period | null {
  const first = hours[DAYS[0]];
  if (!first || first.length !== 1) return null;
  const p = first[0]!;
  const same = DAYS.every((d) => hours[d]?.length === 1 && hours[d]![0]!.open === p.open && hours[d]![0]!.close === p.close);
  return same ? p : null;
}

/** "Every day, 7:30 AM to 10:30 PM", or the day-by-day summary when days differ. */
export function hoursLabel(hours: WeeklyHours): string {
  const p = everyDay(hours);
  if (p) return `Every day, ${clock(p.open)} to ${clock(p.close)}`;
  const label = (d: string) => d.charAt(0).toUpperCase() + d.slice(1, 3);
  return [...DAYS.slice(1), DAYS[0]]
    .map((d) => {
      const ps = hours[d];
      return `${label(d)} ${ps?.length ? ps.map((x) => `${clock(x.open)} to ${clock(x.close)}`).join(', ') : 'closed'}`;
    })
    .join('; ');
}

/** Whether the schedule is open at `now` in the tenant's zone, with a short line to show. */
export function openStateFor(hours: WeeklyHours, timeZone: string, now: Date = new Date()): { open: boolean; line: string } {
  const { day, minutes } = zoned(now, timeZone);
  const idx = DAYS.indexOf(day as (typeof DAYS)[number]);
  const yesterday = DAYS[(idx + 6) % 7]!;
  for (const p of hours[day] ?? []) {
    const o = toMinutes(p.open);
    const c = toMinutes(p.close);
    if ((c > o && minutes >= o && minutes < c) || (c <= o && minutes >= o)) {
      return { open: true, line: `Open now until ${clock(p.close)}` };
    }
  }
  for (const p of hours[yesterday] ?? []) {
    if (toMinutes(p.close) <= toMinutes(p.open) && minutes < toMinutes(p.close)) {
      return { open: true, line: `Open now until ${clock(p.close)}` };
    }
  }
  const next = (hours[day] ?? []).find((p) => toMinutes(p.open) > minutes);
  if (next) return { open: false, line: `Closed now, opens at ${clock(next.open)}` };
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7]!;
    const first = hours[d]?.[0];
    if (first) {
      const when = i === 1 ? '' : ` ${d.charAt(0).toUpperCase() + d.slice(1)}`;
      return { open: false, line: `Closed now, opens${when} at ${clock(first.open)}` };
    }
  }
  return { open: false, line: 'Closed now' };
}
