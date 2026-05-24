#!/usr/bin/env node
/**
 * Génère les vidéos de cours FR via HeyGen Video Agent (v3).
 *
 * Prérequis :
 *   - HEYGEN_API_KEY dans .env à la racine
 *   - CLI heygen installé (curl -fsSL https://static.heygen.ai/cli/install.sh | bash)
 *
 * Usage :
 *   pnpm heygen:generate              # soumet les 3 pilotes + attend + télécharge
 *   pnpm heygen:generate -- --status  # état des jobs
 *   pnpm heygen:generate -- --module device-support-basics  # un seul module
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getModulePedagogy, PILOT_VIDEO_MODULES } from '@ama/shared/course-content';
import {
  getModuleVideoHeyGenFrPublicUrl,
  listVideoHeyGenFrEntries,
  type VideoHeyGenFrManifest,
} from '@ama/shared/video-heygen-fr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'web/public/media/videos/fr');
const jobsPath = path.join(outDir, 'heygen-generate-jobs.json');
const manifestTsPath = path.join(root, 'shared/src/video-heygen-fr-manifest.ts');
const heygenBin = process.env.HEYGEN_CLI ?? path.join(process.env.HOME ?? '', '.local/bin/heygen');

const DEFAULT_AVATAR_ID = process.env.HEYGEN_AVATAR_ID ?? 'Brandon_expressive_public';
const DEFAULT_VOICE_ID = process.env.HEYGEN_VOICE_ID ?? '018a94cf15574491a0bab7f6799ac15b';
const TARGET_MINUTES = Number(process.env.HEYGEN_VIDEO_TARGET_MINUTES ?? 3);

type GenerateJob = {
  courseSlug: string;
  moduleSlug: string;
  basename: string;
  title: string;
  sessionId?: string;
  videoId?: string;
  status?: string;
  error?: string;
  outputVideoUrl?: string;
  updatedAt?: string;
};

type GenerateJobsFile = { jobs: GenerateJob[] };

function loadEnvFile() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
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
    console.error('HEYGEN_API_KEY manquant. Ajoutez-le dans .env à la racine.');
    process.exit(1);
  }
  return key;
}

function readJobs(): GenerateJobsFile {
  if (!fs.existsSync(jobsPath)) return { jobs: [] };
  return JSON.parse(fs.readFileSync(jobsPath, 'utf8')) as GenerateJobsFile;
}

function writeJobs(data: GenerateJobsFile) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(jobsPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeManifestTs(manifest: VideoHeyGenFrManifest) {
  const content = `/** Généré par pnpm heygen:generate — ne pas éditer à la main. */
import type { VideoHeyGenFrManifest } from './video-heygen-fr';

export const VIDEO_HEYGEN_FR_MANIFEST: VideoHeyGenFrManifest = ${JSON.stringify(manifest, null, 2)} as const;
`;
  fs.writeFileSync(manifestTsPath, content, 'utf8');
}

function syncManifestFromJobs(jobs: GenerateJob[]) {
  const manifest: VideoHeyGenFrManifest = {};
  for (const job of jobs) {
    const mp4Path = path.join(outDir, `${job.basename}.mp4`);
    if (fs.existsSync(mp4Path)) {
      manifest[job.basename] = {
        ready: true,
        url: getModuleVideoHeyGenFrPublicUrl({ basename: job.basename, sourceYouTubeUrl: '', heygenTitle: '' }),
        videoTranslationId: job.videoId,
        generatedAt: job.updatedAt ?? new Date().toISOString(),
      };
    }
  }
  writeManifestTs(manifest);
}

function buildCoursePrompt(
  heygenTitle: string,
  pedagogy: NonNullable<ReturnType<typeof getModulePedagogy>>
): string {
  const objectives = pedagogy.learningObjectives.map((item, i) => `${i + 1}. ${item}`).join('\n');
  const takeaways = pedagogy.keyTakeaways.map((item) => `- ${item}`).join('\n');

  return `Create a professional French training video (~${TARGET_MINUTES} minutes, landscape 16:9) for Apple MDM Academy.

Title on screen (optional lower-third): ${heygenTitle}

The selected presenter speaks entirely in French (France). Tone: calm, pedagogical, enterprise IT trainer. Simple studio background, no distracting motion.

SCRIPT (follow closely, natural pacing):

[INTRO — 20 sec]
Bonjour et bienvenue sur Apple MDM Academy. Dans cette leçon : ${pedagogy.summary}

[OBJECTIFS — 40 sec]
À la fin, vous saurez :
${objectives}

[CORPS — main content]
Explain the core concepts clearly for technicians and IT admins. Use concrete examples from enterprise Apple fleets (iPhone, iPad, Mac). Mention Apple Business Manager, supervision, and MDM where relevant.

[POINTS CLÉS — 30 sec]
Retenez surtout :
${takeaways}

[OUTRO — 15 sec]
Merci d'avoir suivi cette leçon. Passez au quiz et aux exercices du module pour valider vos acquis.

