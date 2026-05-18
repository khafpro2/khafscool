'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchCurrentCertificationSprint,
  startCertificationSprint,
  type CertificationSprintDays,
  type CertificationSprintSummary,
  type CertificationSprintTrack,
} from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';

type SprintStatus = 'idle' | 'loading' | 'starting';

const tracks: { value: CertificationSprintTrack; description: string }[] = [
  {
    value: 'APPLE',
    description: 'Device Support, sécurité, diagnostic et fondamentaux MDM Apple.',
  },
  {
    value: 'JAMF',
    description: 'Smart groups, politiques, inventaire et bonnes pratiques Jamf Pro.',
  },
  {
    value: 'INTUNE',
    description: 'Enrôlement mobile, conformité, profils et intégration Microsoft.',
  },
  {
    value: 'SERVICENOW',
    description: 'Qualification, priorisation et clôture propre des tickets support.',
  },
];

const dayOptions: CertificationSprintDays[] = [7, 14];

export default function SprintPage() {
  const [selectedTrack, setSelectedTrack] = useState<CertificationSprintTrack>('APPLE');
  const [selectedDays, setSelectedDays] = useState<CertificationSprintDays>(7);
  const [sprint, setSprint] = useState<CertificationSprintSummary | null>(null);
  const [status, setStatus] = useState<SprintStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    fetchCurrentCertificationSprint(token)
      .then((currentSprint) => {
        setSprint(currentSprint);
        setMessage(
          token
            ? currentSprint
              ? 'Sprint courant chargé. Si l’API est indisponible, une démonstration locale reste affichée.'
              : 'Aucun sprint actif côté compte pour le moment.'
            : 'Mode démo local: connecte-toi pour enregistrer un vrai sprint.'
        );
      })
      .catch(() => {
        setMessage('Impossible de charger le sprint courant. Tu peux lancer une démonstration locale.');
      })
      .finally(() => setStatus('idle'));
  }, []);

  const selectedTrackMeta = useMemo(
    () => tracks.find((track) => track.value === selectedTrack) ?? tracks[0],
    [selectedTrack]
  );

  async function handleStartSprint() {
    setStatus('starting');
    setMessage(null);

    const token = getAccessToken();
    setHasToken(Boolean(token));

    try {
      const nextSprint = await startCertificationSprint(token, {
        track: selectedTrack,
        days: selectedDays,
      });
      setSprint(nextSprint);
      setMessage(
        token
          ? 'Sprint démarré. Si la session ou l’API est indisponible, ce résultat bascule en démo locale.'
          : 'Sprint de démonstration démarré dans ce navigateur.'
      );
    } catch {
      setMessage('Le démarrage a échoué. Réessaie après connexion ou vérifie la disponibilité de l’API.');
    } finally {
      setStatus('idle');
    }
  }

  const isBusy = status === 'loading' || status === 'starting';

  return (
    <section style={{ padding: '2rem 0' }}>
      <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Certification Sprint</p>
      <div
        style={{
          alignItems: 'end',
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          marginTop: '0.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Accélère ta préparation certification</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem', maxWidth: 760 }}>
            Choisis un objectif Apple, Jamf, Intune ou ServiceNow, puis lance un sprint de 7 ou 14 jours pour
            transformer tes modules en plan de révision mesurable.
          </p>
        </div>
        <Link className="btn" href="/dashboard" style={{ background: '#1d1d1f' }}>
          Retour dashboard
        </Link>
      </div>

      <section
        className="card"
        style={{
          background: hasToken ? '#ffffff' : '#fff8e6',
          borderColor: hasToken ? 'var(--border)' : '#f0cf7a',
          marginTop: '1.5rem',
        }}
      >
        <strong>{hasToken ? 'Session connectée' : 'Mode démo'}</strong>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          {hasToken
            ? 'Les actions utilisent le token local ama_access. Un fallback démo prend le relais si l’API ne répond pas.'
            : 'Aucun token local détecté: la page montre un sprint simulé sans modifier ton compte.'}
        </p>
      </section>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 0.8fr)',
          marginTop: '1.5rem',
        }}
      >
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Démarrer un sprint</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.4rem' }}>
            Objectif sélectionné: <strong>{formatTrack(selectedTrackMeta.value)}</strong> sur <strong>{selectedDays} jours</strong>.
          </p>

          <div
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              marginTop: '1rem',
            }}
          >
            {tracks.map((track) => {
              const isSelected = selectedTrack === track.value;

              return (
                <button
                  key={track.value}
                  type="button"
                  onClick={() => setSelectedTrack(track.value)}
                  style={{
                    background: isSelected ? '#eef6ff' : '#ffffff',
                    border: `1px solid ${isSelected ? '#85bfff' : 'var(--border)'}`,
                    borderRadius: 14,
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '1rem',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: isSelected ? 'var(--accent)' : 'var(--muted)', fontSize: '0.8rem', fontWeight: 800 }}>
                    {formatTrack(track.value)}
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.35rem' }}>Sprint {formatTrack(track.value)}</strong>
                  <span style={{ color: 'var(--muted)', display: 'block', marginTop: '0.35rem' }}>{track.description}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
            {dayOptions.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setSelectedDays(days)}
                style={{
                  background: selectedDays === days ? 'var(--accent)' : '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  color: selectedDays === days ? '#ffffff' : 'var(--fg)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  padding: '0.55rem 0.9rem',
                }}
              >
                {days} jours
              </button>
            ))}
          </div>

          <button
            className="btn"
            type="button"
            disabled={isBusy}
            onClick={handleStartSprint}
            style={{ marginTop: '1.25rem' }}
          >
            {status === 'starting' ? 'Démarrage...' : 'Démarrer ce sprint'}
          </button>
          {message && <p style={{ color: 'var(--muted)', marginTop: '0.85rem' }}>{message}</p>}
        </section>

        <CurrentSprintCard sprint={sprint} isLoading={status === 'loading'} />
      </div>
    </section>
  );
}

