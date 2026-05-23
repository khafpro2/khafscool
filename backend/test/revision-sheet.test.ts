import { describe, expect, it } from 'vitest';
import { buildRevisionSections, countRevisionTakeaways } from '@ama/shared/revision-sheet';
import { parseInlineWithGlossary } from '@ama/shared/lesson-markdown';

describe('revision sheet', () => {
  it('aggregates keyTakeaways from all modules in sort order', () => {
    const sections = buildRevisionSections([
      { slug: 'b', title: 'Module B', sortOrder: 2, keyTakeaways: ['Point B'] },
      { slug: 'a', title: 'Module A', sortOrder: 1, keyTakeaways: ['Point A1', 'Point A2'] },
      { slug: 'c', title: 'Module C', sortOrder: 3, keyTakeaways: [] },
    ]);

    expect(sections.map((section) => section.slug)).toEqual(['a', 'b']);
    expect(countRevisionTakeaways(sections)).toBe(3);
  });

  it('links glossary terms inside takeaways', () => {
    const takeaway = 'Activation Lock et supervision ABM passent par le MDM.';
    const parts = parseInlineWithGlossary(takeaway);

    expect(parts.some((part) => part.type === 'glossary' && part.termId === 'abm')).toBe(true);
    expect(parts.some((part) => part.type === 'glossary' && part.termId === 'supervision')).toBe(true);
  });
});
