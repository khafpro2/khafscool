export type VideoProvider = 'youtube' | 'vimeo' | 'mp4' | 'placeholder';

export type ParsedVideoEmbed = {
  provider: VideoProvider;
  embedUrl: string | null;
  watchUrl: string | null;
};

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/')[2];
        return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
      }
      const watchId = parsed.searchParams.get('v');
      return watchId && YOUTUBE_ID_PATTERN.test(watchId) ? watchId : null;
    }
  } catch {
    return null;
  }

  return null;
}

function extractVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;

    const segments = parsed.pathname.split('/').filter(Boolean);
    const id = segments.find((segment) => /^\d+$/.test(segment));
    return id ?? null;
  } catch {
    return null;
  }
}

/** Convertit une URL watch/CDN en URL d’embed sûre (sans autoplay). */
export function parseVideoEmbed(
  url: string | undefined | null,
  providerHint?: VideoProvider
): ParsedVideoEmbed | null {
  if (!url?.trim()) {
    if (providerHint === 'placeholder') {
      return { provider: 'placeholder', embedUrl: null, watchUrl: null };
    }
    return null;
  }

  const trimmed = url.trim();
  if (trimmed === 'placeholder' || providerHint === 'placeholder') {
    return { provider: 'placeholder', embedUrl: null, watchUrl: null };
  }

  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    };
  }

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?dnt=1`,
      watchUrl: `https://vimeo.com/${vimeoId}`,
    };
  }

  if (/^https?:\/\/.+\.(mp4|webm)(\?.*)?$/i.test(trimmed)) {
    return { provider: 'mp4', embedUrl: trimmed, watchUrl: trimmed };
  }

  return null;
}

export function formatVideoDurationLabel(minutes?: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  return minutes === 1 ? '1 min' : `${minutes} min`;
}

export function moduleHasVideo(module: {
  videoUrl?: string | null;
  videoProvider?: VideoProvider;
}): boolean {
  return Boolean(module.videoUrl?.trim()) || module.videoProvider === 'placeholder';
}
