import { describe, expect, it } from 'vitest';
import { getContentStats } from '@ama/shared/course-content';

describe('seed content stats', () => {
  it('exposes 10 questions per module and lesson blocks for all MVP modules', () => {
    const stats = getContentStats();

    expect(stats.courses).toBe(3);
    expect(stats.modules).toBe(12);
    expect(stats.totalQuestions).toBe(132);
    expect(stats.examOnlyQuestions).toBe(12);

    for (const [slug, count] of Object.entries(stats.questionsPerModule)) {
      const isFinalModule =
        slug === 'apps-vpp-management' ||
        slug === 'api-automation-advanced-policies' ||
        slug === 'vpp-abm-business-apps';
      if (isFinalModule) {
        expect(count).toBe(14);
      } else {
        expect(count).toBe(10);
      }
    }

    for (const words of Object.values(stats.lessonWordsPerModule)) {
      expect(words).toBeGreaterThanOrEqual(800);
      expect(words).toBeLessThanOrEqual(1200);
    }
  });
});
