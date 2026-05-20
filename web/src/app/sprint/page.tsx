'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchCurrentCertificationSprint,
  startCertificationSprint,
  type CertificationSprintDays,
  type CertificationSprintSummary,
  type CertificationSprintTrack,
} from '@/lib/api';
import { AuthConnectBanner } from '@/components/auth/AuthConnectBanner';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LevelPill } from '@/components/ui/LevelPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { TrackIcon } from '@/components/ui/TrackIcon';
import {
  estimateDurationMinutes,
  estimatePoints,
  formatDurationLabel,
  getRewardBadgeForTrack,
  getTrackVisual,
} from '@/lib/design';

type SprintStatus = 'idle' | 'loading' | 'starting';

const TRACK_OPTIONS: {
  value: CertificationSprintTrack;
  description: string;
  courseHref: string;
}[] = [
  {
    value: 'APPLE',
    description: 'Device Support, sécurité, diagnostic et fondamentaux MDM Apple.',
    courseHref: '/courses/apple-cert-prep',
  },
  {
    value: 'JAMF',
    description: 'Smart groups, politiques, inventaire et bonnes pratiques Jamf Pro.',
    courseHref: '/courses/jamf-pro-foundations',
  },
  {
    value: 'INTUNE',
    description: 'Enrôlement mobile, conformité, profils et intégration Microsoft.',
    courseHref: '/courses/intune-ios-enrollment',
  },
];

const DAY_OPTIONS: CertificationSprintDays[] = [7, 14];
const SPRINT_GRADIENT = getTrackVisual('SPRINT').gradient;
const SPRINT_VISUAL = getTrackVisual('SPRINT');

const SPRINT_PLAN_COPY: Record<
  CertificationSprintDays,
  { title: string; description: string; modulesHint: string }
