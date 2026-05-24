#!/usr/bin/env node
/**
 * Traduction vidéo FR via HeyGen Video Translate API (v3).
 *
 * Prérequis :
 *   - Compte HeyGen avec clé API : https://app.heygen.com/settings?nav=API
 *   - HEYGEN_API_KEY dans .env à la racine
 *   - URL HTTPS publique du fichier source (MP4 direct, pas une page YouTube)
 *     → variable HEYGEN_SOURCE_VIDEO_URL ou HEYGEN_SOURCE_<BASENAME>_URL
 *
 * Usage :
 *   pnpm heygen:translate              # soumet + attend + télécharge
 *   pnpm heygen:translate -- --status  # état des jobs en cours
 *
 * Alternative manuelle (sans API) :
 *   1. https://app.heygen.com → Video Translate
 *   2. Importer la vidéo source (téléchargée depuis YouTube ou enregistrement écran)
 *   3. Langue cible : French (France), mode Precision
 *   4. Exporter le MP4 dans web/public/media/videos/fr/<basename>.mp4
 *   5. pnpm heygen:register -- --basename apple-device-support-basics-fr
 */
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
const jobsPath = path.join(outDir, 'heygen-jobs.json');
const manifestTsPath = path.join(root, 'shared/src/video-heygen-fr-manifest.ts');

const API_BASE = 'https://api.heygen.com/v3';
const OUTPUT_LANGUAGE = process.env.HEYGEN_OUTPUT_LANGUAGE ?? 'French (France)';
const POLL_MS = Number(process.env.HEYGEN_POLL_MS ?? 30_000);

type HeyGenJob = {
  courseSlug: string;
  moduleSlug: string;
  basename: string;
  title: string;
  sourceVideoUrl: string;
  videoTranslationId?: string;
  status?: string;
  error?: string;
  outputVideoUrl?: string;
  updatedAt?: string;
};

type HeyGenJobsFile = {
  jobs: HeyGenJob[];
};

function loadEnvFile() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireApiKey(): string {
  const key = process.env.HEYGEN_API_KEY?.trim();
  if (!key) {
    console.error('HEYGEN_API_KEY manquant. Ajoutez-le dans .env à la racine du monorepo.');
    console.error('Clé API : https://app.heygen.com/settings?nav=API');
    process.exit(1);
  }
  return key;
}

function sourceUrlForBasename(basename: string): string | null {
  const specific = process.env[`HEYGEN_SOURCE_${basename.replace(/-/g, '_').toUpperCase()}_URL`];
  if (specific?.trim()) return specific.trim();
  const generic = process.env.HEYGEN_SOURCE_VIDEO_URL?.trim();
  return generic || null;
}

function readJobs(): HeyGenJobsFile {
  if (!fs.existsSync(jobsPath)) return { jobs: [] };
  return JSON.parse(fs.readFileSync(jobsPath, 'utf8')) as HeyGenJobsFile;
}

function writeJobs(data: HeyGenJobsFile) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(jobsPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function heygenFetch<T>(apiKey: string, route: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${route}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...(init?.headers ?? {}),
    },
  });

  const body = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    const message = body.error?.message ?? response.statusText;
    throw new Error(`${response.status} ${route}: ${message}`);
  }
  return body;
}

function writeManifestTs(manifest: VideoHeyGenFrManifest) {
  const content = `/** Généré par pnpm heygen:translate — ne pas éditer à la main. */
import type { VideoHeyGenFrManifest } from './video-heygen-fr';

export const VIDEO_HEYGEN_FR_MANIFEST: VideoHeyGenFrManifest = ${JSON.stringify(manifest, null, 2)} as const;
`;
  fs.writeFileSync(manifestTsPath, content, 'utf8');
}

function syncManifestFromJobs(jobs: HeyGenJob[]) {
  const manifest: VideoHeyGenFrManifest = {};
  for (const job of jobs) {
    const mp4Path = path.join(outDir, `${job.basename}.mp4`);
    if (fs.existsSync(mp4Path)) {
      manifest[job.basename] = {
        ready: true,
        url: getModuleVideoHeyGenFrPublicUrl({ basename: job.basename, sourceYouTubeUrl: '', heygenTitle: '' }),
        videoTranslationId: job.videoTranslationId,
        generatedAt: job.updatedAt ?? new Date().toISOString(),
      };
    }
  }
  writeManifestTs(manifest);
}

async function submitJobs(apiKey: string) {
  const store = readJobs();
  const byBasename = new Map(store.jobs.map((job) => [job.basename, job]));

  for (const entry of listVideoHeyGenFrEntries()) {
    const existing = byBasename.get(entry.basename);
    if (existing?.videoTranslationId && existing.status !== 'failed') {
      console.log(`⏭  ${entry.basename} — job existant ${existing.videoTranslationId}`);
      continue;
    }

    const sourceVideoUrl = sourceUrlForBasename(entry.basename);
    if (!sourceVideoUrl) {
      console.warn(
        `⚠️  ${entry.basename} — pas d'URL source. Définissez HEYGEN_SOURCE_${entry.basename.replace(/-/g, '_').toUpperCase()}_URL`
      );
      console.warn(`    YouTube (référence) : ${entry.sourceYouTubeUrl}`);
      continue;
    }

    console.log(`📤 Soumission HeyGen : ${entry.heygenTitle}`);
    const payload = {
      video: { type: 'url', url: sourceVideoUrl },
      output_languages: [OUTPUT_LANGUAGE],
      title: entry.heygenTitle,
      input_language: 'English',
      translate_audio_only: false,
      mode: 'precision',
      enable_dynamic_duration: true,
      keep_the_same_format: true,
      enable_watermark: false,
    };

    const result = await heygenFetch<{ data?: { video_translation_ids?: string[] } }>(
      apiKey,
      '/video-translations',
      { method: 'POST', body: JSON.stringify(payload) }
    );

    const videoTranslationId = result.data?.video_translation_ids?.[0];
    if (!videoTranslationId) {
      throw new Error(`Réponse HeyGen sans video_translation_id pour ${entry.basename}`);
    }

    const job: HeyGenJob = {
      courseSlug: entry.courseSlug,
      moduleSlug: entry.moduleSlug,
      basename: entry.basename,
      title: entry.heygenTitle,
      sourceVideoUrl,
      videoTranslationId,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    };
    byBasename.set(entry.basename, job);
    console.log(`   → ${videoTranslationId}`);
  }

  writeJobs({ jobs: [...byBasename.values()] });
}

