/** App-wide locale and timezone (France). */
export const APP_LOCALE = 'fr-FR';
export const APP_TIMEZONE = 'Europe/Paris';

function coerceDate(value: Date | string | number): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date');
  }
  return date;
}

export function formatDateParis(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    ...options,
  }).format(coerceDate(date));
}

export function formatDateTimeParis(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(coerceDate(date));
}

/** Calendar date (YYYY-MM-DD) in Europe/Paris for the given instant. */
export function getParisDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(date);
}

export function addCalendarDaysKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  const shiftedYear = shifted.getUTCFullYear();
  const shiftedMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const shiftedDay = String(shifted.getUTCDate()).padStart(2, '0');
  return `${shiftedYear}-${shiftedMonth}-${shiftedDay}`;
}

export function parisDateKeyDiff(laterKey: string, earlierKey: string): number {
  const [laterYear, laterMonth, laterDay] = laterKey.split('-').map(Number);
  const [earlierYear, earlierMonth, earlierDay] = earlierKey.split('-').map(Number);
  return Math.round(
    (Date.UTC(laterYear, laterMonth - 1, laterDay) - Date.UTC(earlierYear, earlierMonth - 1, earlierDay)) /
      86_400_000
  );
}

export function getParisDayDiff(from: Date, to: Date): number {
  return parisDateKeyDiff(getParisDateKey(to), getParisDateKey(from));
}

function getParisWeekday(date: Date): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
  }).format(date);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  return map[weekday] ?? 0;
}

function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
  return asUtc - date.getTime();
}

export function parisLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = getTimezoneOffsetMs(APP_TIMEZONE, new Date(utcGuess));
  return new Date(utcGuess - offset);
}

/** Midnight Europe/Paris on the calendar day of the given instant. */
export function startOfDayParis(date: Date): Date {
  const [year, month, day] = getParisDateKey(date).split('-').map(Number);
  return parisLocalToUtc(year, month, day, 0, 0, 0);
}

/** Monday 00:00 Europe/Paris for the week containing the given instant. */
export function startOfWeekParis(date: Date): Date {
  const dateKey = getParisDateKey(date);
  const weekday = getParisWeekday(date);
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  const mondayKey = addCalendarDaysKey(dateKey, -daysFromMonday);
  const [year, month, day] = mondayKey.split('-').map(Number);
  return parisLocalToUtc(year, month, day, 0, 0, 0);
}

/** Next Monday 00:00 Europe/Paris after the week containing the given instant. */
export function endOfWeekParis(date: Date): Date {
  const weekStartKey = getParisDateKey(startOfWeekParis(date));
  const nextMondayKey = addCalendarDaysKey(weekStartKey, 7);
  const [year, month, day] = nextMondayKey.split('-').map(Number);
  return parisLocalToUtc(year, month, day, 0, 0, 0);
}
