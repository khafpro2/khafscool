import { describe, expect, it } from 'vitest';
import {
  getQuizQuestionTypeMeta,
  listIncorrectQuestionIds,
  truncateQuizPrompt,
} from '@ama/shared/quiz-learning';

describe('quiz-learning helpers', () => {
  it('maps question types to French learning labels', () => {
    expect(getQuizQuestionTypeMeta('SCENARIO').shortLabel).toBe('Scénario');
    expect(getQuizQuestionTypeMeta('TROUBLESHOOTING').label).toBe('Dépannage');
    expect(getQuizQuestionTypeMeta('unknown').key).toBe('OTHER');
  });

  it('lists incorrect question ids', () => {
    expect(
      listIncorrectQuestionIds(['q1', 'q2', 'q3'], {
        q1: { correct: true },
        q2: { correct: false },
        q3: undefined,
      })
    ).toEqual(['q2']);
  });

  it('truncates long prompts for recap', () => {
    const long = 'A'.repeat(100);
    expect(truncateQuizPrompt(long, 20).length).toBeLessThanOrEqual(20);
  });
});
