import { describe, expect, it } from 'vitest';
import { parseVideoEmbed } from '@ama/shared/video-embed';

describe('parseVideoEmbed', () => {
  it('converts YouTube watch URLs to nocookie embeds without autoplay', () => {
    const parsed = parseVideoEmbed('https://www.youtube.com/watch?v=qrQyL5-SWFg');
    expect(parsed).toEqual({
      provider: 'youtube',
      embedUrl: 'https://www.youtube-nocookie.com/embed/qrQyL5-SWFg?rel=0&modestbranding=1',
      watchUrl: 'https://www.youtube.com/watch?v=qrQyL5-SWFg',
    });
    expect(parsed?.embedUrl).not.toContain('autoplay');
  });

  it('supports youtu.be short links and Vimeo', () => {
    expect(parseVideoEmbed('https://youtu.be/_g-0V2AFCW0')?.provider).toBe('youtube');
    expect(parseVideoEmbed('https://vimeo.com/123456789')?.embedUrl).toBe(
      'https://player.vimeo.com/video/123456789?dnt=1'
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
