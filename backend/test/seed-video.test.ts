import { describe, expect, it } from 'vitest';
import {
  countCourseVideoModules,
  getModulePedagogy,
  listPilotVideoModules,
  PILOT_VIDEO_MODULES,
} from '@ama/shared/course-content';
import { getModuleVideoDubFr, getModuleVideoDubFrSyncUrl } from '@ama/shared/video-dub-fr';

describe('seed pilot module videos', () => {
  it('defines nine pilot videos (modules 1–3 per track)', () => {
    expect(PILOT_VIDEO_MODULES).toHaveLength(9);
    expect(listPilotVideoModules().map((entry) => entry.moduleSlug)).toEqual([
      'device-support-basics',
      'ios-troubleshooting',
      'acmt-exam-prep',
      'smart-groups-policies',
      'inventory-basics',
      'enrollment-apple-integration',
      'ade-enrollment-basics',
      'compliance-policies',
      'app-protection-conditional-access',
    ]);
  });

  it('seeds video metadata from course-content for pilot modules', () => {
    for (const { courseSlug, moduleSlug } of PILOT_VIDEO_MODULES) {
      const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
      expect(pedagogy?.videoTitle, `${courseSlug}/${moduleSlug}`).toMatch(/^Vidéo :/);
      expect(pedagogy?.videoDurationMinutes, `${courseSlug}/${moduleSlug}`).toBeGreaterThan(0);
      if (pedagogy?.videoProvider === 'placeholder') {
        expect(pedagogy.videoUrl).toBe('placeholder');
      } else if (pedagogy?.videoProvider === 'youtube') {
        expect(pedagogy?.videoUrl, `${courseSlug}/${moduleSlug}`).toMatch(/youtube\.com|youtu\.be/);
      } else {
        expect(pedagogy?.videoUrl, `${courseSlug}/${moduleSlug}`).toMatch(/^\/media\/videos\//);
        expect(pedagogy?.videoProvider).toBe('mp4');
      }
    }
  });

  it('counts three video modules per course track', () => {
    expect(countCourseVideoModules('apple-cert-prep')).toBe(3);
    expect(countCourseVideoModules('jamf-pro-foundations')).toBe(3);
    expect(countCourseVideoModules('intune-ios-enrollment')).toBe(3);
  });

  it('provides a French transcript for the Jamf intro video', () => {
    const pedagogy = getModulePedagogy('jamf-pro-foundations', 'smart-groups-policies');
    expect(pedagogy?.videoSourceLanguage).toBe('en');
    expect(pedagogy?.videoProvider).toBe('youtube');
    expect(pedagogy?.videoUrl).toContain('t3j9TkFfUJw');
    expect(pedagogy?.videoTranscriptFr).toMatch(/Jamf Pro/i);
    expect(pedagogy?.videoTranscriptFr).toMatch(/Smart Groups/i);
  });

  it('defines French dubbed audio for module 1 intro videos only', () => {
    const introModules = PILOT_VIDEO_MODULES.filter(
      (entry) =>
        entry.moduleSlug === 'device-support-basics' ||
        entry.moduleSlug === 'smart-groups-policies' ||
        entry.moduleSlug === 'ade-enrollment-basics'
    );
    expect(introModules).toHaveLength(3);

    for (const { courseSlug, moduleSlug } of introModules) {
      const dub = getModuleVideoDubFr(courseSlug, moduleSlug);
      expect(dub?.basename, `${courseSlug}/${moduleSlug}`).toMatch(/-fr$/);
      expect(dub?.segments.length, `${courseSlug}/${moduleSlug}`).toBeGreaterThan(3);
      expect(getModuleVideoDubFrSyncUrl(dub!), `${courseSlug}/${moduleSlug}`).toMatch(
        /^\/media\/dubs\/.*-sync\.json$/
      );
    }
  });
});
