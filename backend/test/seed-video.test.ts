import { describe, expect, it } from 'vitest';
import { getModulePedagogy, listPilotVideoModules, PILOT_VIDEO_MODULES } from '@ama/shared/course-content';

describe('seed pilot module videos', () => {
  it('defines three intro videos (module 1 per track)', () => {
    expect(PILOT_VIDEO_MODULES).toHaveLength(3);
    expect(listPilotVideoModules().map((entry) => entry.moduleSlug)).toEqual([
      'device-support-basics',
      'smart-groups-policies',
      'ade-enrollment-basics',
    ]);
  });

  it('seeds video metadata from course-content for pilot modules', () => {
    for (const { courseSlug, moduleSlug } of PILOT_VIDEO_MODULES) {
      const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
      expect(pedagogy?.videoUrl, `${courseSlug}/${moduleSlug}`).toMatch(/^https:\/\//);
      expect(pedagogy?.videoTitle, `${courseSlug}/${moduleSlug}`).toMatch(/^Vidéo :/);
      expect(pedagogy?.videoDurationMinutes, `${courseSlug}/${moduleSlug}`).toBeGreaterThan(0);
      expect(pedagogy?.videoProvider).toBe('youtube');
    }
  });
});
