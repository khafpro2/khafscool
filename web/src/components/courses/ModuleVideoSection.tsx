'use client';

import { useMemo } from 'react';
import {
  formatVideoDurationLabel,
  moduleHasVideo,
  parseVideoEmbed,
  type VideoProvider,
} from '@ama/shared/video-embed';
import { Badge } from '@/components/ui/Badge';
import { ModuleAnimatedExplainer } from '@/components/courses/ModuleAnimatedExplainer';

type ModuleVideoSectionProps = {
  videoUrl?: string | null;
  videoTitle?: string | null;
  videoDurationMinutes?: number | null;
  videoProvider?: VideoProvider;
  moduleTitle?: string;
};

export function ModuleVideoSection({
  videoUrl,
  videoTitle,
  videoDurationMinutes,
  videoProvider,
  moduleTitle,
}: ModuleVideoSectionProps) {
  const parsed = useMemo(
    () => parseVideoEmbed(videoUrl, videoProvider),
    [videoUrl, videoProvider]
  );

  if (!moduleHasVideo({ videoUrl, videoProvider })) {
    return null;
  }

  const title = videoTitle ?? (moduleTitle ? `Vidéo : ${moduleTitle}` : 'Vidéo explicative');
  const durationLabel = formatVideoDurationLabel(videoDurationMinutes);
  const ariaLabel = durationLabel ? `${title} — ${durationLabel}` : title;

  return (
    <section
      className="module-video-section"
      aria-label={ariaLabel}
      style={{ marginTop: '1rem', marginBottom: '0.5rem' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '0.55rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{title}</h3>
        {durationLabel ? (
          <Badge tone="neutral" icon={'\u{23F1}\uFE0F'}>
            {durationLabel}
          </Badge>
        ) : null}
      </div>

      <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
        Regardez la vidéo, puis lisez la leçon et passez le quiz.
      </p>

      {parsed?.provider === 'placeholder' || !parsed?.embedUrl ? (
        <div className="module-video-frame" style={{ aspectRatio: '16 / 9' }}>
          <ModuleAnimatedExplainer title={title} />
        </div>
      ) : parsed.provider === 'mp4' ? (
        <div className="module-video-frame" style={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <video
            controls
            preload="none"
            playsInline
            style={{ width: '100%', height: '100%', background: '#0f172a' }}
            aria-label={ariaLabel}
          >
            <source src={parsed.embedUrl} type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        </div>
      ) : (
        <div
          className="module-video-frame"
          style={{
            position: 'relative',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-soft)',
            background: '#0f172a',
          }}
        >
          <iframe
            src={parsed.embedUrl}
            title={title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        </div>
      )}
    </section>
  );
}
