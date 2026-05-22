'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchCourse,
  fetchCourseProgress,
  fetchCurrentUser,
  type CourseCompletionResult,
  type CourseDetail,
} from '@/lib/api';
import { buildAuthUrl, getAccessToken, getStoredUser } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { TrackIcon } from '@/components/ui/TrackIcon';
import {
  estimatePoints,
  getBadgeVisual,
  getRewardBadgeForTrack,
  getTrackVisual,
  inferLevelFromModules,
} from '@/lib/design';

type CertificateState = {
  course: CourseDetail;
  completion: CourseCompletionResult;
  learnerName: string;
  completedAt: Date;
  usesDemo: boolean;
};

function formatFrenchDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function sumProgressPoints(
  modules: { quizScore: number | null; gameScore: number | null; completed: boolean }[]
) {
  return modules
    .filter((module) => module.completed)
    .reduce(
      (sum, module) =>
        sum + Math.round((module.quizScore ?? 0) * 0.1 + (module.gameScore ?? 0) * 0.2),
      0
    );
}

function buildDemoCertificate(course: CourseDetail): CertificateState {
  const reward = getRewardBadgeForTrack(course.track);
  const level = inferLevelFromModules(course.modules.length);
  return {
    course,
    usesDemo: true,
    learnerName: 'Apprenant démo',
    completedAt: new Date(),
    completion: {
      slug: course.slug,
      title: course.title,
      pointsEarned: estimatePoints(course.modules.length, level),
      ...(reward ? { badgeEarned: reward.badgeSlug } : {}),
    },
  };
}

