#!/usr/bin/env node
/**
 * Allonge les distracteurs trop courts dans shared/src/quiz-content.ts (padding pédagogique).
 * Idempotent : détecte les suffixes déjà appliqués et ignore ces options.
 *
 * Usage: node fix-qcm.mjs [--force]
 */
import { readFileSync, writeFileSync } from 'fs';

const force = process.argv.includes('--force');
const src = readFileSync('shared/src/quiz-content.ts', 'utf8');
const idxMap = { a: 0, b: 1, c: 2, d: 3 };

const suffixes = [
  ', sans consulter les procédures officielles Apple',
  ", ce qui risque d'effacer les données utilisateur sans sauvegarde préalable",
  ", sans vérifier l'état d'Activation Lock ni contacter le propriétaire",
  ', contrairement aux bonnes pratiques du support Apple de premier niveau',
  ', ce qui contourne les étapes de diagnostic non destructives recommandées',
  ", sans documenter l'intervention dans le système de tickets SAV",
  ", sans vérifier l'existence d'une sauvegarde iCloud ou locale valide",
  ', ce qui peut engager la responsabilité du technicien sans autorisation',
  ', sans suivre le processus de triage structuré recommandé par Apple',
  ", sans identifier la cause racine via l'Activité moniteur ou les logs système",
];

const alreadyPadded = suffixes.filter((s) => src.includes(s.replace(/\\/g, ''))).length;
if (alreadyPadded >= 3 && !force) {
  console.warn(
    `⚠️  Le fichier semble déjà paddé (${alreadyPadded}/${suffixes.length} suffixes repérés).`,
  );
  console.warn('   Relancer avec --force pour réappliquer, ou ignorer si c\'est attendu.');
  process.exit(0);
}

/** Escape content for single-quoted TypeScript/JavaScript string literals. */
function escapeForSingleQuoted(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function unescapeJsString(value) {
  return value.replace(/\\(.)/g, (_, ch) => (ch === "'" ? "'" : ch === '\\' ? '\\' : ch));
}

function hasPaddingSuffix(label) {
  return suffixes.some((s) => label.endsWith(s) || label.includes(s.slice(2)));
}

const optRe =
  /opt\(\s*\n?\s*'((?:\\.|[^'\\])*)',\s*\n?\s*'((?:\\.|[^'\\])*)',\s*\n?\s*'((?:\\.|[^'\\])*)',\s*\n?\s*'((?:\\.|[^'\\])*)'\s*\)/g;
const correctRe = /correctOption:\s*'(\w+)'/g;

const allOpts = [];
const allCors = [];
let m;
while ((m = optRe.exec(src)) !== null) {
  allOpts.push({
    full: m[0],
    a: unescapeJsString(m[1]),
    b: unescapeJsString(m[2]),
    c: unescapeJsString(m[3]),
    d: unescapeJsString(m[4]),
    pos: m.index,
  });
}
while ((m = correctRe.exec(src)) !== null) allCors.push(m[1]);

let improved = src;
let count = 0;
let skipped = 0;
let offset = 0;

for (let i = 0; i < allOpts.length; i++) {
  const o = allOpts[i];
  const cIdx = idxMap[allCors[i]];
  if (cIdx === undefined) continue;

  const arr = [o.a, o.b, o.c, o.d];
  const correctLen = arr[cIdx].length;
  const threshold = correctLen * 0.65;

  let changed = false;
  const newArr = arr.map((label, j) => {
    if (j === cIdx) return label;
    if (label.length >= threshold) return label;
    if (hasPaddingSuffix(label)) {
      skipped++;
      return label;
    }
    changed = true;
    return label + suffixes[(i * 4 + j) % suffixes.length];
  });

  if (!changed) continue;

  const newCall = `opt(\n        '${escapeForSingleQuoted(newArr[0])}',\n        '${escapeForSingleQuoted(newArr[1])}',\n        '${escapeForSingleQuoted(newArr[2])}',\n        '${escapeForSingleQuoted(newArr[3])}'\n      )`;

  const start = o.pos + offset;
  const end = start + o.full.length;
  improved = improved.substring(0, start) + newCall + improved.substring(end);
  offset += newCall.length - o.full.length;
  count++;
}

if (count === 0) {
  console.log(`✅ Aucune modification (${skipped} options déjà paddées ignorées).`);
} else {
  writeFileSync('shared/src/quiz-content.ts', improved);
  console.log(`✅ ${count} questions améliorées (${skipped} options déjà paddées ignorées).`);
}
console.log('\nVérifiez: pnpm exec tsc --noEmit -p shared && pnpm db:seed');
