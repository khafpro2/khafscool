import { describe, expect, it } from 'vitest';
import {
  countCourseVideoModules,
  getModulePedagogy,
  listPilotVideoModules,
  PILOT_VIDEO_MODULES,
} from '@ama/shared/course-content';
import { getPilotModuleVideoConfig, isModuleVideoHeyGenFrReady } from '@ama/shared/video-local';
import { getModuleVideoDubFr, getModuleVideoDubFrSyncUrl } from '@ama/shared/video-dub-fr';

describe('seed pilot module videos', () => {
  it('defines eleven pilot videos (module 1 Apple sans vidéo ADE)', () => {
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
      expect(pedagogy?.videoSourceLanguage, `${courseSlug}/${moduleSlug}`).toBe('fr');

      if (pedagogy?.videoProvider === 'youtube') {
        expect(pedagogy.videoUrl, `${courseSlug}/${moduleSlug}`).toMatch(
          /^https:\/\/www\.youtube\.com\/watch\?v=/
        );
        continue;
      }

      const expected = getPilotModuleVideoConfig(courseSlug, moduleSlug);
      expect(pedagogy?.videoProvider, `${courseSlug}/${moduleSlug}`).toBe(expected.videoProvider);
      expect(pedagogy?.videoUrl, `${courseSlug}/${moduleSlug}`).toBe(expected.videoUrl);
      if (pedagogy?.videoProvider === 'placeholder') {
        expect(pedagogy.videoUrl).toBe('placeholder');
      } else {
        expect(pedagogy?.videoUrl, `${courseSlug}/${moduleSlug}`).toMatch(/^\/media\/videos\/(fr|sources)\//);
        expect(pedagogy?.videoProvider).toBe('mp4');
      }
    }
  });

  it('counts video modules per course track', () => {
    expect(countCourseVideoModules('apple-cert-prep')).toBe(3);
    expect(countCourseVideoModules('jamf-pro-foundations')).toBe(4);
    expect(countCourseVideoModules('intune-ios-enrollment')).toBe(4);
  });

  it('omits video metadata on Apple module 1 (no ADE intro video)', () => {
    const pedagogy = getModulePedagogy('apple-cert-prep', 'device-support-basics');
    expect(pedagogy?.videoUrl).toBeUndefined();
    expect(pedagogy?.videoTitle).toBeUndefined();
    expect(pedagogy?.videoProvider).toBeUndefined();
  });

  it('uses French YouTube on Apple module 2 ios-troubleshooting', () => {
    const pedagogy = getModulePedagogy('apple-cert-prep', 'ios-troubleshooting');
    expect(pedagogy?.videoUrl).toBe('https://www.youtube.com/watch?v=lgMDK4zU114');
    expect(pedagogy?.videoTitle).toBe('Vidéo : dépannage iOS en environnement géré');
    expect(pedagogy?.videoProvider).toBe('youtube');
    expect(pedagogy?.videoSourceLanguage).toBe('fr');
    expect(pedagogy?.videoTitle).not.toMatch(/ADE|ABM/i);
  });

  it('uses YouTube intro on Jamf module 1 (not Smart Groups titled video)', () => {
    const pedagogy = getModulePedagogy('jamf-pro-foundations', 'smart-groups-policies');
    expect(pedagogy?.videoUrl).toBe('https://www.youtube.com/watch?v=t3j9TkFfUJw');
    expect(pedagogy?.videoTitle).toBe('Vidéo : introduction Jamf Pro');
    expect(pedagogy?.videoProvider).toBe('youtube');
    expect(pedagogy?.videoSourceLanguage).toBe('fr');
    expect(getModuleVideoDubFr('jamf-pro-foundations', 'smart-groups-policies')).toBeUndefined();
  });

  it('uses dub-sync for Jamf ABM module when HeyGen is pending', () => {
    const pedagogy = getModulePedagogy('jamf-pro-foundations', 'enrollment-apple-integration');
    expect(isModuleVideoHeyGenFrReady('jamf-pro-foundations', 'enrollment-apple-integration')).toBe(
      false
    );
    expect(pedagogy?.videoProvider).toBe('mp4');
    expect(pedagogy?.videoUrl).toBe('/media/videos/sources/device-support-basics-ade-en.heygen.mp4');
    expect(getModuleVideoDubFr('jamf-pro-foundations', 'enrollment-apple-integration')).toBeDefined();
  });

  it('serves module 4 pilot videos as French YouTube when HeyGen is pending', () => {
    const appleVpp = getModulePedagogy('apple-cert-prep', 'apps-vpp-management');
    expect(appleVpp?.videoProvider).toBe('youtube');
    expect(appleVpp?.videoUrl).toBe('https://www.youtube.com/watch?v=k0cchC6mE88');
    expect(appleVpp?.videoTitle).toBe('Vidéo : apps VPP et apps gérées en entreprise');
    expect(appleVpp?.videoTitle).not.toMatch(/ADE|ABM/i);

    const jamfApi = getModulePedagogy('jamf-pro-foundations', 'api-automation-advanced-policies');
    expect(jamfApi?.videoProvider).toBe('youtube');
    expect(jamfApi?.videoUrl).toBe('https://www.youtube.com/watch?v=t3j9TkFfUJw');

    const intuneVpp = getModulePedagogy('intune-ios-enrollment', 'vpp-abm-business-apps');
    expect(intuneVpp?.videoProvider).toBe('youtube');
    expect(intuneVpp?.videoUrl).toBe('https://www.youtube.com/watch?v=k0cchC6mE88');
  });

  it('serves module 3 pilot videos (FR MP4 or YouTube)', () => {
    const acmt = getModulePedagogy('apple-cert-prep', 'acmt-exam-prep');
    expect(acmt?.videoProvider).toBe('mp4');
    expect(acmt?.videoUrl).toBe('/media/videos/fr/apple-acmt-exam-prep-fr.mp4');
    expect(acmt?.videoTitle).toBe('Vidéo : Apple Diagnostics et préparation examen');
    expect(acmt?.videoTitle).not.toMatch(/ADE|ABM/i);

    const jamfApi = getModulePedagogy('jamf-pro-foundations', 'api-automation-advanced-policies');
    expect(jamfApi?.videoProvider).toBe('youtube');
    expect(jamfApi?.videoUrl).toBe('https://www.youtube.com/watch?v=t3j9TkFfUJw');
    expect(jamfApi?.videoTitle).toBe('Vidéo : automatisation API Jamf Pro');

    const intuneAppProtection = getModulePedagogy(
      'intune-ios-enrollment',
      'app-protection-conditional-access'
    );
    expect(intuneAppProtection?.videoProvider).toBe('youtube');
    expect(intuneAppProtection?.videoUrl).toBe('https://www.youtube.com/watch?v=F4PESZiEQhU');
    expect(intuneAppProtection?.videoTitle).toBe('Vidéo : App Protection et Conditional Access Intune');
  });

  it('serves ready HeyGen modules as local French MP4', () => {
    const readyCases = [
      ['apple-cert-prep', 'acmt-exam-prep', '/media/videos/fr/apple-acmt-exam-prep-fr.mp4'],
      ['jamf-pro-foundations', 'inventory-basics', '/media/videos/fr/jamf-inventory-basics-fr.mp4'],
      [
        'intune-ios-enrollment',
        'ade-enrollment-basics',
        '/media/videos/fr/intune-ade-enrollment-basics-fr.mp4',
      ],
      [
        'intune-ios-enrollment',
        'compliance-policies',
        '/media/videos/fr/intune-compliance-policies-fr.mp4',
      ],
    ] as const;

    for (const [courseSlug, moduleSlug, url] of readyCases) {
      expect(isModuleVideoHeyGenFrReady(courseSlug, moduleSlug)).toBe(true);
      const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
      expect(pedagogy?.videoProvider).toBe('mp4');
      expect(pedagogy?.videoUrl).toBe(url);
    }
  });

  it('defines French dubbed audio for pilot intro videos with dub sync', () => {
    const introModules = PILOT_VIDEO_MODULES.filter(
      (entry) =>
        entry.moduleSlug === 'enrollment-apple-integration' ||
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
