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

export type InlinePart =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'link'; label: string; href: string };

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

export function isBonnePratiqueBlockquote(text: string): boolean {
  return /^\*\*Bonne pratique\s*:/i.test(text.trim());
}
