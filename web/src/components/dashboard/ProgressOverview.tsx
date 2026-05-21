import Link from 'next/link';
import { formatBadge } from '@/lib/tracks';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Props {
  modulesCompleted: number;
  timeSpentMinutes: number;
  averageQuizScore: number;
  badges: string[];
  preparationScore?: number;
}

export function ProgressOverview({
  modulesCompleted,
  timeSpentMinutes,
  averageQuizScore,
  badges,
  preparationScore,
}: Props) {
  return (
    <section className="card dashboard-overview dashboard-fade-in dashboard-fade-in-delay">
      <div className="section-head" style={{ marginBottom: '1rem' }}>
        <div>
          <span className="section-eyebrow">Statistiques</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Vue d’ensemble</h2>
        </div>
        {badges.length > 0 ? (
          <Link href="/badges" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {badges.length} badge{badges.length > 1 ? 's' : ''} →
          </Link>
        ) : null}
      </div>

      <div className="stat-grid dashboard-stat-grid">
        <Stat label="Modules terminés" value={String(modulesCompleted)} />
        <Stat label="Temps passé" value={`${timeSpentMinutes} min`} />
        <Stat label="Score quiz moyen" value={`${averageQuizScore}%`} highlight={averageQuizScore >= 80} />
        {preparationScore != null ? (
          <Stat label="Préparation certif." value={`${preparationScore}%`} highlight={preparationScore >= 70} />
        ) : null}
      </div>

      {badges.length > 0 ? (
        <div className="dashboard-badge-chips">
          <p className="stat-label">Badges gagnés</p>
          <ul className="dashboard-badge-list">
            {badges.map((badge) => (
              <li key={badge} className="dashboard-badge-chip">
                {formatBadge(badge)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="dashboard-badge-empty">
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            Aucun badge pour l’instant — termine une unité pour en débloquer un.
          </p>
          <ProgressBar value={0} tone="accent" style={{ marginTop: '0.65rem' }} />
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat dashboard-overview-stat${highlight ? ' dashboard-overview-stat-highlight' : ''}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
