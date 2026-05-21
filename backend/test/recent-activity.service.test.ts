import { describe, expect, it } from 'vitest';
import { mapRecentActivity } from '../src/services/gamification.service.js';

describe('mapRecentActivity', () => {
  it('maps completed modules with computed points', () => {
    const rows = [
      {
        module: {
          id: 'mod-1',
          slug: 'mdm-basics',
          title: 'Bases MDM',
          course: {
            slug: 'apple-cert-prep',
            title: 'Parcours Apple',
            track: 'APPLE' as const,
          },
        },
        completedAt: new Date('2026-05-18T10:00:00.000Z'),
        quizScore: 90,
        gameScore: 80,
      },
    ];

    const result = mapRecentActivity(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'mod-1',
      slug: 'mdm-basics',
      title: 'Bases MDM',
      courseSlug: 'apple-cert-prep',
      courseTitle: 'Parcours Apple',
      track: 'APPLE',
      quizScore: 90,
      gameScore: 80,
      pointsEarned: 25,
    });
  });

  it('returns an empty list when no rows are provided', () => {
    expect(mapRecentActivity([])).toEqual([]);
  });
});
