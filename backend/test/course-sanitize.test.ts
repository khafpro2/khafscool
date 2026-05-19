import { describe, expect, it } from 'vitest';

import { sanitizeCourse, sanitizeGame, sanitizeQuestion } from '../src/utils/course-sanitize.js';

describe('course sanitize', () => {
  it('removes quiz answers and game solutions from client payloads', () => {
    const sanitized = sanitizeCourse({
      id: 'course-1',
      slug: 'apple-cert-prep',
      track: 'APPLE',
      title: 'Parcours Apple',
      description: 'Description',
      sortOrder: 1,
      modules: [
        {
          id: 'module-1',
          courseId: 'course-1',
          slug: 'module-1',
          title: 'Unité 1',
          summary: 'Résumé',
          imageUrl: null,
          sortOrder: 1,
          questions: [
            {
              id: 'q1',
              moduleId: 'module-1',
              type: 'MULTIPLE_CHOICE',
              prompt: 'Question ?',
              options: [
                { id: 'a', label: 'A' },
                { id: 'b', label: 'B' },
              ],
              correctOption: 'b',
              explanation: 'Parce que B',
            },
          ],
          game: {
            id: 'game-1',
            moduleId: 'module-1',
            type: 'SCENARIO_FIX',
            scenario: 'Scénario',
            steps: [{ id: 1, label: 'Étape 1' }],
            solution: { correctOrder: [1] },
          },
        },
      ],
    });

    expect(sanitized.modules[0]?.questions[0]).toEqual({
      id: 'q1',
      type: 'MULTIPLE_CHOICE',
      prompt: 'Question ?',
      options: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
    });
    expect(sanitized.modules[0]?.game).toEqual({
      id: 'game-1',
      type: 'SCENARIO_FIX',
      scenario: 'Scénario',
      steps: [{ id: 1, label: 'Étape 1' }],
    });
    expect(sanitizeQuestion).toBeDefined();
    expect(sanitizeGame(null)).toBeNull();
  });
});
