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

/** Somme des durées de lecture estimées pour plusieurs leçons. */
export function sumLessonReadingMinutes(contents: string[]): number {
  return contents.reduce(
    (total, content) => total + estimateReadingMinutes(countLessonWords(content)),
    0
  );
}

/** Bandeau hero parcours : « N modules · Q questions · ~M min de lecture » (+ vidéos si présentes). */
export function formatCourseHeroBanner(
  moduleCount: number,
  totalReadingMinutes: number,
  questionsPerModule = 10,
  videoModuleCount?: number
): string {
  const moduleLabel = moduleCount > 1 ? 'modules' : 'module';
  const base = `${moduleCount} ${moduleLabel} · ${questionsPerModule} questions · ~${totalReadingMinutes} min de lecture`;
  const videoSuffix = formatCourseHeroVideoSuffix(videoModuleCount ?? 0);
  return videoSuffix ? `${base} · ${videoSuffix}` : base;
}

/** Métadonnées catalogue : « ~M min · N modules · Q avec vidéo » ou « · Q questions ». */
export function formatTrailCatalogMeta(
  moduleCount: number,
  totalReadingMinutes: number,
  questionsPerModule = 10,
  videoModuleCount?: number
): string {
  const moduleLabel = moduleCount > 1 ? 'modules' : 'module';
  const videoPart =
    videoModuleCount && videoModuleCount > 0
      ? `${videoModuleCount} avec vidéo`
      : `${moduleCount * questionsPerModule} questions`;
  return `~${totalReadingMinutes} min · ${moduleCount} ${moduleLabel} · ${videoPart}`;
}

/** Suffixe hero parcours quand des unités ont une vidéo explicative. */
export function formatCourseHeroVideoSuffix(videoModuleCount: number): string | null {
  if (!videoModuleCount || videoModuleCount <= 0) return null;
  const label = videoModuleCount > 1 ? 'modules' : 'module';
  return `${videoModuleCount} ${label} avec vidéo explicative`;
}
