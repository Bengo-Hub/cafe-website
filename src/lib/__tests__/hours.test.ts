import { FALLBACK_HOURS, hoursLabel, openStateFor, parseOpeningHours } from '../hours';

const TZ = 'Africa/Nairobi';
// 2026-11-23 is a Monday. Nairobi is UTC+3.
const at = (isoUtc: string) => new Date(isoUtc);

describe('opening hours', () => {
  const daily = parseOpeningHours(
    Object.fromEntries(
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => [d, { open: '07:30', close: '22:30' }]),
    ),
  )!;

  it('labels a same-every-day schedule', () => {
    expect(hoursLabel(daily)).toBe('Every day, 7:30 AM to 10:30 PM');
    expect(hoursLabel(FALLBACK_HOURS)).toBe('Every day, 7:30 AM to 10:30 PM');
  });

  it('reads the clock in the tenant timezone', () => {
    expect(openStateFor(daily, TZ, at('2026-11-23T19:15:00Z'))).toEqual({ open: true, line: 'Open now until 10:30 PM' }); // 22:15 EAT
    expect(openStateFor(daily, TZ, at('2026-11-23T19:30:00Z')).open).toBe(false); // 22:30 EAT
    expect(openStateFor(daily, TZ, at('2026-11-23T04:00:00Z'))).toEqual({ open: false, line: 'Closed now, opens at 7:30 AM' }); // 07:00 EAT
  });

  it('handles closed days and overnight periods', () => {
    const h = parseOpeningHours({ friday: { open: '18:00', close: '02:00' }, monday: null })!;
    expect(openStateFor(h, TZ, at('2026-11-27T22:00:00Z')).open).toBe(true); // Saturday 01:00 EAT
    expect(openStateFor(h, TZ, at('2026-11-23T09:00:00Z')).line).toBe('Closed now, opens Friday at 6 PM');
    expect(hoursLabel(h)).toContain('Mon closed');
  });

  it('treats a missing or malformed schedule as unset', () => {
    expect(parseOpeningHours(undefined)).toBeNull();
    expect(parseOpeningHours({ note: 'x' })).toBeNull();
    expect(parseOpeningHours({ monday: { open: '25:00', close: '22:00' } })).toEqual({});
  });
});
