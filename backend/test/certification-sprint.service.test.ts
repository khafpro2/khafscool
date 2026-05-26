import { CourseTrack } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  buildCertificationSprintQuestKey,
  normalizeCertificationSprintDays,
  parseCertificationSprintQuestKey,
} from '../src/services/gamification.service.js';
import { parseCertificationSprintRequest } from '../src/controllers/courses.controller.js';

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

describe('certification sprint request validation', () => {
  it('accepts supported tracks and sprint durations', () => {
    const result = parseCertificationSprintRequest({ track: CourseTrack.INTUNE, days: 14 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ track: CourseTrack.INTUNE, days: 14 });
    }
  });

  it('rejects unsupported tracks and durations before service logic', () => {
    const invalidTrack = parseCertificationSprintRequest({ track: 'LINUX', days: 7 });
    const invalidDays = parseCertificationSprintRequest({ track: CourseTrack.APPLE, days: 30 });

    expect(invalidTrack.success).toBe(false);
    expect(invalidDays.success).toBe(false);
    if (!invalidTrack.success) {
      expect(invalidTrack.error.issues[0]?.path).toEqual(['track']);
    }
    if (!invalidDays.success) {
      expect(invalidDays.error.issues[0]?.path).toEqual(['days']);
    }
  });
});
