export type LessonBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'p'; text: string };

export function parseLessonBlocks(content: string): LessonBlock[] {
  if (!content.trim()) return [];

  return content
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('## ')) {
        return { type: 'h2' as const, text: block.slice(3) };
      }
      if (block.startsWith('### ')) {
        return { type: 'h3' as const, text: block.slice(4) };
      }
      if (block.startsWith('> ')) {
        const lines = block.split('\n').map((line) => line.replace(/^>\s?/, ''));
        return { type: 'blockquote' as const, text: lines.join('\n') };
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter((line) => line.startsWith('- ')).map((line) => line.slice(2));
        return { type: 'ul' as const, items };
      }
      return { type: 'p' as const, text: block };
    });
}

import { findGlossaryMatchesInText } from './glossary';

export type InlinePart =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'link'; label: string; href: string }
  | { type: 'glossary'; label: string; termId: string };

export function parseInlineMarkdown(text: string): InlinePart[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  const result: InlinePart[] = [];

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      result.push({ type: 'strong', value: part.slice(2, -2) });
      continue;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      result.push({ type: 'link', label: linkMatch[1]!, href: linkMatch[2]! });
      continue;
    }
    result.push({ type: 'text', value: part });
  }

  return result;
}

function splitTextWithGlossary(
  text: string,
  linkedTermIds: Set<string>
): Array<{ type: 'text'; value: string } | { type: 'glossary'; label: string; termId: string }> {
  const matches = findGlossaryMatchesInText(text, linkedTermIds);
  if (!matches.length) return [{ type: 'text', value: text }];

  const parts: Array<{ type: 'text'; value: string } | { type: 'glossary'; label: string; termId: string }> = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      parts.push({ type: 'text', value: text.slice(cursor, match.start) });
    }
    parts.push({ type: 'glossary', label: match.label, termId: match.termId });
    cursor = match.end;
  }

  if (cursor < text.length) {
    parts.push({ type: 'text', value: text.slice(cursor) });
  }

  return parts;
}

/** Parse le markdown inline et insère des liens glossaire (max 1 par terme et par paragraphe). */
export function parseInlineWithGlossary(
  text: string,
  linkedTermIds: Set<string> = new Set()
): InlinePart[] {
  const baseParts = parseInlineMarkdown(text);
  const result: InlinePart[] = [];

  for (const part of baseParts) {
    if (part.type !== 'text') {
      result.push(part);
      continue;
    }

    const glossaryParts = splitTextWithGlossary(part.value, linkedTermIds);
    for (const glossaryPart of glossaryParts) {
      result.push(glossaryPart);
    }
  }

  return result;
}

export function isBonnePratiqueBlockquote(text: string): boolean {
  return /^\*\*Bonne pratique\s*:/i.test(text.trim());
}
