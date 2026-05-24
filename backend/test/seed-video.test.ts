import { describe, expect, it } from 'vitest';
import { getModulePedagogy, listPilotVideoModules, PILOT_VIDEO_MODULES } from '@ama/shared/course-content';
import { getModuleVideoDubFr, getModuleVideoDubFrSyncUrl } from '@ama/shared/video-dub-fr';

describe('seed pilot module videos', () => {
  it('defines six pilot videos (modules 1 and 2 per track)', () => {
    expect(PILOT_VIDEO_MODULES).toHaveLength(6);
    expect(listPilotVideoModules().map((entry) => entry.moduleSlug)).toEqual([
      'device-support-basics',
      'ios-troubleshooting',
      'smart-groups-policies',
      'inventory-basics',
      'ade-enrollment-basics',
      'compliance-policies',
    ]);
  });

  it('seeds video metadata from course-content for pilot modules', () => {
    for (const { courseSlug, moduleSlug } of PILOT_VIDEO_MODULES) {
      const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
      expect(pedagogy?.videoTitle, `${courseSlug}/${moduleSlug}`).toMatch(/^Vidéo :/);
      expect(pedagogy?.videoDurationMinutes, `${courseSlug}/${moduleSlug}`).toBeGreaterThan(0);
      if (pedagogy?.videoProvider === 'placeholder') {
        expect(pedagogy.videoUrl).toBe('placeholder');
      } else {
        expect(pedagogy?.videoUrl, `${courseSlug}/${moduleSlug}`).toMatch(/^https:\/\//);
        expect(pedagogy?.videoProvider).toBe('youtube');
      }
    }
  });

  it('provides a French transcript for the Jamf intro video', () => {
    const pedagogy = getModulePedagogy('jamf-pro-foundations', 'smart-groups-policies');
    expect(pedagogy?.videoSourceLanguage).toBe('en');
    expect(pedagogy?.videoTranscriptFr).toMatch(/Jamf Pro/i);
    expect(pedagogy?.videoTranscriptFr).toMatch(/Apple Business Manager/i);
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
