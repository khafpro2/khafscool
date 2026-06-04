#!/usr/bin/env node
/**
 * Rééquilibre les libellés des options dans shared/src/quiz-content.ts
 * (raccourcit la bonne réponse si trop longue, allonge les distracteurs courts).
 * Usage : node scripts/quiz-rebalance-lengths.mjs [--write] [--module course/module]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quizFile = path.join(root, 'shared/src/quiz-content.ts');

const DISTRACTOR_SUFFIXES = [
  ' sans diagnostic préalable',
  ' — piste peu adaptée au scénario',
  ' (hors bonnes pratiques support)',
  ' sans validation MDM ou ABM',
];

function shortenLabel(label, maxLen) {
  if (label.length <= maxLen) return label;

  const segments = label.split(/\s*[;—]\s*|\s+puis\s+|\s+et\s+/i).map((s) => s.trim());
  let result = segments[0] ?? label;
  for (let i = 1; i < segments.length; i += 1) {
    const candidate = `${result}, ${segments[i]}`;
    if (candidate.length <= maxLen) result = candidate;
    else break;
  }

  if (result.length > maxLen) {
    const trimmed = result.slice(0, maxLen - 1).trimEnd();
    return `${trimmed}…`;
  }
  return result;
}

function lengthenLabel(label, minLen) {
  if (label.length >= minLen - 4) return label;
  for (const suffix of DISTRACTOR_SUFFIXES) {
    const candidate = label.endsWith('.') ? `${label.slice(0, -1)}${suffix}.` : `${label}${suffix}`;
    if (candidate.length >= minLen - 4 && candidate.length <= minLen + 24) return candidate;
  }
  const pad = ' (option incorrecte pour ce cas)';
  const candidate = `${label}${pad}`;
  return candidate.length <= minLen + 30 ? candidate : label;
}

function rebalanceOptions(options, correctOption) {
  const lens = options.map((o) => o.label.length);
  const correctIdx = options.findIndex((o) => o.id === correctOption);
  const correctLen = lens[correctIdx] ?? 0;
  const otherLens = lens.filter((_, i) => i !== correctIdx);
  const maxOther = otherLens.length ? Math.max(...otherLens) : 0;
  const gap = correctLen - maxOther;

  if (gap <= 8) return options;

  const target = Math.max(maxOther, Math.round((correctLen + maxOther) / 2));
  const targetDistractor = Math.max(38, target - 4);

  return options.map((option, index) => {
    if (option.id === correctOption) {
      return { ...option, label: shortenLabel(option.label, target + 6) };
    }
    return { ...option, label: lengthenLabel(option.label, targetDistractor) };
  });
}

function parseQuizContent(source) {
  const sf = ts.createSourceFile('quiz-content.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits = [];

  function visit(node) {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(sf) === 'options' &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText(sf) === 'opt'
    ) {
      const parent = node.parent;
      if (!parent || !ts.isObjectLiteralExpression(parent)) return;

      let correctOption = null;
      for (const prop of parent.properties) {
        if (ts.isPropertyAssignment(prop) && prop.name.getText(sf) === 'correctOption') {
          const init = prop.initializer;
          if (ts.isStringLiteral(init)) correctOption = init.text;
        }
      }
      if (!correctOption) return;

      const args = node.initializer.arguments;
      if (args.length < 4) return;

      const labels = args.map((arg) => (ts.isStringLiteral(arg) ? arg.text : null));
      if (labels.some((l) => l === null)) return;

      const options = ['a', 'b', 'c', 'd'].map((id, i) => ({ id, label: labels[i] }));
      const rebalanced = rebalanceOptions(options, correctOption);
      const changed = rebalanced.some((o, i) => o.label !== options[i].label);
      if (!changed) return;

      const newCall = `opt(\n        ${rebalanced.map((o) => JSON.stringify(o.label)).join(',\n        ')}\n      )`;
      edits.push({ start: node.initializer.getStart(sf), end: node.initializer.getEnd(), text: newCall });
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return edits.sort((a, b) => b.start - a.start);
}

function applyEdits(source, edits) {
  let result = source;
  for (const edit of edits) {
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  }
  return result;
}

const write = process.argv.includes('--write');
const moduleFilter = process.argv.find((a) => a.startsWith('--module='))?.split('=')[1];

const source = fs.readFileSync(quizFile, 'utf8');
let edits = parseQuizContent(source);

if (moduleFilter) {
  const idx = source.indexOf(`'${moduleFilter.split('/').pop()}'`);
  if (idx >= 0) {
    edits = edits.filter((e) => e.start > idx - 200 && e.start < idx + 12000);
  }
}

console.log(`[quiz-rebalance] ${edits.length} blocs options à ajuster`);

if (!write) {
  console.log('Relancer avec --write pour appliquer les changements.');
  process.exit(0);
}

const next = applyEdits(source, edits);
fs.writeFileSync(quizFile, next);
console.log(`[quiz-rebalance] Fichier mis à jour : ${quizFile}`);
