'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  computeVideoDubPlaybackRate,
  resolveVideoDubSegmentAt,
  type VideoDubFrSyncManifest,
  type VideoDubFrSyncSegment,
} from '@ama/shared/video-dub-fr';
import { Badge } from '@/components/ui/Badge';
import { ModuleAnimatedExplainer } from '@/components/courses/ModuleAnimatedExplainer';

type ModuleVideoFrenchDubPlayerProps = {
  videoSrc: string;
  syncUrl: string;
  title: string;
};

export function ModuleVideoFrenchDubPlayer({
  videoSrc,
  syncUrl,
  title,
}: ModuleVideoFrenchDubPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const segmentsRef = useRef<VideoDubFrSyncSegment[]>([]);
  const activeSegmentRef = useRef<number | null>(null);
  const syncingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [manifestReady, setManifestReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [videoMissing, setVideoMissing] = useState(false);

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
        void audio.play().catch(() => videoRef.current?.pause());
      }
    } else if (!audio.paused) {
      audio.pause();
    }
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused) return;

    syncAudioToVideo(video.currentTime, true);
    rafRef.current = window.requestAnimationFrame(tick);
  }, [syncAudioToVideo]);

  const pauseBoth = useCallback(() => {
    syncingRef.current = true;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    videoRef.current?.pause();
    audioRef.current?.pause();
    syncingRef.current = false;
  }, []);

  const playBoth = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !ready || !manifestReady || videoMissing) return;

    syncingRef.current = true;
    try {
      activeSegmentRef.current = null;
      video.currentTime = 0;
      audioRef.current?.pause();
      await video.play();
      syncAudioToVideo(0, true);
      rafRef.current = window.requestAnimationFrame(tick);
    } catch {
      pauseBoth();
    } finally {
      syncingRef.current = false;
    }
  }, [manifestReady, pauseBoth, ready, tick, videoMissing, syncAudioToVideo]);

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
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => setReady(true);
    const onError = () => setVideoMissing(true);
    const onPlay = () => {
      if (syncingRef.current) return;
      syncAudioToVideo(video.currentTime, true);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    const onPause = () => {
      if (syncingRef.current) return;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      syncAudioToVideo(video.currentTime, false);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [syncAudioToVideo, tick, videoSrc]);

  return (
    <div className="module-video-dub-sync">
      <div className="module-video-frame">
        {videoMissing ? (
          <ModuleAnimatedExplainer title={title} />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            controls
            playsInline
            preload="metadata"
            title={title}
            aria-label={title}
          />
        )}
      </div>

      <audio ref={audioRef} preload="auto" className="module-video-dub-audio-hidden" />

      <div className="module-video-dub-controls">
        <Badge tone="accent" icon={'\u{1F399}\uFE0F'}>
          Doublage français synchronisé — voix Lifa
        </Badge>
        {videoMissing ? (
          <p className="muted module-video-dub-hint">
            La vidéo locale n&apos;est pas encore disponible. Le doublage audio reste jouable via les
            contrôles ci-dessous une fois le MP4 publié.
          </p>
        ) : null}
        {loadError ? <p className="muted module-video-dub-hint">{loadError}</p> : null}
        <div className="module-video-dub-actions">
          <button
            type="button"
            className="btn btn-sm"
            disabled={(!ready && !videoMissing) || !manifestReady || Boolean(loadError)}
            onClick={() => void playBoth()}
          >
            Lire depuis le début
          </button>
          <button type="button" className="btn btn-sm btn-secondary" disabled={!ready && !videoMissing} onClick={pauseBoth}>
            Pause
          </button>
        </div>
        <p className="muted module-video-dub-hint">
          La voix française est calée sur chaque passage de la vidéo locale. L&apos;image est muette :
          seul le doublage est audible.
        </p>
      </div>
    </div>
  );
}
