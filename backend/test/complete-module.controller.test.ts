import { describe, expect, it } from 'vitest';
import { parseCompleteModuleRequest } from '../src/controllers/courses.controller.js';

describe('parseCompleteModuleRequest', () => {
  it('accepts valid quiz and game payloads', () => {
    const parsed = parseCompleteModuleRequest({
      quizAnswers: { 'q-1': 'a', 'q-2': 'b' },
      gameOrder: [2, 0, 1],
      reviewMode: true,
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects empty quiz answer keys or values', () => {
    expect(parseCompleteModuleRequest({ quizAnswers: { '': 'a' } }).success).toBe(false);
    expect(parseCompleteModuleRequest({ quizAnswers: { 'q-1': '' } }).success).toBe(false);
  });

  it('rejects non-integer game order entries', () => {
    expect(parseCompleteModuleRequest({ gameOrder: [1, 1.5] }).success).toBe(false);
  });
});
