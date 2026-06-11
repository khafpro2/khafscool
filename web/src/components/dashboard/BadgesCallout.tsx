'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAccessToken } from '@/lib/auth';
import { fetchDashboard } from '@/lib/api';
import type { DashboardData } from '@/lib/api';

// Badge emoji map for common badges
const BADGE_ICONS: Record<string, string> = {
  'first-quiz': '🎯',
  'first-lab': '🔧',
  'badge-abm': '📱',
  'jamf-100': '🛠️',
  'jamf-200': '⚙️',
  'apple-it-pro': '🍎',
  'intune': '🪟',
  'supporter': '❤️',
};

function getBadgeIcon(slug: string): string {
  return BADGE_ICONS[slug] ?? '🏅';
}

export function BadgesCallout() {
  const [recentBadges, setRecentBadges] = useState<string[]>([]);
  const [totalBadges, setTotalBadges] = useState(0);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    fetchDashboard(token)
      .then((data: DashboardData) => {
        if (data.badges?.length) {
          setTotalBadges(data.badges.length);
          setRecentBadges(data.badges.slice(-5));
        }
      })
      .catch(() => null);
  }, []);

  return (
    <Card className="dashboard-callout dashboard-callout-badges dashboard-fade-in">
      <div className="dashboard-callout-inner">
        <div>
          <span className="dashboard-callout-eyebrow">Super-badges</span>
          <h2 className="dashboard-callout-title">
            {totalBadges > 0
              ? `${totalBadges} badge${totalBadges > 1 ? 's' : ''} obtenus !`
              : 'Collectionne tes récompenses MDM Academy'}
          </h2>
          <p className="muted dashboard-callout-caption">
            Consulte les badges gagnés et ceux à débloquer sur Apple, Jamf et Intune.
          </p>
          {recentBadges.length > 0 && (
            <div
              aria-label="Derniers badges"
              style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}
            >
              {recentBadges.map((slug) => (
                <span
                  key={slug}
                  title={slug}
                  style={{
                    fontSize: '1.75rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))',
                  }}
                  aria-hidden="true"
                >
                  {getBadgeIcon(slug)}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button href="/badges">Voir mes badges</Button>
      </div>
    </Card>
  );
}
