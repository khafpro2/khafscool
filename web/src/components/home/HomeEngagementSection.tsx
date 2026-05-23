'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CertificationSprintSummary, DashboardData } from '@/lib/api';
import { fetchDashboard } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { countCompletedQuests } from '@/lib/quest-feedback';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';

export function HomeEngagementSection() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    fetchDashboard(token ?? undefined)
      .then(setDashboard)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="section container home-engagement" aria-busy="true" aria-label="Chargement des objectifs">
        <div className="home-engagement-grid">
          <Card className="home-engagement-card home-engagement-quests">
            <Skeleton width={120} height={12} rounded="pill" />
            <Skeleton width="70%" height={24} rounded="sm" style={{ marginTop: '0.65rem' }} />
            <Skeleton width="100%" height={8} rounded="pill" style={{ marginTop: '0.85rem' }} />
            <Skeleton width={140} height={36} rounded="md" style={{ marginTop: '1rem' }} />
          </Card>
          <Card className="home-engagement-card home-engagement-sprint">
            <Skeleton width={140} height={12} rounded="pill" />
            <Skeleton width="75%" height={24} rounded="sm" style={{ marginTop: '0.65rem' }} />
            <Skeleton width="100%" height={8} rounded="pill" style={{ marginTop: '0.85rem' }} />
            <Skeleton width={120} height={36} rounded="md" style={{ marginTop: '1rem' }} />
          </Card>
        </div>
      </section>
    );
  }

  if (!dashboard) return null;

  const completedQuests = countCompletedQuests(
    dashboard.quests.map((quest) => ({
      id: quest.id,
      questKey: quest.questKey ?? quest.id,
      label: quest.label,
      target: quest.target,
      progress: quest.progress,
      completed: quest.completed ?? quest.progress >= quest.target,
    }))
  );
  const totalQuests = dashboard.quests.length;
  const questProgressPercent =
    totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const featuredQuest = dashboard.quests.find((quest) => !quest.completed && quest.progress < quest.target)
    ?? dashboard.quests[0];
  const featuredQuestPercent =
    featuredQuest && featuredQuest.target > 0
      ? Math.min(100, Math.round((featuredQuest.progress / featuredQuest.target) * 100))
      : 0;

  return (
    <section className="section container home-engagement">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Engagement</span>
          <h2>Tes objectifs en cours</h2>
          <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 620 }}>
            Quêtes hebdo et sprint certification — synchronisés avec ton tableau de bord.
          </p>
        </div>
        <Link href="/dashboard" style={{ fontWeight: 700 }}>
          Mon apprentissage →
        </Link>
      </div>
      <div className="home-engagement-grid">
        <WeeklyQuestHomeCard
          completedQuests={completedQuests}
          totalQuests={totalQuests}
          questProgressPercent={questProgressPercent}
          featuredQuest={featuredQuest}
          featuredQuestPercent={featuredQuestPercent}
        />
        <SprintHomeCard sprint={dashboard.certificationSprint ?? null} />
      </div>
    </section>
  );
}

function WeeklyQuestHomeCard({
  completedQuests,
  totalQuests,
  questProgressPercent,
  featuredQuest,
  featuredQuestPercent,
}: {
  completedQuests: number;
  totalQuests: number;
  questProgressPercent: number;
  featuredQuest?: DashboardData['quests'][number];
  featuredQuestPercent: number;
}) {
  return (
    <Card className="home-engagement-card home-engagement-quests">
      <span className="home-engagement-eyebrow">Quête de la semaine</span>
      <h3 className="home-engagement-title">
        {completedQuests > 0
          ? `${completedQuests}/${totalQuests} quête${totalQuests > 1 ? 's' : ''} complétée${completedQuests > 1 ? 's' : ''}`
          : 'Débloque tes bonus hebdo'}
      </h3>
      <p className="muted home-engagement-caption">
        {featuredQuest
          ? `${featuredQuest.label} — ${featuredQuest.progress}/${featuredQuest.target}`
          : 'Valide des unités Apple, Jamf ou Intune avant la réinitialisation hebdomadaire.'}
      </p>
      <ProgressBar value={featuredQuest ? featuredQuestPercent : questProgressPercent} tone="success" />
      <p className="home-engagement-meta">
        Progression globale : {questProgressPercent}% · réinitialisation chaque lundi
      </p>
      <Button href="/quests" size="sm" style={{ marginTop: '0.85rem' }}>
        Voir mes quêtes
      </Button>
    </Card>
  );
}

function SprintHomeCard({ sprint }: { sprint: CertificationSprintSummary | null }) {
  if (!sprint) {
    return (
      <Card className="home-engagement-card home-engagement-sprint">
        <span className="home-engagement-eyebrow">Sprint certification</span>
        <h3 className="home-engagement-title">Lance un sprint certification</h3>
        <p className="muted home-engagement-caption">
          Défi guidé sur 7 ou 14 jours sur Apple, Jamf ou Intune. Termine le cycle pour débloquer ton badge.
        </p>
        <Button href="/sprint" size="sm" style={{ marginTop: '0.85rem' }}>
          Démarrer un sprint
        </Button>
      </Card>
    );
  }

  const status = sprint.completed ? 'Terminé' : sprint.expired ? 'Expiré' : 'Actif';

  return (
    <Card className="home-engagement-card home-engagement-sprint">
      <span className="home-engagement-eyebrow">Sprint certification</span>
      <h3 className="home-engagement-title">{sprint.label}</h3>
      <p className="muted home-engagement-caption">
        {formatTrack(sprint.track)} · {sprint.days} jours · {status} · {sprint.progress}/{sprint.target} unités
      </p>
      <ProgressBar
        value={Math.min(100, sprint.progressPercent)}
        tone={sprint.completed ? 'success' : 'accent'}
      />
      <p className="home-engagement-meta">
        {sprint.remainingModules} unité{sprint.remainingModules > 1 ? 's' : ''} restante
        {sprint.remainingModules > 1 ? 's' : ''} · {sprint.progressPercent}% complété
      </p>
      <Button href="/sprint" size="sm" style={{ marginTop: '0.85rem' }}>
        {sprint.completed ? 'Voir le sprint' : 'Continuer le sprint'}
      </Button>
    </Card>
  );
}
