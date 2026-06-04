'use client';

import { useEffect, useState } from 'react';
import { fetchDashboard, type DashboardData } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { toastQuestsCompleted } from '@/lib/gamification-toasts';
import { countCompletedQuests, detectNewlyCompletedQuests } from '@/lib/quest-feedback';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function WeeklyQuestsCallout() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [hasNewCompletion, setHasNewCompletion] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    fetchDashboard(token)
      .then((data) => {
        setDashboard(data);
        const newlyCompleted = detectNewlyCompletedQuests(mapDashboardQuests(data));
        if (newlyCompleted.length > 0) {
          toastQuestsCompleted(newlyCompleted);
        }
        setHasNewCompletion(newlyCompleted.length > 0);
      })
      .catch(() => {
        setDashboard(null);
      });
  }, []);

  const quests = dashboard ? mapDashboardQuests(dashboard) : [];
  const completedCount = countCompletedQuests(quests);
  const totalQuests = quests.length;
  const questProgressPercent =
    totalQuests > 0 ? Math.min(100, Math.round((completedCount / totalQuests) * 100)) : 0;

  return (
    <Card
      style={{
        marginTop: '1.25rem',
        background: 'linear-gradient(135deg, #e8f5ec 0%, #ffffff 100%)',
        borderColor: '#a8d8b2',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ color: '#2e844a', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quêtes hebdo
          </span>
          {hasNewCompletion ? (
            <span
              style={{
                background: '#2e844a',
                color: '#fff',
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.15rem 0.55rem',
              }}
            >
              Nouveau !
            </span>
          ) : null}
          {completedCount > 0 ? (
            <span style={{ color: '#2e844a', fontSize: '0.85rem', fontWeight: 700 }}>
              {completedCount} complétée{completedCount > 1 ? 's' : ''} cette semaine
            </span>
          ) : null}
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Avance tes objectifs de la semaine
        </h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Suis tes quêtes Apple, Jamf et Intune, leur progression et les points à débloquer avant la
          réinitialisation hebdomadaire.
        </p>
        {totalQuests > 0 ? (
          <div style={{ marginTop: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              <span className="muted">Progression hebdo</span>
              <span>
                {completedCount}/{totalQuests} quêtes
              </span>
            </div>
            <ProgressBar
              value={questProgressPercent}
              tone={completedCount === totalQuests ? 'success' : 'accent'}
              className="dashboard-quest-callout-progress"
              style={{ marginTop: '0.45rem' }}
            />
          </div>
        ) : null}
      </div>
      <Button href="/quests">Voir mes quêtes</Button>
    </Card>
  );
}

function mapDashboardQuests(dashboard: DashboardData) {
  return dashboard.quests.map((quest) => ({
    id: quest.id,
    questKey: quest.questKey ?? quest.id,
    label: quest.label,
    target: quest.target,
    progress: quest.progress,
    completed: quest.completed ?? quest.progress >= quest.target,
  }));
}
