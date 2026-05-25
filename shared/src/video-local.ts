import type { VideoProvider } from './video-embed';
import { VIDEO_HEYGEN_FR_BY_MODULE } from './video-heygen-fr';
import { VIDEO_HEYGEN_FR_MANIFEST } from './video-heygen-fr-manifest';

export type PilotModuleVideoConfig = {
  videoUrl: string;
  videoProvider: VideoProvider;
  videoSourceLanguage: 'fr';
};

/** Chemin public du MP4 FR hébergé dans web/public/media/videos/fr/ */
export function getModuleVideoLocalPublicUrl(courseSlug: string, moduleSlug: string): string {
  const heygen = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug];
  if (heygen) {
    return `/media/videos/fr/${heygen.basename}.mp4`;
  }
  return `/media/videos/fr/${courseSlug}-${moduleSlug}-fr.mp4`;
}

export function isModuleVideoHeyGenFrReady(courseSlug: string, moduleSlug: string): boolean {
  const basename = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug]?.basename;
  if (!basename) return false;
  return VIDEO_HEYGEN_FR_MANIFEST[basename]?.ready === true;
}

/**
 * Vidéo pilote : MP4 français si HeyGen prêt, sinon placeholder animé FR (jamais YouTube EN).
 */
export function getPilotModuleVideoConfig(
  courseSlug: string,
  moduleSlug: string
): PilotModuleVideoConfig {
  const basename = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug]?.basename;
  if (basename && VIDEO_HEYGEN_FR_MANIFEST[basename]?.ready === true) {
    return {
      videoUrl: `/media/videos/fr/${basename}.mp4`,
      videoProvider: 'mp4',
      videoSourceLanguage: 'fr',
    };
  }
  return {
    videoUrl: 'placeholder',
    videoProvider: 'placeholder',
    videoSourceLanguage: 'fr',
  };
}
