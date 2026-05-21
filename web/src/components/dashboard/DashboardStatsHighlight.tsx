import Link from 'next/link';
import type { CourseSummary } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { LearningStreak } from '@/lib/api';
import {
  ALL_BADGE_SLUGS,
  getBadgeCriteria,
  getBadgeTrack,
  getBadgeVisual,
} from '@/lib/design';

interface Props {
  badges: string[];
  courses: CourseSummary[];
  learningStreak?: LearningStreak | null;
}

export function DashboardStatsHighlight({ badges, courses, learningStreak }: Props) {
  const nextBadge = getNextBadgeProgress(badges, courses);
  const streakDays = learningStreak?.currentDays ?? 0;

  return (
    <div className="dashboard-stats-highlight dashboard-fade-in">
      <Card className="dashboard-stat-card dashboard-stat-card-streak">
        <span className="dashboard-stat-eyebrow">
          <span aria-hidden>{'\u{1F525}'}</span> Série de jours
        </span>
        <p className="dashboard-stat-hero">
          <span className="dashboard-stat-number dashboard-stat-pulse">{streakDays}</span>
          <span className="dashboard-stat-unit">{streakDays <= 1 ? 'jour' : 'jours'}</span>
        </p>
        <p className="muted dashboard-stat-caption">
          {streakDays > 0
            ? 'Continue ta série en validant au moins une unité aujourd’hui.'
            : 'Valide une unité aujourd’hui pour démarrer ta série.'}
        </p>
        {learningStreak ? (
          <p className="muted dashboard-stat-meta">
            Record : {learningStreak.longestDays} {learningStreak.longestDays <= 1 ? 'jour' : 'jours'}
          </p>
        ) : null}
      </Card>

      <Card className="dashboard-stat-card dashboard-stat-card-badge">
        <span className="dashboard-stat-eyebrow">
          <span aria-hidden>{'\u{1F3C5}'}</span> Prochain super-badge
        </span>
        {nextBadge ? (
          <>
            <h2 className="dashboard-stat-title">{nextBadge.label}</h2>
            <p className="muted dashboard-stat-caption">{nextBadge.criteria}</p>
            <ProgressBar
              value={nextBadge.progress}
              tone="accent"
              className="dashboard-stat-progress"
            />
            <p className="dashboard-stat-meta">
              {nextBadge.progress}% vers le badge · parcours {nextBadge.trackLabel}
            </p>
          </>
        ) : (
          <>
            <h2 className="dashboard-stat-title">Collection complète</h2>
            <p className="muted dashboard-stat-caption">
              Tu as débloqué tous les super-badges Apple, Jamf et Intune.
            </p>
            <Link href="/badges" className="dashboard-stat-link">
              Voir ma collection →
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

function getNextBadgeProgress(badges: string[], courses: CourseSummary[]) {
  const earned = new Set(badges);
  const nextSlug = ALL_BADGE_SLUGS.find((slug) => !earned.has(slug));
  if (!nextSlug) return null;

  const track = getBadgeTrack(nextSlug);
  const course = courses.find((item) => item.track.toUpperCase() === track);
  const visual = getBadgeVisual(nextSlug);

  return {
    slug: nextSlug,
    label: visual.label,
    progress: course?.progressPercent ?? 0,
    criteria: getBadgeCriteria(nextSlug),
    trackLabel: track === 'APPLE' ? 'Apple' : track === 'JAMF' ? 'Jamf' : 'Intune',
  };
}
