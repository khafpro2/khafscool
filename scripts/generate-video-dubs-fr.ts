#!/usr/bin/env node
/**
 * Génère les MP3 de doublage français par segment (Microsoft Edge TTS).
 * Prérequis : pip install edge-tts  →  python3 -m edge_tts
 *
 * Usage : pnpm dub:generate
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getModuleVideoDubFrSyncUrl,
  listVideoDubFrEntries,
  type VideoDubFrSyncManifest,
} from '@ama/shared/video-dub-fr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'web/public/media/dubs');
const voice = process.env.DUB_VOICE ?? 'fr-FR-HenriNeural';
const pythonBin = process.env.PYTHON_BIN ?? 'python3';
const onlyModule = process.env.DUB_ONLY_MODULE;

function assertEdgeTts() {
  try {
    execFileSync(pythonBin, ['-m', 'edge_tts', '--version'], { stdio: 'pipe' });
  } catch {
    console.error('edge-tts manquant. Installez-le : pip install edge-tts');
    process.exit(1);
  }
}

function mp3DurationSec(filePath: string): number {
  const out = execFileSync('afinfo', [filePath], { encoding: 'utf8' });
  const match = out.match(/estimated duration:\s*([\d.]+)\s*sec/);
  if (!match) {
    throw new Error(`Durée introuvable pour ${filePath}`);
  }
  return parseFloat(match[1]);
}

assertEdgeTts();
fs.mkdirSync(outDir, { recursive: true });

const dubEntries = listVideoDubFrEntries().filter((entry) => {
  if (!onlyModule) return true;
  const [courseSlug, moduleSlug] = onlyModule.includes('/') ? onlyModule.split('/') : ['', onlyModule];
  if (courseSlug && moduleSlug) {
    return entry.courseSlug === courseSlug && entry.moduleSlug === moduleSlug;
  }
  return entry.moduleSlug === onlyModule;
});

for (const entry of dubEntries) {
  const manifest: VideoDubFrSyncManifest = {
    basename: entry.basename,
    segments: [],
  };

  console.log(`\n${entry.courseSlug}/${entry.moduleSlug} (${entry.segments.length} segments)`);

  for (let i = 0; i < entry.segments.length; i += 1) {
    const segment = entry.segments[i];
    const index = String(i + 1).padStart(2, '0');
    const filename = `${entry.basename}-${index}.mp3`;
    const outPath = path.join(outDir, filename);
    const txtPath = path.join(outDir, `${filename}.txt`);
    const publicUrl = `/media/dubs/${filename}`;

    fs.writeFileSync(txtPath, segment.script, 'utf8');
    console.log(`  [${index}] t=${segment.atSec}s → ${filename}`);
    execFileSync(
      pythonBin,
      ['-m', 'edge_tts', '--voice', voice, '-f', txtPath, '--write-media', outPath],
      { stdio: 'inherit' }
    );
    fs.unlinkSync(txtPath);

    const durationSec = mp3DurationSec(outPath);
    manifest.segments.push({
      atSec: segment.atSec,
      url: publicUrl,
      durationSec: Math.round(durationSec * 100) / 100,
    });
  }

  const manifestPath = path.join(outDir, `${entry.basename}-sync.json`);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`  manifest → ${getModuleVideoDubFrSyncUrl(entry)}`);
}

console.log('\nDoublages français synchronisés générés.');
