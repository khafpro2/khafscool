import { CourseTrack } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { buildCompletedCourses } from '../src/services/gamification.service.js';

describe('buildCompletedCourses', () => {
  it('returns courses where every module is completed', () => {
    const completedAt = new Date('2026-05-10T12:00:00.000Z');
    const result = buildCompletedCourses([
      {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        track: CourseTrack.APPLE,
        modules: [
          { progresses: [{ completedAt }] },
          { progresses: [{ completedAt: new Date('2026-05-12T08:00:00.000Z') }] },
        ],
      },
      {
        slug: 'jamf-pro-foundations',
        title: 'Fondations Jamf Pro',
        track: CourseTrack.JAMF,
        modules: [
          { progresses: [{ completedAt }] },
          { progresses: [{ completedAt: null }] },
        ],
      },
    ]);

    expect(result).toEqual([
      {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        track: CourseTrack.APPLE,
        completedAt: '2026-05-12T08:00:00.000Z',
      },
    ]);
  });

  it('ignores courses with no modules', () => {
    expect(
      buildCompletedCourses([
        {
          slug: 'empty-course',
          title: 'Vide',
          track: CourseTrack.APPLE,
          modules: [],
        },
      ])
    ).toEqual([]);
  });
});
