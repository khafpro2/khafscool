'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  canEmbedExternalVideo,
  formatVideoDurationLabel,
  moduleHasVideo,
  parseVideoEmbed,
  type VideoProvider,
} from '@ama/shared/video-embed';
import { Badge } from '@/components/ui/Badge';
import { ModuleAnimatedExplainer } from '@/components/courses/ModuleAnimatedExplainer';
import { LessonContent } from '@/components/courses/LessonContent';
import { ModuleVideoFrenchDubPlayer } from '@/components/courses/ModuleVideoFrenchDubPlayer';
import { isVideoWatched, markVideoWatched } from '@/lib/video-watched';

const VIDEO_WATCH_SECONDS = 30;

type ModuleVideoSectionProps = {
  moduleId?: string;
  videoUrl?: string | null;
  videoTitle?: string | null;
  videoDurationMinutes?: number | null;
  videoProvider?: VideoProvider;
  videoSourceLanguage?: 'fr' | 'en' | null;
  videoTranscriptFr?: string | null;
  videoHeyGenFrUrl?: string | null;
  videoDubFrSyncUrl?: string | null;
  videoDubFrUrl?: string | null;
  moduleTitle?: string;
};

export function ModuleVideoSection({
  moduleId,
  videoUrl,
  videoTitle,
  videoDurationMinutes,
  videoProvider,
  videoSourceLanguage,
  videoTranscriptFr,
  videoHeyGenFrUrl,
  videoDubFrSyncUrl,
  videoDubFrUrl,
  moduleTitle,
}: ModuleVideoSectionProps) {
  const [localVideoMissing, setLocalVideoMissing] = useState(false);
  const watchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parsed = useMemo(
    () => parseVideoEmbed(videoUrl, videoProvider, { locale: 'fr' }),
    [videoUrl, videoProvider]
  );

  const scheduleVideoWatched = useCallback(() => {
    if (!moduleId || isVideoWatched(moduleId)) return;
    if (watchTimerRef.current) return;
    watchTimerRef.current = setTimeout(() => {
      markVideoWatched(moduleId);
      watchTimerRef.current = null;
    }, VIDEO_WATCH_SECONDS * 1000);
  }, [moduleId]);

  useEffect(() => {
    return () => {
      if (watchTimerRef.current) {
        clearTimeout(watchTimerRef.current);
        watchTimerRef.current = null;
      }
    };
  }, [moduleId, videoUrl]);

  if (!moduleHasVideo({ videoUrl, videoProvider })) {
    return null;
  }

  const title = videoTitle ?? (moduleTitle ? `Vidéo : ${moduleTitle}` : 'Vidéo explicative');
  const durationLabel = formatVideoDurationLabel(videoDurationMinutes);
  const ariaLabel = durationLabel ? `${title} — ${durationLabel}` : title;
  const localVideoSrc = parsed?.provider === 'mp4' ? parsed.embedUrl : null;
  const syncUrl = videoDubFrSyncUrl ?? videoDubFrUrl;
  const hasHeyGenFrenchVideo = Boolean(videoHeyGenFrUrl?.trim());
  const hasSyncedFrenchDub =
    !hasHeyGenFrenchVideo && Boolean(syncUrl?.trim()) && Boolean(localVideoSrc);
  const allowExternalEmbed = canEmbedExternalVideo(videoSourceLanguage);
  const showFrenchPending =
    parsed?.provider === 'placeholder' ||
    !parsed?.embedUrl ||
    localVideoMissing ||
    ((parsed.provider === 'youtube' || parsed.provider === 'vimeo') && !allowExternalEmbed);

  return (
    <section className="module-video-section" aria-label={ariaLabel}>
      <div className="module-video-section-header">
        <h3 className="module-video-section-title">{title}</h3>
        <div className="module-video-section-badges">
          <Badge tone="accent" icon={'\u{1F1EB}\u{1F1F7}'}>
            Français
          </Badge>
          {durationLabel ? (
            <Badge tone="neutral" icon={'\u{23F1}\uFE0F'}>
              {durationLabel}
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="muted module-video-section-lead">
        {showFrenchPending
          ? 'Vidéo française bientôt disponible — schéma animé et leçon ci-dessous en attendant.'
          : hasHeyGenFrenchVideo
            ? 'Vidéo explicative en français — hébergée sur Apple MDM Academy.'
            : hasSyncedFrenchDub
              ? 'Regardez la vidéo locale : le doublage français est calé sur chaque passage.'
              : 'Regardez la vidéo, puis lisez la leçon et passez le quiz.'}
      </p>

      {hasHeyGenFrenchVideo ? (
        <div className="module-video-dub-sync">
          <div className="module-video-frame">
            <video
              controls
              preload="metadata"
              playsInline
              aria-label={`${title} — version française`}
              onLoadedData={scheduleVideoWatched}
            >
              <source src={videoHeyGenFrUrl!} type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          </div>
          <div className="module-video-dub-controls">
            <Badge tone="accent" icon={'\u{1F399}\uFE0F'}>
              Vidéo FR
            </Badge>
          </div>
        </div>
      ) : hasSyncedFrenchDub ? (
        <ModuleVideoFrenchDubPlayer videoSrc={localVideoSrc!} syncUrl={syncUrl!} title={title} />
      ) : showFrenchPending ? (
        <div className="module-video-frame module-video-frame--plain">
          <ModuleAnimatedExplainer title={title} onReady={scheduleVideoWatched} />
        </div>
      ) : parsed.provider === 'mp4' ? (
        <div className="module-video-frame">
          {localVideoMissing ? (
            <ModuleAnimatedExplainer title={title} onReady={scheduleVideoWatched} />
          ) : (
            <video
              controls
              preload="metadata"
              playsInline
              aria-label={ariaLabel}
              onError={() => setLocalVideoMissing(true)}
              onLoadedData={scheduleVideoWatched}
            >
              <source src={parsed.embedUrl!} type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          )}
        </div>
      ) : parsed.provider === 'youtube' || parsed.provider === 'vimeo' ? (
        <div className="module-video-frame">
          <iframe
            src={parsed.embedUrl ?? undefined}
            title={ariaLabel}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={scheduleVideoWatched}
          />
        </div>
      ) : (
        <div className="module-video-frame module-video-frame--plain">
          <ModuleAnimatedExplainer title={title} onReady={scheduleVideoWatched} />
        </div>
      )}

      {videoTranscriptFr ? (
        <details className="module-video-transcript">
          <summary>Transcription en français</summary>
          <div className="module-video-transcript-body">
            <LessonContent content={videoTranscriptFr} />
          </div>
        </details>
      ) : null}
    </section>
  );
}
