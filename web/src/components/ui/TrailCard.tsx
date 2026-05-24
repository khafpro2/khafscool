import Link from 'next/link';
import * as React from 'react';
import { QUESTIONS_PER_MODULE } from '@ama/shared/constants';
import { formatTrailCatalogMeta } from '@ama/shared/reading-time';
import { Badge } from './Badge';
import { LevelPill } from './LevelPill';
import { ProgressBar } from './ProgressBar';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { BrandIcon } from '@/components/ui/BrandIcon';
import {
  estimateDurationMinutes,
  estimatePoints,
  formatDurationLabel,
  getRewardBadgeForTrack,
  getTrackVisual,
  inferLevelFromModules,
  type TrailLevel,
} from '@/lib/design';

export interface TrailCardProps {
  href: string;
  title: string;
  description?: string;
  track?: string | null;
  trackLabel?: string;
  totalModules?: number;
  completedModules?: number;
  progressPercent?: number;
  questionsPerModule?: number;
  showProgress?: boolean;
  level?: TrailLevel;
  durationMinutes?: number;
  readingMinutes?: number;
  points?: number;
  rewardBadge?: { label: string; brand?: import('@/lib/brands').BrandId; icon?: string } | null;
  cta?: string;
  ctaSuffix?: React.ReactNode;
  status?: 'available' | 'in-progress' | 'completed';
  recommended?: boolean;
  videoModuleCount?: number;
}

export function TrailCard({
  href,
  title,
  description,
  track,
  trackLabel,
  totalModules,
  completedModules,
  progressPercent,
  questionsPerModule,
  showProgress,
  level,
  durationMinutes,
  readingMinutes,
  points,
  rewardBadge,
  cta,
  ctaSuffix,
  status,
  recommended,
  videoModuleCount,
}: TrailCardProps) {
  const visual = getTrackVisual(track);
  const effectiveLevel = level ?? inferLevelFromModules(totalModules);
  const effectiveDuration = durationMinutes ?? estimateDurationMinutes(totalModules);
  const effectivePoints = points ?? estimatePoints(totalModules, effectiveLevel);
  const effectiveReward = rewardBadge === null ? null : rewardBadge ?? mapTrackReward(track);
  const percent = clampPercent(progressPercent ?? deriveProgressPercent(completedModules, totalModules));
  const inProgress = status ? status === 'in-progress' : percent > 0 && percent < 100;
  const isCompleted = status ? status === 'completed' : percent >= 100;
  const ctaLabel = cta ?? (isCompleted ? 'Revoir' : inProgress ? 'Continuer' : 'Démarrer');
  const catalogMeta = formatTrailCatalogLabel(totalModules, readingMinutes, questionsPerModule);
  const shouldShowProgress = showProgress || inProgress || isCompleted;

  return (
    <Link href={href} className="trail-card" aria-label={`${title} — ouvrir le parcours`}>
      <div className="trail-card-banner" style={{ background: visual.gradient }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <TrackIcon
            track={track}
            size="md"
            className="trail-card-icon"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)' }}
            ariaHidden
          />
          {recommended && !isCompleted ? (
            <span
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#0a5c2e',
                borderRadius: 999,
                padding: '0.18rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Recommandé
            </span>
          ) : null}
          {isCompleted && (
            <span
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.32)',
                borderRadius: 999,
                padding: '0.18rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Terminé
            </span>
          )}
        </div>
        <span className="trail-card-track">{trackLabel ?? visual.label}</span>
      </div>
      <div className="trail-card-body">
        <h3 className="trail-card-title">{title}</h3>
        {description && <p className="trail-card-desc">{description}</p>}

        <div className="trail-card-meta">
          <LevelPill level={effectiveLevel} />
          {catalogMeta ? (
            <Badge tone="neutral">{catalogMeta}</Badge>
          ) : (
            <>
              <Badge tone="neutral">{formatDurationLabel(effectiveDuration)}</Badge>
              {totalModules ? (
                <Badge tone="neutral">
                  {totalModules} unité{totalModules > 1 ? 's' : ''}
                </Badge>
              ) : null}
            </>
          )}
          <Badge tone="warning">
            {effectivePoints} pts
          </Badge>
          {videoModuleCount && videoModuleCount > 0 ? (
            <Badge tone="neutral">
              {'\u{1F3AC}'} {videoModuleCount > 1 ? `${videoModuleCount} vidéos` : 'Vidéo'}
            </Badge>
          ) : null}
        </div>

        {shouldShowProgress && (
          <ProgressBar
            value={percent}
            tone={isCompleted ? 'success' : 'accent'}
            showValueLabel
            label={
              typeof completedModules === 'number' && totalModules
                ? `${completedModules}/${totalModules} unités · ${percent} %`
                : `${percent} %`
            }
            size="sm"
            style={{ marginTop: '0.2rem' }}
          />
        )}

        <div className="trail-card-footer">
          <span className="trail-card-reward">
            {effectiveReward ? (
              <>
                {effectiveReward.brand ? (
                  <BrandIcon brand={effectiveReward.brand} size="sm" />
                ) : (
                  <span aria-hidden>{effectiveReward.icon ?? '\u{1F3C5}'}</span>
                )}
                <strong>Badge {effectiveReward.label}</strong>
              </>
            ) : (
              <>
                <span aria-hidden>{'\u{1F3C5}'}</span>
                <strong>Récompense parcours</strong>
              </>
            )}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
            {ctaLabel}
            <span aria-hidden>{'\u2192'}</span>
            {ctaSuffix}
          </span>
        </div>
      </div>
    </Link>
  );
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveProgressPercent(completed?: number, total?: number) {
  if (!completed || !total) return 0;
  return Math.round((completed / total) * 100);
}

function mapTrackReward(track?: string | null) {
  const reward = getRewardBadgeForTrack(track);
  if (!reward) return null;
  return { label: reward.label, brand: reward.brand };
}

function formatTrailCatalogLabel(
  totalModules?: number,
  readingMinutes?: number,
  questionsPerModule?: number
) {
  if (!totalModules || typeof readingMinutes !== 'number' || readingMinutes <= 0) {
    return null;
  }
  return formatTrailCatalogMeta(totalModules, readingMinutes, questionsPerModule ?? QUESTIONS_PER_MODULE);
}