function CurrentSprintCard({
  sprint,
  isLoading,
}: {
  sprint: CertificationSprintSummary | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <aside className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sprint courant</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>Chargement du sprint...</p>
      </aside>
    );
  }

  if (!sprint) {
    return (
      <aside className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sprint courant</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
          Aucun sprint actif. Choisis un objectif et lance ton prochain cycle de préparation.
        </p>
      </aside>
    );
  }

  const endsAt = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(sprint.endsAt));

  return (
    <aside className="card" style={{ alignSelf: 'start' }}>
      <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
        Sprint courant
      </p>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>{sprint.label}</h2>
      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
        {sprint.days} jours · fin prévue le {endsAt}
      </p>

      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <strong>{sprint.progressPercent}% complété</strong>
          <span style={{ color: 'var(--muted)' }}>
            {sprint.progress}/{sprint.target} modules
          </span>
        </div>
        <div style={{ background: '#e5e5ea', borderRadius: 999, height: 10, marginTop: '0.65rem' }}>
          <div
            style={{
              background: sprint.completed ? '#0f7a3b' : 'var(--accent)',
              borderRadius: 999,
              height: '100%',
              width: `${Math.min(100, sprint.progressPercent)}%`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          marginTop: '1.25rem',
        }}
      >
        <SprintMetric label="Restants" value={String(sprint.remainingModules)} />
        <SprintMetric label="Parcours" value={formatTrack(sprint.track)} />
        <SprintMetric label="Statut" value={sprint.completed ? 'Terminé' : sprint.expired ? 'Expiré' : 'Actif'} />
        <SprintMetric label="Durée" value={`${sprint.days} j`} />
      </div>

      <Link href="/courses" style={{ display: 'inline-block', fontWeight: 700, marginTop: '1.25rem' }}>
        Continuer les modules
      </Link>
    </aside>
  );
}

function SprintMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f5f5f7', borderRadius: 12, padding: '0.75rem' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 700 }}>{label}</p>
      <strong style={{ display: 'block', marginTop: '0.2rem' }}>{value}</strong>
    </div>
  );
}
