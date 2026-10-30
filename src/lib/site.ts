/**
 * Facts about the cafe used across the public site. Phone and email come from the tenant record
 * when it loads (useTenantBrand); these values are the fallback and the source for structured data.
 */
export const SITE = {
  name: 'Urban Loft Cafe',
  town: 'Busia',
  phone: '0116010638',
  email: 'urbanloftc@gmail.com',
  /** Open every day; the kitchen takes the last table booking an hour before closing. */
  opens: '07:30',
  closes: '22:00',
  mapUrl: 'https://maps.google.com/?q=The+Urban+Loft+Cafe+Busia,+Kenya',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.6927520153863!2d34.124710474474604!3d0.45457156380033154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177fa1fa9904e015%3A0x596a9eb86b54c451!2sThe%20Urban%20Loft%20Cafe%20Busia!5e0!3m2!1sen!2ske!4v1766102160363!5m2!1sen!2ske',
  socials: {
    facebook: 'https://web.facebook.com/profile.php?id=61572312098329',
    instagram: 'https://www.instagram.com/theurbanloftcafebusia/',
    tiktok: 'https://www.tiktok.com/@urbanloftcafe',
  },
} as const;

/** "07:30" as minutes after midnight. */
function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** "7:30 AM" from "07:30". */
export function clock(hhmm: string): string {
  const m = minutes(hhmm);
  const h = Math.floor(m / 60);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m % 60;
  return mm === 0 ? `${h12} ${suffix}` : `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
}

export const HOURS_LABEL = `Every day, ${clock(SITE.opens)} to ${clock(SITE.closes)}`;

/** Whether the cafe is open at `now`, in Busia time (UTC+3), with a short line to show. */
export function openState(now: Date = new Date()): { open: boolean; line: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const t = h * 60 + m;
  const open = t >= minutes(SITE.opens) && t < minutes(SITE.closes);
  if (open) return { open, line: `Open now until ${clock(SITE.closes)}` };
  return { open, line: `Closed now, opens at ${clock(SITE.opens)}` };
}

/** A Kenyan number as people write it: "+254116010638" or "0116010638" becomes "0116 010 638". */
export function displayPhone(phone: string): string {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('254') && d.length === 12) d = `0${d.slice(3)}`;
  if (d.length !== 10 || !d.startsWith('0')) return phone;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

/** tel: link for a Kenyan number written 07xx or 01xx. */
export function telHref(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return `tel:${d.startsWith('0') ? `+254${d.slice(1)}` : `+${d}`}`;
}

export function whatsappHref(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return `https://wa.me/${d.startsWith('0') ? `254${d.slice(1)}` : d}`;
}
