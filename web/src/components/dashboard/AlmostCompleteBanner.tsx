'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { CourseSummary } from '@/lib/api';
import { toastAlmostComplete } from '@/lib/gamification-toasts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function findAlmostCompleteCourses(courses: CourseSummary[]) {
  return courses.filter(
    (course) =>
      course.totalModules === 4 &&
      course.completedModules === 3 &&
      (course.progressPercent ?? 0) < 100
  );
}

export function AlmostCompleteBanner({ courses }: { courses: CourseSummary[] }) {
  const almostComplete = findAlmostCompleteCourses(courses);

  useEffect(() => {
    if (typeof window === 'undefined' || !almostComplete.length) return;

    for (const course of almostComplete) {
      const key = `almost-complete-toast:${course.slug}`;
      if (sessionStorage.getItem(key)) continue;
      sessionStorage.setItem(key, '1');
      toastAlmostComplete(course.title);
    }
  }, [almostComplete]);

  if (!almostComplete.length) return null;

  const primary = almostComplete[0];
  const resumeHref = primary.nextModule
    ? `/courses/${primary.slug}#module-${primary.nextModule.slug}`
    : `/courses/${primary.slug}`;

  return (
    <Card
      variant="soft"
      className="dashboard-fade-in"
      style={{
        marginTop: '1.25rem',
        borderColor: 'rgba(10, 92, 46, 0.22)',
        background: 'linear-gradient(135deg, rgba(10, 92, 46, 0.08), rgba(10, 92, 46, 0.03))',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div>
          <span className="section-eyebrow">Presque terminé</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
            Plus qu&apos;une unité pour le badge !
          </h2>
          <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 560 }}>
            {almostComplete.length === 1 ? (
              <>
                « {primary.title} » — 3/4 modules complétés. Termine la dernière unité pour débloquer ton
                super-badge piste.
              </>
            ) : (
              <>
                {almostComplete.length} parcours à 3/4 modules —{' '}
                {almostComplete.map((course) => course.title).join(', ')}.
              </>
            )}
          </p>
          {almostComplete.length === 1 && primary.nextModule ? (
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Prochaine unité : {primary.nextModule.title}
            </p>
          ) : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <Button href={resumeHref}>Continuer</Button>
          {almostComplete.length > 1 ? (
            <Link href="/courses" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
              Voir le catalogue →
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
