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
    <Card
      style={{
        marginTop: '1.25rem',
        background: 'linear-gradient(135deg, #fff4e8 0%, #ffffff 100%)',
        borderColor: '#f5b87a',
      }}
    >
      <span style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span aria-hidden>{'\u{1F525}'}</span> Série Trailblazer
      </span>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          marginTop: '0.85rem',
        }}
      >
        <StreakMetric label="Jours consécutifs" value={String(streak.currentDays)} highlight />
        <StreakMetric label="Meilleure série" value={String(streak.longestDays)} />
        <StreakMetric label="Dernière activité" value={lastActivityLabel} compact />
      </div>
      <p className="muted" style={{ marginTop: '0.85rem', fontSize: '0.9rem' }}>
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
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p
        className="stat-value"
        style={{
          color: highlight ? '#b45309' : undefined,
          fontSize: compact ? '1rem' : undefined,
          lineHeight: compact ? 1.35 : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}
