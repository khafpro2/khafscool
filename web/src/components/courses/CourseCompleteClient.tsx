'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CourseSlug } from '@ama/shared/learning-paths';
import {
  fetchCourse,
  fetchCourseProgress,
  NEXT_COURSE_BY_SLUG,
  type CourseCompletionResult,
  type CourseDetail,
} from '@/lib/api';
import { buildAuthUrl, getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShareSuccessButton } from '@/components/courses/ShareSuccessButton';
import { Card } from '@/components/ui/Card';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TrackIcon } from '@/components/ui/TrackIcon';
import {
  estimatePoints,
  getBadgeVisual,
  getRewardBadgeForTrack,
  getTrackVisual,
  inferLevelFromModules,
} from '@/lib/design';

type CompletionState = {
  course: CourseDetail;
  completion: CourseCompletionResult;
  usesDemo: boolean;
};

export function CourseCompleteClient({
  slug,
  initialCompletion,
}: {
  slug: string;
  initialCompletion?: CourseCompletionResult | null;
}) {
  const [state, setState] = useState<CompletionState | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    let storedCompletion: CourseCompletionResult | null = initialCompletion ?? null;
    if (!storedCompletion && typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(`course-completion:${slug}`);
      if (raw) {
        try {
          storedCompletion = JSON.parse(raw) as CourseCompletionResult;
          sessionStorage.removeItem(`course-completion:${slug}`);
        } catch {
          storedCompletion = null;
        }
      }
    }

    fetchCourse(slug, token)
      .then(async (course) => {
        if (storedCompletion) {
          setState({ course, completion: storedCompletion, usesDemo: !token });
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
                usesDemo: false,
              });
              return;
            }
          } catch {
            // fall through
          }
          return;
        }

        setState(buildDemoCompletion(course));
      })
      .finally(() => setIsLoading(false));
  }, [slug, initialCompletion]);

  const nextCourse = useMemo(
    () => NEXT_COURSE_BY_SLUG[slug as CourseSlug] ?? null,
    [slug]
  );

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <p className="muted">Préparation de ta célébration...</p>
      </section>
    );
  }

  if (!state) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Parcours non terminé</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Termine toutes les unités du parcours pour débloquer cette page de victoire.
        </p>
        <Button href={`/courses/${slug}`} style={{ marginTop: '1rem' }}>
          Reprendre le parcours
        </Button>
      </section>
    );
  }

  const { course, completion, usesDemo } = state;
  const visual = getTrackVisual(course.track);
  const reward = getRewardBadgeForTrack(course.track);
  const badgeSlug = completion.badgeEarned ?? reward?.badgeSlug;
  const badgeVisual = badgeSlug ? getBadgeVisual(badgeSlug) : null;
  const level = inferLevelFromModules(course.modules.length);
  const estimatedTotal = estimatePoints(course.modules.length, level);

  return (
    <section style={{ padding: '1rem 0 3rem', position: 'relative', overflow: 'hidden' }}>
      <Breadcrumbs
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Parcours', href: '/courses' },
          { label: course.title },
        ]}
      />
      <ConfettiLayer />

      <div className="hero" style={{ marginTop: 0, position: 'relative', zIndex: 1, background: visual.gradient }}>
        <Badge tone="success" icon="\u{1F389}" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
          Parcours terminé
        </Badge>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, marginTop: '0.75rem' }}>
          Bravo ! Tu as complété « {completion.title} »
        </h1>
        <p style={{ marginTop: '0.65rem', maxWidth: 640, color: 'rgba(255,255,255,0.94)' }}>
          Tu viens de boucler les {course.modules.length} unités du parcours{' '}
          {formatTrack(course.track)}. Continue sur la lancée !
        </p>
        {usesDemo && (
          <p
            style={{
              marginTop: '0.75rem',
              padding: '0.55rem 0.75rem',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.18)',
              fontSize: '0.9rem',
            }}
          >
            Mode démo — connecte-toi pour enregistrer ta victoire et synchroniser tes badges.
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrackIcon track={course.track} size="lg" style={{ background: visual.gradient }} />
            <div>
              <p className="muted" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                Points gagnés sur le parcours
              </p>
              <p style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '0.15rem' }}>
                +{completion.pointsEarned || estimatedTotal} pts
              </p>
            </div>
          </div>
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Estimation catalogue : jusqu’à {estimatedTotal} pts pour ce parcours {level.toLowerCase()}.
          </p>
        </Card>

        <Card className="notice-demo">
          <p style={{ color: '#92400e', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Super-badge débloqué
          </p>
          {badgeVisual ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.65rem' }}>
              <div
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: badgeVisual.bg,
                  border: `2px solid ${badgeVisual.color}33`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.55rem',
                }}
              >
                {badgeVisual.brand ? (
                  <BrandIcon brand={badgeVisual.brand} size="lg" />
                ) : (
                  badgeVisual.icon
                )}
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem' }}>{badgeVisual.label}</strong>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}>
                  Ajouté à ta collection MDM Academy.
                </p>
              </div>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: '0.65rem' }}>
              Continue à valider des unités pour débloquer le badge {formatTrack(course.track)}.
            </p>
          )}
        </Card>
      </div>

      <Card style={{ marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Et maintenant ?</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.85rem', alignItems: 'flex-start' }}>
          <ShareSuccessButton courseTitle={completion.title} slug={slug} />
          <Button href={`/courses/${slug}/certificate`} variant="secondary" icon={'\u{1F4DC}'}>
            Télécharger / Imprimer mon certificat
          </Button>
          <Button href="/badges">Voir mes badges</Button>
          <Button href="/dashboard" variant="ghost">
            Tableau de bord
          </Button>
          <Button href="/courses" variant="ghost">
            Tous les parcours
          </Button>
          {!hasToken && (
            <Button href={buildAuthUrl(`/courses/${slug}/complete`)} variant="dark">
              Se connecter
            </Button>
          )}
        </div>

        {nextCourse ? (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: 14,
              border: '1px solid var(--border-soft)',
              background: '#f8fafd',
            }}
          >
            <p className="muted" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Parcours suggéré
            </p>
            <p style={{ fontWeight: 800, marginTop: '0.35rem' }}>{nextCourse.title}</p>
            <p className="muted" style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
              {slug === 'apple-cert-prep'
                ? 'Enchaîne avec Jamf Pro après ton socle Apple.'
                : 'Poursuis ta montée en compétences MDM multi-plateforme.'}
            </p>
            <Button href={`/courses/${nextCourse.slug}`} size="sm" style={{ marginTop: '0.75rem' }}>
              Commencer le parcours suivant
            </Button>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: '1rem' }}>
            Tu as complété la trilogie Apple · Jamf · Intune. Explore les quêtes et le classement !
          </p>
        )}
      </Card>

      <p style={{ marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
        <Link href={`/courses/${slug}`} style={{ fontWeight: 700 }}>
          ← Revoir le parcours
        </Link>
      </p>
    </section>
  );
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

function buildDemoCompletion(course: CourseDetail): CompletionState {
  const reward = getRewardBadgeForTrack(course.track);
  const level = inferLevelFromModules(course.modules.length);
  return {
    course,
    usesDemo: true,
    completion: {
      slug: course.slug,
      title: course.title,
      pointsEarned: estimatePoints(course.modules.length, level),
      ...(reward ? { badgeEarned: reward.badgeSlug } : {}),
    },
  };
}

function ConfettiLayer() {
  const pieces = ['\u{1F389}', '\u2B50', '\u{1F3C6}', '\u2728', '\u{1F34F}', '\u{1F6E1}'];
  return (
    <div aria-hidden className="confetti-layer">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${(index * 17) % 100}%`,
            fontSize: `${1 + (index % 3) * 0.35}rem`,
            animationDuration: `${2.8 + (index % 4) * 0.4}s`,
            animationDelay: `${index * 0.12}s`,
          }}
        >
          {pieces[index % pieces.length]}
        </span>
      ))}
    </div>
  );
}
