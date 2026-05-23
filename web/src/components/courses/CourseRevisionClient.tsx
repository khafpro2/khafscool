'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { buildRevisionSections, type RevisionModuleSection } from '@ama/shared/revision-sheet';
import { parseInlineWithGlossary } from '@ama/shared/lesson-markdown';
import { glossaryWebHref } from '@ama/shared/glossary';
import {
  fetchCourse,
  fetchCourseProgress,
  type CourseDetail,
} from '@/lib/api';
import { buildAuthUrl, getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { getTrackVisual } from '@/lib/design';

type RevisionState = {
  course: CourseDetail;
  sections: RevisionModuleSection[];
  usesDemo: boolean;
  isComplete: boolean;
};

export function CourseRevisionClient({ slug }: { slug: string }) {
  const [state, setState] = useState<RevisionState | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    fetchCourse(slug, token ?? undefined)
      .then(async (course) => {
        const sections = buildRevisionSections(course.modules);

        if (!token) {
          setState({
            course,
            sections,
            usesDemo: true,
            isComplete: true,
          });
          return;
        }

        try {
          const progress = await fetchCourseProgress(slug, token);
          const isComplete = progress.progress.progressPercent >= 100;
          if (!isComplete) {
            setBlocked(true);
            return;
          }
          setState({
            course,
            sections,
            usesDemo: false,
            isComplete: true,
          });
        } catch {
          setBlocked(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const takeawayCount = useMemo(
    () => state?.sections.reduce((sum, section) => sum + section.takeaways.length, 0) ?? 0,
    [state]
  );

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <p className="muted">Préparation de ta fiche révision…</p>
      </section>
    );
  }

  if (blocked || !state) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fiche révision verrouillée</h1>
        <p className="muted" style={{ marginTop: '0.5rem', maxWidth: 560 }}>
          Termine les {state?.course.modules.length ?? 4} modules du parcours pour débloquer la fiche révision
          (points clés + liens glossaire).
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button href={`/courses/${slug}`}>Reprendre le parcours</Button>
          {!hasToken ? (
            <Button href={buildAuthUrl(`/courses/${slug}/revision`)} variant="secondary">
              Se connecter
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  const { course, sections, usesDemo } = state;
  const visual = getTrackVisual(course.track);

  return (
    <section className="revision-page" style={{ padding: '1rem 0 3rem' }}>
      <div className="no-print">
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Parcours', href: '/courses' },
            { label: course.title, href: `/courses/${slug}` },
            { label: 'Fiche révision' },
          ]}
        />
      </div>

      <div
        className="hero revision-hero no-print-dark"
        style={{ marginTop: '0.75rem', background: visual.gradient }}
      >
        <p style={{ fontWeight: 800, fontSize: '0.85rem', opacity: 0.92 }}>{'\u{1F4D1}'} Fiche révision</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, marginTop: '0.5rem' }}>
          {course.title}
        </h1>
        <p style={{ marginTop: '0.55rem', maxWidth: 640, color: 'rgba(255,255,255,0.94)' }}>
          {sections.length} modules · {takeawayCount} points clés · piste {formatTrack(course.track)} — synthèse
          avant certification ou entretien.
        </p>
        {usesDemo ? (
          <p
            style={{
              marginTop: '0.75rem',
              padding: '0.55rem 0.75rem',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.18)',
              fontSize: '0.9rem',
            }}
          >
            Mode démo — connecte-toi après complétion pour synchroniser ta progression.
          </p>
        ) : null}
      </div>

      <div className="revision-actions no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
        <Button icon={'\u{1F5A8}'} onClick={() => window.print()}>
          Imprimer / PDF
        </Button>
        <Button href={`/courses/${slug}/complete`} variant="secondary">
          Page de complétion
        </Button>
        <Button href={`/resources/glossaire`} variant="ghost">
          Glossaire MDM
        </Button>
      </div>

      <article className="revision-document" style={{ marginTop: '1.25rem' }}>
        <header className="revision-document__header">
          <TrackIcon track={course.track} size="md" style={{ background: visual.gradient }} />
          <div>
            <p className="revision-document__eyebrow">Synthèse {formatTrack(course.track)}</p>
            <h2 className="revision-document__title">{course.title}</h2>
            <p className="muted revision-document__meta">
              {sections.length} modules · {takeawayCount} points clés à retenir
            </p>
          </div>
        </header>

        {sections.map((section, sectionIndex) => (
          <section key={section.slug} className="revision-module">
            <h3 className="revision-module__title">
              {sectionIndex + 1}. {section.title}
            </h3>
            <ul className="revision-module__list">
              {section.takeaways.map((takeaway) => (
                <li key={takeaway}>
                  <TakeawayInline text={takeaway} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <footer className="revision-document__footer muted">
          <p>
            Glossaire complet :{' '}
            <Link href="/resources/glossaire" className="revision-glossary-link">
              /resources/glossaire
            </Link>
          </p>
          <p style={{ marginTop: '0.35rem' }}>MDM Academy Pro — fiche générée pour révision personnelle.</p>
        </footer>
      </article>
    </section>
  );
}

function TakeawayInline({ text }: { text: string }) {
  const linkedTermIds = new Set<string>();

  return (
    <>
      {parseInlineWithGlossary(text, linkedTermIds).map((part, index) => {
        if (part.type === 'strong') {
          return <strong key={index}>{part.value}</strong>;
        }
        if (part.type === 'link') {
          return (
            <a key={index} href={part.href} className="revision-inline-link" target="_blank" rel="noreferrer">
              {part.label}
            </a>
          );
        }
        if (part.type === 'glossary') {
          return (
            <Link key={index} href={glossaryWebHref(part.termId)} className="revision-glossary-term">
              {part.label}
            </Link>
          );
        }
        return part.value;
      })}
    </>
  );
}
