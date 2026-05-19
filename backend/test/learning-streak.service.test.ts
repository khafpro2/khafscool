import { describe, expect, it } from 'vitest';

import { buildLearningStreak } from '../src/services/gamification.service.js';

describe('buildLearningStreak', () => {
  it('returns zero streak when there is no activity', () => {
    expect(buildLearningStreak([])).toEqual({
      currentDays: 0,
      longestDays: 0,
      lastActivityDate: null,
    });
  });

  it('counts consecutive days ending today', () => {
    const now = new Date('2026-05-19T18:00:00.000Z');
    const result = buildLearningStreak(
      [
        new Date('2026-05-19T10:00:00.000Z'),
        new Date('2026-05-18T09:00:00.000Z'),
        new Date('2026-05-17T20:00:00.000Z'),
        new Date('2026-05-15T12:00:00.000Z'),
      ],
      now
    );

    expect(result).toEqual({
      currentDays: 3,
      longestDays: 3,
      lastActivityDate: '2026-05-19',
    });
  });

  it('keeps the streak alive when the last activity was yesterday', () => {
    const now = new Date('2026-05-19T08:00:00.000Z');
    const result = buildLearningStreak(
      [new Date('2026-05-18T21:00:00.000Z'), new Date('2026-05-17T12:00:00.000Z')],
      now
    );

    expect(result.currentDays).toBe(2);
    expect(result.longestDays).toBe(2);
    expect(result.lastActivityDate).toBe('2026-05-18');
  });

  it('resets the current streak after a gap longer than one day', () => {
    const now = new Date('2026-05-19T12:00:00.000Z');
    const result = buildLearningStreak(
      [
        new Date('2026-05-10T10:00:00.000Z'),
        new Date('2026-05-09T10:00:00.000Z'),
        new Date('2026-05-08T10:00:00.000Z'),
        new Date('2026-05-01T10:00:00.000Z'),
      ],
      now
    );

    expect(result.currentDays).toBe(0);
    expect(result.longestDays).toBe(3);
    expect(result.lastActivityDate).toBe('2026-05-10');
  });
});
