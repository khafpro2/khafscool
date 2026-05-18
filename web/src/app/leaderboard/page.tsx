'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardResponse } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getBadgeVisual, getRankInfo } from '@/lib/design';

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
        <p className="muted" style={{ marginTop: '0.5rem' }}>Chargement du classement...</p>
      </section>
    );
  }

  if (status === 'error' || !data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Classement</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Impossible de charger le classement. Réessaie plus tard ou reconnecte-toi.
        </p>
        <Button href="/dashboard" style={{ marginTop: '1rem' }}>
          Retour au tableau de bord
        </Button>
      </section>
    );
  }

  const { leaderboard, currentUserRank } = data;
  const topThree = leaderboard.slice(0, 3);

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <div
        className="hero"
        style={{
          background: 'linear-gradient(135deg, #c23934 0%, #ff7a59 60%, #ffb02e 100%)',
        }}
      >
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F3C6}'}</span> Communauté MDM Academy
        </span>
        <h1>Classement Trailblazer</h1>
        <p style={{ marginTop: '0.75rem' }}>
          Le top 10 des apprenants MDM Academy, classés par points gagnés sur les parcours Apple, Jamf
          et Intune.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <Button href="/dashboard" variant="secondary">
            Retour dashboard
          </Button>
          <Button href="/courses" variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Voir les parcours
          </Button>
        </div>
      </div>

      <Card
        style={{
          marginTop: '1.5rem',
          background: hasToken && !usingFallback ? '#ffffff' : '#fff8e6',
          borderColor: hasToken && !usingFallback ? 'var(--border)' : '#f0cf7a',
        }}
      >
        <strong>{hasToken ? 'Classement connecté' : 'Classement en mode démo'}</strong>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          {hasToken
            ? currentUserRank
              ? `Tu es actuellement classé(e) #${currentUserRank}. Continue les modules pour grimper.`
              : 'Aucun rang détecté pour ton compte. Termine un module pour apparaître au classement.'
            : 'Connecte-toi pour voir les vrais apprenants et ton rang réel. Cet aperçu est un exemple local.'}
        </p>
      </Card>

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

      <Card style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <header
          style={{
            background: '#f4f6fb',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gap: '0.5rem',
            gridTemplateColumns: '60px minmax(0, 1.6fr) 90px 140px minmax(0, 1fr)',
            padding: '0.85rem 1.25rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--muted)',
            letterSpacing: '0.06em',
          }}
        >
          <span>Rang</span>
          <span>Apprenant</span>
          <span>Points</span>
          <span>Rang Trailblazer</span>
          <span>Badges</span>
        </header>
        <ul style={{ listStyle: 'none' }}>
          {leaderboard.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </ul>
        {leaderboard.length === 0 && (
          <p className="muted" style={{ padding: '1.25rem' }}>
            Aucun apprenant classé pour le moment. Sois le premier à valider un module.
          </p>
        )}
      </Card>

      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
        Les points sont calculés côté serveur via l’endpoint privé <code>GET /leaderboard</code>. En cas
        d’indisponibilité ou de session absente, un aperçu démo en français est affiché.
      </p>
    </section>
  );
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const rank = getRankInfo(entry.points);
  const medal = entry.rank === 1 ? '\u{1F947}' : entry.rank === 2 ? '\u{1F948}' : '\u{1F949}';
  const isCurrent = entry.isCurrentUser;

  return (
    <Card
      style={{
        background: isCurrent
          ? 'linear-gradient(135deg, #e3f0ff 0%, #ffffff 100%)'
          : entry.rank === 1
            ? 'linear-gradient(135deg, #fff7d6 0%, #ffffff 100%)'
            : entry.rank === 2
              ? 'linear-gradient(135deg, #f0f0f3 0%, #ffffff 100%)'
              : 'linear-gradient(135deg, #fde4cf 0%, #ffffff 100%)',
        borderColor: isCurrent ? '#85bfff' : 'var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span aria-hidden style={{ fontSize: '1.4rem' }}>{medal}</span>
        <span className="section-eyebrow" style={{ color: 'var(--muted)' }}>
          #{entry.rank}
          {isCurrent ? ' · toi' : ''}
        </span>
      </div>
      <strong style={{ fontSize: '1.1rem', display: 'block', marginTop: '0.5rem' }}>{entry.displayName}</strong>
      <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
        {entry.points} points · {rank.name}
      </p>
      {entry.badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.6rem' }}>
          {entry.badges.slice(0, 3).map((slug) => {
            const visual = getBadgeVisual(slug);
            return (
              <Badge
                key={slug}
                icon={visual.icon}
                style={{ background: visual.bg, color: visual.color }}
                tone="accent"
              >
                {visual.label}
              </Badge>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isCurrent = entry.isCurrentUser;
  const rank = getRankInfo(entry.points);

  return (
    <li
      style={{
        alignItems: 'center',
        background: isCurrent ? 'var(--accent-soft)' : 'transparent',
        borderBottom: '1px solid var(--border-soft)',
        display: 'grid',
        gap: '0.5rem',
        gridTemplateColumns: '60px minmax(0, 1.6fr) 90px 140px minmax(0, 1fr)',
        padding: '0.85rem 1.25rem',
      }}
    >
      <strong style={{ color: isCurrent ? 'var(--accent)' : 'var(--fg)' }}>#{entry.rank}</strong>
      <div style={{ display: 'grid', gap: '0.1rem' }}>
        <strong>{entry.displayName}</strong>
        {isCurrent && (
          <span style={{ color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700 }}>C’est toi</span>
        )}
      </div>
      <span style={{ fontWeight: 700 }}>{entry.points}</span>
      <Badge tone="outline" icon={rank.icon}>{rank.name}</Badge>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {entry.badges.length === 0 && <span className="muted">—</span>}
        {entry.badges.slice(0, 3).map((slug) => {
          const visual = getBadgeVisual(slug);
          return (
            <Badge
              key={slug}
              icon={visual.icon}
              tone="accent"
              style={{ background: visual.bg, color: visual.color }}
            >
              {visual.label}
            </Badge>
          );
        })}
        {entry.badges.length > 3 && (
          <span className="muted" style={{ fontSize: '0.78rem', alignSelf: 'center' }}>
            +{entry.badges.length - 3}
          </span>
        )}
      </div>
    </li>
  );
}
