'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CertificationSprintSummary, DashboardData } from '@/lib/api';
import { fetchDashboard } from '@/lib/api';
import { buildAuthUrl, getAccessToken, logoutSession } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { ProgressOverview } from '@/components/dashboard/ProgressOverview';
import { BadgesCallout } from '@/components/dashboard/BadgesCallout';
import { WeeklyQuestsCallout } from '@/components/dashboard/WeeklyQuestsCallout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LevelPill } from '@/components/ui/LevelPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { TrailCard } from '@/components/ui/TrailCard';
import { estimatePoints, getBadgeVisual, getRankInfo, inferLevelFromModules } from '@/lib/design';

type Quest = { id: string; label: string; progress: number; target: number };
type QuickAction = {
  label: string;
  description: string;
  href: string;
  track: string;
  progress?: number;
  primary?: boolean;
};
type RecommendedAction = {
  title: string;
  description: string;
  href: string;
  cta: string;
  meta: string;
};

const fallbackQuickActions: QuickAction[] = [
  {
    label: 'Continuer Apple',
    description: 'Reprendre les fondamentaux Device Support et MDM.',
    href: '/courses/apple-cert-prep',
    track: 'APPLE',
  },
  {
    label: 'Continuer Jamf',
    description: 'Pratiquer smart groups, politiques et inventaire.',
    href: '/courses/jamf-pro-foundations',
    track: 'JAMF',
  },
  {
    label: 'Continuer Intune',
    description: 'Réviser l’enrôlement iOS et la conformité mobile.',
    href: '/courses',
    track: 'INTUNE',
  },
  {
    label: 'Sprint certification',
    description: 'Planifier 7 ou 14 jours de révision Apple, Jamf ou Intune.',
    href: '/sprint',
    track: 'SPRINT',
    primary: true,
  },
  {
    label: 'Ressources officielles',
    description: 'Vérifier les sources éditeurs avant un module, un sprint ou une certification.',
    href: '/resources',
    track: 'RESOURCES',
  },
];

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

  async function handleLogout() {
    await logoutSession();
    setHasToken(false);
    setData(null);
  }

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Tableau de bord</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>Chargement du compte...</p>
      </section>
    );
  }

  if (!hasToken) {
    const recommendedAction = getFallbackRecommendation();

    return (
      <section style={{ padding: '1rem 0 2rem' }}>
        <Card
          variant="gradient"
          style={{
            background: 'linear-gradient(135deg, #032d60 0%, #0070d2 60%, #16cdf1 100%)',
          }}
        >
          <span className="hero-eyebrow" style={{ background: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.32)' }}>
            <span aria-hidden>{'\u{1F3AF}'}</span> Tableau de bord MDM Academy
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.75rem' }}>
            Connecte-toi pour suivre ta progression Trailblazer.
          </h1>
          <p style={{ marginTop: '0.5rem', maxWidth: 600 }}>
            Le tableau de bord utilise le token local pour appeler <code>/users/me/progress</code>. Sans
            token, le MVP te laisse explorer les parcours en mode démo.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <Button href={buildAuthUrl('/dashboard')} variant="secondary" size="lg">
              Se connecter ou s’inscrire
            </Button>
            <Button href="/courses" size="lg" variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Explorer les parcours
            </Button>
          </div>
        </Card>

        <RecommendedActionCard action={recommendedAction} />
        <WeeklyQuestsCallout />
        <BadgesCallout />
        <QuickActionsGrid actions={fallbackQuickActions} />
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Tableau de bord</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Impossible de charger les données. Essaie de te reconnecter.
        </p>
        <Button href={buildAuthUrl('/dashboard')} style={{ marginTop: '1rem' }}>
          Revenir à la connexion
        </Button>
      </section>
    );
  }

  const { user, stats, badges, quests, courses, certificationSprint } = data;
  const recommendedAction = getRecommendedAction(data);
  const quickActions = getQuickActions(data);

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <TrailblazerRankCard user={user.displayName ?? 'Technicien'} points={stats.points} level={stats.level} onLogout={handleLogout} />

      <RecommendedActionCard action={recommendedAction} />
      <SprintDashboardCard sprint={certificationSprint ?? null} />
      <WeeklyQuestsCallout />
      <BadgesCallout />
      <LeaderboardCallout />
      <QuickActionsGrid actions={quickActions} />

      <ProgressOverview
        modulesCompleted={stats.modulesCompleted}
        timeSpentMinutes={stats.timeSpentMinutes}
        averageQuizScore={stats.averageQuizScore}
        badges={badges}
        preparationScore={stats.preparationScore}
      />

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Mes parcours</span>
            <h2>Continue là où tu t’étais arrêté</h2>
          </div>
          <Link href="/courses" style={{ fontWeight: 700 }}>
            Voir tout le catalogue →
          </Link>
        </div>
        <div className="grid grid-cards-lg">
          {courses.map((course) => {
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
      </section>

      <QuestsBadgesPanel quests={quests} badges={badges} />
    </section>
  );
}

function TrailblazerRankCard({
  user,
  points,
  level,
  onLogout,
}: {
  user: string;
  points: number;
  level: string;
  onLogout: () => void;
}) {
  const rank = getRankInfo(points);
  const previousFloor = rank.minPoints;
  const ceiling = rank.nextPoints ?? Math.max(previousFloor + 100, points + 100);
  const span = Math.max(1, ceiling - previousFloor);
  const progressInRank = Math.max(0, Math.min(span, points - previousFloor));
  const percent = Math.round((progressInRank / span) * 100);
  const remaining = rank.nextPoints != null ? Math.max(0, rank.nextPoints - points) : 0;

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
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
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
            <span aria-hidden>{rank.icon}</span> Rang Trailblazer
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Bonjour {user}
          </h1>
          <p style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.92)' }}>
            Rang <strong style={{ color: '#fff' }}>{rank.name}</strong> · niveau{' '}
            <strong style={{ color: '#fff' }}>{level}</strong> · {points} points cumulés
          </p>
          <div style={{ marginTop: '1rem', maxWidth: 560 }}>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
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
                  width: `${percent}%`,
                  borderRadius: 999,
                }}
              />
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.92)' }}>
              {rank.nextName
                ? `${remaining} pts pour atteindre le rang ${rank.nextName}`
                : 'Rang maximal atteint — bravo Champion·ne !'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-secondary btn-sm"
          style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.32)' }}
        >
          Déconnexion locale
        </button>
      </div>
    </Card>
  );
}

