'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CourseSummary } from '@/lib/api';
import { fetchCourses } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

const TRACK_LABELS: Record<string, string> = {
  APPLE: 'Apple',
  JAMF: 'Jamf Pro',
  INTUNE: 'Intune',
  SERVICENOW: 'ServiceNow',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('TOUS');
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    fetchCourses(token)
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const tracks = useMemo(
    () => ['TOUS', ...Array.from(new Set(courses.map((course) => course.track))).sort()],
    [courses]
  );
  const filteredCourses = useMemo(
    () => (selectedTrack === 'TOUS' ? courses : courses.filter((course) => course.track === selectedTrack)),
    [courses, selectedTrack]
  );
  const moduleCount = courses.reduce((total, course) => total + (course.totalModules ?? 0), 0);

  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 55%, #fff8e6 100%)',
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 0.45fr)',
          padding: '1.75rem',
        }}
      >
        <div>
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Catalogue public
          </p>
          <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.12, marginTop: '0.35rem' }}>
            Choisis ton parcours Apple, MDM ou support
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.75rem', maxWidth: 720 }}>
            Compare les tracks, repère le volume de modules et démarre une préparation guidée. Le catalogue reste
            consultable en local si l’API publique est indisponible.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link className="btn" href={hasToken ? '/dashboard' : '/auth'}>
              {hasToken ? 'Voir mon dashboard' : 'Créer un compte'}
            </Link>
            <Link className="btn" href="/sprint" style={{ background: '#1d1d1f' }}>
              Lancer un sprint
            </Link>
          </div>
        </div>
        <aside
          style={{
            alignSelf: 'stretch',
            background: 'rgba(255, 255, 255, 0.72)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            display: 'grid',
            gap: '0.75rem',
            padding: '1rem',
          }}
        >
          <CatalogStat label="Tracks disponibles" value={String(Math.max(tracks.length - 1, 0))} />
          <CatalogStat label="Modules catalogue" value={String(moduleCount || 'Démo')} />
          <CatalogStat label="Accès" value={hasToken ? 'Connecté' : 'Public'} />
        </aside>
      </div>

      {!hasToken && (
        <section className="card" style={{ background: '#fff8e6', borderColor: '#f0cf7a', marginTop: '1.25rem' }}>
          <strong>Mode public</strong>
          <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
            Tu peux explorer les parcours sans compte. Connecte-toi pour reprendre un module, sauvegarder tes scores
            et alimenter ton sprint de certification.
          </p>
        </section>
      )}

      {isLoading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Chargement des parcours...</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            {tracks.map((track) => {
              const isSelected = selectedTrack === track;

              return (
                <button
                  key={track}
                  type="button"
                  onClick={() => setSelectedTrack(track)}
                  style={{
                    background: isSelected ? 'var(--accent)' : '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    color: isSelected ? '#ffffff' : 'var(--fg)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    padding: '0.55rem 0.9rem',
                  }}
                >
                  {track === 'TOUS' ? 'Tous les tracks' : TRACK_LABELS[track] ?? track}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              marginTop: '1.25rem',
            }}
          >
            {filteredCourses.map((course) => (
              <CourseCatalogCard course={course} hasToken={hasToken} key={course.slug} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CourseCatalogCard({ course, hasToken }: { course: CourseSummary; hasToken: boolean }) {
  const moduleCount = course.totalModules ?? 0;
  const completedModules = course.completedModules ?? 0;
  const progressPercent = course.progressPercent ?? 0;
  const detailHref = `/courses/${course.slug}${course.nextModule ? `#module-${course.nextModule.slug}` : ''}`;

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
          {TRACK_LABELS[course.track] ?? course.track}
        </p>
        <span
          style={{
            background: '#f5f5f7',
            borderRadius: 999,
            color: 'var(--muted)',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '0.25rem 0.6rem',
            whiteSpace: 'nowrap',
          }}
        >
          {moduleCount || 'Démo'} module{moduleCount > 1 ? 's' : ''}
        </span>
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2, marginTop: '0.5rem' }}>{course.title}</h2>
      {course.description && <p style={{ color: 'var(--muted)', marginTop: '0.65rem' }}>{course.description}</p>}

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
          <strong>{hasToken ? `${progressPercent}% complété` : 'Aperçu public'}</strong>
          <span style={{ color: 'var(--muted)' }}>
            {moduleCount ? `${completedModules}/${moduleCount}` : 'modules inclus'}
          </span>
        </div>
        <div style={{ background: '#e5e5ea', borderRadius: 999, height: 8, marginTop: '0.5rem' }}>
          <div
            style={{
              background: progressPercent > 0 ? '#0f7a3b' : 'var(--accent)',
              borderRadius: 999,
              height: '100%',
              width: `${Math.min(100, progressPercent)}%`,
            }}
          />
        </div>
      </div>

      {course.nextModule && (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.85rem' }}>
          Prochaine étape: <strong>{course.nextModule.title}</strong>
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: 'auto', paddingTop: '1.25rem' }}>
        <Link className="btn" href={detailHref}>
          {hasToken ? 'Continuer' : 'Voir le détail'}
        </Link>
        {!hasToken && (
          <Link className="btn" href="/auth" style={{ background: '#1d1d1f' }}>
            S’inscrire
          </Link>
        )}
        <Link href="/sprint" style={{ alignSelf: 'center', fontWeight: 800 }}>
          Préparer en sprint
        </Link>
      </div>
    </article>
  );
}

function CatalogStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 12, padding: '0.85rem' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 700 }}>{label}</p>
      <strong style={{ display: 'block', fontSize: '1.15rem', marginTop: '0.15rem' }}>{value}</strong>
    </div>
  );
}
