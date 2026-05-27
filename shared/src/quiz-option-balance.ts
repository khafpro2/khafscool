import type { QuizOption } from './quiz-content.js';

export type QuizOptionLengthBias = {
  /** Longueur de la bonne réponse en caractères. */
  correctLength: number;
  /** Longueur max des distracteurs. */
  maxDistractorLength: number;
  /** Écart correct − max(distracteurs). */
  gap: number;
  /** La bonne réponse est strictement la plus longue. */
  isCorrectLongest: boolean;
  /** Écart > 15 caractères (biais « réponse la plus longue » très probable). */
  isSevere: boolean;
};

export function measureQuizOptionLengthBias(question: {
  options: readonly QuizOption[];
  correctOption: string;
}): QuizOptionLengthBias {
  const lens = question.options.map((option) => option.label.length);
  const correctIndex = question.options.findIndex((option) => option.id === question.correctOption);
  const correctLength = lens[correctIndex] ?? 0;
  const distractorLengths = lens.filter((_, index) => index !== correctIndex);
  const maxDistractorLength = distractorLengths.length ? Math.max(...distractorLengths) : 0;
  const gap = correctLength - maxDistractorLength;

  return {
    correctLength,
    maxDistractorLength,
    gap,
    isCorrectLongest: correctLength > maxDistractorLength,
    isSevere: gap > 15,
  };
}
