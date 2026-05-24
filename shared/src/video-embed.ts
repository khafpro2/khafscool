export type VideoProvider = 'youtube' | 'vimeo' | 'mp4' | 'placeholder';

export type VideoEmbedLocale = 'fr' | 'en';

export type VideoEmbedOptions = {
  /** Langue du lecteur et des sous-titres préférés (défaut : fr). */
  locale?: VideoEmbedLocale;
};

export type ParsedVideoEmbed = {
  provider: VideoProvider;
  embedUrl: string | null;
  watchUrl: string | null;
};

function buildYouTubeEmbedUrl(videoId: string, locale: VideoEmbedLocale = 'fr'): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    hl: locale,
    cc_lang_pref: locale,
    cc_load_policy: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function buildYouTubeWatchUrl(videoId: string, locale: VideoEmbedLocale = 'fr'): string {
  const params = new URLSearchParams({ v: videoId, hl: locale });
  return `https://www.youtube.com/watch?${params.toString()}`;
}

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

/** Extrait l’identifiant YouTube d’une URL watch, youtu.be ou embed. */
export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  return extractYouTubeId(url.trim());
}

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
  providerHint?: VideoProvider,
  options?: VideoEmbedOptions
): ParsedVideoEmbed | null {
  const locale = options?.locale ?? 'fr';
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
      embedUrl: buildYouTubeEmbedUrl(youtubeId, locale),
      watchUrl: buildYouTubeWatchUrl(youtubeId, locale),
    };
  }

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    const vimeoParams = locale === 'fr' ? '?dnt=1&texttrack=fr' : '?dnt=1';
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}${vimeoParams}`,
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
