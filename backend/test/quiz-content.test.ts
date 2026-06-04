import { describe, expect, it } from 'vitest';
import {
  appleCertPrepQuestions,
  intuneIosEnrollmentQuestions,
  jamfProFoundationsQuestions,
  moduleQuizQuestions,
  type SeedQuestion,
} from '@ama/shared/quiz-content';

function assertQuestionBank(
  label: string,
  bank: Record<string, SeedQuestion[]>,
  minModules: number,
  minQuestions: number,
) {
  const modules = Object.values(bank);
  expect(modules.length, `${label} module count`).toBeGreaterThanOrEqual(minModules);

  const total = modules.flat().length;
  expect(total, `${label} question count`).toBeGreaterThanOrEqual(minQuestions);

  for (const question of modules.flat()) {
    expect(question.options).toHaveLength(4);
    expect(question.options.map((o) => o.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(question.options.some((o) => o.id === question.correctOption)).toBe(true);
    expect(question.prompt.length).toBeGreaterThan(10);
  }
}

describe('appleCertPrepQuestions', () => {
  it('loads all module question banks with valid options', () => {
    assertQuestionBank('apple', appleCertPrepQuestions, 4, 40);
  });
});

describe('jamfProFoundationsQuestions', () => {
  it('loads all module question banks with valid options', () => {
    assertQuestionBank('jamf', jamfProFoundationsQuestions, 4, 40);
  });
});

describe('intuneIosEnrollmentQuestions', () => {
  it('loads all module question banks with valid options', () => {
    assertQuestionBank('intune', intuneIosEnrollmentQuestions, 4, 40);
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
