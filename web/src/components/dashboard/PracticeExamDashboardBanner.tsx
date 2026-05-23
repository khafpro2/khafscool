'use client';

import Link from 'next/link';
import type { CourseSummary } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function findCompletedCourses(courses: CourseSummary[]) {
  return courses.filter(
    (course) =>
      course.totalModules > 0 &&
      (course.progressPercent ?? 0) >= 100 &&
      course.completedModules >= course.totalModules
  );
}

export function PracticeExamDashboardBanner({ courses }: { courses: CourseSummary[] }) {
  const completed = findCompletedCourses(courses);
  if (!completed.length) return null;

  const primary = completed[0];

  return (
    <Card
      variant="soft"
      className="dashboard-fade-in"
      style={{
        marginTop: '1.25rem',
        borderColor: 'rgba(37, 99, 235, 0.22)',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.03))',
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
          <span className="section-eyebrow">Examen blanc</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
            Parcours terminé — teste-toi !
          </h2>
          <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 560 }}>
            {completed.length === 1 ? (
              <>
                « {primary.title} » est complété à 100 %. Passe l&apos;examen blanc (10 questions) pour valider
                ta préparation et débloquer le badge « Examen blanc réussi ».
              </>
            ) : (
              <>
                {completed.length} parcours terminés —{' '}
                {completed.map((course) => course.title).join(', ')}.
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <Button href={`/courses/${primary.slug}/examen`}>Passer l&apos;examen blanc</Button>
          {completed.length > 1 ? (
            <Link href="/courses" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
              Choisir un parcours →
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
