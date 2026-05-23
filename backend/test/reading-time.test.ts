import { describe, expect, it } from 'vitest';
import {
  countLessonWords,
  estimateReadingMinutes,
  formatReadingTimeLabel,
  READING_WORDS_PER_MINUTE,
} from '@ama/shared/reading-time';

describe('reading time', () => {
  it('uses ~200 words per minute', () => {
    expect(READING_WORDS_PER_MINUTE).toBe(200);
    expect(estimateReadingMinutes(200)).toBe(1);
    expect(estimateReadingMinutes(201)).toBe(2);
    expect(estimateReadingMinutes(400)).toBe(2);
  });

  it('returns at least 1 minute for empty content', () => {
    expect(estimateReadingMinutes(0)).toBe(1);
    expect(estimateReadingMinutes(-5)).toBe(1);
  });

  it('counts words in markdown lesson content', () => {
    const words = countLessonWords('## Titre\n\nParagraphe avec **gras** et [lien](https://example.com).');
    expect(words).toBeGreaterThan(5);
  });

  it('formats French reading badge label', () => {
    expect(formatReadingTimeLabel(400)).toBe('~2 min de lecture');
  });
});