Do not add English narration. Keep the presenter centered, professional business casual attire.`;
}

function heygen(args: string[], apiKey: string): { ok: boolean; stdout: string; stderr: string } {
  const result = spawnSync(heygenBin, args, {
    env: { ...process.env, HEYGEN_API_KEY: apiKey },
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function parseJson(stdout: string): Record<string, unknown> | null {
  try {
    return JSON.parse(stdout) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function submitJob(apiKey: string, job: GenerateJob): Promise<GenerateJob> {
  const pedagogy = getModulePedagogy(job.courseSlug, job.moduleSlug);
  if (!pedagogy) {
    job.status = 'failed';
    job.error = 'Pédagogie introuvable';
    return job;
  }

  console.log(`📤 Génération HeyGen : ${job.title}`);
  const prompt = buildCoursePrompt(job.title, pedagogy);
  const { ok, stdout, stderr } = heygen(
    [
      'video-agent',
      'create',
      '--prompt',
      prompt,
      '--avatar-id',
      DEFAULT_AVATAR_ID,
      '--voice-id',
      DEFAULT_VOICE_ID,
      '--orientation',
      'landscape',
      '--mode',
      'generate',
      '--wait',
      '--timeout',
      '25m',
    ],
    apiKey
  );

  if (!ok) {
    job.status = 'failed';
    job.error = stderr.trim() || stdout.trim() || 'Échec CLI heygen';
    console.error(`   ❌ ${job.error}`);
    return job;
  }

  const body = parseJson(stdout);
  const data = (body?.data ?? body) as Record<string, unknown> | undefined;
  job.sessionId = typeof data?.session_id === 'string' ? data.session_id : job.sessionId;
  job.videoId = typeof data?.video_id === 'string' ? data.video_id : job.videoId;
  job.status = typeof data?.status === 'string' ? data.status : 'completed';
  job.updatedAt = new Date().toISOString();

  if (!job.videoId) {
    job.status = 'failed';
    job.error = 'Réponse sans video_id';
    return job;
  }

  console.log(`   → session ${job.sessionId ?? '—'} | video ${job.videoId}`);
  return job;
}

async function downloadVideo(apiKey: string, job: GenerateJob): Promise<GenerateJob> {
  if (!job.videoId) return job;
  const mp4Path = path.join(outDir, `${job.basename}.mp4`);
  if (fs.existsSync(mp4Path)) return job;

  const { ok, stdout, stderr } = heygen(['video', 'get', job.videoId], apiKey);
  if (!ok) {
    job.status = 'failed';
    job.error = stderr.trim() || 'Impossible de récupérer la vidéo';
    return job;
  }

  const body = parseJson(stdout);
  const data = (body?.data ?? body) as Record<string, unknown> | undefined;
  const status = typeof data?.status === 'string' ? data.status : '';
  const videoUrl = typeof data?.video_url === 'string' ? data.video_url : null;

  if (status !== 'completed' || !videoUrl) {
    job.status = status || 'processing';
    console.log(`   ⏳ ${job.basename}: ${job.status}`);
    return job;
  }

  console.log(`   ⬇️  Téléchargement ${job.basename}.mp4…`);
  const response = await fetch(videoUrl);
  if (!response.ok) {
    job.status = 'failed';
    job.error = `Téléchargement échoué (${response.status})`;
    return job;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(mp4Path, Buffer.from(await response.arrayBuffer()));
  job.outputVideoUrl = videoUrl;
  job.status = 'completed';
  job.updatedAt = new Date().toISOString();
  console.log(`   ✅ ${job.basename}.mp4`);
  return job;
}

function printStatus() {
  const store = readJobs();
  if (!store.jobs.length) {
    console.log('Aucun job de génération HeyGen enregistré.');
    return;
  }
  for (const job of store.jobs) {
    const local = fs.existsSync(path.join(outDir, `${job.basename}.mp4`)) ? '✅ local' : '—';
    console.log(`${job.basename}: ${job.status ?? 'unknown'} ${local}`);
    if (job.videoId) console.log(`  video: ${job.videoId}`);
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

  const moduleFilter = args.includes('--module') ? args[args.indexOf('--module') + 1] : null;
  const apiKey = requireApiKey();

  if (!fs.existsSync(heygenBin)) {
    console.error(`CLI heygen introuvable : ${heygenBin}`);
    console.error('Installez-le : curl -fsSL https://static.heygen.ai/cli/install.sh | bash');
    process.exit(1);
  }

  const store = readJobs();
  const byBasename = new Map(store.jobs.map((job) => [job.basename, job]));

  for (const entry of listVideoHeyGenFrEntries()) {
    if (moduleFilter && entry.moduleSlug !== moduleFilter) continue;

    const existing = byBasename.get(entry.basename);
    if (existing?.status === 'completed' && fs.existsSync(path.join(outDir, `${entry.basename}.mp4`))) {
      console.log(`⏭  ${entry.basename} — déjà généré`);
      continue;
    }
    if (existing?.videoId && existing.status !== 'failed' && !fs.existsSync(path.join(outDir, `${entry.basename}.mp4`))) {
      console.log(`🔍 Reprise téléchargement : ${entry.basename}`);
      const updated = await downloadVideo(apiKey, existing);
      byBasename.set(entry.basename, updated);
      writeJobs({ jobs: [...byBasename.values()] });
      continue;
    }
    if (existing?.videoId && existing.status !== 'failed') {
      console.log(`⏭  ${entry.basename} — job existant ${existing.videoId}`);
      continue;
    }

    const job: GenerateJob = {
      courseSlug: entry.courseSlug,
      moduleSlug: entry.moduleSlug,
      basename: entry.basename,
      title: entry.heygenTitle,
      status: 'pending',
    };

    const submitted = await submitJob(apiKey, job);
    const finished = submitted.status === 'failed' ? submitted : await downloadVideo(apiKey, submitted);
    byBasename.set(entry.basename, finished);
    writeJobs({ jobs: [...byBasename.values()] });
  }

  syncManifestFromJobs([...byBasename.values()]);
  printStatus();
  console.log('\nTerminé. Rechargez le parcours : les vidéos HeyGen remplacent le doublage TTS.');
}

void main();