export function CourseCertificateClient({ slug }: { slug: string }) {
  const [state, setState] = useState<CertificateState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    let storedCompletion: CourseCompletionResult | null = null;
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(`course-completion:${slug}`);
      if (raw) {
        try {
          storedCompletion = JSON.parse(raw) as CourseCompletionResult;
        } catch {
          storedCompletion = null;
        }
      }
    }

    fetchCourse(slug, token)
      .then(async (course) => {
        const resolveLearnerName = async () => {
          if (storedUser?.displayName) return storedUser.displayName;
          if (token) {
            const me = await fetchCurrentUser(token);
            if (me?.user.displayName) return me.user.displayName;
          }
          return 'Apprenant MDM Academy';
        };

        if (storedCompletion) {
          setState({
            course,
            completion: storedCompletion,
            learnerName: (await resolveLearnerName()) ?? 'Apprenant MDM Academy',
            completedAt: new Date(),
            usesDemo: !token,
          });
          return;
        }

        if (token) {
          try {
            const progress = await fetchCourseProgress(slug, token);
            if (progress.progress.progressPercent >= 100) {
              const reward = getRewardBadgeForTrack(course.track);
              const badgeEarned =
                reward && progress.progress.progressPercent >= 100 ? reward.badgeSlug : undefined;
              setState({
                course,
                completion: {
                  slug: course.slug,
                  title: course.title,
                  pointsEarned: sumProgressPoints(progress.modules),
                  ...(badgeEarned ? { badgeEarned } : {}),
                },
                learnerName: (await resolveLearnerName()) ?? 'Apprenant MDM Academy',
                completedAt: new Date(),
                usesDemo: false,
              });
              return;
            }
          } catch {
            // fall through
          }
          return;
        }

        setState(buildDemoCertificate(course));
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const certificateId = useMemo(
    () => `AMA-${slug.toUpperCase().replace(/-/g, '')}-${state?.completedAt.getFullYear() ?? ''}`,
    [slug, state?.completedAt]
  );

  if (isLoading) {
    return (
      <section className="certificate-page" style={{ padding: '2rem 0' }}>
        <p className="muted">Préparation de ton certificat…</p>
      </section>
    );
  }

  if (!state) {
    return (
      <section className="certificate-page" style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Certificat indisponible</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Termine toutes les unités du parcours pour obtenir ton certificat de complétion.
        </p>
        <Button href={`/courses/${slug}`} style={{ marginTop: '1rem' }}>
          Reprendre le parcours
        </Button>
      </section>
    );
  }

  const { course, completion, learnerName, completedAt, usesDemo } = state;
  const visual = getTrackVisual(course.track);
  const reward = getRewardBadgeForTrack(course.track);
  const badgeSlug = completion.badgeEarned ?? reward?.badgeSlug;
  const badgeVisual = badgeSlug ? getBadgeVisual(badgeSlug) : null;
  const level = inferLevelFromModules(course.modules.length);
  const estimatedTotal = estimatePoints(course.modules.length, level);
  const points = completion.pointsEarned || estimatedTotal;

  return (
    <section className="certificate-page">
      <div className="no-print">
        <Breadcrumbs
          items={[
          { label: 'Accueil', href: '/' },
          { label: 'Parcours', href: '/courses' },
          { label: course.title, href: `/courses/${slug}` },
          { label: 'Certificat' },
        ]}
        />
      </div>
      <div className="certificate-toolbar no-print">
        <div>
          <Link href={`/courses/${slug}/complete`} style={{ fontWeight: 700 }}>
            ← Retour à la célébration
          </Link>
          {usesDemo && (
            <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
              Mode démo — connecte-toi pour un certificat nominatif enregistré.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <Button
            type="button"
            onClick={() => window.print()}
            icon={'\u{1F5A8}\uFE0F'}
            aria-label="Télécharger le certificat en PDF via la boîte de dialogue d'impression"
          >
            Télécharger PDF
          </Button>
          <p className="muted no-print" style={{ fontSize: '0.85rem', margin: 0 }}>
            Choisis « Enregistrer au format PDF » dans la fenêtre d&apos;impression de ton navigateur.
          </p>
          {usesDemo && (
            <Button href={buildAuthUrl(`/courses/${slug}/certificate`)} variant="dark">
              Se connecter
            </Button>
          )}
        </div>
      </div>

      <article className="certificate-document" aria-label="Certificat de complétion">
        <div className="certificate-document__frame">
          <header className="certificate-document__header">
            <div className="certificate-document__brand">
              <span className="certificate-document__logo" aria-hidden>
                <BrandIcon brand="jamf" size="lg" variant="onColor" />
              </span>
              <div>
                <p className="certificate-document__org">MDM Academy Pro</p>
                <p className="certificate-document__tagline">Certificat de complétion</p>
              </div>
            </div>
            <p className="certificate-document__id">N° {certificateId}</p>
          </header>

          <div className="certificate-document__rule" aria-hidden />

          <p className="certificate-document__intro">Ce certificat atteste que</p>
          <h1 className="certificate-document__name">{learnerName}</h1>
          <p className="certificate-document__intro" style={{ marginTop: '1rem' }}>
            a complété avec succès le parcours
          </p>
          <h2 className="certificate-document__course">{completion.title}</h2>
          <p className="certificate-document__track">
            Piste {formatTrack(course.track)} · {course.modules.length} unités · niveau {level}
          </p>

          <div className="certificate-document__metrics">
            <div className="certificate-document__metric">
              <TrackIcon track={course.track} size="lg" style={{ background: visual.gradient }} />
              <div>
                <p className="certificate-document__metric-label">Parcours</p>
                <p className="certificate-document__metric-value">{formatTrack(course.track)}</p>
              </div>
            </div>
            <div className="certificate-document__metric">
              <span className="certificate-document__metric-icon" aria-hidden>
                {'\u{1F3C6}'}
              </span>
              <div>
                <p className="certificate-document__metric-label">Points obtenus</p>
                <p className="certificate-document__metric-value">+{points} pts</p>
              </div>
            </div>
            {badgeVisual ? (
              <div className="certificate-document__metric">
                <div
                  className="certificate-document__badge"
                  style={{
                    background: badgeVisual.bg,
                    border: `2px solid ${badgeVisual.color}33`,
                  }}
                  aria-hidden
                >
                  {badgeVisual.brand ? (
                    <BrandIcon brand={badgeVisual.brand} size="lg" />
                  ) : (
                    badgeVisual.icon
                  )}
                </div>
                <div>
                  <p className="certificate-document__metric-label">Super-badge</p>
                  <p className="certificate-document__metric-value">{badgeVisual.label}</p>
                </div>
              </div>
            ) : null}
          </div>

          <p className="certificate-document__date">
            Délivré le <strong>{formatFrenchDate(completedAt)}</strong>
          </p>

          <footer className="certificate-document__footer">
            <div className="certificate-document__seal" aria-hidden>
              <BrandIcon brand="jamf" size="md" />
              <span>MDM Pro</span>
            </div>
            <p className="certificate-document__legal">
              Formation gratuite Apple Device Support, Jamf Pro et Microsoft Intune — progression
              vérifiée sur la plateforme MDM Academy.
            </p>
          </footer>
        </div>
      </article>
    </section>
  );
}
