import { describe, expect, it } from 'vitest';
import { resolveQuizOptionIndexFromKey } from '@ama/shared/quiz-learning';

describe('quiz keyboard letters', () => {
  it('maps A–D to option indexes within bounds', () => {
    expect(resolveQuizOptionIndexFromKey('a', 4)).toBe(0);
    expect(resolveQuizOptionIndexFromKey('C', 4)).toBe(2);
    expect(resolveQuizOptionIndexFromKey('d', 3)).toBeNull();
    expect(resolveQuizOptionIndexFromKey('e', 4)).toBeNull();
    expect(resolveQuizOptionIndexFromKey('1', 4)).toBeNull();
  });
});
