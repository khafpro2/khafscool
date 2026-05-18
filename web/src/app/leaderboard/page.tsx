'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardResponse } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatBadge } from '@/lib/tracks';

type Status = 'loading' | 'ready' | 'error';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    fetchLeaderboard(token)
      .then((response) => {
        setData(response);
        // Sans token, fetchLeaderboard renvoie directement le mock.
        // Avec token mais API KO, le mock est aussi renvoyé : on le détecte via l'absence de userId réels.
        setUsingFallback(!token);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, []);

  if (status === 'loading') {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Classement</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Chargement du classement...</p>
      </section>
    );
  }

  if (status === 'error' || !data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Classement</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Impossible de charger le classement. Réessaie plus tard ou reconnecte-toi.
        </p>
        <Link className="btn" href="/dashboard" style={{ marginTop: '1rem' }}>
          Retour au tableau de bord
        </Link>
      </section>
    );
  }

  const { leaderboard, currentUserRank } = data;
  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        style={{
          alignItems: 'end',
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
        }}
      >
        <div>
          <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Communauté</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>Classement</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', maxWidth: 720 }}>
            Le top 10 des apprenants Apple MDM Academy, classés par points gagnés sur les parcours Apple,
            Jamf, Intune et ServiceNow.
          </p>
        </div>
        <Link className="btn" href="/dashboard" style={{ background: '#1d1d1f' }}>
          Retour dashboard
        </Link>
      </div>

      <section
        className="card"
        style={{
          background: hasToken && !usingFallback ? '#ffffff' : '#fff8e6',
          borderColor: hasToken && !usingFallback ? 'var(--border)' : '#f0cf7a',
          marginTop: '1.5rem',
        }}
      >
        <strong>
          {hasToken ? 'Classement connecté' : 'Classement en mode démo'}
        </strong>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          {hasToken
            ? currentUserRank
              ? `Tu es actuellement classé(e) #${currentUserRank}. Continue les modules pour grimper.`
              : 'Aucun rang détecté pour ton compte. Termine un module pour apparaître au classement.'
            : 'Connecte-toi pour voir les vrais apprenants et ton rang réel. Cet aperçu est un exemple local.'}
        </p>
      </section>

      {topThree.length > 0 && (
        <section
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginTop: '1.5rem',
          }}
        >
          {topThree.map((entry) => (
            <PodiumCard key={entry.rank} entry={entry} />
          ))}
        </section>
      )}

      <section className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <header
          style={{
            background: '#f5f5f7',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gap: '0.5rem',
            gridTemplateColumns: '60px minmax(0, 1.6fr) 100px 120px minmax(0, 1fr)',
            padding: '0.85rem 1.25rem',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          <span>Rang</span>
          <span>Apprenant</span>
          <span>Points</span>
          <span>Niveau</span>
          <span>Badges</span>
        </header>
        <ul style={{ listStyle: 'none' }}>
          {leaderboard.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </ul>
        {others.length === 0 && topThree.length === 0 && (
          <p style={{ color: 'var(--muted)', padding: '1.25rem' }}>
            Aucun apprenant classé pour le moment. Sois le premier à valider un module.
          </p>
        )}
      </section>

      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        Les points sont calculés côté serveur via l’endpoint privé <code>GET /leaderboard</code>. En cas
        d’indisponibilité ou de session absente, un aperçu démo en français est affiché.
      </p>
    </section>
  );
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const medal = entry.rank === 1 ? '1er' : entry.rank === 2 ? '2e' : '3e';
  const background = entry.isCurrentUser
    ? 'linear-gradient(135deg, #eef6ff 0%, #ffffff 100%)'
    : entry.rank === 1
      ? 'linear-gradient(135deg, #fff7d6 0%, #ffffff 100%)'
      : entry.rank === 2
        ? 'linear-gradient(135deg, #f0f0f3 0%, #ffffff 100%)'
        : 'linear-gradient(135deg, #fde4cf 0%, #ffffff 100%)';
  const borderColor = entry.isCurrentUser ? '#85bfff' : 'var(--border)';

  return (
    <article
      className="card"
      style={{
        background,
        borderColor,
        display: 'grid',
        gap: '0.5rem',
      }}
    >
      <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
        {medal} place {entry.isCurrentUser ? '· toi' : ''}
      </span>
      <strong style={{ fontSize: '1.15rem' }}>{entry.displayName}</strong>
      <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
        {entry.points} points · niveau {entry.level}
      </span>
      {entry.badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
          {entry.badges.slice(0, 3).map((badge) => (
            <span
              key={badge}
              style={{
                background: '#eef6ff',
                border: '1px solid #c7ddff',
                borderRadius: 999,
                color: '#0057b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
              }}
            >
              {formatBadge(badge)}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isCurrent = entry.isCurrentUser;

  return (
    <li
      style={{
        alignItems: 'center',
        background: isCurrent ? '#eef6ff' : 'transparent',
        borderBottom: '1px solid var(--border)',
        display: 'grid',
        gap: '0.5rem',
        gridTemplateColumns: '60px minmax(0, 1.6fr) 100px 120px minmax(0, 1fr)',
        padding: '0.85rem 1.25rem',
      }}
    >
      <strong style={{ color: isCurrent ? 'var(--accent)' : 'var(--fg)' }}>#{entry.rank}</strong>
      <div style={{ display: 'grid', gap: '0.15rem' }}>
        <strong>{entry.displayName}</strong>
        {isCurrent && (
          <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>C’est toi</span>
        )}
      </div>
      <span>{entry.points}</span>
      <span style={{ color: 'var(--muted)' }}>{entry.level}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {entry.badges.length === 0 && <span style={{ color: 'var(--muted)' }}>—</span>}
        {entry.badges.slice(0, 3).map((badge) => (
          <span
            key={badge}
            style={{
              background: '#f5f5f7',
              border: '1px solid var(--border)',
              borderRadius: 999,
              fontSize: '0.75rem',
              padding: '0.2rem 0.55rem',
            }}
          >
            {formatBadge(badge)}
          </span>
        ))}
        {entry.badges.length > 3 && (
          <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>+{entry.badges.length - 3}</span>
        )}
      </div>
    </li>
  );
}
