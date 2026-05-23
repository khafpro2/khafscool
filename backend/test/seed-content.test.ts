import { describe, expect, it } from 'vitest';
import { getContentStats } from '@ama/shared/course-content';

describe('seed content stats', () => {
  it('exposes 8 questions per module and lesson blocks for all MVP modules', () => {
    const stats = getContentStats();

    expect(stats.courses).toBe(3);
    expect(stats.modules).toBe(9);
    expect(stats.totalQuestions).toBe(72);

    for (const count of Object.values(stats.questionsPerModule)) {
      expect(count).toBe(8);
    }

    for (const words of Object.values(stats.lessonWordsPerModule)) {
      expect(words).toBeGreaterThanOrEqual(500);
      expect(words).toBeLessThanOrEqual(800);
    }
  });
});
