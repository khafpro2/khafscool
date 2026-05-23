import { BrandIcon } from '@/components/ui/BrandIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LevelPill } from '@/components/ui/LevelPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  estimatePoints,
  formatDurationLabel,
  getRewardBadgeForTrack,
  getTrackVisual,
} from '@/lib/design';
import type { LearningPathMeta } from '@/lib/learningPaths';

export interface LearningPathCardProps {
  path: LearningPathMeta;
  title?: string;
  progressPercent?: number;
  completedModules?: number;
  cta?: string;
  size?: 'default' | 'hero';
  showTrackProgress?: boolean;
}

export function LearningPathCard({
  path,
  title,
  progressPercent = 0,
  completedModules,
  cta = 'Commencer ce parcours',
  size = 'default',
  showTrackProgress = false,
}: LearningPathCardProps) {
  const visual = getTrackVisual(path.track);
  const displayTitle = title ?? path.title;
  const points = estimatePoints(path.totalModules, path.level);
  const percent = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const inProgress = percent > 0 && percent < 100;
  const isCompleted = percent >= 100;
  const ctaLabel = isCompleted ? 'Revoir le parcours' : inProgress ? 'Continuer le parcours' : cta;

  const rewardBadge = getRewardBadgeForTrack(path.track);

  const cardClass = size === 'hero' ? 'learning-path-card learning-path-card-hero' : 'learning-path-card';

  return (
    <article className={cardClass}>
      <PathBanner
        gradient={visual.gradient}
        brand={path.brand}
        recommended={path.recommended}
        trackBadgeLabel={rewardBadge?.label}
        large={size === 'hero'}
      />
      <PathBody
        path={path}
        title={displayTitle}
        points={points}
        percent={percent}
        completedModules={completedModules}
        inProgress={inProgress}
        isCompleted={isCompleted}
        ctaLabel={ctaLabel}
        showTrackProgress={showTrackProgress}
      />
    </article>
  );
}

function PathBanner({
  gradient,
  brand,
  recommended,
  trackBadgeLabel,
  large,
}: {
  gradient: string;
  brand: LearningPathMeta['brand'];
  recommended?: boolean;
  trackBadgeLabel?: string;
  large?: boolean;
}) {
  return (
    <div className="learning-path-card-banner" style={{ background: gradient }}>
      <BrandIcon brand={brand} size={large ? 'lg' : 'md'} variant="onColor" />
      {trackBadgeLabel ? (
        <Badge
          tone="neutral"
          style={{
            position: 'absolute',
            bottom: '0.85rem',
            left: '0.85rem',
            background: 'rgba(255,255,255,0.92)',
            color: '#0f172a',
            border: 'none',
            maxWidth: 'calc(100% - 1.7rem)',
          }}
        >
          {'\u{1F3C5}'} {trackBadgeLabel}
        </Badge>
      ) : null}
      {recommended ? (
        <Badge
          tone="success"
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: 'rgba(255,255,255,0.95)',
            color: '#0a5c2e',
            border: 'none',
          }}
        >
          Recommandé
        </Badge>
      ) : null}
    </div>
  );
}

function PathBody({
  path,
  title,
  points,
  percent,
  completedModules,
  inProgress,
  isCompleted,
  ctaLabel,
  showTrackProgress,
}: {
  path: LearningPathMeta;
  title: string;
  points: number;
  percent: number;
  completedModules?: number;
  inProgress: boolean;
  isCompleted: boolean;
  ctaLabel: string;
  showTrackProgress?: boolean;
}) {
  const moduleTotal = path.totalModules;
  const moduleDone = typeof completedModules === 'number' ? completedModules : null;
  const showProgressBar = showTrackProgress || inProgress || isCompleted;

  return (
    <div className="learning-path-card-body">
      <h3 className="learning-path-card-title">{title}</h3>
      <div className="learning-path-card-meta">
        <LevelPill level={path.level} />
        <Badge tone="neutral">{formatDurationLabel(path.durationMinutes)}</Badge>
        <Badge tone="neutral">
          {moduleTotal} unité{moduleTotal > 1 ? 's' : ''}
        </Badge>
        {moduleDone !== null ? (
          <Badge tone={isCompleted ? 'success' : 'neutral'}>
            {moduleDone}/{moduleTotal} modules
          </Badge>
        ) : null}
        <Badge tone="warning">{points} pts</Badge>
      </div>
      <ul className="learning-path-objectives">
        {path.objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ul>
      {(showProgressBar || moduleDone !== null) && (
        <ProgressBar
          value={percent}
          tone={isCompleted ? 'success' : 'accent'}
          showValueLabel
          label={moduleDone !== null ? `${moduleDone}/${moduleTotal} modules` : 'Progression'}
          size="sm"
          style={{ marginTop: '0.35rem' }}
        />
      )}
      <div className="learning-path-card-footer">
        <Button href={path.href} size="sm">
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
