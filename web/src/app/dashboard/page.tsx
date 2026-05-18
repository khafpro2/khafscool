'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CertificationSprintSummary, DashboardData } from '@/lib/api';
import { fetchDashboard } from '@/lib/api';
import { getAccessToken, logoutSession } from '@/lib/auth';
import { formatBadge, formatTrack } from '@/lib/tracks';
import { ProgressOverview } from '@/components/dashboard/ProgressOverview';

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
    label: 'Continuer ServiceNow',
    description: 'S’entraîner à qualifier et clôturer un ticket support.',
    href: '/courses',
    track: 'SERVICENOW',
  },
  {
    label: 'Sprint certification',
    description: 'Planifier 7 ou 14 jours de révision Apple, Jamf, Intune ou ServiceNow.',
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
  {
    label: 'Lancer le mini-jeu ServiceNow',
    description: 'Scorer une note de résolution avec le mode connecté ou le fallback local.',
    href: '/servicenow',
    track: 'SERVICENOW_GAME',
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
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Chargement du compte...</p>
      </section>
    );
  }

  if (!hasToken) {
    const recommendedAction = getFallbackRecommendation();

    return (
      <section style={{ padding: '2rem 0', maxWidth: 720 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Connecte-toi pour suivre ta progression</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            Le dashboard utilise le token local pour appeler `/users/me/dashboard`. Sans token, le MVP te
            laisse explorer les parcours en mode démo.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link className="btn" href="/auth">
              Se connecter ou s’inscrire
            </Link>
            <Link className="btn" href="/courses" style={{ background: '#1d1d1f' }}>
              Explorer les parcours
            </Link>
          </div>
        </div>
        <RecommendedActionCard action={recommendedAction} />
        <QuickActionsGrid actions={fallbackQuickActions} />
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Impossible de charger les données. Essaie de te reconnecter.
        </p>
        <Link className="btn" href="/auth" style={{ marginTop: '1rem' }}>
          Revenir à la connexion
        </Link>
      </section>
    );
  }

  const { user, stats, badges, quests, courses, certificationSprint } = data;
  const recommendedAction = getRecommendedAction(data);
  const quickActions = getQuickActions(data);

  return (
    <section style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
            Bonjour, {user.displayName ?? 'Technicien'}
          </p>
        </div>
        <button className="btn" type="button" onClick={handleLogout} style={{ background: '#1d1d1f' }}>
          Déconnexion locale
        </button>
      </div>
      <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
        Session chargée depuis `ama_access`.
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        Niveau : <strong>{stats.level}</strong> · {stats.points} points
      </p>

      <RecommendedActionCard action={recommendedAction} />
      <SprintDashboardCard sprint={certificationSprint ?? null} />
      <QuickActionsGrid actions={quickActions} />

      <ProgressOverview
        modulesCompleted={stats.modulesCompleted}
        timeSpentMinutes={stats.timeSpentMinutes}
        averageQuizScore={stats.averageQuizScore}
        badges={badges}
        preparationScore={stats.preparationScore}
      />

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Parcours</h2>
        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {courses.map((c) => (
            <article key={c.id} className="card">
              <h3 style={{ fontWeight: 600 }}>{c.title}</h3>
              <div style={{ marginTop: '0.75rem', height: 8, background: '#e5e5ea', borderRadius: 4 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${c.progressPercent ?? 0}%`,
                    background: 'var(--accent)',
                    borderRadius: 4,
                  }}
                />
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                {c.progressPercent ?? 0}% complété
              </p>
              <Link
                href={`/courses/${c.slug}${c.nextModule ? `#module-${c.nextModule.slug}` : ''}`}
                style={{ display: 'inline-block', marginTop: '0.75rem', fontWeight: 600 }}
              >
                {c.nextModule ? `Continuer : ${c.nextModule.title}` : 'Ouvrir le parcours'}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <QuestsBadgesPanel quests={quests} badges={badges} />
    </section>
  );
}

function SprintDashboardCard({ sprint }: { sprint: CertificationSprintSummary | null }) {
  const sprintStatus = sprint ? formatSprintStatus(sprint) : 'Non démarré';

  return (
    <section
      className="card"
      style={{
        alignItems: 'center',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        marginTop: '1.5rem',
      }}
    >
      <div>
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
          Certification Sprint
        </p>
        {sprint ? (
          <>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>{sprint.label}</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
              {formatTrack(sprint.track)} · {sprint.days} jours · {sprintStatus}
            </p>
            <div style={{ background: '#e5e5ea', borderRadius: 999, height: 8, marginTop: '0.75rem' }}>
              <div
                style={{
                  background: sprint.completed ? '#0f7a3b' : 'var(--accent)',
                  borderRadius: 999,
                  height: '100%',
                  width: `${Math.min(100, sprint.progressPercent)}%`,
                }}
              />
            </div>
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
              Aucun sprint actif
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
              Lance un cycle court de préparation sur Apple, Jamf, Intune ou ServiceNow, puis suis ton rythme ici.
            </p>
          </>
        )}
      </div>
      <Link className="btn" href="/sprint">
        {sprint ? 'Voir le sprint' : 'Démarrer un sprint'}
      </Link>
    </section>
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

function RecommendedActionCard({ action }: { action: RecommendedAction }) {
  return (
    <section
      className="card"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 100%)',
        borderColor: '#c7ddff',
        marginTop: '1.5rem',
      }}
    >
      <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
        Prochaine action recommandée
      </p>
      <div
        style={{
          alignItems: 'end',
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          marginTop: '0.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{action.title}</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>{action.description}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>{action.meta}</p>
        </div>
        <Link className="btn" href={action.href}>
          {action.cta}
        </Link>
      </div>
    </section>
  );
}

function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <section style={{ marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Accès rapides</h2>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          marginTop: '0.75rem',
        }}
      >
        {actions.map((action) => (
          <Link
            className="card"
            href={action.href}
            key={action.label}
            style={{
              borderColor: action.primary ? '#c7ddff' : 'var(--border)',
              color: 'inherit',
              display: 'grid',
              gap: '0.4rem',
            }}
          >
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 800 }}>
              {formatTrack(action.track)}
            </span>
            <strong>{action.label}</strong>
            <span style={{ color: 'var(--muted)' }}>{action.description}</span>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        marginTop: '2rem',
      }}
    >
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quêtes de la semaine</h2>
        {quests.length > 0 ? (
          <ul style={{ display: 'grid', gap: '0.85rem', listStyle: 'none', marginTop: '1rem' }}>
            {quests.map((quest) => {
              const progressPercent = quest.target > 0 ? Math.min(100, Math.round((quest.progress / quest.target) * 100)) : 0;

              return (
                <li key={quest.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span>{quest.label}</span>
                    <strong>
                      {quest.progress}/{quest.target}
                    </strong>
                  </div>
                  <div style={{ background: '#e5e5ea', borderRadius: 999, height: 8, marginTop: '0.5rem' }}>
                    <div
                      style={{
                        background: 'var(--accent)',
                        borderRadius: 999,
                        height: '100%',
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
            Aucune quête active pour le moment. Continue un module ou lance le mini-jeu ServiceNow pour garder le rythme.
          </p>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Badges</h2>
        {badges.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {badges.map((badge) => (
              <span
                key={badge}
                style={{
                  background: '#eef6ff',
                  border: '1px solid #c7ddff',
                  borderRadius: 999,
                  color: '#0057b8',
                  fontWeight: 700,
                  padding: '0.35rem 0.7rem',
                }}
              >
                {formatBadge(badge)}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
            Aucun badge débloqué. Termine un module complet pour afficher tes premières récompenses.
          </p>
        )}
      </div>
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
    title: 'Mini-jeu ServiceNow',
    description: 'Teste une note de résolution et obtiens un score local même sans session connectée.',
    href: '/servicenow',
    cta: 'Lancer le mini-jeu',
    meta: 'Fallback démo disponible dans ce navigateur',
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
