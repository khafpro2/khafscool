import { CourseTrack } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  buildCourseCompletionResult,
  modulePointsFromScores,
  sumCoursePointsFromProgress,
} from '../src/services/gamification.service.js';

describe('course completion helpers', () => {
  it('computes module and course points from quiz and game scores', () => {
    expect(modulePointsFromScores(80, 100)).toBe(28);
    expect(
      sumCoursePointsFromProgress([
        { quizScore: 80, gameScore: 100 },
        { quizScore: 60, gameScore: 50 },
      ])
    ).toBe(44);
  });

  it('returns course completion when all modules are done', () => {
    const result = buildCourseCompletionResult(
      {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        track: CourseTrack.APPLE,
      },
      3,
      3,
      ['apple-mdm-foundation'],
      120
    );

    expect(result).toEqual({
      courseCompleted: true,
      courseCompletion: {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        pointsEarned: 120,
        badgeEarned: 'apple-mdm-foundation',
      },
    });
  });

  it('omits completion payload until the course reaches 100%', () => {
    expect(
      buildCourseCompletionResult(
        {
          slug: 'jamf-pro-foundations',
          title: 'Fondamentaux Jamf Pro',
          track: CourseTrack.JAMF,
        },
        2,
        3,
        ['jamf-engineer'],
        80
      )
    ).toEqual({ courseCompleted: false });
  });
});
