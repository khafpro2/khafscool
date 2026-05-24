import { describe, expect, it } from 'vitest';
import { extractYouTubeVideoId, parseVideoEmbed } from '@ama/shared/video-embed';

describe('parseVideoEmbed', () => {
  it('converts YouTube watch URLs to nocookie embeds without autoplay', () => {
    const parsed = parseVideoEmbed('https://www.youtube.com/watch?v=qrQyL5-SWFg');
    expect(parsed?.provider).toBe('youtube');
    expect(parsed?.embedUrl).toContain('youtube-nocookie.com/embed/qrQyL5-SWFg');
    expect(parsed?.embedUrl).toContain('hl=fr');
    expect(parsed?.embedUrl).toContain('cc_lang_pref=fr');
    expect(parsed?.embedUrl).toContain('cc_load_policy=1');
    expect(parsed?.watchUrl).toContain('hl=fr');
    expect(parsed?.embedUrl).not.toContain('autoplay');
  });

  it('supports youtu.be short links and Vimeo', () => {
    expect(parseVideoEmbed('https://youtu.be/_g-0V2AFCW0')?.provider).toBe('youtube');
    expect(parseVideoEmbed('https://vimeo.com/123456789')?.embedUrl).toBe(
      'https://player.vimeo.com/video/123456789?dnt=1&texttrack=fr'
    );
  });

  it('accepts direct MP4 CDN URLs', () => {
    const parsed = parseVideoEmbed('https://cdn.example.com/intro.mp4');
    expect(parsed?.provider).toBe('mp4');
    expect(parsed?.embedUrl).toBe('https://cdn.example.com/intro.mp4');
  });

  it('returns placeholder mode without external URL', () => {
    expect(parseVideoEmbed(null, 'placeholder')).toEqual({
      provider: 'placeholder',
      embedUrl: null,
      watchUrl: null,
    });
  });

  it('rejects unsafe or unknown URLs', () => {
    expect(parseVideoEmbed('javascript:alert(1)')).toBeNull();
    expect(parseVideoEmbed('https://evil.example/not-video')).toBeNull();
  });
});

describe('extractYouTubeVideoId', () => {
  it('extracts ids from watch, youtu.be and embed URLs', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=qrQyL5-SWFg')).toBe('qrQyL5-SWFg');
    expect(extractYouTubeVideoId('https://youtu.be/_g-0V2AFCW0')).toBe('_g-0V2AFCW0');
    expect(extractYouTubeVideoId('https://www.youtube-nocookie.com/embed/GrSaEcbyGh8')).toBe('GrSaEcbyGh8');
    expect(extractYouTubeVideoId(null)).toBeNull();
  });
});
