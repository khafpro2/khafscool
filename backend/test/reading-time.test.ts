import { describe, expect, it } from 'vitest';
import {
  countLessonWords,
  estimateReadingMinutes,
  formatReadingTimeLabel,
  formatCourseHeroBanner,
  formatTrailCatalogMeta,
  sumLessonReadingMinutes,
  READING_WORDS_PER_MINUTE,
} from '@ama/shared/reading-time';
import { getCourseReadingMinutes } from '@ama/shared/course-content';

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

  it('sums reading minutes across lessons', () => {
    expect(sumLessonReadingMinutes(['word '.repeat(200), 'word '.repeat(400)])).toBe(3);
  });

  it('formats course hero banner for four-module tracks', () => {
    expect(formatCourseHeroBanner(4, 18, 10)).toBe('4 modules · 10 questions · ~18 min de lecture');
  });

  it('formats trail catalog meta with reading sum', () => {
    expect(formatTrailCatalogMeta(4, 18, 10)).toBe('~18 min · 4 modules · 40 questions');
  });

  it('exposes positive reading minutes for MVP courses', () => {
    expect(getCourseReadingMinutes('apple-cert-prep')).toBeGreaterThan(10);
    expect(getCourseReadingMinutes('jamf-pro-foundations')).toBeGreaterThan(10);
    expect(getCourseReadingMinutes('intune-ios-enrollment')).toBeGreaterThan(10);
  });
});
