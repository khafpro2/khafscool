'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardResponse } from '@/lib/api';
import { AuthConnectBanner } from '@/components/auth/AuthConnectBanner';
import { getAccessToken } from '@/lib/auth';
import {
  filterLeaderboardByTrack,
  formatLeaderboardTrackFilter,
  LEADERBOARD_TRACK_FILTERS,
  type LeaderboardTrackFilter,
} from '@/lib/leaderboard-tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LeaderboardPageSkeleton } from '@/components/ui/Skeleton';
import { getBadgeVisual, getRankInfo, getTrackVisual } from '@/lib/design';

const LEADERBOARD_VISUAL = getTrackVisual('LEADERBOARD');

type Status = 'loading' | 'ready' | 'error';

type LeaderboardPageClientProps = {
  initialTrack: LeaderboardTrackFilter;
};

export function LeaderboardPageClient({ initialTrack }: LeaderboardPageClientProps) {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<LeaderboardTrackFilter>(initialTrack);

  useEffect(() => {
    setSelectedTrack(initialTrack);
  }, [initialTrack]);

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

  const setTrackFilter = useCallback(
    (track: LeaderboardTrackFilter) => {
      setSelectedTrack(track);
      const query = track === 'TOUS' ? '' : `?track=${track}`;
      router.replace(`/leaderboard${query}`, { scroll: false });
    },
    [router]
  );

  const filteredLeaderboard = useMemo(
    () => (data ? filterLeaderboardByTrack(data.leaderboard, selectedTrack) : []),
    [data, selectedTrack]
  );

  const filteredCurrentUserRank = useMemo(() => {
    if (!data) return null;
    const currentEntry = data.leaderboard.find((entry) => entry.isCurrentUser);
    if (!currentEntry) return null;
    if (selectedTrack !== 'TOUS' && !filteredLeaderboard.some((entry) => entry.isCurrentUser)) {
      return null;
    }
    const index = filteredLeaderboard.findIndex((entry) => entry.isCurrentUser);
    return index >= 0 ? index + 1 : data.currentUserRank;
  }, [data, filteredLeaderboard, selectedTrack]);

  if (status === 'loading') {
    return <LeaderboardPageSkeleton />;
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

  const topThree = filteredLeaderboard.slice(0, 3);

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      {!hasToken ? <AuthConnectBanner redirectPath="/leaderboard" /> : null}
      <div className="hero" style={{ marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{LEADERBOARD_VISUAL.icon}</span> Communauté MDM Academy
        </span>
        <h1>Classement des apprenants</h1>
        <p style={{ marginTop: '0.75rem' }}>
          {hasToken
            ? 'Le top 10 des apprenants MDM Academy, classés par points gagnés sur les parcours Apple, Jamf et Intune.'
            : 'Aperçu du format de classement — connecte-toi pour voir le classement réel de la communauté.'}
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
        className={hasToken && !usingFallback ? undefined : 'notice-demo'}
        style={{
          marginTop: '1.5rem',
          background: hasToken && !usingFallback ? 'var(--surface)' : undefined,
          borderColor: hasToken && !usingFallback ? 'var(--border)' : undefined,
        }}
      >
        <strong>{hasToken ? 'Classement connecté' : 'Classement en mode démo'}</strong>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          {hasToken
            ? filteredCurrentUserRank
              ? `Tu es actuellement classé(e) #${filteredCurrentUserRank}${
                  selectedTrack !== 'TOUS' ? ` sur la piste ${formatLeaderboardTrackFilter(selectedTrack)}` : ''
                }. Continue les unités pour grimper.`
              : selectedTrack !== 'TOUS'
                ? `Aucun rang sur la piste ${formatLeaderboardTrackFilter(selectedTrack)}. Termine une unité de ce parcours pour apparaître.`
                : 'Aucun rang détecté pour ton compte. Termine une unité pour apparaître au classement.'
            : 'Connecte-toi pour voir les vrais apprenants et ton rang réel. Cet aperçu est un exemple local.'}
        </p>
      </Card>

      <TrackFilterRow selected={selectedTrack} onSelect={setTrackFilter} />

      {topThree.length > 0 && (
        <section
          aria-label={`Podium ${formatLeaderboardTrackFilter(selectedTrack)}`}
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
            background: 'var(--accent-soft)',
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
          <span>Rang MDM</span>
          <span>Badges</span>
        </header>
        <ul style={{ listStyle: 'none' }}>
          {filteredLeaderboard.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </ul>
        {filteredLeaderboard.length === 0 && (
          <div style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p className="muted">
              {selectedTrack === 'TOUS'
                ? 'Aucun apprenant classé pour le moment. Sois le premier à valider une unité et cumuler des points.'
                : `Aucun apprenant classé sur la piste ${formatLeaderboardTrackFilter(selectedTrack)} pour le moment. Termine une unité de ce parcours pour apparaître ici.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <Button href="/courses">Parcourir les formations</Button>
              <Button href="/quests" variant="secondary">
                Quêtes de la semaine
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
        Les points sont calculés côté serveur via l’endpoint privé <code>GET /leaderboard</code>. En cas
        d’indisponibilité ou de session absente, un aperçu démo en français est affiché. Le filtre par piste
        s’applique côté client (badges et parcours).
      </p>
    </section>
  );
}

function TrackFilterRow({
  selected,
  onSelect,
}: {
  selected: LeaderboardTrackFilter;
  onSelect: (track: LeaderboardTrackFilter) => void;
}) {
  return (
    <div
      className="leaderboard-track-filters"
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}
    >
      <span
        className="muted"
        style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Piste
      </span>
      <div className="chip-row" role="group" aria-label="Filtrer le classement par piste">
        {LEADERBOARD_TRACK_FILTERS.map((track) => (
          <button
            key={track}
            type="button"
            className="chip"
            aria-pressed={track === selected}
            onClick={() => onSelect(track)}
          >
            {formatLeaderboardTrackFilter(track)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const rank = getRankInfo(entry.points);
  const medalLabel = entry.rank === 1 ? '1er' : entry.rank === 2 ? '2e' : '3e';
  const isCurrent = entry.isCurrentUser;

  return (
    <Card
      style={{
        background: isCurrent
          ? 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 100%)'
          : entry.rank === 1
            ? 'linear-gradient(135deg, var(--warning-soft) 0%, var(--surface) 100%)'
            : 'var(--surface)',
        borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          aria-hidden
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--muted)',
          }}
        >
          {medalLabel}
        </span>
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
                brand={visual.brand}
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
              brand={visual.brand}
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
