'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchUserBadges, type UserBadge, type UserBadgesResult } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import {
  ALL_BADGE_SLUGS,
  getBadgeCriteria,
  getBadgeTrack,
  getBadgeVisual,
  getTrackVisual,
} from '@/lib/design';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrackIcon } from '@/components/ui/TrackIcon';

type Status = 'loading' | 'ready' | 'error';

export default function BadgesPage() {
  const [data, setData] = useState<UserBadgesResult | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    fetchUserBadges(token)
      .then((result) => {
        setData(result);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const summary = useMemo(() => buildSummary(data), [data]);

  if (status === 'loading') {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Mes super-badges</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>Chargement de ta collection...</p>
      </section>
    );
  }

  if (status === 'error' || !data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Mes super-badges</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Impossible de charger les badges. Réessaie plus tard ou reconnecte-toi.
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

  const earnedSet = new Set(data.earnedSlugs);
  const earnedBadges = ALL_BADGE_SLUGS.filter((slug) => earnedSet.has(slug));
  const lockedBadges = ALL_BADGE_SLUGS.filter((slug) => !earnedSet.has(slug));
  const earnedBySlug = new Map(data.badges.map((badge) => [badge.slug, badge]));

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <div
        className="hero"
        style={{
          background: 'linear-gradient(135deg, #ffb02e 0%, #ffce5b 45%, #ffe89e 100%)',
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
          <span aria-hidden>{'\u{1F3C5}'}</span> Galerie Trailhead
        </span>
        <h1 style={{ color: '#3a2200' }}>Tes super-badges MDM Academy</h1>
        <p style={{ marginTop: '0.75rem', color: '#3a2200', maxWidth: 640 }}>
          Chaque piste Apple, Jamf et Intune récompense ta progression avec un badge distinct. Collectionne-les
          tous pour montrer ton expertise multi-plateforme.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <Button href="/dashboard" variant="dark">
            Tableau de bord
          </Button>
          <Button href="/courses" variant="secondary">
            Parcours
          </Button>
          <Button href="/sprint" variant="ghost" style={{ color: '#3a2200', borderColor: 'rgba(58,34,0,0.25)' }}>
            Sprint certification
          </Button>
        </div>
      </div>

      <Card
        style={{
          marginTop: '1.5rem',
          background: hasToken && data.fromApi ? '#ffffff' : '#fff8e6',
          borderColor: hasToken && data.fromApi ? 'var(--border)' : '#f0cf7a',
        }}
      >
        <strong>{hasToken && data.fromApi ? 'Collection connectée' : 'Collection en mode démo'}</strong>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          {hasToken && data.fromApi
            ? 'Tes badges sont récupérés via GET /users/me/dashboard.'
            : 'Connecte-toi pour synchroniser tes vrais badges. Cet aperçu local mélange badges gagnés et à débloquer.'}
        </p>
      </Card>

      <section className="stat-grid" style={{ marginTop: '1.5rem' }}>
        <SummaryStat label="Badges gagnés" value={`${summary.earned} / ${summary.total}`} />
        <SummaryStat label="Apple" value={String(summary.byTrack.APPLE)} />
        <SummaryStat label="Jamf" value={String(summary.byTrack.JAMF)} />
        <SummaryStat label="Intune" value={String(summary.byTrack.INTUNE)} />
      </section>

      <ProgressBar value={summary.percent} tone="accent" style={{ marginTop: '1rem' }} />
      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
        {summary.percent}% de la collection complétée
      </p>

      <BadgeSection title="Mes badges" eyebrow="Collection débloquée">
        {earnedBadges.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {earnedBadges.map((slug) => (
              <EarnedBadgeCard key={slug} slug={slug} badge={earnedBySlug.get(slug)} />
            ))}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Aucun badge gagné pour le moment. Termine un module complet pour afficher ta première récompense.
          </p>
        )}
      </BadgeSection>

      <BadgeSection title="À débloquer" eyebrow="Prochains objectifs">
        {lockedBadges.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {lockedBadges.map((slug) => (
              <LockedBadgeCard key={slug} slug={slug} />
            ))}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Bravo — tu as débloqué tous les super-badges disponibles !
          </p>
        )}
      </BadgeSection>

      <Card style={{ marginTop: '2rem' }}>
        <span className="section-eyebrow">Continuer la progression</span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Chaque module te rapproche d’un nouveau badge
        </h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Reprends un parcours, lance un sprint ou consulte ton tableau de bord pour suivre ta progression.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button href="/courses">Explorer les parcours</Button>
          <Button href="/dashboard" variant="secondary">
            Mon tableau de bord
          </Button>
          <Button href="/sprint" variant="ghost">
            Sprint certification
          </Button>
        </div>
      </Card>
    </section>
  );
}

function BadgeSection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section" style={{ marginTop: '2rem' }}>
      <div className="section-head">
        <div>
          <span className="section-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function EarnedBadgeCard({ slug, badge }: { slug: string; badge?: UserBadge }) {
  const visual = getBadgeVisual(slug);
  const track = getBadgeTrack(slug);
  const trackVisual = getTrackVisual(track);

  return (
    <Card
      style={{
        borderColor: `${visual.color}33`,
        background: `linear-gradient(135deg, ${visual.bg} 0%, #ffffff 100%)`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.75rem',
            background: visual.bg,
            border: `2px solid ${visual.color}44`,
          }}
        >
          {visual.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <Badge tone="success" icon="\u2705">
              Débloqué
            </Badge>
            <Badge
              tone="accent"
              icon={trackVisual.icon}
              style={{ background: `${trackVisual.color}12`, color: trackVisual.color }}
            >
              {formatTrack(track)}
            </Badge>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.45rem' }}>{visual.label}</h3>
          <p className="muted" style={{ marginTop: '0.3rem', fontSize: '0.9rem' }}>
            Piste {formatTrack(track)}
            {badge?.earnedAt ? ` · obtenu le ${formatEarnedDate(badge.earnedAt)}` : ''}
          </p>
        </div>
        <TrackIcon track={track} size="sm" />
      </div>
    </Card>
  );
}

function LockedBadgeCard({ slug }: { slug: string }) {
  const visual = getBadgeVisual(slug);
  const track = getBadgeTrack(slug);
  const criteria = getBadgeCriteria(slug);

  return (
    <Card
      style={{
        borderColor: 'var(--border-soft)',
        background: 'var(--card)',
        opacity: 0.92,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.75rem',
            background: '#eef0f5',
            border: '2px dashed #c5cfdd',
            filter: 'grayscale(0.85)',
          }}
        >
          {visual.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <Badge tone="neutral" icon="\u{1F512}">
              Verrouillé
            </Badge>
            <Badge tone="outline" icon={getTrackVisual(track).icon}>
              {formatTrack(track)}
            </Badge>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.45rem', color: 'var(--muted)' }}>
            {visual.label}
          </h3>
          <p style={{ marginTop: '0.3rem', fontSize: '0.9rem' }}>{criteria}</p>
        </div>
        <Button href="/courses" size="sm" variant="secondary">
          Voir le parcours
        </Button>
      </div>
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="soft">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </Card>
  );
}

function buildSummary(data: UserBadgesResult | null) {
  const total = ALL_BADGE_SLUGS.length;
  const earned = data?.earnedSlugs.length ?? 0;
  const byTrack = { APPLE: 0, JAMF: 0, INTUNE: 0 };

  for (const slug of data?.earnedSlugs ?? []) {
    const track = getBadgeTrack(slug);
    if (track in byTrack) {
      byTrack[track as keyof typeof byTrack] += 1;
    }
  }

  return {
    total,
    earned,
    percent: total > 0 ? Math.round((earned / total) * 100) : 0,
    byTrack,
  };
}

function formatEarnedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}
