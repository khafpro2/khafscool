/** Nombre de questions tirées aléatoirement pour l'examen blanc. */
export const PRACTICE_EXAM_QUESTION_COUNT = 10;

export type PracticeExamQuestionSource = {
  id: string;
  moduleId: string;
};

/** Fisher-Yates puis sélection des N premières entrées. */
export function pickPracticeExamQuestions<T extends PracticeExamQuestionSource>(
  pool: T[],
  count = PRACTICE_EXAM_QUESTION_COUNT,
  random = Math.random
): T[] {
  if (pool.length <= count) return [...pool];

  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export function computePracticeExamScorePercent(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}
