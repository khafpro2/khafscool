import { describe, expect, it } from 'vitest';
import {
  isBonnePratiqueBlockquote,
  parseInlineMarkdown,
  parseInlineWithGlossary,
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

  it('links glossary terms once per paragraph', () => {
    const linked = new Set<string>();
    const parts = parseInlineWithGlossary(
      'ABM centralise VPP et la supervision MDM. ABM reste le portail clé.',
      linked
    );

    expect(parts.some((part) => part.type === 'glossary' && part.termId === 'abm')).toBe(true);
    expect(parts.filter((part) => part.type === 'glossary' && part.termId === 'abm')).toHaveLength(1);
    expect(linked.has('abm')).toBe(true);
  });

  it('does not link inside existing markdown links', () => {
    const parts = parseInlineWithGlossary('[ABM](https://example.com) et VPP.');
    expect(parts.some((part) => part.type === 'glossary')).toBe(true);
    expect(parts.some((part) => part.type === 'link' && part.label === 'ABM')).toBe(true);
  });
});
