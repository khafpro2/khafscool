import { describe, expect, it } from 'vitest';
import {
  computePracticeExamScorePercent,
  pickPracticeExamQuestions,
  PRACTICE_EXAM_PASS_BADGE,
  PRACTICE_EXAM_PASS_PERCENT,
  PRACTICE_EXAM_QUESTION_COUNT,
} from '@ama/shared/practice-exam';

describe('practice exam', () => {
  it('defines pass threshold and badge slug', () => {
    expect(PRACTICE_EXAM_PASS_PERCENT).toBe(70);
    expect(PRACTICE_EXAM_PASS_BADGE).toBe('practice-exam-pass');
  });

  it('picks exactly 10 questions from a larger pool', () => {
    const pool = Array.from({ length: 40 }, (_, index) => ({
      id: `q-${index}`,
      moduleId: `m-${Math.floor(index / 10)}`,
    }));

    const picked = pickPracticeExamQuestions(pool);
    expect(picked).toHaveLength(PRACTICE_EXAM_QUESTION_COUNT);
    expect(new Set(picked.map((item) => item.id)).size).toBe(PRACTICE_EXAM_QUESTION_COUNT);
  });

  it('returns the full pool when fewer than 10 questions exist', () => {
    const pool = [{ id: 'q1', moduleId: 'm1' }];
    expect(pickPracticeExamQuestions(pool)).toEqual(pool);
  });

  it('computes score percent rounded', () => {
    expect(computePracticeExamScorePercent(7, 10)).toBe(70);
    expect(computePracticeExamScorePercent(0, 10)).toBe(0);
  });
});
