'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchWeeklyQuests,
  type WeeklyQuest,
  type WeeklyQuestsResponse,
} from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrackIcon } from '@/components/ui/TrackIcon';

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
        <p className="muted" style={{ marginTop: '0.5rem' }}>Chargement des quêtes...</p>
      </section>
    );
  }

  if (status === 'error' || !data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Quêtes hebdo</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Impossible de charger les quêtes. Réessaie plus tard ou reconnecte-toi.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button href="/dashboard">Retour au tableau de bord</Button>
          <Button href="/courses" variant="dark">
            Voir les parcours
          </Button>
        </div>
      </section>
    );
  }

  const { quests } = data;
  const isEmpty = quests.length === 0;

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <div
        className="hero"
        style={{
          background: 'linear-gradient(135deg, #ff9e2c 0%, #ffce5b 60%, #ffe89e 100%)',
          color: '#3a2200',
        }}
      >
        <span
          className="hero-eyebrow"
          style={{
            background: 'rgba(255,255,255,0.45)',
            borderColor: 'rgba(0,0,0,0.08)',
            color: '#3a2200',
          }}
        >
          <span aria-hidden>{'\u{1F3AF}'}</span> Quêtes hebdo
        </span>
        <h1 style={{ color: '#3a2200' }}>Renouvelle ton rythme chaque semaine</h1>
        <p style={{ marginTop: '0.75rem', color: '#3a2200' }}>
          Des objectifs courts qui se renouvellent chaque semaine pour entretenir ta progression sur
          Apple, Jamf et Intune.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <Button href="/dashboard" variant="dark">
            Retour dashboard
          </Button>
          <Button href="/courses" variant="secondary">
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
        <strong>{hasToken ? 'Quêtes connectées' : 'Quêtes en mode démo'}</strong>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          {hasToken
            ? 'Tes quêtes hebdo sont récupérées via l’endpoint privé GET /quests/weekly.'
            : 'Connecte-toi pour synchroniser tes vraies quêtes. Cet aperçu local permet de découvrir le format.'}
        </p>
      </Card>

      <section className="stat-grid" style={{ marginTop: '1.5rem' }}>
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
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}

      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '1.5rem' }}>
        Les quêtes sont calculées côté serveur via <code>GET /quests/weekly</code> (authentification
        requise). En cas d’indisponibilité ou de session absente, un aperçu démo en français est affiché.
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
    <Card
      style={{
        borderColor: completed ? '#a8d8b2' : 'var(--border)',
        background: completed ? 'linear-gradient(135deg, #f4fbf6 0%, #ffffff 100%)' : 'var(--card)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <TrackIcon track={quest.track ?? 'QUESTS'} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {quest.track && (
              <Badge tone="accent" icon="\u{1F3AF}">
                {formatTrack(quest.track)}
              </Badge>
            )}
            <Badge tone={completed ? 'success' : 'warning'} icon={completed ? '\u2705' : '\u23F3'}>
              {completed ? 'Complétée' : 'En cours'}
            </Badge>
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.45rem' }}>{quest.label}</h2>
          {quest.description && (
            <p className="muted" style={{ marginTop: '0.3rem' }}>{quest.description}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: '1.1rem' }}>
            {progress}/{target}
          </strong>
          <p className="muted" style={{ fontSize: '0.8rem' }}>{progressPercent}%</p>
        </div>
      </div>

      <ProgressBar
        value={progressPercent}
        tone={completed ? 'success' : 'accent'}
        style={{ marginTop: '0.75rem' }}
      />

      {typeof quest.rewardPoints === 'number' && quest.rewardPoints > 0 && (
        <p className="muted" style={{ marginTop: '0.6rem', fontSize: '0.9rem' }}>
          Récompense :{' '}
          <strong style={{ color: 'var(--fg)' }}>{quest.rewardPoints} points</strong>
          {completed ? ' (gagnés)' : ' à débloquer'}
        </p>
      )}
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card style={{ marginTop: '1.5rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Aucune quête active</h2>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        Aucune quête n’a encore été générée pour cette semaine. Termine un module pour amorcer le compteur.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <Button href="/courses">Lancer un parcours</Button>
        <Button href="/dashboard" variant="dark">
          Retour dashboard
        </Button>
      </div>
    </Card>
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
