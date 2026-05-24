'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  computeVideoDubPlaybackRate,
  resolveVideoDubSegmentAt,
  type VideoDubFrSyncManifest,
  type VideoDubFrSyncSegment,
} from '@ama/shared/video-dub-fr';
import { Badge } from '@/components/ui/Badge';

type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YtApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    }
  ) => YtPlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
  };
};

declare global {
  interface Window {
    YT?: YtApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = 'true';
      document.head.appendChild(script);
    }
  });
}

type ModuleVideoFrenchDubPlayerProps = {
  youtubeVideoId: string;
  syncUrl: string;
  title: string;
  originalWatchUrl?: string | null;
};

export function ModuleVideoFrenchDubPlayer({
  youtubeVideoId,
  syncUrl,
  title,
  originalWatchUrl,
}: ModuleVideoFrenchDubPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const segmentsRef = useRef<VideoDubFrSyncSegment[]>([]);
  const activeSegmentRef = useRef<number | null>(null);
  const syncingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [manifestReady, setManifestReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const syncAudioToVideo = useCallback((videoTime: number, shouldPlay: boolean) => {
    const audio = audioRef.current;
    const segments = segmentsRef.current;
    if (!audio || !segments.length) return;

    const resolved = resolveVideoDubSegmentAt(segments, videoTime);
    if (!resolved) {
      if (!audio.paused) audio.pause();
      activeSegmentRef.current = null;
      return;
    }

    const { index, segment, windowEndSec } = resolved;
    const offsetInWindow = videoTime - segment.atSec;
    const windowDuration =
      Number.isFinite(windowEndSec) ? windowEndSec - segment.atSec : segment.durationSec;
    const playbackRate = computeVideoDubPlaybackRate(segment.durationSec, windowDuration);
    const targetAudioTime = Math.min(
      offsetInWindow * playbackRate,
      Math.max(0, segment.durationSec - 0.05)
    );
    const pastWindow = Number.isFinite(windowEndSec) && videoTime >= windowEndSec - 0.05;

    if (activeSegmentRef.current !== index) {
      activeSegmentRef.current = index;
      audio.src = segment.url;
      audio.load();
      audio.playbackRate = playbackRate;
      audio.currentTime = targetAudioTime;
    } else if (Math.abs(audio.playbackRate - playbackRate) > 0.02) {
      audio.playbackRate = playbackRate;
    }

    if (Math.abs(audio.currentTime - targetAudioTime) > 0.45) {
      audio.currentTime = targetAudioTime;
    }

    if (shouldPlay && !pastWindow && targetAudioTime < segment.durationSec) {
      if (audio.paused) {
        void audio.play().catch(() => playerRef.current?.pauseVideo());
      }
    } else if (!audio.paused) {
      audio.pause();
    }
  }, []);

  const tick = useCallback(() => {
    const player = playerRef.current;
    if (!player || !window.YT) return;

    const state = player.getPlayerState();
    const isPlaying = state === window.YT.PlayerState.PLAYING;
    syncAudioToVideo(player.getCurrentTime(), isPlaying);

    if (isPlaying) {
      rafRef.current = window.requestAnimationFrame(tick);
    }
  }, [syncAudioToVideo]);

  const pauseBoth = useCallback(() => {
    syncingRef.current = true;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    playerRef.current?.pauseVideo();
    audioRef.current?.pause();
    syncingRef.current = false;
  }, []);

  const playBoth = useCallback(async () => {
    const player = playerRef.current;
    if (!player || !ready || !manifestReady) return;

    syncingRef.current = true;
    try {
      activeSegmentRef.current = null;
      player.seekTo(0, true);
      audioRef.current?.pause();
      player.playVideo();
      syncAudioToVideo(0, true);
      rafRef.current = window.requestAnimationFrame(tick);
    } catch {
      pauseBoth();
    } finally {
      syncingRef.current = false;
    }
  }, [manifestReady, pauseBoth, ready, syncAudioToVideo, tick]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setManifestReady(false);

    void fetch(syncUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Manifest ${response.status}`);
        return response.json() as Promise<VideoDubFrSyncManifest>;
      })
      .then((manifest) => {
        if (cancelled) return;
        segmentsRef.current = manifest.segments;
        setManifestReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Impossible de charger le doublage synchronisé.');
      });

    return () => {
      cancelled = true;
    };
  }, [syncUrl]);

  useEffect(() => {
    let cancelled = false;

    void loadYouTubeIframeApi().then(() => {
      if (cancelled || !mountRef.current || playerRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId: youtubeVideoId,
        playerVars: {
          mute: 1,
          rel: 0,
          modestbranding: 1,
          hl: 'fr',
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onStateChange: (event) => {
            if (syncingRef.current || !window.YT) return;
            const player = playerRef.current;
            if (!player) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              syncAudioToVideo(player.getCurrentTime(), true);
              if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
              rafRef.current = window.requestAnimationFrame(tick);
              return;
            }

            if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }
              syncAudioToVideo(player.getCurrentTime(), false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [syncAudioToVideo, tick, youtubeVideoId]);

  return (
    <div className="module-video-dub-sync">
      <div className="module-video-frame">
        <div ref={mountRef} className="module-video-frame-yt-mount" title={title} aria-label={title} />
      </div>

      <audio ref={audioRef} preload="auto" className="module-video-dub-audio-hidden" />

      <div className="module-video-dub-controls">
        <Badge tone="accent" icon={'\u{1F399}\uFE0F'}>
          Doublage français synchronisé — son original coupé
        </Badge>
        {loadError ? <p className="muted module-video-dub-hint">{loadError}</p> : null}
        <div className="module-video-dub-actions">
          <button
            type="button"
            className="btn btn-sm"
            disabled={!ready || !manifestReady || Boolean(loadError)}
            onClick={() => void playBoth()}
          >
            Lire depuis le début
          </button>
          <button type="button" className="btn btn-sm btn-secondary" disabled={!ready} onClick={pauseBoth}>
            Pause
          </button>
          {originalWatchUrl ? (
            <a
              href={originalWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="module-video-dub-original-link"
            >
              Version anglaise sur YouTube
            </a>
          ) : null}
        </div>
        <p className="muted module-video-dub-hint">
          La voix française est calée sur chaque passage de la vidéo. Utilisez les contrôles YouTube :
          l&apos;image et le doublage avancent ensemble.
        </p>
      </div>
    </div>
  );
}
