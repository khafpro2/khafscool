#!/usr/bin/env node
/**
 * Traduction vidéo FR via HeyGen Video Translate API (v3).
 *
 * Prérequis :
 *   - Compte HeyGen avec clé API : https://app.heygen.com/settings?nav=API
 *   - HEYGEN_API_KEY dans .env à la racine
 *   - URL HTTPS publique du fichier source (MP4 direct, pas une page YouTube)
 *     → variable HEYGEN_SOURCE_VIDEO_URL ou HEYGEN_SOURCE_<BASENAME>_URL
 *   - Ou fichier local dans web/public/media/videos/sources/ (upload HeyGen automatique)
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
 *   5. pnpm heygen:register -- --basename jamf-enrollment-apple-integration-fr
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getModuleVideoHeyGenFrPublicUrl,
  listVideoHeyGenFrEntries,
} from '@ama/shared/video-heygen-fr';
import { syncHeyGenManifestFromDisk } from './heygen-manifest-sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'web/public/media/videos/fr');
const sourcesDir = path.join(root, 'web/public/media/videos/sources');
const jobsPath = path.join(outDir, 'heygen-jobs.json');

const API_BASE = 'https://api.heygen.com/v3';
const HEYGEN_MAX_ASSET_BYTES = 32 * 1024 * 1024;
const OUTPUT_LANGUAGE = process.env.HEYGEN_OUTPUT_LANGUAGE ?? 'French (France)';
const POLL_MS = Number(process.env.HEYGEN_POLL_MS ?? 30_000);
/** true = garde l’image source, traduit l’audio seulement (pas d’avatar HeyGen). */
const TRANSLATE_AUDIO_ONLY = process.env.HEYGEN_TRANSLATE_AUDIO_ONLY !== 'false';
const TRANSLATE_MODE = process.env.HEYGEN_TRANSLATE_MODE ?? 'speed';
/** Voix clone pour Video Translate — uniquement si HEYGEN_BRAND_VOICE_ID est défini (Video Agent utilise HEYGEN_VOICE_ID). */
const BRAND_VOICE_ID = process.env.HEYGEN_BRAND_VOICE_ID?.trim() || '';

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

type VideoAssetInput =
  | { type: 'url'; url: string; label: string }
  | { type: 'asset_id'; asset_id: string; label: string };

function isLocalWebUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function resolveLocalSourcePath(filename: string): string | null {
  const primary = path.join(sourcesDir, filename);
  if (!fs.existsSync(primary)) return null;

  const stat = fs.statSync(primary);
  if (stat.size <= HEYGEN_MAX_ASSET_BYTES) return primary;

  const uploadVariant = primary.replace(/\.mp4$/i, '.upload.mp4');
  if (fs.existsSync(uploadVariant) && fs.statSync(uploadVariant).size <= HEYGEN_MAX_ASSET_BYTES) {
    return uploadVariant;
  }

  return stat.size <= HEYGEN_MAX_ASSET_BYTES ? primary : null;
}

async function uploadHeyGenAsset(apiKey: string, filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length > HEYGEN_MAX_ASSET_BYTES) {
    throw new Error(
      `Fichier trop volumineux pour HeyGen (${Math.round(buffer.length / 1024 / 1024)} Mo > 32 Mo) : ${filePath}`
    );
  }

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'video/mp4' }), path.basename(filePath));

  const response = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: form,
  });

  const body = (await response.json()) as {
    data?: { asset_id?: string };
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(`${response.status} /assets: ${body.error?.message ?? response.statusText}`);
  }

  const assetId = body.data?.asset_id;
  if (!assetId) throw new Error(`Réponse HeyGen sans asset_id pour ${filePath}`);
  return assetId;
}

