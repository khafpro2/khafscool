import { describe, expect, it } from 'vitest';
import {
  getQuizOptionDisplayLetter,
  getQuizQuestionTypeMeta,
  hashSeedString,
  listIncorrectQuestionIds,
  shuffleQuizQuestionOptions,
  shuffleWithSeed,
  truncateQuizPrompt,
  withShuffledQuizOptions,
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

  it('shuffles options deterministically per question id', () => {
    const options = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Bravo' },
      { id: 'c', label: 'Charlie' },
      { id: 'd', label: 'Delta' },
    ];

    const first = shuffleQuizQuestionOptions(options, 'question-42');
    const second = shuffleQuizQuestionOptions(options, 'question-42');
    const other = shuffleQuizQuestionOptions(options, 'question-99');

    expect(first.map((option) => option.id)).toEqual(second.map((option) => option.id));
    expect(first.map((option) => option.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(first.map((option) => option.id)).not.toEqual(options.map((option) => option.id));
    expect(other.map((option) => option.id)).not.toEqual(first.map((option) => option.id));
  });

  it('preserves option ids when shuffling questions', () => {
    const questions = withShuffledQuizOptions([
      {
        id: 'q1',
        options: [
          { id: 'a', label: 'Un' },
          { id: 'b', label: 'Deux' },
        ],
      },
    ]);

    expect(questions[0]?.options.map((option) => option.id).sort()).toEqual(['a', 'b']);
  });

  it('maps display letters after shuffle', () => {
    const shuffled = shuffleWithSeed(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      'seed'
    );
    const correctId = shuffled[1]?.id ?? 'a';
    expect(getQuizOptionDisplayLetter(shuffled, correctId)).toBe('B');
  });

  it('hashSeedString is stable', () => {
    expect(hashSeedString('demo-q1')).toBe(hashSeedString('demo-q1'));
    expect(hashSeedString('demo-q1')).not.toBe(hashSeedString('demo-q2'));
  });
});
