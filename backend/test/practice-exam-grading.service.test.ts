import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computePracticeExamScorePercent } from '@ama/shared/practice-exam';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    question: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import {
  gradePracticeExamAnswers,
  normalizePracticeExamAnswers,
  signPracticeExamAttempt,
  verifyPracticeExamAttempt,
} from '../src/services/practice-exam.service.js';

describe('practice exam server-side grading', () => {
  beforeEach(() => {
    vi.mocked(prisma.question.findMany).mockReset();
  });

  it('signs and verifies attempt tokens for a user and slug', () => {
    const token = signPracticeExamAttempt('user-1', 'apple-cert-prep', ['q-1', 'q-2']);
    const payload = verifyPracticeExamAttempt(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.slug).toBe('apple-cert-prep');
    expect(payload.questionIds).toEqual(['q-1', 'q-2']);
  });

  it('rejects incomplete or unknown answers', () => {
    expect(() => normalizePracticeExamAnswers(['q-1', 'q-2'], [{ questionId: 'q-1', selectedOption: 'a' }])).toThrow(
      'INCOMPLETE_PRACTICE_EXAM_ANSWERS'
    );
    expect(() =>
      normalizePracticeExamAnswers(['q-1'], [{ questionId: 'q-2', selectedOption: 'b' }])
    ).toThrow('UNKNOWN_PRACTICE_EXAM_QUESTION');
    expect(() =>
      normalizePracticeExamAnswers(['q-1', 'q-2'], [
        { questionId: 'q-1', selectedOption: 'a' },
        { questionId: 'q-1', selectedOption: 'b' },
      ])
    ).toThrow('DUPLICATE_PRACTICE_EXAM_ANSWER');
  });

  it('grades answers from database correct options', async () => {
    vi.mocked(prisma.question.findMany).mockResolvedValue([
      { id: 'q-1', correctOption: 'a' },
      { id: 'q-2', correctOption: 'b' },
    ] as never);

    const result = await gradePracticeExamAnswers(
      ['q-1', 'q-2'],
      [
        { questionId: 'q-1', selectedOption: 'a' },
        { questionId: 'q-2', selectedOption: 'c' },
      ]
    );

    expect(result.correct).toBe(1);
    expect(result.total).toBe(2);
    expect(result.scorePercent).toBe(computePracticeExamScorePercent(1, 2));
  });

  it('rejects when questions are missing from database', async () => {
    vi.mocked(prisma.question.findMany).mockResolvedValue([{ id: 'q-1', correctOption: 'a' }] as never);

    await expect(
      gradePracticeExamAnswers(['q-1', 'q-2'], [
        { questionId: 'q-1', selectedOption: 'a' },
        { questionId: 'q-2', selectedOption: 'b' },
      ])
    ).rejects.toThrow('INVALID_PRACTICE_EXAM_QUESTIONS');
  });
});
