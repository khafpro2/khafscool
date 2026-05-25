import { VIDEO_HEYGEN_FR_MANIFEST } from './video-heygen-fr-manifest';
export type VideoHeyGenFrEntry = {
  /** Nom de base du fichier MP4 dans web/public/media/videos/fr/ */
  basename: string;
  /** URL YouTube source (anglais) — pour téléchargement / import HeyGen. */
  sourceYouTubeUrl?: string;
  /** Fichier MP4 anglais dans web/public/media/videos/sources/ */
  sourceLocalFilename?: string;
  /** Titre affiché dans HeyGen / suivi des jobs. */
  heygenTitle: string;
};

export const VIDEO_HEYGEN_FR_BY_MODULE: Record<string, Record<string, VideoHeyGenFrEntry>> = {
  'apple-cert-prep': {
    'device-support-basics': {
      basename: 'apple-device-support-basics-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=_g-0V2AFCW0',
      sourceLocalFilename: 'device-support-basics-ade-en.heygen.mp4',
      heygenTitle: 'Apple MDM Academy — ABM, supervision et ADE (FR)',
    },
    'ios-troubleshooting': {
      basename: 'apple-ios-troubleshooting-fr',
      heygenTitle: 'Apple MDM Academy — Dépannage iOS en environnement géré (FR)',
    },
    'acmt-exam-prep': {
      basename: 'apple-acmt-exam-prep-fr',
      heygenTitle: 'Formation Apple Device Support Professional',
    },
    'apps-vpp-management': {
      basename: 'apple-apps-vpp-management-fr',
      heygenTitle: 'Apple MDM Academy — Apps VPP et apps gérées (FR)',
    },
  },
  'jamf-pro-foundations': {
    'inventory-basics': {
      basename: 'jamf-inventory-basics-fr',
      heygenTitle: 'Apple MDM Academy — Inventaire Jamf Pro (FR)',
    },
    'enrollment-apple-integration': {
      basename: 'jamf-enrollment-apple-integration-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=_g-0V2AFCW0',
      sourceLocalFilename: 'device-support-basics-ade-en.mp4',
      heygenTitle: 'Apple MDM Academy — Enrôlement ABM et Jamf Pro (FR)',
    },
    'api-automation-advanced-policies': {
      basename: 'jamf-api-automation-fr',
      heygenTitle: 'Apple MDM Academy — Automatisation API Jamf Pro (FR)',
    },
  },
  'intune-ios-enrollment': {
    'ade-enrollment-basics': {
      basename: 'intune-ade-enrollment-basics-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=GrSaEcbyGh8',
      sourceLocalFilename: 'intune-ade-enrollment-basics-en.upload.mp4',
      heygenTitle: 'Apple MDM Academy — Intune ADE et ABM (FR)',
    },
    'compliance-policies': {
      basename: 'intune-compliance-policies-fr',
      heygenTitle: 'Apple MDM Academy — Conformité Intune iOS (FR)',
    },
    'app-protection-conditional-access': {
      basename: 'intune-app-protection-fr',
      sourceYouTubeUrl: 'https://www.youtube.com/watch?v=F4PESZiEQhU',
      heygenTitle: 'Apple MDM Academy — App Protection et Conditional Access (FR)',
    },
    'vpp-abm-business-apps': {
      basename: 'intune-vpp-abm-business-apps-fr',
      heygenTitle: 'Apple MDM Academy — VPP ABM et apps métier Intune (FR)',
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

export { VIDEO_HEYGEN_FR_MANIFEST };

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
  VideoHeyGenFrEntry & { courseSlug: string; moduleSlug: string }
> {
  const entries: Array<VideoHeyGenFrEntry & { courseSlug: string; moduleSlug: string }> = [];

  for (const [courseSlug, modules] of Object.entries(VIDEO_HEYGEN_FR_BY_MODULE)) {
    for (const [moduleSlug, entry] of Object.entries(modules)) {
      entries.push({ courseSlug, moduleSlug, ...entry });
    }
  }

  return entries;
}
