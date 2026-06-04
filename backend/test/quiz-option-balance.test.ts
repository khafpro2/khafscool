import { describe, expect, it } from 'vitest';
import { moduleQuizQuestions, QUESTIONS_BY_COURSE } from '@ama/shared/quiz-content';
import { measureQuizOptionLengthBias } from '@ama/shared/quiz-option-balance';

describe('quiz option length balance', () => {
  it('keeps severe longest-correct bias under an acceptable threshold', () => {
    let severe = 0;
    let total = 0;

    for (const modules of Object.values(QUESTIONS_BY_COURSE)) {
      for (const questions of Object.values(modules)) {
        for (const question of moduleQuizQuestions(questions)) {
          total += 1;
          const bias = measureQuizOptionLengthBias(question);
          if (bias.isSevere) severe += 1;
        }
      }
    }

    expect(total).toBeGreaterThan(100);
    // Objectif pédagogique : réduire le biais « réponse la plus longue » (shuffle seul ne suffit pas).
    expect(severe).toBeLessThanOrEqual(55);
  });

  it('keeps moderate length gaps (correct vs longest distractor) at 8 characters or less', () => {
    let overGap = 0;

    for (const modules of Object.values(QUESTIONS_BY_COURSE)) {
      for (const questions of Object.values(modules)) {
        for (const question of moduleQuizQuestions(questions)) {
          const bias = measureQuizOptionLengthBias(question);
          if (bias.gap > 8) overGap += 1;
        }
      }
    }

    expect(overGap).toBe(0);
  });
});
