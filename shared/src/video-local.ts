import { VIDEO_HEYGEN_FR_BY_MODULE } from './video-heygen-fr';

/** Chemin public du MP4 FR hébergé dans web/public/media/videos/fr/ */
export function getModuleVideoLocalPublicUrl(courseSlug: string, moduleSlug: string): string {
  const heygen = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug];
  if (heygen) {
    return `/media/videos/fr/${heygen.basename}.mp4`;
  }
  return `/media/videos/fr/${courseSlug}-${moduleSlug}-fr.mp4`;
}