async function pollAndDownload(apiKey: string) {
  const store = readJobs();
  if (!store.jobs.length) {
    console.log('Aucun job HeyGen. Lancez d’abord la soumission.');
    return;
  }

  for (const job of store.jobs) {
    if (!job.videoTranslationId) continue;
    if (job.status === 'completed' && fs.existsSync(path.join(outDir, `${job.basename}.mp4`))) {
      continue;
    }

    console.log(`🔍 ${job.basename} (${job.videoTranslationId})…`);
    const detail = await heygenFetch<{
      data?: { status?: string; video_url?: string; error?: { message?: string } };
    }>(apiKey, `/video-translations/${job.videoTranslationId}`);

    const status = detail.data?.status ?? 'unknown';
    job.status = status;
    job.updatedAt = new Date().toISOString();

    if (status === 'failed') {
      job.error = detail.data?.error?.message ?? 'Échec HeyGen';
      console.error(`   ❌ ${job.error}`);
      continue;
    }

    if (status !== 'completed' || !detail.data?.video_url) {
      console.log(`   ⏳ ${status}`);
      continue;
    }

    const downloadUrl = detail.data.video_url;
    job.outputVideoUrl = downloadUrl;
    console.log(`   ⬇️  Téléchargement MP4…`);

    const videoResponse = await fetch(downloadUrl);
    if (!videoResponse.ok) {
      throw new Error(`Téléchargement échoué (${videoResponse.status})`);
    }

    const buffer = Buffer.from(await videoResponse.arrayBuffer());
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${job.basename}.mp4`), buffer);
    job.status = 'completed';
    console.log(`   ✅ ${job.basename}.mp4`);
  }

  writeJobs(store);
  syncManifestFromJobs(store.jobs);
}

function registerLocalBasename(basename: string) {
  const mp4Path = path.join(outDir, `${basename}.mp4`);
  if (!fs.existsSync(mp4Path)) {
    console.error(`Fichier introuvable : ${mp4Path}`);
    process.exit(1);
  }

  const store = readJobs();
  const job =
    store.jobs.find((item) => item.basename === basename) ??
    ({
      courseSlug: '',
      moduleSlug: '',
      basename,
      title: basename,
      sourceVideoUrl: 'manual',
      status: 'completed',
      updatedAt: new Date().toISOString(),
    } satisfies HeyGenJob);

  job.status = 'completed';
  job.updatedAt = new Date().toISOString();
  const others = store.jobs.filter((item) => item.basename !== basename);
  writeJobs({ jobs: [...others, job] });
  syncManifestFromJobs([job]);
  console.log(`Enregistré : ${basename} → ${getModuleVideoHeyGenFrPublicUrl({ basename, sourceYouTubeUrl: '', heygenTitle: '' })}`);
}

function printStatus() {
  const store = readJobs();
  if (!store.jobs.length) {
    console.log('Aucun job HeyGen enregistré.');
    return;
  }
  for (const job of store.jobs) {
    const local = fs.existsSync(path.join(outDir, `${job.basename}.mp4`)) ? '✅ local' : '—';
    console.log(`${job.basename}: ${job.status ?? 'unknown'} ${local}`);
    if (job.videoTranslationId) console.log(`  id: ${job.videoTranslationId}`);
    if (job.error) console.log(`  error: ${job.error}`);
  }
}

async function main() {
  loadEnvFile();
  fs.mkdirSync(outDir, { recursive: true });

  const args = process.argv.slice(2);
  if (args.includes('--status')) {
    printStatus();
    return;
  }

  const registerIdx = args.indexOf('--basename');
  if (registerIdx !== -1) {
    const basename = args[registerIdx + 1];
    if (!basename) {
      console.error('Usage: pnpm heygen:register -- --basename <basename>');
      process.exit(1);
    }
    registerLocalBasename(basename);
    return;
  }

  const apiKey = requireApiKey();
  await submitJobs(apiKey);

  let pending = true;
  while (pending) {
    await pollAndDownload(apiKey);
    const store = readJobs();
    pending = store.jobs.some(
      (job) =>
        job.videoTranslationId &&
        job.status !== 'completed' &&
        job.status !== 'failed' &&
        !fs.existsSync(path.join(outDir, `${job.basename}.mp4`))
    );
    if (pending) {
      console.log(`\nNouvelle vérification dans ${POLL_MS / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  }

  printStatus();
  console.log('\nTerminé. Rechargez le parcours : les vidéos HeyGen remplacent le doublage TTS.');
}

void main();
