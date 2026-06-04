/** Nombre de questions tirées aléatoirement pour l'examen blanc. */
export const PRACTICE_EXAM_QUESTION_COUNT = 10;

/** Durée indicative (~1,5 min / question) pour l'affichage du minuteur web. */
export const PRACTICE_EXAM_RECOMMENDED_MINUTES = 15;

/** Seuil de réussite de l'examen blanc (badge + quête hebdo). */
export const PRACTICE_EXAM_PASS_PERCENT = 70;

/** Badge débloqué une fois lors d'un examen blanc ≥ PRACTICE_EXAM_PASS_PERCENT. */
export const PRACTICE_EXAM_PASS_BADGE = 'practice-exam-pass';

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

/** Affiche mm:ss pour le minuteur d'examen blanc. */
export function formatPracticeExamElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isPracticeExamOverRecommendedTime(elapsedSeconds: number): boolean {
  return elapsedSeconds > PRACTICE_EXAM_RECOMMENDED_MINUTES * 60;
}
