'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';
import { fetchDashboard } from '@/lib/api';
import type { DashboardData } from '@/lib/api';

type Stats = { percent: number; badges: number; streak: number };

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ink)' }}>{value}</span>
      <span style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export function HomeStatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    fetchDashboard(token)
      .then((data: DashboardData) => {
        setStats({
          percent: Math.round(data.stats?.preparationScore ?? data.stats?.averageQuizScore ?? 0),
          badges: data.badges?.length ?? 0,
          streak: data.learningStreak?.currentDays ?? 0,
        });
      })
      .catch(() => null);
  }, []);

  if (!stats) return null;

  return (
    <section
      className="container"
      style={{ marginTop: '1rem', marginBottom: '0.5rem' }}
      aria-label="Statistiques rapides"
    >
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        justifyContent: 'center',
        padding: '0.75rem 1.5rem',
        borderRadius: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
      }}>
        <StatPill value={`${stats.percent}%`} label="Progression" />
        <div style={{ width: 1, background: 'var(--border-soft)', alignSelf: 'stretch' }} aria-hidden />
        <StatPill value={String(stats.badges)} label="Badges" />
        <div style={{ width: 1, background: 'var(--border-soft)', alignSelf: 'stretch' }} aria-hidden />
        <StatPill value={`${stats.streak}j`} label="Streak" />
      </div>
    </section>
  );
}
