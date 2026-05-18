'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchWeeklyQuests,
  type WeeklyQuest,
  type WeeklyQuestsResponse,
} from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';

type Status = 'loading' | 'ready' | 'error';

export default function WeeklyQuestsPage() {
  const [data, setData] = useState<WeeklyQuestsResponse | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    fetchWeeklyQuests(token)
      .then((response) => {
        setData(response);
        setUsingFallback(!token);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, []);

  const summary = useMemo(() => buildSummary(data?.quests ?? []), [data]);
  const resetLabel = useMemo(() => formatResetLabel(data?.weekEnd ?? null), [data]);

  if (status === 'loading') {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Quêtes hebdo</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Chargement des quêtes...</p>
      </section>
    );
  }

  if (status === 'error' || !data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Quêtes hebdo</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Impossible de charger les quêtes. Réessaie plus tard ou reconnecte-toi.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link className="btn" href="/dashboard">
            Retour au tableau de bord
          </Link>
          <Link className="btn" href="/courses" style={{ background: '#1d1d1f' }}>
            Voir les parcours
          </Link>
        </div>
      </section>
    );
  }

  const { quests } = data;
  const isEmpty = quests.length === 0;

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
          <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Gamification</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>Quêtes hebdo</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', maxWidth: 720 }}>
            Des objectifs courts qui se renouvellent chaque semaine pour entretenir ta progression sur Apple,
            Jamf, Intune et ServiceNow.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link className="btn" href="/dashboard" style={{ background: '#1d1d1f' }}>
            Retour dashboard
          </Link>
          <Link className="btn" href="/courses">
            Voir les parcours
          </Link>
        </div>
      </div>

      <section
        className="card"
        style={{
          background: hasToken && !usingFallback ? '#ffffff' : '#fff8e6',
          borderColor: hasToken && !usingFallback ? 'var(--border)' : '#f0cf7a',
          marginTop: '1.5rem',
        }}
      >
        <strong>{hasToken ? 'Quêtes connectées' : 'Quêtes en mode démo'}</strong>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          {hasToken
            ? 'Tes quêtes hebdo sont récupérées via l’endpoint privé GET /quests/weekly.'
            : 'Connecte-toi pour synchroniser tes vraies quêtes. Cet aperçu local permet de découvrir le format.'}
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          marginTop: '1.5rem',
        }}
      >
        <SummaryStat label="Quêtes complétées" value={`${summary.completed} / ${summary.total}`} />
        <SummaryStat label="Points gagnés" value={`${summary.earnedPoints}`} />
        <SummaryStat
          label="Points possibles"
          value={summary.possiblePoints > 0 ? `${summary.possiblePoints}` : '—'}
        />
        <SummaryStat label="Réinitialisation" value={resetLabel} />
      </section>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <section style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </section>
      )}

      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        Les quêtes sont calculées côté serveur via <code>GET /quests/weekly</code> (authentification requise).
        En cas d’indisponibilité ou de session absente, un aperçu démo en français est affiché.
      </p>
    </section>
  );
}

function QuestCard({ quest }: { quest: WeeklyQuest }) {
  const target = Math.max(0, quest.target ?? 0);
  const progress = Math.max(0, quest.progress ?? 0);
  const progressPercent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const completed = quest.completed || (target > 0 && progress >= target);

  return (
    <article
      className="card"
      style={{
        borderColor: completed ? '#a8d8b2' : 'var(--border)',
        background: completed ? 'linear-gradient(135deg, #f4fbf6 0%, #ffffff 100%)' : 'var(--card)',
        display: 'grid',
        gap: '0.6rem',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'grid',
          gap: '0.5rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
        }}
      >
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {quest.track && (
              <span
                style={{
                  background: '#eef6ff',
                  border: '1px solid #c7ddff',
                  borderRadius: 999,
                  color: '#0057b8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.18rem 0.55rem',
                  textTransform: 'uppercase',
                }}
              >
                {formatTrack(quest.track)}
              </span>
            )}
            <StatusPill completed={completed} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.4rem' }}>{quest.label}</h2>
          {quest.description && (
            <p style={{ color: 'var(--muted)', marginTop: '0.3rem' }}>{quest.description}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: '1.1rem' }}>
            {progress}/{target}
          </strong>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{progressPercent}%</p>
        </div>
      </div>

      <div style={{ background: '#e5e5ea', borderRadius: 999, height: 8 }}>
        <div
          style={{
            background: completed ? '#0f7a3b' : 'var(--accent)',
            borderRadius: 999,
            height: '100%',
            width: `${progressPercent}%`,
          }}
        />
      </div>

      {typeof quest.rewardPoints === 'number' && quest.rewardPoints > 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Récompense : <strong style={{ color: 'var(--fg)' }}>{quest.rewardPoints} points</strong>
          {completed ? ' (gagnés)' : ' à débloquer'}
        </p>
      )}
    </article>
  );
}

function StatusPill({ completed }: { completed: boolean }) {
  return (
    <span
      style={{
        background: completed ? '#e5f5ea' : '#fff4e1',
        border: `1px solid ${completed ? '#a8d8b2' : '#f0cf7a'}`,
        borderRadius: 999,
        color: completed ? '#0f7a3b' : '#8a6d00',
        fontSize: '0.72rem',
        fontWeight: 800,
        padding: '0.18rem 0.55rem',
        textTransform: 'uppercase',
      }}
    >
      {completed ? 'Complétée' : 'En cours'}
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: '0.9rem 1rem' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
        {label}
      </p>
      <strong style={{ display: 'block', fontSize: '1.35rem', marginTop: '0.2rem' }}>{value}</strong>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Aucune quête active</h2>
      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
        Aucune quête n’a encore été générée pour cette semaine. Termine un module pour amorcer le compteur.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <Link className="btn" href="/courses">
          Lancer un parcours
        </Link>
        <Link className="btn" href="/dashboard" style={{ background: '#1d1d1f' }}>
          Retour dashboard
        </Link>
      </div>
    </section>
  );
}

function buildSummary(quests: WeeklyQuest[]) {
  return quests.reduce(
    (acc, quest) => {
      const completed = quest.completed || (quest.target > 0 && quest.progress >= quest.target);
      const reward = typeof quest.rewardPoints === 'number' ? quest.rewardPoints : 0;
      return {
        total: acc.total + 1,
        completed: acc.completed + (completed ? 1 : 0),
        possiblePoints: acc.possiblePoints + reward,
        earnedPoints: acc.earnedPoints + (completed ? reward : 0),
      };
    },
    { total: 0, completed: 0, possiblePoints: 0, earnedPoints: 0 }
  );
}

function formatResetLabel(weekEndIso: string | null): string {
  if (!weekEndIso) return 'chaque lundi';
  const date = new Date(weekEndIso);
  if (Number.isNaN(date.getTime())) return 'chaque lundi';
  try {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
  } catch {
    return 'chaque lundi';
  }
}
