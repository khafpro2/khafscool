#!/usr/bin/env node
/**
 * Audit des vidéos pilotes : MP4 HeyGen, sources, doublage TTS, config cours.
 * Usage : pnpm videos:audit
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PILOT_VIDEO_MODULES, getModulePedagogy } from '@ama/shared/course-content';
import { getModuleVideoDubFr } from '@ama/shared/video-dub-fr';
import {
  VIDEO_HEYGEN_FR_BY_MODULE,
  VIDEO_HEYGEN_FR_MANIFEST,
} from '@ama/shared/video-heygen-fr';
import { getPilotModuleVideoConfig, isModuleVideoHeyGenFrReady } from '@ama/shared/video-local';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const frDir = path.join(root, 'web/public/media/videos/fr');
const sourcesDir = path.join(root, 'web/public/media/videos/sources');

type Row = {
  course: string;
  module: string;
  mode: string;
  videoUrl: string;
  heygen: string;
  dub: string;
  source: string;
};

function fileSizeMb(filePath: string): string {
  if (!fs.existsSync(filePath)) return '—';
  const mb = fs.statSync(filePath).size / (1024 * 1024);
  return `${mb.toFixed(1)} Mo`;
}

function main() {
  const rows: Row[] = [];

  for (const { courseSlug, moduleSlug } of PILOT_VIDEO_MODULES) {
    const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
    const config = getPilotModuleVideoConfig(courseSlug, moduleSlug);
    const heygenEntry = VIDEO_HEYGEN_FR_BY_MODULE[courseSlug]?.[moduleSlug];
    const basename = heygenEntry?.basename;
    const heygenReady = isModuleVideoHeyGenFrReady(courseSlug, moduleSlug);
    const dub = getModuleVideoDubFr(courseSlug, moduleSlug);
    const dubSync = dub
      ? path.join(root, 'web/public/media/dubs', `${dub.basename}-sync.json`)
      : null;

    let mode = 'placeholder';
    if (heygenReady) mode = 'heygen-mp4';
    else if (config.videoProvider === 'mp4' && config.videoUrl.includes('/sources/')) mode = 'dub-sync';
    else if (config.videoProvider === 'mp4') mode = 'mp4-local';
    else if (config.videoProvider === 'youtube') mode = 'youtube-fr';

    const frMp4 = basename ? path.join(frDir, `${basename}.mp4`) : null;
    const sourceMp4 = heygenEntry?.sourceLocalFilename
      ? path.join(sourcesDir, heygenEntry.sourceLocalFilename)
      : null;

    rows.push({
      course: courseSlug,
      module: moduleSlug,
      mode,
      videoUrl: pedagogy?.videoUrl ?? '—',
      heygen: heygenReady ? `✅ ${fileSizeMb(frMp4!)}` : '—',
      dub: dubSync && fs.existsSync(dubSync) ? '✅ sync' : dub ? '⚠️ pas sync' : '—',
      source: sourceMp4 ? fileSizeMb(sourceMp4) : '—',
    });
  }

  console.log('\n📹 Audit vidéos pilotes (12 modules)\n');
  console.log(
    'Parcours'.padEnd(22) +
      'Module'.padEnd(32) +
      'Mode'.padEnd(12) +
      'HeyGen'.padEnd(14) +
      'Dub TTS'.padEnd(10) +
      'Source EN'
  );
  console.log('-'.repeat(100));

  for (const row of rows) {
    console.log(
      row.course.padEnd(22) +
        row.module.padEnd(32) +
        row.mode.padEnd(12) +
        row.heygen.padEnd(14) +
        row.dub.padEnd(10) +
        row.source
    );
  }

  const heygenCount = Object.keys(VIDEO_HEYGEN_FR_MANIFEST).filter(
    (key) => VIDEO_HEYGEN_FR_MANIFEST[key]?.ready
  ).length;
  console.log(`\nManifest HeyGen : ${heygenCount} MP4 prêt(s).`);
  console.log('Modes : heygen-mp4 | dub-sync (voix FR segmentée) | youtube-fr | placeholder\n');
}

main();
