import { describe, expect, it } from 'vitest';

import { modulePointsFromScores } from '../src/services/gamification.service.js';

describe('quiz recap points estimate', () => {
  it('combines quiz and mini-game scores into module points', () => {
    expect(modulePointsFromScores(80, 100)).toBe(28);
    expect(modulePointsFromScores(100, 0)).toBe(10);
    expect(modulePointsFromScores(0, 50)).toBe(10);
  });

  it('matches the recap formula used before module completion toast', () => {
    const quizScorePercent = 67;
    const gameScorePercent = 100;
    const recapPoints = modulePointsFromScores(quizScorePercent, gameScorePercent);

    expect(recapPoints).toBe(27);
  });
});
