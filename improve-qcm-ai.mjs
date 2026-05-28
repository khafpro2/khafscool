#!/usr/bin/env node
/**
 * Analyse l'équilibre des longueurs des options QCM dans shared/src/quiz-content.ts.
 *
 * Par défaut : rapport sur stdout uniquement (aucune écriture de fichier).
 *
 * Usage:
 *   node improve-qcm-ai.mjs [projectRoot]
 *   node improve-qcm-ai.mjs --report /tmp/qcm-report.txt
 *   node improve-qcm-ai.mjs --rewrite   # réécriture API (nécessite ANTHROPIC_API_KEY) → stdout JSON
 *   node improve-qcm-ai.mjs --check     # exit 1 si au moins une question déséquilibrée (CI)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const reportFlag = args.find((a) => a.startsWith('--report'));
const reportPath = reportFlag?.includes('=')
  ? reportFlag.split('=')[1]
  : reportFlag && args[args.indexOf(reportFlag) + 1]?.startsWith('--')
    ? undefined
    : reportFlag
      ? args[args.indexOf(reportFlag) + 1]
      : undefined;
const rewriteMode = args.includes('--rewrite');
const positionalRoot = args.find((a) => !a.startsWith('--'));
const projectRoot = positionalRoot || process.cwd();
const quizFile = path.join(projectRoot, 'shared/src/quiz-content.ts');

if (!fs.existsSync(quizFile)) {
  console.error('❌ Fichier introuvable: ' + quizFile);
  process.exit(1);
}

const source = fs.readFileSync(quizFile, 'utf8');
const idxMap = { a: 0, b: 1, c: 2, d: 3 };

const optRe =
  /opt\(\s*\n?\s*'((?:\\.|[^'\\])*)',\s*\n?\s*'((?:\\.|[^'\\])*)',\s*\n?\s*'((?:\\.|[^'\\])*)',\s*\n?\s*'((?:\\.|[^'\\])*)'\s*\)/g;
const correctRe = /correctOption:\s*'(\w+)'/g;

function unescapeJsString(value) {
  return value.replace(/\\(.)/g, (_, ch) => (ch === "'" ? "'" : ch === '\\' ? '\\' : ch));
}

function extractField(block, field) {
  const re = new RegExp(field + ":\\s*[`']([\\s\\S]*?)[`'](?:\\s*[,}])");
  const m = re.exec(block);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

const allOpts = [];
const allCors = [];
let m;
while ((m = optRe.exec(source)) !== null) {
  allOpts.push({
    raw: m[0],
    opts: [m[1], m[2], m[3], m[4]].map(unescapeJsString),
    pos: m.index,
  });
}
while ((m = correctRe.exec(source)) !== null) allCors.push(m[1]);

const questions = [];
for (let i = 0; i < allOpts.length; i++) {
  const o = allOpts[i];
  const cid = allCors[i];
  const cIdx = idxMap[cid];
  if (cIdx === undefined) continue;

  const opts = o.opts;
  const correctLen = opts[cIdx].length;
  const wrongs = opts.filter((_, j) => j !== cIdx);
  const avgWrong = wrongs.reduce((s, w) => s + w.length, 0) / wrongs.length;
  const ratio = correctLen / Math.max(avgWrong, 1);

  const blockStart = Math.max(0, source.lastIndexOf('{', o.pos));
  const blockEnd = source.indexOf('},', o.pos);
  const raw = source.slice(blockStart, blockEnd > 0 ? blockEnd + 1 : o.pos + o.raw.length);

  questions.push({ raw, opts, cid, cIdx, ratio, prompt: extractField(raw, 'prompt') });
}

const toImprove = questions.filter((q) => q.ratio > 1.4).sort((a, b) => b.ratio - a.ratio);

const lines = [];
lines.push('');
lines.push('📊 Analyse: ' + questions.length + ' questions trouvées');
lines.push('⚠️  ' + toImprove.length + ' questions déséquilibrées (ratio longueur correcte / moyenne distracteurs > 1.4x)');
lines.push('');
lines.push('Top 8 questions les plus déséquilibrées:');

toImprove.slice(0, 8).forEach((q, i) => {
  const prompt = (q.prompt || '?').replace(/\s+/g, ' ').substring(0, 55);
  lines.push('');
  lines.push('  ' + (i + 1) + '. Ratio ' + q.ratio.toFixed(1) + 'x | "' + prompt + '..."');
  q.opts.forEach((o, idx) => {
    const mark = idx === q.cIdx ? '✅' : '❌';
    lines.push('     ' + mark + ' (' + o.length + 'c) "' + o.substring(0, 65) + '"');
  });
});

const report = lines.join('\n');
console.log(report);

if (reportPath) {
  fs.writeFileSync(reportPath, report + '\n');
  console.log('\n📄 Rapport écrit → ' + reportPath);
} else if (!rewriteMode && toImprove.length > 0) {
  const defaultReport = path.join(os.tmpdir(), 'qcm-balance-report.txt');
  fs.writeFileSync(defaultReport, report + '\n');
  console.log('\n📄 Copie du rapport → ' + defaultReport);
}

async function rewriteQuestion(q) {
  const prompt = (q.prompt || '').replace(/\s+/g, ' ').trim();
  const expMatch = /explanation:\s*`([\s\S]*?)`/.exec(q.raw);
  const explanation = expMatch ? expMatch[1].replace(/\s+/g, ' ').trim() : '';
  const correct = q.opts[q.cIdx];
  const wrongs = q.opts.filter((_, i) => i !== q.cIdx);
  const target = Math.round(correct.length * 0.85);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY manquant');
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: 'Tu es expert MDM Apple/Jamf/Intune. Réécris UNIQUEMENT en JSON valide, sans texte avant ou après.',
      messages: [
        {
          role: 'user',
          content:
            'Question: "' +
            prompt +
            '"\nBonne réponse: "' +
            correct +
            '"\nExplication: "' +
            explanation +
            '"\n\nRéécris ces 3 distracteurs pour qu\'ils soient plausibles, ~' +
            target +
            ' caractères chacun, même style technique:\n' +
            wrongs.map((w, i) => i + 1 + '. "' + w + '"').join('\n') +
            '\n\nRéponds UNIQUEMENT: {"d":["distract1","distract2","distract3"]}',
        },
      ],
    }),
  });

  const data = await resp.json();
  const text = data.content[0].text
    .trim()
    .replace(/```json?\n?/g, '')
    .replace(/\n?```/g, '')
    .trim();
  return JSON.parse(text);
}

async function runRewrite() {
  console.log('\n\n🔄 Réécriture de ' + toImprove.length + ' questions (sortie JSON stdout)...\n');
  const results = [];

  for (let i = 0; i < toImprove.length; i++) {
    const q = toImprove[i];
    process.stdout.write('  [' + (i + 1) + '/' + toImprove.length + '] ratio ' + q.ratio.toFixed(1) + 'x → ');
    try {
      const result = await rewriteQuestion(q);
      if (!result.d || result.d.length !== 3) {
        process.stdout.write('⚠️  format invalide\n');
        continue;
      }
      const avgNew = result.d.reduce((s, d) => s + d.length, 0) / 3;
      const newRatio = q.opts[q.cIdx].length / avgNew;
      process.stdout.write('✅ ' + q.ratio.toFixed(1) + 'x → ' + newRatio.toFixed(1) + 'x\n');
      results.push({ prompt: q.prompt, correctOption: q.cid, distractors: result.d });
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      process.stdout.write('❌ ' + err.message.substring(0, 40) + '\n');
    }
  }

  console.log('\n' + JSON.stringify({ rewritten: results.length, items: results }, null, 2));
  console.log('\nAppliquez manuellement les distracteurs dans quiz-content.ts, puis: pnpm db:seed');
}

if (checkMode && toImprove.length > 0) {
  console.error(
    '\n❌ Échec --check : ' +
      toImprove.length +
      ' question(s) avec ratio longueur correcte / distracteurs > 1.4x',
  );
  process.exit(1);
}

if (checkMode) {
  console.log('\n✅ QCM équilibrés (' + questions.length + ' questions, seuil 1.4x).');
}

if (rewriteMode) {
  runRewrite().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (toImprove.length > 0) {
  console.log('\n💡 Corrigez manuellement dans quiz-content.ts, ou lancez --rewrite (API Anthropic).');
}
