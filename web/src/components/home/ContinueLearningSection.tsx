'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { DashboardData } from '@/lib/api';
import { fetchDashboard } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { getFallbackResumeAction, getResumeLearningAction } from '@/lib/resume-learning';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function ContinueLearningSection() {
  const [action, setAction] = useState(() => getFallbackResumeAction());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchDashboard(token)
      .then((data: DashboardData) => setAction(getResumeLearningAction(data)))
      .catch(() => setAction(getFallbackResumeAction()))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="section container home-continue-learning" aria-busy="true" aria-label="Chargement">
        <Card className="home-continue-learning-card">
          <Skeleton width={140} height={12} rounded="pill" />
          <Skeleton width="65%" height={28} rounded="sm" style={{ marginTop: '0.65rem' }} />
          <Skeleton width="90%" height={16} rounded="sm" style={{ marginTop: '0.55rem' }} />
          <Skeleton width={180} height={40} rounded="md" style={{ marginTop: '1rem' }} />
        </Card>
      </section>
    );
  }

  return (
    <section className="section container home-continue-learning">
      <Card
        className={`home-continue-learning-card${action.hasProgress ? ' home-continue-learning-card-active' : ''}`}
      >
        <span className="section-eyebrow">Continuer l’apprentissage</span>
        <h2 className="home-continue-learning-title">{action.title}</h2>
        <p className="muted home-continue-learning-caption">{action.description}</p>
        <p className="muted home-continue-learning-meta">{action.meta}</p>
        <div className="home-continue-learning-actions">
          <Button href={action.href} size="sm">
            {action.cta}
          </Button>
          {action.hasProgress ? (
            <Link href="/dashboard" className="home-continue-learning-link">
              Mon apprentissage →
            </Link>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
