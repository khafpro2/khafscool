import { describe, expect, it } from 'vitest';
import { appleCertPrepQuestions, moduleQuizQuestions } from '@ama/shared/quiz-content';

describe('appleCertPrepQuestions', () => {
  it('loads all module question banks with valid options', () => {
    const modules = Object.values(appleCertPrepQuestions);
    expect(modules.length).toBeGreaterThanOrEqual(4);

    const total = modules.flat().length;
    expect(total).toBeGreaterThanOrEqual(40);

    for (const question of modules.flat()) {
      expect(question.options).toHaveLength(4);
      expect(question.options.map((o) => o.id).sort()).toEqual(['a', 'b', 'c', 'd']);
      expect(question.options.some((o) => o.id === question.correctOption)).toBe(true);
      expect(question.prompt.length).toBeGreaterThan(10);
    }
  });
});

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