function SprintDashboardCard({ sprint }: { sprint: CertificationSprintSummary | null }) {
  const sprintStatus = sprint ? formatSprintStatus(sprint) : 'Non démarré';

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
          <span className="section-eyebrow">Sprint certification</span>
          {sprint ? (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>{sprint.label}</h2>
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                {formatTrack(sprint.track)} · {sprint.days} jours · {sprintStatus}
              </p>
              <ProgressBar
                value={Math.min(100, sprint.progressPercent)}
                tone={sprint.completed ? 'success' : 'accent'}
                style={{ marginTop: '0.85rem' }}
              />
              <div
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  marginTop: '1rem',
                }}
              >
                <SprintMetric label="Progression" value={`${sprint.progress}/${sprint.target}`} />
                <SprintMetric label="Objectif" value={`${sprint.progressPercent}%`} />
                <SprintMetric label="Restants" value={String(sprint.remainingModules)} />
                <SprintMetric label="Statut" value={sprintStatus} />
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>Aucun sprint actif</h2>
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                Lance un cycle court de préparation sur Apple, Jamf ou Intune, puis suis ton rythme ici.
              </p>
            </>
          )}
        </div>
        <Button href="/sprint">{sprint ? 'Voir le sprint' : 'Démarrer un sprint'}</Button>
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

