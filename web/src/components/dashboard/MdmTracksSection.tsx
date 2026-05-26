'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { CourseSummary } from '@/lib/api';
import { fetchCourses } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { LearningPathCard } from '@/components/ui/LearningPathCard';
import { LEARNING_PATHS } from '@/lib/learningPaths';

export function MdmTracksSection({ courses: progressCourses }: { courses?: CourseSummary[] }) {
  const [catalogCourses, setCatalogCourses] = useState<CourseSummary[]>(progressCourses ?? []);

  useEffect(() => {
    if (progressCourses?.length) {
      setCatalogCourses(progressCourses);
      return;
    }
    const token = getAccessToken();
    fetchCourses(token ?? undefined)
      .then(setCatalogCourses)
      .catch(() => setCatalogCourses([]));
  }, [progressCourses]);

  const progressBySlug = useMemo(() => {
    const map = new Map<string, CourseSummary>();
    for (const course of catalogCourses) {
      map.set(course.slug, course);
    }
    return map;
  }, [catalogCourses]);

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Mes pistes MDM</span>
          <h2>Apple, Jamf Pro et Microsoft Intune</h2>
          <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 640 }}>
            Trois parcours complémentaires pour couvrir le support Apple, l’administration Jamf et l’enrôlement
            Intune. Démarre chaque piste à ton rythme.
          </p>
        </div>
        <Link href="/courses" style={{ fontWeight: 700 }}>
          Voir le catalogue →
        </Link>
      </div>
      <div className="grid grid-learning-paths">
        {LEARNING_PATHS.map((path) => {
          const course = progressBySlug.get(path.slug);
          return (
            <LearningPathCard
              key={path.slug}
              path={path}
              title={course?.title ?? path.title}
              progressPercent={course?.progressPercent ?? 0}
              completedModules={course?.completedModules ?? 0}
              showTrackProgress={Boolean(course)}
              cta={course?.progressPercent ? 'Continuer ce parcours' : 'Démarrer cette piste'}
            />
          );
        })}
      </div>
    </section>
  );
}
