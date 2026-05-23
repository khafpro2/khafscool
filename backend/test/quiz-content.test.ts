import { describe, expect, it } from 'vitest';
import { moduleQuizQuestions } from '@ama/shared/quiz-content';

describe('moduleQuizQuestions', () => {
  it('excludes exam-only bonus questions from module quiz', () => {
    const questions = [
      { id: '1', examOnly: false },
      { id: '2', examOnly: true },
      { id: '3' },
    ];

    expect(moduleQuizQuestions(questions).map((question) => question.id)).toEqual(['1', '3']);
  });
});
