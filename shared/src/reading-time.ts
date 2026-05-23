/** Vitesse de lecture moyenne pour les leçons MDM (mots/min). */
export const READING_WORDS_PER_MINUTE = 200;

/** Estime la durée de lecture en minutes (~200 mots/min, minimum 1 min). */
export function estimateReadingMinutes(wordCount: number): number {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / READING_WORDS_PER_MINUTE));
}

/** Compte les mots d’un contenu markdown de leçon (approximation sans syntaxe). */
export function countLessonWords(content: string): number {
  const normalized = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return 0;
  return normalized.split(' ').filter(Boolean).length;
}

/** Libellé FR pour badge de durée de lecture. */
export function formatReadingTimeLabel(wordCount: number): string {
  return `~${estimateReadingMinutes(wordCount)} min de lecture`;
}
