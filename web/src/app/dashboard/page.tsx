'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DashboardData } from '@/lib/api';
import { fetchDashboard } from '@/lib/api';
import { clearAuthTokens, getAccessToken } from '@/lib/auth';
import { ProgressOverview } from '@/components/dashboard/ProgressOverview';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchDashboard(token)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  function handleLogout() {
    clearAuthTokens();
    setHasToken(false);
    setData(null);
  }

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Chargement du compte...</p>
      </section>
    );
  }

  if (!hasToken) {
    return (
      <section style={{ padding: '2rem 0', maxWidth: 720 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Connecte-toi pour suivre ta progression</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            Le dashboard utilise le token local pour appeler `/users/me/dashboard`. Sans token, le MVP te
            laisse explorer les parcours en mode démo.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link className="btn" href="/auth">
              Se connecter ou s’inscrire
            </Link>
            <Link className="btn" href="/courses" style={{ background: '#1d1d1f' }}>
              Explorer les parcours
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Impossible de charger les données. Essaie de te reconnecter.
        </p>
        <Link className="btn" href="/auth" style={{ marginTop: '1rem' }}>
          Revenir à la connexion
        </Link>
      </section>
    );
  }

  const { user, stats, badges, quests, courses } = data;

  return (
    <section style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
            Bonjour, {user.displayName ?? 'Technicien'}
          </p>
        </div>
        <button className="btn" type="button" onClick={handleLogout} style={{ background: '#1d1d1f' }}>
          Déconnexion locale
        </button>
      </div>
      <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
        Session chargée depuis `ama_access`.
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        Niveau : <strong>{stats.level}</strong> · {stats.points} points
      </p>

      <ProgressOverview
        modulesCompleted={stats.modulesCompleted}
        timeSpentMinutes={stats.timeSpentMinutes}
        averageQuizScore={stats.averageQuizScore}
        badges={badges}
        preparationScore={stats.preparationScore}
      />

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Parcours</h2>
        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {courses.map((c) => (
            <article key={c.id} className="card">
              <h3 style={{ fontWeight: 600 }}>{c.title}</h3>
              <div style={{ marginTop: '0.75rem', height: 8, background: '#e5e5ea', borderRadius: 4 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${c.progressPercent ?? 0}%`,
                    background: 'var(--accent)',
                    borderRadius: 4,
                  }}
                />
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                {c.progressPercent ?? 0}% complété
              </p>
              <Link href={`/courses/${c.slug}`} style={{ display: 'inline-block', marginTop: '0.75rem', fontWeight: 600 }}>
                Ouvrir le parcours
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Quêtes de la semaine</h2>
        <ul style={{ marginTop: '1rem', listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
          {quests.map((q: { id: string; label: string; progress: number; target: number }) => (
            <li key={q.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{q.label}</span>
              <span style={{ fontWeight: 600 }}>
                {q.progress}/{q.target}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
