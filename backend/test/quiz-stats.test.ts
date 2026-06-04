import { describe, expect, it } from 'vitest';

import {
  computeQuizScorePercent,
  countCorrectAnswers,
  summarizeQuizStats,
} from '@ama/shared/quiz-stats';

describe('quiz stats helper', () => {
  it('computes score percent from revealed answers', () => {
    const results = {
      q1: { correct: true },
      q2: { correct: false },
      q3: { correct: true },
      q4: { correct: true },
    };

    expect(countCorrectAnswers(results)).toBe(3);
    expect(computeQuizScorePercent(4, results)).toBe(75);
  });

  it('summarizes pass state with the shared threshold', () => {
    const summary = summarizeQuizStats(4, {
      q1: { correct: true },
      q2: { correct: true },
      q3: { correct: false },
      q4: { correct: false },
    });

    expect(summary).toEqual({
      totalQuestions: 4,
      answeredCount: 4,
      correctCount: 2,
      scorePercent: 50,
      passed: true,
    });
  });
});
