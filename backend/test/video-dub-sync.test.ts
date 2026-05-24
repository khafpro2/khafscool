import { describe, expect, it } from 'vitest';
import {
  computeVideoDubPlaybackRate,
  getModuleVideoDubFr,
  getModuleVideoDubFrSyncUrl,
  resolveVideoDubSegmentAt,
} from '@ama/shared/video-dub-fr';

describe('video dub sync helpers', () => {
  it('resolves the active segment from video time', () => {
    const segments = [
      { atSec: 0, url: '/a.mp3', durationSec: 5 },
      { atSec: 30, url: '/b.mp3', durationSec: 8 },
      { atSec: 90, url: '/c.mp3', durationSec: 6 },
    ];

    expect(resolveVideoDubSegmentAt(segments, 10)?.segment.url).toBe('/a.mp3');
    expect(resolveVideoDubSegmentAt(segments, 30)?.segment.url).toBe('/b.mp3');
    expect(resolveVideoDubSegmentAt(segments, 120)?.segment.url).toBe('/c.mp3');
    expect(resolveVideoDubSegmentAt(segments, -1)).toBeNull();
  });

  it('clamps playback rate to keep audio inside the video window', () => {
    expect(computeVideoDubPlaybackRate(10, 20)).toBe(0.82);
    expect(computeVideoDubPlaybackRate(20, 20)).toBe(1);
    expect(computeVideoDubPlaybackRate(30, 20)).toBe(1.25);
  });

  it('defines synced dub manifests for pilot modules', () => {
    for (const [courseSlug, moduleSlug] of [
      ['jamf-pro-foundations', 'smart-groups-policies'],
      ['intune-ios-enrollment', 'ade-enrollment-basics'],
    ] as const) {
      const dub = getModuleVideoDubFr(courseSlug, moduleSlug);
      expect(dub?.basename, `${courseSlug}/${moduleSlug}`).toBeTruthy();
      expect(dub?.segments.length, `${courseSlug}/${moduleSlug}`).toBeGreaterThan(3);
      expect(getModuleVideoDubFrSyncUrl(dub!), `${courseSlug}/${moduleSlug}`).toMatch(/-sync\.json$/);
      for (let i = 1; i < dub!.segments.length; i += 1) {
        expect(dub!.segments[i].atSec).toBeGreaterThanOrEqual(dub!.segments[i - 1].atSec);
      }
    }
  });
});
