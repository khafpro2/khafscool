import { describe, expect, it } from 'vitest';

import {
  APP_LOCALE,
  APP_TIMEZONE,
  endOfWeekParis,
  formatDateParis,
  formatDateTimeParis,
  getParisDateKey,
  startOfWeekParis,
} from '@ama/shared/locale';

describe('locale (Europe/Paris, fr-FR)', () => {
  it('exports app locale constants', () => {
    expect(APP_LOCALE).toBe('fr-FR');
    expect(APP_TIMEZONE).toBe('Europe/Paris');
  });

  it('formats a known instant in Paris local date', () => {
    expect(
      formatDateParis('2026-06-15T10:00:00.000Z', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('15 juin 2026');
  });

  it('formats date and time in Paris timezone', () => {
    const label = formatDateTimeParis('2026-01-15T22:30:00.000Z');
    expect(label).toMatch(/15 janvier 2026/i);
    expect(label).toMatch(/23:30/);
  });

  it('resolves Paris calendar date across UTC midnight', () => {
    expect(getParisDateKey(new Date('2026-05-18T22:00:00.000Z'))).toBe('2026-05-19');
  });

  it('starts the week on Monday 00:00 Europe/Paris', () => {
    const thursday = new Date('2026-05-28T12:00:00.000Z');
    const weekStart = startOfWeekParis(thursday);
    expect(getParisDateKey(weekStart)).toBe('2026-05-25');
    expect(weekStart.toISOString()).toBe('2026-05-24T22:00:00.000Z');
  });

  it('ends the week at the next Monday 00:00 Europe/Paris', () => {
    const thursday = new Date('2026-05-28T12:00:00.000Z');
    const weekEnd = endOfWeekParis(thursday);
    expect(getParisDateKey(weekEnd)).toBe('2026-06-01');
    expect(weekEnd.toISOString()).toBe('2026-05-31T22:00:00.000Z');
  });
});
