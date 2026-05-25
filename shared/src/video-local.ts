import type { VideoProvider } from './video-embed';
import { getModuleVideoDubFr } from './video-dub-fr';
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

function getDubSourceVideoUrl(courseSlug: string, moduleSlug: string): string | null {
  const heygen = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug];
  if (!heygen?.sourceLocalFilename) return null;
  if (!getModuleVideoDubFr(courseSlug, moduleSlug)) return null;
  return `/media/videos/sources/${heygen.sourceLocalFilename}`;
}

/**
 * Vidéo pilote : MP4 HeyGen FR si prêt, sinon MP4 source EN + doublage TTS synchronisé, sinon placeholder.
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

  const dubSourceUrl = getDubSourceVideoUrl(courseSlug, moduleSlug);
  if (dubSourceUrl) {
    return {
      videoUrl: dubSourceUrl,
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