> = {
  7: {
    title: 'Sprint intensif — 7 jours',
    description: 'Rythme soutenu pour réviser les unités clés avant une certification proche.',
    modulesHint: '4 unités ciblées',
  },
  14: {
    title: 'Sprint étendu — 14 jours',
    description: 'Progression plus souple avec marge pour consolider chaque piste Apple, Jamf ou Intune.',
    modulesHint: '4 unités + révisions',
  },
};

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
            : 'Mode démo local : connecte-toi pour enregistrer un vrai sprint.'
        );
      })
      .catch(() => {
        setMessage('Impossible de charger le sprint courant. Tu peux lancer une démonstration locale.');
      })
      .finally(() => setStatus('idle'));
  }, []);

  const selectedTrackMeta = useMemo(
    () => TRACK_OPTIONS.find((track) => track.value === selectedTrack) ?? TRACK_OPTIONS[0],
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
    <section style={{ padding: '1rem 0 2rem' }}>
      {!hasToken ? <AuthConnectBanner redirectPath="/sprint" /> : null}
      <div className="hero" style={{ background: SPRINT_GRADIENT, marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{SPRINT_VISUAL.icon}</span> Certification Sprint
        </span>
        <h1>Accélère ta préparation certification</h1>
        <p style={{ marginTop: '0.85rem' }}>
          Choisis un objectif Apple, Jamf ou Intune, puis lance un sprint de 7 ou 14 jours pour transformer
          tes unités en plan de révision mesurable.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Button href="/dashboard" variant="secondary" size="lg">
            Retour dashboard
          </Button>
          <Button
            href="/courses"
            size="lg"
            variant="ghost"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            Explorer les parcours
          </Button>
        </div>
        <div
          style={{
            marginTop: '1.75rem',
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          }}
        >
          <HeroStat label="Pistes" value="3" />
          <HeroStat label="Durées" value="7 / 14 j" />
          <HeroStat label="Objectif" value="Certif" />
          <HeroStat label="Mode" value={hasToken ? 'Connecté' : 'Démo'} />
        </div>
      </div>

      <Card
        style={{
          marginTop: '1.5rem',
          background: hasToken ? '#ffffff' : '#fff8e6',
          borderColor: hasToken ? 'var(--border)' : '#f0cf7a',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge tone={hasToken ? 'success' : 'warning'} icon={hasToken ? '\u{1F512}' : '\u{1F9EA}'}>
                {hasToken ? 'Session connectée' : 'Mode démo'}
              </Badge>
              <LevelPill level="Avancé" />
            </div>
            <strong style={{ display: 'block', marginTop: '0.65rem' }}>
              {hasToken ? 'Synchronisation compte active' : 'Aperçu local sans compte'}
            </strong>
            <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 720 }}>
              {hasToken
                ? 'Les actions utilisent le token local ama_access. Un fallback démo prend le relais si l’API ne répond pas.'
                : 'Aucun token local détecté : la page montre un sprint simulé sans modifier ton compte.'}
            </p>
          </div>
          {!hasToken && (
            <Button href="/auth" size="sm">
              Se connecter
            </Button>
          )}
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 0.85fr)',
          marginTop: '1.5rem',
          alignItems: 'start',
        }}
      >
        <div>
          <Card>
            <span className="section-eyebrow">Nouveau sprint</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>Démarrer un sprint</h2>
            <p className="muted" style={{ marginTop: '0.4rem' }}>
              Objectif sélectionné : <strong>{formatTrack(selectedTrackMeta.value)}</strong> sur{' '}
              <strong>{selectedDays} jours</strong>.
            </p>

            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                marginTop: '1rem',
              }}
            >
              {TRACK_OPTIONS.map((track) => {
                const isSelected = selectedTrack === track.value;
                const visual = getTrackVisual(track.value);

                return (
                  <button
                    key={track.value}
                    type="button"
                    onClick={() => setSelectedTrack(track.value)}
                    aria-pressed={isSelected}
                    style={{
                      background: isSelected ? `${visual.color}10` : '#ffffff',
                      border: `2px solid ${isSelected ? visual.color : 'var(--border)'}`,
                      borderRadius: 14,
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '1rem',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <TrackIcon track={track.value} size="sm" />
                      <span style={{ color: visual.color, fontSize: '0.8rem', fontWeight: 800 }}>
                        {formatTrack(track.value)}
                      </span>
                    </div>
                    <strong style={{ display: 'block', marginTop: '0.5rem' }}>
                      Sprint {formatTrack(track.value)}
                    </strong>
                    <span className="muted" style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                      {track.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <span
                className="muted"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.5rem',
                }}
              >
                Durée du sprint
              </span>
              <div className="chip-row">
                {DAY_OPTIONS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    className="chip"
                    aria-pressed={selectedDays === days}
                    onClick={() => setSelectedDays(days)}
                  >
                    {days} jours
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <Button type="button" disabled={isBusy} onClick={handleStartSprint}>
                {status === 'starting' ? 'Démarrage...' : 'Démarrer ce sprint'}
              </Button>
              <Button href={selectedTrackMeta.courseHref} variant="secondary">
                Voir le parcours lié
              </Button>
            </div>

            {message && (
              <p className="muted" style={{ marginTop: '0.85rem' }}>
                {message}
              </p>
            )}
          </Card>

          <section className="section" style={{ marginTop: '1.5rem' }}>
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Plans de révision</span>
                <h2>Choisis ton rythme</h2>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              }}
            >
              {DAY_OPTIONS.map((days) => (
                <SprintPlanCard
                  key={days}
                  days={days}
                  track={selectedTrack}
                  selected={selectedDays === days}
                  onSelect={() => setSelectedDays(days)}
                />
              ))}
            </div>
          </section>
        </div>

        <CurrentSprintCard sprint={sprint} isLoading={status === 'loading'} />
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.24)',
        borderRadius: 12,
        padding: '0.75rem 0.95rem',
        color: '#fff',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: 0.86,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.2rem' }}>{value}</p>
    </div>
  );
}

function SprintPlanCard({
  days,
  track,
  selected,
  onSelect,
}: {
  days: CertificationSprintDays;
  track: CertificationSprintTrack;
  selected: boolean;
  onSelect: () => void;
}) {
  const copy = SPRINT_PLAN_COPY[days];
  const trackVisual = getTrackVisual(track);
  const sprintVisual = getTrackVisual('SPRINT');
  const durationMinutes = estimateDurationMinutes(4);
  const points = estimatePoints(4, 'Avancé');
  const reward = getRewardBadgeForTrack(track);

  return (
    <button
      type="button"
      className="trail-card"
      aria-pressed={selected}
      aria-label={`${copy.title} — sélectionner ce plan`}
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        textAlign: 'left',
        outline: selected ? `3px solid ${sprintVisual.color}` : undefined,
        outlineOffset: selected ? 2 : undefined,
      }}
    >
      <div className="trail-card-banner" style={{ background: sprintVisual.gradient }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <TrackIcon track="SPRINT" size="md" className="trail-card-icon" ariaHidden />
          {selected && (
            <span
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.32)',
                borderRadius: 999,
                padding: '0.18rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Sélectionné
            </span>
          )}
        </div>
        <span className="trail-card-track">
          {formatTrack(track)} · {days} jours
        </span>
      </div>
      <div className="trail-card-body">
        <h3 className="trail-card-title">{copy.title}</h3>
        <p className="trail-card-desc">{copy.description}</p>

        <div className="trail-card-meta">
          <LevelPill level="Avancé" />
          <Badge tone="neutral">
            {formatDurationLabel(durationMinutes)}
          </Badge>
          <Badge tone="neutral">
            {copy.modulesHint}
          </Badge>
          <Badge tone="warning">
            {points} pts
          </Badge>
        </div>

        <div className="trail-card-footer">
          <span className="trail-card-reward">
            {reward ? (
              <>
                {reward.brand ? <BrandIcon brand={reward.brand} size="sm" /> : null}
                <strong>Badge {reward.label}</strong>
              </>
            ) : (
              <>
                {trackVisual.brand ? (
                  <BrandIcon brand={trackVisual.brand} size="sm" />
                ) : (
                  <span aria-hidden>{trackVisual.icon}</span>
                )}
                <strong>Objectif {trackVisual.label}</strong>
              </>
            )}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            Choisir ce plan
            <span aria-hidden>{'\u2192'}</span>
          </span>
        </div>
      </div>
    </button>
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
      <Card as="aside" style={{ alignSelf: 'start' }}>
        <span className="section-eyebrow">Sprint courant</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>Chargement...</h2>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          Récupération du sprint en cours.
        </p>
      </Card>
    );
  }

  if (!sprint) {
    return (
      <Card as="aside" style={{ alignSelf: 'start' }}>
        <span className="section-eyebrow">Sprint courant</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>Aucun sprint actif</h2>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          Choisis un objectif et lance ton prochain cycle de préparation.
        </p>
        <Button href="/courses" variant="secondary" style={{ marginTop: '1rem' }}>
          Explorer les parcours
        </Button>
      </Card>
    );
  }

  const trackMeta = TRACK_OPTIONS.find((track) => track.value === sprint.track) ?? TRACK_OPTIONS[0];
  const statusLabel = formatSprintStatus(sprint);
  const statusTone = sprint.completed ? 'success' : sprint.expired ? 'neutral' : 'accent';
  const daysRemaining = computeDaysRemaining(sprint.endsAt);
  const endsAtLabel = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(sprint.endsAt));

  return (
    <Card as="aside" style={{ alignSelf: 'start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <TrackIcon track={sprint.track} size="sm" />
          <span className="section-eyebrow" style={{ margin: 0 }}>
            Sprint courant
          </span>
        </div>
        <Badge tone={statusTone}>{statusLabel}</Badge>
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>{sprint.label}</h2>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        {sprint.days} jours · fin prévue le {endsAtLabel}
      </p>

      <ProgressBar
        value={Math.min(100, sprint.progressPercent)}
        tone={sprint.completed ? 'success' : 'accent'}
        label={`${sprint.progressPercent}% complété`}
        showValueLabel
        style={{ marginTop: '1.1rem' }}
      />
      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
        {sprint.progress}/{sprint.target} unités validées
      </p>

      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          marginTop: '1.25rem',
        }}
      >
        <SprintMetric label="Restants" value={String(sprint.remainingModules)} />
        <SprintMetric label="Jours restants" value={String(daysRemaining)} />
        <SprintMetric label="Parcours" value={formatTrack(sprint.track)} />
        <SprintMetric label="Statut" value={statusLabel} />
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <Button href="/courses">Continuer les unités</Button>
        <Button href={trackMeta.courseHref} variant="secondary">
          Voir parcours lié
        </Button>
      </div>
    </Card>
  );
}

function SprintMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function formatSprintStatus(sprint: CertificationSprintSummary) {
  if (sprint.completed) return 'Terminé';
  if (sprint.expired) return 'Expiré';
  return 'Actif';
}

function computeDaysRemaining(endsAt: string) {
  const end = new Date(endsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
