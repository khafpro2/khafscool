import { CourseTrack } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  buildCertificationSprintQuestKey,
  normalizeCertificationSprintDays,
  parseCertificationSprintQuestKey,
} from '../src/services/gamification.service.js';

describe('certification sprint helpers', () => {
  it('builds and parses sprint quest keys', () => {
    const questKey = buildCertificationSprintQuestKey(CourseTrack.INTUNE, new Date(2026, 4, 18, 10), 14);

    expect(questKey).toBe('sprint:INTUNE:2026-05-18:14');
    expect(parseCertificationSprintQuestKey(questKey)).toMatchObject({
      track: CourseTrack.INTUNE,
      days: 14,
    });
  });

  it('defaults to seven days and rejects unsupported durations', () => {
    expect(normalizeCertificationSprintDays()).toBe(7);
    expect(normalizeCertificationSprintDays(7)).toBe(7);
    expect(normalizeCertificationSprintDays(14)).toBe(14);
    expect(() => normalizeCertificationSprintDays(30)).toThrow('INVALID_SPRINT_DAYS');
  });
});
