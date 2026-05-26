import { Card } from '@/components/ui/Card';
import type { LearningStreak } from '@/lib/api';

export function LearningStreakCard({ streak }: { streak: LearningStreak }) {
  const lastActivityLabel = streak.lastActivityDate
    ? new Date(`${streak.lastActivityDate}T12:00:00`).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
    : 'aucune activité récente';

  return (
    <Card className="dashboard-callout dashboard-callout-streak dashboard-fade-in">
      <span className="dashboard-callout-eyebrow">
        <span aria-hidden>{'\u{1F525}'}</span> Série d'apprentissage
      </span>
      <div className="stat-grid dashboard-streak-grid">
        <StreakMetric label="Jours consécutifs" value={String(streak.currentDays)} highlight />
        <StreakMetric label="Meilleure série" value={String(streak.longestDays)} />
        <StreakMetric label="Dernière activité" value={lastActivityLabel} compact />
      </div>
      <p className="muted dashboard-callout-caption">
        {streak.currentDays > 0
          ? 'Continue ta série en validant au moins une unité par jour.'
          : 'Valide une unité aujourd’hui pour démarrer ou relancer ta série.'}
      </p>
    </Card>
  );
}

function StreakMetric({
  label,
  value,
  highlight = false,
  compact = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`stat${highlight ? ' dashboard-streak-highlight' : ''}`}>
      <p className="stat-label">{label}</p>
      <p
        className={`stat-value${compact ? ' dashboard-streak-compact' : ''}${highlight ? ' dashboard-stat-pulse' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}
