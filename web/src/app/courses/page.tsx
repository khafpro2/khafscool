'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CourseSummary } from '@/lib/api';
import { fetchCourses } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    fetchCourses(token)
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Parcours</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', maxWidth: 680 }}>
            Ouvre un parcours Apple ou Jamf, révise les modules et réponds aux questions. Si l’API ou la base
            ne répond pas, cette page garde un fallback démo.
          </p>
        </div>
        {!hasToken && (
          <Link className="btn" href="/auth">
            Se connecter
          </Link>
        )}
      </div>

      {!hasToken && (
        <p className="card" style={{ marginTop: '1.5rem', color: 'var(--muted)' }}>
          Catalogue public : connecte-toi pour ouvrir les modules protégés et enregistrer ta progression.
        </p>
      )}

      {isLoading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Chargement des parcours...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            marginTop: '2rem',
          }}
        >
          {courses.map((course) => (
            <article className="card" key={course.slug}>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 700 }}>{course.track}</p>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>{course.title}</h2>
              {course.description && (
                <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{course.description}</p>
              )}
              <p style={{ color: 'var(--muted)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                Progression : {course.progressPercent ?? 0}%
                {course.totalModules ? ` · ${course.completedModules ?? 0}/${course.totalModules} modules` : ''}
              </p>
              <Link
                className="btn"
                href={`/courses/${course.slug}${course.nextModule ? `#module-${course.nextModule.slug}` : ''}`}
                style={{ marginTop: '1rem' }}
              >
                {course.nextModule ? 'Reprendre le prochain module' : 'Ouvrir'}
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
