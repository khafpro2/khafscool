import Link from 'next/link';
import type { RecentActivityItem } from '@/lib/api';
import { formatActivityDate } from '@/lib/points';
import { formatTrack } from '@/lib/tracks';
import { Card } from '@/components/ui/Card';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { Button } from '@/components/ui/Button';

interface RecentActivitySectionProps {
  items: RecentActivityItem[];
}

export function RecentActivitySection({ items }: RecentActivitySectionProps) {
  if (items.length === 0) {
    return (
      <Card variant="soft" className="profile-activity-card" style={{ marginTop: '1.25rem' }}>
        <span className="section-eyebrow">Activité</span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.35rem' }}>Aucune activité récente</h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Termine une unité pour voir ici tes modules complétés et les points gagnés.
        </p>
        <Button href="/courses" style={{ marginTop: '0.85rem' }}>
          Explorer les parcours
        </Button>
      </Card>
    );
  }

  return (
    <section className="section profile-activity-section" style={{ marginTop: '1.5rem' }}>
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Activité</span>
          <h2>Activité récente</h2>
          <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 620 }}>
            Tes dernières unités complétées et les points associés.
          </p>
        </div>
        <Link href="/dashboard" style={{ fontWeight: 700 }}>
          Mon apprentissage →
        </Link>
      </div>
      <ul className="profile-activity-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/courses/${item.courseSlug}#module-${item.slug}`}
              className="profile-activity-item card card-soft"
            >
              <TrackIcon track={item.track} size="sm" />
              <div className="profile-activity-body">
                <p className="profile-activity-title">{item.title}</p>
                <p className="muted profile-activity-meta">
                  {item.courseTitle} · {formatTrack(item.track)} · {formatActivityDate(item.completedAt)}
                </p>
              </div>
              <span className="profile-activity-points">+{item.pointsEarned} pts</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
