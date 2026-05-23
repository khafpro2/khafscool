import { describe, expect, it } from 'vitest';
import {
  isBonnePratiqueBlockquote,
  parseInlineMarkdown,
  parseLessonBlocks,
} from '@ama/shared/lesson-markdown';

describe('lesson markdown parser', () => {
  it('parses headings, lists, blockquotes and paragraphs', () => {
    const blocks = parseLessonBlocks(`## Section principale

### Sous-section

- Premier point
- Deuxième point

> **Bonne pratique :** Documentez chaque étape.

Paragraphe avec **gras** et [lien](https://example.com).`);

    expect(blocks).toEqual([
      { type: 'h2', text: 'Section principale' },
      { type: 'h3', text: 'Sous-section' },
      { type: 'ul', items: ['Premier point', 'Deuxième point'] },
      { type: 'blockquote', text: '**Bonne pratique :** Documentez chaque étape.' },
      { type: 'p', text: 'Paragraphe avec **gras** et [lien](https://example.com).' },
    ]);
  });

  it('detects Bonne pratique blockquotes', () => {
    expect(isBonnePratiqueBlockquote('**Bonne pratique :** Testez en labo.')).toBe(true);
    expect(isBonnePratiqueBlockquote('Citation neutre')).toBe(false);
  });

  it('parses inline bold and external links', () => {
    const parts = parseInlineMarkdown('Voir [Apple](https://apple.com) en **gras**.');
    expect(parts).toEqual([
      { type: 'text', value: 'Voir ' },
      { type: 'link', label: 'Apple', href: 'https://apple.com' },
      { type: 'text', value: ' en ' },
      { type: 'strong', value: 'gras' },
      { type: 'text', value: '.' },
    ]);
  });
});
