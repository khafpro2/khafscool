'use client';

import { useMemo } from 'react';
import {
  extractYouTubeVideoId,
  formatVideoDurationLabel,
  moduleHasVideo,
  parseVideoEmbed,
  type VideoProvider,
} from '@ama/shared/video-embed';
import { Badge } from '@/components/ui/Badge';
import { ModuleAnimatedExplainer } from '@/components/courses/ModuleAnimatedExplainer';
import { LessonContent } from '@/components/courses/LessonContent';
import { ModuleVideoFrenchDubPlayer } from '@/components/courses/ModuleVideoFrenchDubPlayer';

type ModuleVideoSectionProps = {
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
  videoUrl,
  videoTitle,
  videoDurationMinutes,
  videoProvider,
  videoTranscriptFr,
  videoHeyGenFrUrl,
  videoDubFrSyncUrl,
  videoDubFrUrl,
  moduleTitle,
}: ModuleVideoSectionProps) {
  const parsed = useMemo(
    () => parseVideoEmbed(videoUrl, videoProvider, { locale: 'fr' }),
    [videoUrl, videoProvider]
  );

  if (!moduleHasVideo({ videoUrl, videoProvider })) {
    return null;
  }

  const title = videoTitle ?? (moduleTitle ? `Vidéo : ${moduleTitle}` : 'Vidéo explicative');
  const durationLabel = formatVideoDurationLabel(videoDurationMinutes);
  const ariaLabel = durationLabel ? `${title} — ${durationLabel}` : title;
  const youtubeVideoId = extractYouTubeVideoId(videoUrl);
  const syncUrl = videoDubFrSyncUrl ?? videoDubFrUrl;
  const hasHeyGenFrenchVideo = Boolean(videoHeyGenFrUrl?.trim());
  const hasSyncedFrenchDub =
    !hasHeyGenFrenchVideo &&
    Boolean(syncUrl?.trim()) &&
    parsed?.provider === 'youtube' &&
    Boolean(youtubeVideoId);

  return (
    <section className="module-video-section" aria-label={ariaLabel}>
      <div className="module-video-section-header">
        <h3 className="module-video-section-title">{title}</h3>
        {durationLabel ? (
          <Badge tone="neutral" icon={'\u{23F1}\uFE0F'}>
            {durationLabel}
          </Badge>
        ) : null}
      </div>

      <p className="muted module-video-section-lead">
        {hasHeyGenFrenchVideo
          ? 'Vidéo entièrement doublée en français (HeyGen) — image et voix synchronisées.'
          : hasSyncedFrenchDub
            ? 'Regardez la vidéo : le doublage français est calé sur chaque passage affiché à l’écran.'
            : 'Regardez la vidéo, puis lisez la leçon et passez le quiz.'}
      </p>

      {hasHeyGenFrenchVideo ? (
        <div className="module-video-dub-sync">
          <div className="module-video-frame">
            <video controls preload="metadata" playsInline aria-label={`${title} — version française`}>
              <source src={videoHeyGenFrUrl!} type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          </div>
          <div className="module-video-dub-controls">
            <Badge tone="accent" icon={'\u{1F399}\uFE0F'}>
              Doublage HeyGen — français natif
            </Badge>
            {parsed?.watchUrl ? (
              <a
                href={parsed.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="module-video-dub-original-link"
              >
                Version anglaise sur YouTube
              </a>
            ) : null}
          </div>
        </div>
      ) : hasSyncedFrenchDub ? (
        <ModuleVideoFrenchDubPlayer
          youtubeVideoId={youtubeVideoId!}
          syncUrl={syncUrl!}
          title={title}
          originalWatchUrl={parsed?.watchUrl}
        />
      ) : parsed?.provider === 'placeholder' || !parsed?.embedUrl ? (
        <div className="module-video-frame module-video-frame--plain">
          <ModuleAnimatedExplainer title={title} />
        </div>
      ) : parsed.provider === 'mp4' ? (
        <div className="module-video-frame">
          <video controls preload="none" playsInline aria-label={ariaLabel}>
            <source src={parsed.embedUrl} type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        </div>
      ) : (
        <div className="module-video-frame">
          <iframe
            src={parsed.embedUrl}
            title={title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
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