function LeaderboardCallout() {
  return (
    <Card
      style={{
        marginTop: '1.25rem',
        background: 'linear-gradient(135deg, #fff7d6 0%, #ffffff 100%)',
        borderColor: '#f0cf7a',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
      }}
    >
      <div>
        <span style={{ color: '#8a6d00', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Classement
        </span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Compare ta progression à la communauté
        </h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Découvre le top 10 des apprenants MDM Academy et ton rang actuel.
        </p>
      </div>
      <Button href="/leaderboard">Voir le classement</Button>
    </Card>
  );
}

function RecommendedActionCard({ action }: { action: RecommendedAction }) {
  return (
    <Card
      style={{
        marginTop: '1.25rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #e3f0ff 100%)',
        borderColor: '#c5dbf3',
      }}
    >
      <span className="section-eyebrow">Prochaine action recommandée</span>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          marginTop: '0.4rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{action.title}</h2>
          <p className="muted" style={{ marginTop: '0.35rem' }}>{action.description}</p>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{action.meta}</p>
        </div>
        <Button href={action.href}>{action.cta}</Button>
      </div>
    </Card>
  );
}

function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <section className="section" style={{ marginTop: '1.5rem' }}>
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Accès rapides</span>
          <h2>Reprends en un clic</h2>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {actions.map((action) => (
          <Link
            href={action.href}
            key={action.label}
            className="card card-soft"
            style={{
              display: 'grid',
              gap: '0.5rem',
              color: 'inherit',
              borderColor: action.primary ? '#c5dbf3' : 'var(--border-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <TrackIcon track={action.track} size="sm" />
              <span className="muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {formatTrack(action.track)}
              </span>
            </div>
            <strong>{action.label}</strong>
            <span className="muted" style={{ fontSize: '0.9rem' }}>{action.description}</span>
            {typeof action.progress === 'number' && (
              <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700 }}>
                {action.progress}% complété
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuestsBadgesPanel({ quests, badges }: { quests: Quest[]; badges: string[] }) {
  return (
    <section
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        marginTop: '2rem',
      }}
    >
      <Card>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quêtes de la semaine</h2>
        {quests.length > 0 ? (
          <ul style={{ display: 'grid', gap: '0.85rem', listStyle: 'none', marginTop: '1rem' }}>
            {quests.map((quest) => {
              const target = Math.max(1, quest.target);
              const progressPercent = Math.min(100, Math.round((quest.progress / target) * 100));
              return (
                <li key={quest.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span>{quest.label}</span>
                    <strong>
                      {quest.progress}/{quest.target}
                    </strong>
                  </div>
                  <ProgressBar
                    value={progressPercent}
                    tone={progressPercent >= 100 ? 'success' : 'accent'}
                    size="sm"
                    style={{ marginTop: '0.4rem' }}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Aucune quête active pour le moment. Continue un module ou démarre un sprint pour garder le
            rythme.
          </p>
        )}
      </Card>

      <Card>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Badges</h2>
        {badges.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {badges.map((slug) => {
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
            Aucun badge débloqué. Termine un module complet pour afficher tes premières récompenses.
          </p>
        )}
        <p className="muted" style={{ marginTop: '0.85rem', fontSize: '0.85rem' }}>
          <LevelPill level="Intermédiaire" /> ton niveau évolue avec tes points et tes super-badges.
        </p>
      </Card>
    </section>
  );
}

function getRecommendedAction(data: DashboardData): RecommendedAction {
  const nextCourse = data.courses.find((course) => course.nextModule);

  if (nextCourse?.nextModule) {
    return {
      title: nextCourse.nextModule.title,
      description: `Continue le parcours ${formatTrack(nextCourse.track)} là où tu t’es arrêté.`,
      href: `/courses/${nextCourse.slug}#module-${nextCourse.nextModule.slug}`,
      cta: 'Reprendre',
      meta: `${nextCourse.progressPercent ?? 0}% du parcours complété`,
    };
  }

  const incompleteCourse = data.courses.find((course) => (course.progressPercent ?? 0) < 100);

  if (incompleteCourse) {
    return {
      title: incompleteCourse.title,
      description: `Ouvre le prochain module disponible pour renforcer ton socle ${formatTrack(incompleteCourse.track)}.`,
      href: `/courses/${incompleteCourse.slug}`,
      cta: 'Continuer',
      meta: `${incompleteCourse.progressPercent ?? 0}% du parcours complété`,
    };
  }

  return getFallbackRecommendation();
}

function getFallbackRecommendation(): RecommendedAction {
  return {
    title: 'Préparer un sprint certification',
    description: 'Planifie 7 ou 14 jours de révision Apple, Jamf ou Intune pour cadrer ta progression.',
    href: '/sprint',
    cta: 'Lancer un sprint',
    meta: 'Disponible avec ou sans session connectée',
  };
}

function getQuickActions(data: DashboardData): QuickAction[] {
  return fallbackQuickActions.map((fallbackAction) => {
    const course = data.courses.find((item) => item.track === fallbackAction.track);

    if (!course) {
      return fallbackAction;
    }

    return {
      ...fallbackAction,
      description: course.nextModule ? `Prochain module : ${course.nextModule.title}` : course.description ?? fallbackAction.description,
      href: `/courses/${course.slug}${course.nextModule ? `#module-${course.nextModule.slug}` : ''}`,
      progress: course.progressPercent ?? 0,
    };
  });
}

function formatSprintStatus(sprint: CertificationSprintSummary) {
  if (sprint.completed) return 'Terminé';
  if (sprint.expired) return 'Expiré';
  return 'Actif';
}
