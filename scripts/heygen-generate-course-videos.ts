#!/usr/bin/env node
/**
 * Génère les vidéos de cours FR via HeyGen Video Agent (v3) — présentateur Lifa.
 *
 * Usage :
 *   pnpm heygen:generate              # soumet tous les modules puis télécharge
 *   pnpm heygen:generate -- --submit  # soumet uniquement (rapide)
 *   pnpm heygen:download              # reprend les téléchargements
 *   pnpm heygen:generate:status       # état des jobs
 *   pnpm heygen:generate -- --force   # régénère même si un MP4 existe
 *   pnpm heygen:generate -- --module device-support-basics
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getModulePedagogy } from '@ama/shared/course-content';
import { listVideoHeyGenFrEntries } from '@ama/shared/video-heygen-fr';
import { syncHeyGenManifestFromDisk } from './heygen-manifest-sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'web/public/media/videos/fr');
const jobsPath = path.join(outDir, 'heygen-generate-jobs.json');
const heygenBin = process.env.HEYGEN_CLI ?? path.join(process.env.HOME ?? '', '.local/bin/heygen');

/** Voix clone « khaf 1 » — utilisée pour toutes les générations HeyGen. */
const KHAF1_VOICE_ID = '54727d8635f94d56b32ac1ff45e5b848';
/** Look ID photo avatar « lifa » (HeyGen Video Agent). */
const DEFAULT_AVATAR_ID = process.env.HEYGEN_AVATAR_ID ?? 'f35747e92a224e7daad1319a2b629b0b';
const DEFAULT_VOICE_ID = process.env.HEYGEN_VOICE_ID?.trim() || KHAF1_VOICE_ID;
const TARGET_MINUTES = Number(process.env.HEYGEN_VIDEO_TARGET_MINUTES ?? 2.5);

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

/** Motion design + voix off — sans présentateur ni avatar. */
function buildMotionGraphicsPrompt(
  heygenTitle: string,
  pedagogy: NonNullable<ReturnType<typeof getModulePedagogy>>
): string {
  const objectives = pedagogy.learningObjectives
    .filter((item) => /ABM|MDM|enrôl|supervis|ADE|Business Manager/i.test(item))
    .map((item, i) => `${i + 1}. ${item}`)
    .join('\n');

  return `Create a French motion-graphics explainer (~2 minutes, landscape 16:9) for Apple MDM Academy.

Title on screen: ${heygenTitle}

CRITICAL RULES — MUST FOLLOW:
- NO human presenter. NO talking head. NO avatar. NO person visible on screen at any time.
- Voiceover narration in French (France) only — use the selected voice, never show a speaker.
- Visuals ONLY: animated diagrams, flowcharts, icons, UI mockups, text callouts, b-roll style device silhouettes (not a presenter).
- Clean enterprise tech aesthetic: dark blue / slate background, white text, minimal Apple MDM Academy branding.

TOPIC (stay focused):
Explain Apple Business Manager (ABM) and Automated Device Enrollment (ADE) for enterprise MDM:
- ABM centralizes device purchases and assigns them to an MDM server
- ADE enrolls iPhone/iPad/Mac at first setup in supervised mode
- Flow: Revendeur Apple → ABM (48-72h) → assignation serveur MDM → assistant de configuration → appareil supervisé et géré
- Example: receiving 200 corporate iPhones — verify Remote Management screen and Managed status in MDM console
- Activation Lock and legitimate removal via ABM or MDM (not bypass)

Learning objectives to cover:
${objectives || pedagogy.learningObjectives.map((item, i) => `${i + 1}. ${item}`).join('\n')}

[OUTRO — 15 sec]
Invite the learner to continue with the lesson text and quiz.

Do not add English. Do not use a studio presenter shot.`;
}

