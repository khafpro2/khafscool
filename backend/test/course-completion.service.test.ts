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

  it('returns course completion when all four modules are done', () => {
    const result = buildCourseCompletionResult(
      {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        track: CourseTrack.APPLE,
      },
      4,
      4,
      ['apple-mdm-foundation'],
      160
    );

    expect(result).toEqual({
      courseCompleted: true,
      courseCompletion: {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        pointsEarned: 160,
        badgeEarned: 'apple-mdm-foundation',
      },
    });
  });

  it('includes module 4 points in course total', () => {
    expect(
      sumCoursePointsFromProgress([
        { quizScore: 80, gameScore: 100 },
        { quizScore: 60, gameScore: 50 },
        { quizScore: 90, gameScore: 90 },
        { quizScore: 100, gameScore: 100 },
      ])
    ).toBe(101);
  });

  it('omits completion payload until the course reaches 100%', () => {
    expect(
      buildCourseCompletionResult(
        {
          slug: 'jamf-pro-foundations',
          title: 'Fondamentaux Jamf Pro',
          track: CourseTrack.JAMF,
        },
        3,
        4,
        ['jamf-engineer'],
        80
      )
    ).toEqual({ courseCompleted: false });
  });

  it('omits completion payload when only three of four modules are done (legacy case)', () => {
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
