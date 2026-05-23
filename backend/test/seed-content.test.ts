import { describe, expect, it } from 'vitest';
import { getContentStats } from '@ama/shared/course-content';

describe('seed content stats', () => {
  it('exposes 10 questions per module and lesson blocks for all MVP modules', () => {
    const stats = getContentStats();

    expect(stats.courses).toBe(3);
    expect(stats.modules).toBe(12);
    expect(stats.totalQuestions).toBe(126);

    for (const count of Object.values(stats.questionsPerModule)) {
      expect(count).toBeGreaterThanOrEqual(10);
      expect(count).toBeLessThanOrEqual(12);
    }

    for (const words of Object.values(stats.lessonWordsPerModule)) {
      expect(words).toBeGreaterThanOrEqual(800);
      expect(words).toBeLessThanOrEqual(1200);
    }
  });
});