async function tryDownloadFromUrl(job: GenerateJob, videoUrl: string): Promise<boolean> {
  const mp4Path = path.join(outDir, `${job.basename}.mp4`);
  console.log(`   ⬇️  Téléchargement ${job.basename}.mp4…`);
  const response = await fetch(videoUrl);
  if (!response.ok) {
    console.error(`   ❌ Téléchargement échoué (${response.status})`);
    return false;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(mp4Path, Buffer.from(await response.arrayBuffer()));
  job.outputVideoUrl = videoUrl;
  job.status = 'completed';
  job.updatedAt = new Date().toISOString();
  console.log(`   ✅ ${job.basename}.mp4`);
  return true;
}

async function submitJob(
  apiKey: string,
  job: GenerateJob,
  wait: boolean,
  options: { noAvatar?: boolean } = {}
): Promise<GenerateJob> {
  const pedagogy = getModulePedagogy(job.courseSlug, job.moduleSlug);
  if (!pedagogy) {
    job.status = 'failed';
    job.error = 'Pédagogie introuvable';
    return job;
  }

  const noAvatar = options.noAvatar ?? false;
  const prompt = noAvatar
    ? buildMotionGraphicsPrompt(job.title, pedagogy)
    : buildCoursePrompt(job.title, pedagogy);

  console.log(
    `📤 Soumission HeyGen Video Agent : ${job.title}${noAvatar ? ' (motion design, sans avatar)' : ''}`
  );
  const args = [
    'video-agent',
    'create',
    '--prompt',
    prompt,
    '--voice-id',
    DEFAULT_VOICE_ID,
    '--orientation',
    'landscape',
    '--mode',
    'generate',
  ];
  if (!noAvatar) {
    args.push('--avatar-id', DEFAULT_AVATAR_ID);
  }
  if (wait) {
    args.push('--wait', '--timeout', '25m');
  }

  const { ok, stdout, stderr } = heygen(args, apiKey);
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
  job.status = typeof data?.status === 'string' ? data.status : 'submitted';
  job.updatedAt = new Date().toISOString();

  if (!job.sessionId && !job.videoId) {
    job.status = 'failed';
    job.error = 'Réponse HeyGen sans session_id ni video_id';
    return job;
  }

  console.log(`   → session ${job.sessionId ?? '—'} | video ${job.videoId ?? '—'}`);
  return job;
}

async function resolveVideoId(apiKey: string, job: GenerateJob): Promise<GenerateJob> {
  if (job.videoId) return job;
  if (!job.sessionId) return job;

  const { ok, stdout } = heygen(['video-agent', 'get', job.sessionId], apiKey);
  if (!ok) return job;

  const data = (parseJson(stdout)?.data ?? parseJson(stdout)) as Record<string, unknown> | undefined;
  if (typeof data?.video_id === 'string') {
    job.videoId = data.video_id;
    job.status = typeof data.status === 'string' ? data.status : job.status;
    job.updatedAt = new Date().toISOString();
  }
  return job;
}

async function downloadVideo(apiKey: string, job: GenerateJob): Promise<GenerateJob> {
  const mp4Path = path.join(outDir, `${job.basename}.mp4`);
  if (fs.existsSync(mp4Path) && job.status === 'completed') return job;

  await resolveVideoId(apiKey, job);

  if (!job.videoId) {
    job.status = 'processing';
    job.error = 'video_id pas encore disponible — relancez pnpm heygen:download';
    return job;
  }

  if (job.outputVideoUrl && (await tryDownloadFromUrl(job, job.outputVideoUrl))) {
    return job;
  }

  const pollMs = Number(process.env.HEYGEN_POLL_MS ?? 30_000);
  const maxPolls = Number(process.env.HEYGEN_MAX_POLLS ?? 60);

  for (let attempt = 0; attempt < maxPolls; attempt++) {
    const { ok, stdout, stderr } = heygen(['video', 'get', job.videoId], apiKey);
    if (!ok) {
      job.status = 'failed';
      job.error = stderr.trim() || 'Impossible de récupérer la vidéo';
      return job;
    }

    const data = (parseJson(stdout)?.data ?? parseJson(stdout)) as Record<string, unknown> | undefined;
    const status = typeof data?.status === 'string' ? data.status : '';
    const videoUrl = typeof data?.video_url === 'string' ? data.video_url : null;

    if (status === 'failed') {
      job.status = 'failed';
      job.error = typeof data?.error === 'string' ? data.error : 'Génération HeyGen échouée';
      return job;
    }

    if (status !== 'completed' || !videoUrl) {
      job.status = status || 'processing';
      if (attempt === 0 || attempt % 3 === 0) {
        console.log(`   ⏳ ${job.basename}: ${job.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
      continue;
    }

    await tryDownloadFromUrl(job, videoUrl);
    return job;
  }

  job.status = 'processing';
  job.error = 'Délai dépassé — relancez pnpm heygen:download';
  return job;
}

type HeyGenListedVideo = {
  id?: string;
  title?: string;
  status?: string;
  video_url?: string;
  completed_at?: number;
  created_at?: number;
};

function titleMatchesEntry(videoTitle: string, heygenTitle: string): boolean {
  const normalized = videoTitle.trim();
  if (normalized === heygenTitle) return true;
  if (normalized.startsWith(`${heygenTitle}-`)) return true;
  return normalized.startsWith(heygenTitle);
}

async function recoverFromHeyGenList(
  apiKey: string,
  entries: ReturnType<typeof listVideoHeyGenFrEntries>,
  byBasename: Map<string, GenerateJob>,
  options: { force?: boolean } = {}
): Promise<void> {
  const { ok, stdout } = heygen(['video', 'list', '--limit', '50'], apiKey);
  if (!ok) {
    console.error('Impossible de lister les vidéos HeyGen.');
    return;
  }

  const listed = (parseJson(stdout)?.data ?? []) as HeyGenListedVideo[];
  const completed = listed.filter(
    (video) => video.status === 'completed' && typeof video.video_url === 'string'
  );

  console.log(`\n📥 Récupération depuis HeyGen (${completed.length} vidéo(s) terminée(s))…\n`);

  for (const entry of entries) {
    const mp4Path = path.join(outDir, `${entry.basename}.mp4`);
    if (!options.force && fs.existsSync(mp4Path)) {
      console.log(`⏭  ${entry.basename} — déjà local`);
      continue;
    }

    const candidates = completed
      .filter((video) => titleMatchesEntry(video.title ?? '', entry.heygenTitle))
      .sort((a, b) => {
        const aTs = a.completed_at ?? a.created_at ?? 0;
        const bTs = b.completed_at ?? b.created_at ?? 0;
        return bTs - aTs;
      });

    const match = candidates[0];
    if (!match?.video_url || !match.id) {
      console.log(`—  ${entry.basename} — aucune vidéo terminée sur HeyGen`);
      continue;
    }

    const job: GenerateJob = byBasename.get(entry.basename) ?? {
      courseSlug: entry.courseSlug,
      moduleSlug: entry.moduleSlug,
      basename: entry.basename,
      title: entry.heygenTitle,
    };
    job.videoId = match.id;
    job.status = 'completed';
    job.error = undefined;
    console.log(`🔍 ${entry.basename} ← ${match.id} (${match.title})`);
    await tryDownloadFromUrl(job, match.video_url);
    byBasename.set(entry.basename, job);
  }
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
  const force = args.includes('--force');
  const noAvatar = args.includes('--no-avatar');
  const submitOnly = args.includes('--submit');
  const downloadOnly = args.includes('--download');
  const recoverOnly = args.includes('--recover');
  const moduleFilter = args.includes('--module') ? args[args.indexOf('--module') + 1] : null;

  if (args.includes('--status')) {
    printStatus();
    return;
  }

  const apiKey = requireApiKey();
  if (!fs.existsSync(heygenBin)) {
    console.error(`CLI heygen introuvable : ${heygenBin}`);
    process.exit(1);
  }

  const store = readJobs();
  const byBasename = new Map(store.jobs.map((job) => [job.basename, job]));

  const entries = listVideoHeyGenFrEntries().filter(
    (entry) => !moduleFilter || entry.moduleSlug === moduleFilter
  );

  if (!downloadOnly && !recoverOnly) {
    console.log(
      `\n🎬 HeyGen Video Agent — ${entries.length} module(s)${noAvatar ? ' — motion design (sans avatar)' : ' — avatar Lifa'}\n`
    );
    for (const entry of entries) {
      const mp4Path = path.join(outDir, `${entry.basename}.mp4`);
      const existing = byBasename.get(entry.basename);

      if (!force && fs.existsSync(mp4Path)) {
        console.log(`⏭  ${entry.basename} — MP4 déjà présent`);
        continue;
      }

      if (!force && existing?.videoId && existing.status !== 'failed') {
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

      const submitted = await submitJob(apiKey, job, !submitOnly, { noAvatar });
      byBasename.set(entry.basename, submitted);

      if (!submitOnly && submitted.status !== 'failed') {
        const finished = await downloadVideo(apiKey, submitted);
        byBasename.set(entry.basename, finished);
      }

      writeJobs({ jobs: [...byBasename.values()] });
      syncHeyGenManifestFromDisk('pnpm heygen:generate');
    }
  }

  if (downloadOnly || submitOnly || recoverOnly) {
    if (!recoverOnly) {
      console.log('\n🔍 Téléchargement / reprise des jobs…\n');
      for (const entry of entries) {
        const job = byBasename.get(entry.basename);
        if (!job?.videoId && !job?.sessionId) continue;
        if (!force && fs.existsSync(path.join(outDir, `${entry.basename}.mp4`))) {
          console.log(`⏭  ${entry.basename} — déjà téléchargé`);
          continue;
        }
        console.log(`🔍 ${entry.basename}`);
        const updated = await downloadVideo(apiKey, job);
        byBasename.set(entry.basename, updated);
      }
    }

    await recoverFromHeyGenList(apiKey, entries, byBasename, { force });
    writeJobs({ jobs: [...byBasename.values()] });
    syncHeyGenManifestFromDisk('pnpm heygen:generate');
  }

  printStatus();
  console.log('\nTerminé. Les MP4 sont dans web/public/media/videos/fr/');
  console.log('Rechargez le parcours pour voir les vidéos HeyGen (sans YouTube).');
}

void main();
