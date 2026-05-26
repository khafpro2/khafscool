import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getModuleVideoHeyGenFrPublicUrl,
  listVideoHeyGenFrEntries,
  type VideoHeyGenFrManifest,
} from '@ama/shared/video-heygen-fr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'web/public/media/videos/fr');
const manifestTsPath = path.join(root, 'shared/src/video-heygen-fr-manifest.ts');

/** Lit les jobs JSON et construit le manifest à partir des MP4 présents sur disque. */
export function buildHeyGenManifestFromDisk(): VideoHeyGenFrManifest {
  const manifest: VideoHeyGenFrManifest = {};
  const jobMeta = new Map<string, { videoTranslationId?: string; generatedAt?: string }>();

  for (const jobsFile of ['heygen-jobs.json', 'heygen-generate-jobs.json']) {
    const jobsPath = path.join(outDir, jobsFile);
    if (!fs.existsSync(jobsPath)) continue;
    const parsed = JSON.parse(fs.readFileSync(jobsPath, 'utf8')) as {
      jobs?: Array<{
        basename: string;
        videoTranslationId?: string;
        videoId?: string;
        updatedAt?: string;
      }>;
    };
    for (const job of parsed.jobs ?? []) {
      jobMeta.set(job.basename, {
        videoTranslationId: job.videoTranslationId ?? job.videoId,
        generatedAt: job.updatedAt,
      });
    }
  }

  for (const entry of listVideoHeyGenFrEntries()) {
    const mp4Path = path.join(outDir, `${entry.basename}.mp4`);
    if (!fs.existsSync(mp4Path)) continue;
    const meta = jobMeta.get(entry.basename);
    manifest[entry.basename] = {
      ready: true,
      url: getModuleVideoHeyGenFrPublicUrl(entry),
      videoTranslationId: meta?.videoTranslationId,
      generatedAt: meta?.generatedAt ?? new Date(fs.statSync(mp4Path).mtime).toISOString(),
    };
  }

  return manifest;
}

export function writeHeyGenManifestTs(manifest: VideoHeyGenFrManifest, source: string) {
  const content = `/** Généré par ${source} — ne pas éditer à la main. */
import type { VideoHeyGenFrManifest } from './video-heygen-fr';

export const VIDEO_HEYGEN_FR_MANIFEST: VideoHeyGenFrManifest = ${JSON.stringify(manifest, null, 2)} as const;
`;
  fs.writeFileSync(manifestTsPath, content, 'utf8');
}

export function syncHeyGenManifestFromDisk(source: string) {
  writeHeyGenManifestTs(buildHeyGenManifestFromDisk(), source);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')) {
  syncHeyGenManifestFromDisk('pnpm heygen:sync');
  const manifest = buildHeyGenManifestFromDisk();
  const count = Object.keys(manifest).length;
  console.log(count ? `Manifest HeyGen : ${count} vidéo(s) prête(s).` : 'Aucun MP4 HeyGen trouvé dans web/public/media/videos/fr/');
}
