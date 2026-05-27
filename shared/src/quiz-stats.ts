export type QuizAnswerResult = {
  correct: boolean;
};

export type QuizStatsSummary = {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
};

export function computeQuizScorePercent(
  totalQuestions: number,
  questionResults: Record<string, QuizAnswerResult>
): number {
  if (!totalQuestions) return 0;
  const checkedCount = Object.keys(questionResults).length;
  if (!checkedCount) return 0;
  const correct = Object.values(questionResults).filter((result) => result.correct).length;
  return Math.round((correct / totalQuestions) * 100);
}

export function countCorrectAnswers(questionResults: Record<string, QuizAnswerResult>): number {
  return Object.values(questionResults).filter((result) => result.correct).length;
}

export function summarizeQuizStats(
  totalQuestions: number,
  questionResults: Record<string, QuizAnswerResult>,
  passPercent = 50
): QuizStatsSummary {
  const answeredCount = Object.keys(questionResults).length;
  const correctCount = countCorrectAnswers(questionResults);
  const scorePercent = computeQuizScorePercent(totalQuestions, questionResults);
  const requiredCorrect =
    totalQuestions > 0 ? Math.ceil((passPercent / 100) * totalQuestions) : 0;

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    scorePercent,
    passed: totalQuestions > 0 && correctCount >= requiredCorrect,
  };
}
