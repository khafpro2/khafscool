'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CertificationSprintSummary, DashboardData } from '@/lib/api';
import { fetchCurrentUser, fetchDashboard } from '@/lib/api';
import { getAccessToken, getStoredUser, logoutSession } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrailCard } from '@/components/ui/TrailCard';
import {
  estimatePoints,
  getBadgeVisual,
  getRankInfo,
  inferLevelFromModules,
} from '@/lib/design';

export default function ProfilePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fromApi, setFromApi] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    if (!token) {
      fetchDashboard()
        .then((dashboard) => {
          setData(dashboard);
          setFromApi(false);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    Promise.all([fetchDashboard(token), fetchCurrentUser(token)])
      .then(([dashboard]) => {
        setData(dashboard);
        setFromApi(true);
      })
      .catch(() => {
        fetchDashboard(token).then((dashboard) => {
          setData(dashboard);
          setFromApi(false);
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleLogout() {
    await logoutSession();
    setHasToken(false);
    setFromApi(false);
    const demo = await fetchDashboard();
    setData(demo);
  }

  const storedUser = useMemo(() => (typeof window !== 'undefined' ? getStoredUser() : null), [hasToken]);

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Mon profil Trailblazer</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>Chargement de ton profil…</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Mon profil Trailblazer</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Impossible de charger le profil. Réessaie ou reconnecte-toi.
        </p>
        <Button href="/auth" style={{ marginTop: '1rem' }}>
          Se connecter
        </Button>
      </section>
    );
  }

  const { user, stats, badges, quests, courses, certificationSprint } = data;
  const displayName = user.displayName ?? storedUser?.displayName ?? 'Trailblazer';
  const email = user.email ?? storedUser?.email ?? 'demo@ama.dev';
  const rank = getRankInfo(stats.points);
  const previousFloor = rank.minPoints;
  const ceiling = rank.nextPoints ?? Math.max(previousFloor + 100, stats.points + 100);
  const span = Math.max(1, ceiling - previousFloor);
  const progressInRank = Math.max(0, Math.min(span, stats.points - previousFloor));
  const rankPercent = Math.round((progressInRank / span) * 100);
  const remainingPoints = rank.nextPoints != null ? Math.max(0, rank.nextPoints - stats.points) : 0;

  const activeCourses = courses.filter(
    (course) => (course.progressPercent ?? 0) < 100 || course.nextModule
  );
  const recentBadges = badges.slice(0, 4);
  const activeQuests = quests.filter((quest) => quest.progress < quest.target);

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      {!hasToken ? (
        <Card
          style={{
            marginBottom: '1.25rem',
            background: '#fff8e6',
            borderColor: '#f0cf7a',
          }}
        >
          <p style={{ margin: 0, color: '#8a5a00', fontWeight: 700 }}>
            Profil en mode démo — connecte-toi pour synchroniser ta progression réelle.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
            <Button href="/auth" size="sm">
              Se connecter ou s&apos;inscrire
            </Button>
            <Button href="/dashboard" variant="ghost" size="sm">
              Tableau de bord
            </Button>
          </div>
        </Card>
      ) : hasToken && !fromApi ? (
        <Card
          style={{
            marginBottom: '1.25rem',
            background: '#fff8e6',
            borderColor: '#f0cf7a',
          }}
        >
          <p style={{ margin: 0, color: '#8a5a00', fontWeight: 700 }}>
            API indisponible — affichage des données de démonstration.
          </p>
        </Card>
      ) : null}

      <ProfileHero
        displayName={displayName}
        email={email}
        rank={rank}
        level={stats.level}
        points={stats.points}
        rankPercent={rankPercent}
        remainingPoints={remainingPoints}
        hasToken={hasToken}
        onLogout={handleLogout}
      />

      <section className="section" style={{ marginTop: '1.5rem' }}>
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Parcours en cours</span>
            <h2>Ta progression active</h2>
          </div>
          <Link href="/courses" style={{ fontWeight: 700 }}>
            Catalogue →
          </Link>
        </div>
        {activeCourses.length > 0 ? (
          <div className="grid grid-cards-lg">
            {activeCourses.map((course) => {
              const level = inferLevelFromModules(course.totalModules);
              const points = estimatePoints(course.totalModules, level);
              return (
                <TrailCard
                  key={course.id}
                  href={`/courses/${course.slug}${course.nextModule ? `#module-${course.nextModule.slug}` : ''}`}
                  title={course.title}
                  description={course.description}
                  track={course.track}
                  trackLabel={formatTrack(course.track)}
                  totalModules={course.totalModules}
                  completedModules={course.completedModules}
                  progressPercent={course.progressPercent}
                  level={level}
                  points={points}
                  cta={course.nextModule ? 'Continuer' : 'Ouvrir'}
                />
              );
            })}
          </div>
        ) : (
          <Card variant="soft">
            <p className="muted" style={{ margin: 0 }}>
              Aucun parcours en cours. Explore le catalogue pour démarrer.
            </p>
            <Button href="/courses" style={{ marginTop: '0.85rem' }}>
              Voir les parcours
            </Button>
          </Card>
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginTop: '2rem',
        }}
      >
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Badges récents</h2>
            <Link href="/badges" style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              Tout voir →
            </Link>
          </div>
          {recentBadges.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {recentBadges.map((slug) => {
                const visual = getBadgeVisual(slug);
                return (
                  <Badge
                    key={slug}
                    icon={visual.icon}
                    style={{ background: visual.bg, color: visual.color, border: `1px solid ${visual.color}22` }}
                    tone="accent"
                  >
                    {visual.label}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              Aucun badge débloqué. Termine un module pour afficher tes premières récompenses.
            </p>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quêtes actives</h2>
            <Link href="/quests" style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              Toutes →
            </Link>
          </div>
          {activeQuests.length > 0 ? (
            <ul style={{ display: 'grid', gap: '0.85rem', listStyle: 'none', marginTop: '1rem' }}>
              {activeQuests.map((quest) => {
                const target = Math.max(1, quest.target);
                const questPercent = Math.min(100, Math.round((quest.progress / target) * 100));
                return (
                  <li key={quest.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span>{quest.label}</span>
                      <strong>
                        {quest.progress}/{quest.target}
                      </strong>
                    </div>
                    <ProgressBar
                      value={questPercent}
                      tone={questPercent >= 100 ? 'success' : 'accent'}
                      size="sm"
                      style={{ marginTop: '0.4rem' }}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              Aucune quête en cours. Consulte les défis hebdomadaires pour gagner des points bonus.
            </p>
          )}
        </Card>
      </section>

      {certificationSprint ? (
        <SprintSection sprint={certificationSprint} />
      ) : (
        <Card style={{ marginTop: '1.25rem' }}>
          <span className="section-eyebrow">Sprint certification</span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>Aucun sprint actif</h2>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Lance un cycle court de préparation Apple, Jamf ou Intune depuis la page Sprint.
          </p>
          <Button href="/sprint" style={{ marginTop: '0.85rem' }}>
            Démarrer un sprint
          </Button>
        </Card>
      )}
    </section>
  );
}

function ProfileHero({
  displayName,
  email,
  rank,
  level,
  points,
  rankPercent,
  remainingPoints,
  hasToken,
  onLogout,
}: {
  displayName: string;
  email: string;
  rank: ReturnType<typeof getRankInfo>;
  level: string;
  points: number;
  rankPercent: number;
  remainingPoints: number;
  hasToken: boolean;
  onLogout: () => void;
}) {
  const initials = getInitials(displayName, email);

  return (
    <Card
      style={{
        background: rank.gradient,
        color: '#fff',
        borderColor: 'transparent',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          {initials}
        </div>
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.32)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span aria-hidden>{rank.icon}</span> Rang {rank.name}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{displayName}</h1>
          <p style={{ marginTop: '0.25rem', color: 'rgba(255,255,255,0.88)', fontSize: '0.95rem' }}>{email}</p>
          <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.92)' }}>
            Niveau <strong style={{ color: '#fff' }}>{level}</strong> · {points} points cumulés
          </p>
          <div style={{ marginTop: '1rem', maxWidth: 560 }}>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={rankPercent}
              style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: 999,
                height: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #ffce5b 100%)',
                  height: '100%',
                  width: `${rankPercent}%`,
                  borderRadius: 999,
                }}
              />
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.92)' }}>
              {rank.nextName
                ? `${remainingPoints} pts pour le rang ${rank.nextName}`
                : 'Rang maximal atteint — bravo Champion·ne !'}
            </p>
          </div>
        </div>
        {hasToken ? (
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.32)' }}
          >
            Déconnexion
          </button>
        ) : (
          <Button href="/auth" variant="secondary" size="sm" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.32)' }}>
            Connexion
          </Button>
        )}
      </div>
    </Card>
  );
}

function SprintSection({ sprint }: { sprint: CertificationSprintSummary }) {
  const sprintStatus = sprint.completed ? 'Terminé' : sprint.expired ? 'Expiré' : 'Actif';

  return (
    <Card style={{ marginTop: '1.25rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div>
          <span className="section-eyebrow">Sprint en cours</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>{sprint.label}</h2>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {formatTrack(sprint.track)} · {sprint.days} jours · {sprintStatus}
          </p>
          <ProgressBar
            value={Math.min(100, sprint.progressPercent)}
            tone={sprint.completed ? 'success' : 'accent'}
            style={{ marginTop: '0.85rem' }}
          />
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {sprint.progress}/{sprint.target} modules · {sprint.remainingModules} restant
            {sprint.remainingModules > 1 ? 's' : ''}
          </p>
        </div>
        <Button href="/sprint">Voir le sprint</Button>
      </div>
    </Card>
  );
}

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed && trimmed !== 'Trailblazer' && trimmed !== 'Technicien démo') {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.includes('@')) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'TB';
}