async function resolveSourceVideo(
  apiKey: string,
  basename: string,
  sourceLocalFilename?: string
): Promise<VideoAssetInput | null> {
  const envUrl = sourceUrlForBasename(basename);
  if (envUrl) return { type: 'url', url: envUrl, label: envUrl };

  const webUrl = process.env.WEB_URL?.trim();
  if (sourceLocalFilename && webUrl && !isLocalWebUrl(webUrl)) {
    const publicUrl = `${webUrl.replace(/\/+$/, '')}/media/videos/sources/${sourceLocalFilename}`;
    return { type: 'url', url: publicUrl, label: publicUrl };
  }

  if (!sourceLocalFilename) return null;

  const localPath = resolveLocalSourcePath(sourceLocalFilename);
  if (!localPath) {
    console.warn(
      `⚠️  ${basename} — source locale introuvable ou > 32 Mo : ${path.join(sourcesDir, sourceLocalFilename)}`
    );
    return null;
  }

  console.log(`   📁 Upload HeyGen : ${path.basename(localPath)} (${Math.round(fs.statSync(localPath).size / 1024 / 1024)} Mo)`);
  const assetId = await uploadHeyGenAsset(apiKey, localPath);
  return { type: 'asset_id', asset_id: assetId, label: `asset:${assetId}` };
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

function writeManifest() {
  syncHeyGenManifestFromDisk('pnpm heygen:translate');
}

async function tryDownloadJobMp4(job: HeyGenJob, downloadUrl: string): Promise<boolean> {
  const mp4Path = path.join(outDir, `${job.basename}.mp4`);
  if (fs.existsSync(mp4Path)) return true;

  console.log(`   ⬇️  Téléchargement MP4…`);
  const videoResponse = await fetch(downloadUrl);
  if (!videoResponse.ok) {
    console.error(`   ❌ Téléchargement échoué (${videoResponse.status})`);
    return false;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(mp4Path, Buffer.from(await videoResponse.arrayBuffer()));
  job.outputVideoUrl = downloadUrl;
  job.status = 'completed';
  job.updatedAt = new Date().toISOString();
  console.log(`   ✅ ${job.basename}.mp4`);
  return true;
}

async function submitJobs(apiKey: string, moduleFilter: string | null, force = false) {
  const store = readJobs();
  const byBasename = new Map(store.jobs.map((job) => [job.basename, job]));

  for (const entry of listVideoHeyGenFrEntries()) {
    if (moduleFilter && entry.moduleSlug !== moduleFilter) continue;

    const mp4Path = path.join(outDir, `${entry.basename}.mp4`);
    if (!force && fs.existsSync(mp4Path)) {
      console.log(`⏭  ${entry.basename} — MP4 FR déjà présent`);
      continue;
    }

    const existing = byBasename.get(entry.basename);
    const retryFailed = process.argv.includes('--retry-failed');
    const mayResubmit = force || retryFailed || existing?.status === 'failed';
    if (!mayResubmit && existing?.videoTranslationId) {
      console.log(`⏭  ${entry.basename} — job existant ${existing.videoTranslationId}`);
      continue;
    }
    if (retryFailed && existing?.status === 'failed') {
      console.log(`🔄 Nouvelle tentative : ${entry.basename}`);
    }

    const sourceVideo = await resolveSourceVideo(apiKey, entry.basename, entry.sourceLocalFilename);
    if (!sourceVideo) {
      if (!entry.sourceLocalFilename) {
        console.warn(`⚠️  ${entry.basename} — pas de source locale. Générez via pnpm heygen:generate ou définissez HEYGEN_SOURCE_*_URL`);
      } else {
        console.warn(
          `⚠️  ${entry.basename} — pas d'URL source. Définissez HEYGEN_SOURCE_${entry.basename.replace(/-/g, '_').toUpperCase()}_URL`
        );
      }
      continue;
    }

    console.log(`📤 Soumission HeyGen : ${entry.heygenTitle}`);
    const payload: Record<string, unknown> = {
      video:
        sourceVideo.type === 'url'
          ? { type: 'url', url: sourceVideo.url }
          : { type: 'asset_id', asset_id: sourceVideo.asset_id },
      output_languages: [OUTPUT_LANGUAGE],
      title: entry.heygenTitle,
      input_language: 'English',
      translate_audio_only: TRANSLATE_AUDIO_ONLY,
      mode: TRANSLATE_MODE,
      enable_dynamic_duration: true,
      keep_the_same_format: true,
      enable_watermark: false,
    };
    if (BRAND_VOICE_ID) payload.brand_voice_id = BRAND_VOICE_ID;

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
      sourceVideoUrl: sourceVideo.label,
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
    const mp4Path = path.join(outDir, `${job.basename}.mp4`);
    if (fs.existsSync(mp4Path)) {
      job.status = 'completed';
      continue;
    }

    if (job.outputVideoUrl) {
      console.log(`🔍 ${job.basename} — reprise URL enregistrée…`);
      if (await tryDownloadJobMp4(job, job.outputVideoUrl)) continue;
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
    await tryDownloadJobMp4(job, downloadUrl);
  }

  writeJobs(store);
  writeManifest();
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
  writeManifest();
  console.log(`Enregistré : ${basename} → ${getModuleVideoHeyGenFrPublicUrl({ basename, heygenTitle: basename })}`);
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
  const moduleFilter = args.includes('--module') ? args[args.indexOf('--module') + 1] ?? null : null;
  const force = args.includes('--force');

  if (force && moduleFilter) {
    const entry = listVideoHeyGenFrEntries().find((item) => item.moduleSlug === moduleFilter);
    if (entry) {
      const mp4Path = path.join(outDir, `${entry.basename}.mp4`);
      if (fs.existsSync(mp4Path)) {
        fs.unlinkSync(mp4Path);
        console.log(`🗑  ${entry.basename}.mp4 supprimé (--force)`);
      }
      const store = readJobs();
      writeJobs({ jobs: store.jobs.filter((item) => item.basename !== entry.basename) });
    }
  }

  await submitJobs(apiKey, moduleFilter, force);

  let pending = true;
  while (pending) {
    await pollAndDownload(apiKey);
    const store = readJobs();
    pending = store.jobs.some(
      (job) =>
        job.videoTranslationId &&
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
