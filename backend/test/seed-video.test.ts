import { describe, expect, it } from 'vitest';
import {
  countCourseVideoModules,
  getModulePedagogy,
  listPilotVideoModules,
  PILOT_VIDEO_MODULES,
} from '@ama/shared/course-content';
import { getModuleVideoDubFr, getModuleVideoDubFrSyncUrl } from '@ama/shared/video-dub-fr';

describe('seed pilot module videos', () => {
  it('defines eleven pilot videos (three Apple, four Jamf/Intune)', () => {
    expect(PILOT_VIDEO_MODULES).toHaveLength(11);
    expect(listPilotVideoModules().map((entry) => entry.moduleSlug)).toEqual([
      'ios-troubleshooting',
      'acmt-exam-prep',
      'apps-vpp-management',
      'smart-groups-policies',
      'inventory-basics',
      'enrollment-apple-integration',
      'api-automation-advanced-policies',
      'ade-enrollment-basics',
      'compliance-policies',
      'app-protection-conditional-access',
      'vpp-abm-business-apps',
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

  it('counts video modules per course track', () => {
    expect(countCourseVideoModules('apple-cert-prep')).toBe(3);
    expect(countCourseVideoModules('jamf-pro-foundations')).toBe(4);
    expect(countCourseVideoModules('intune-ios-enrollment')).toBe(4);
  });

  it('does not expose video metadata on Apple module 1', () => {
    const pedagogy = getModulePedagogy('apple-cert-prep', 'device-support-basics');
    expect(pedagogy?.videoUrl).toBeUndefined();
    expect(pedagogy?.videoTitle).toBeUndefined();
    expect(pedagogy?.videoProvider).toBeUndefined();
  });

  it('serves Jamf smart groups video as local French MP4', () => {
    const pedagogy = getModulePedagogy('jamf-pro-foundations', 'smart-groups-policies');
    expect(pedagogy?.videoSourceLanguage).toBe('fr');
    expect(pedagogy?.videoProvider).toBe('mp4');
    expect(pedagogy?.videoUrl).toBe('/media/videos/fr/jamf-smart-groups-policies-fr.mp4');
  });

  it('defines French dubbed audio for module 1 intro videos only', () => {
    const introModules = PILOT_VIDEO_MODULES.filter(
      (entry) =>
        entry.moduleSlug === 'smart-groups-policies' ||
        entry.moduleSlug === 'ade-enrollment-basics'
    );
    expect(introModules).toHaveLength(2);

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
