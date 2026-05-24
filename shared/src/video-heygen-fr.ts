import { getModulePedagogy, PILOT_VIDEO_MODULES } from './course-content';
import { VIDEO_HEYGEN_FR_MANIFEST } from './video-heygen-fr-manifest';

export type VideoHeyGenFrEntry = {
  /** Nom de base du fichier MP4 dans web/public/media/videos/fr/ */
  basename: string;
  /** URL YouTube source (anglais) — référence pour l’import HeyGen. */
  sourceYouTubeUrl: string;
  /** Titre affiché dans HeyGen / suivi des jobs. */
  heygenTitle: string;
};

export const VIDEO_HEYGEN_FR_BY_MODULE: Record<string, Record<string, VideoHeyGenFrEntry>> = {
  'apple-cert-prep': {
    'device-support-basics': {
      basename: 'apple-device-support-basics-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=qrQyL5-SWFg',
      heygenTitle: 'Apple MDM Academy — ABM et enrôlement MDM (FR)',
    },
  },
  'jamf-pro-foundations': {
    'smart-groups-policies': {
      basename: 'jamf-smart-groups-policies-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=_g-0V2AFCW0',
      heygenTitle: 'Apple MDM Academy — Jamf Pro et ABM (FR)',
    },
  },
  'intune-ios-enrollment': {
    'ade-enrollment-basics': {
      basename: 'intune-ade-enrollment-basics-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=GrSaEcbyGh8',
      heygenTitle: 'Apple MDM Academy — Intune ADE et ABM (FR)',
    },
  },
};

export type VideoHeyGenFrManifestEntry = {
  ready: boolean;
  url: string;
  videoTranslationId?: string;
  generatedAt?: string;
};

export type VideoHeyGenFrManifest = Record<string, VideoHeyGenFrManifestEntry>;

export { VIDEO_HEYGEN_FR_MANIFEST } from './video-heygen-fr-manifest';

export function getModuleVideoHeyGenFr(
  courseSlug: string,
  moduleSlug: string
): (VideoHeyGenFrEntry & { url: string | null }) | undefined {
  const entry = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug];
  if (!entry) return undefined;

  const manifest = VIDEO_HEYGEN_FR_MANIFEST[entry.basename];
  const url = manifest?.ready ? manifest.url : null;
  return { ...entry, url };
}

export function getModuleVideoHeyGenFrPublicUrl(entry: VideoHeyGenFrEntry): string {
  return `/media/videos/fr/${entry.basename}.mp4`;
}

export function listVideoHeyGenFrEntries(): Array<
  VideoHeyGenFrEntry & { courseSlug: string; moduleSlug: string; sourceVideoUrl: string | null }
> {
  const entries: Array<
    VideoHeyGenFrEntry & { courseSlug: string; moduleSlug: string; sourceVideoUrl: string | null }
  > = [];

  for (const { courseSlug, moduleSlug } of PILOT_VIDEO_MODULES) {
    const entry = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug];
    if (!entry) continue;
    const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
    entries.push({
      courseSlug,
      moduleSlug,
      ...entry,
      sourceVideoUrl: pedagogy?.videoUrl ?? entry.sourceYouTubeUrl,
    });
  }

  return entries;
}
