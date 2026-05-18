'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CourseDetail, CourseProgressData } from '@/lib/api';
import { completeModule, fetchCourse, fetchCourseProgress } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LevelPill } from '@/components/ui/LevelPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrackIcon } from '@/components/ui/TrackIcon';
import {
  estimateDurationMinutes,
  estimatePoints,
  formatDurationLabel,
  getRewardBadgeForTrack,
  getTrackVisual,
  inferLevelFromModules,
} from '@/lib/design';

export function CourseDetailClient({ slug }: { slug: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [usesProgressFallback, setUsesProgressFallback] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    setUsesProgressFallback(false);
    fetchCourse(slug, token)
      .then(async (loadedCourse) => {
        setCourse(loadedCourse);
        try {
          const loadedProgress = await fetchCourseProgress(slug, token);
          setProgress(loadedProgress);
          setUsesProgressFallback(!token || loadedProgress.course.id.startsWith('demo-'));
        } catch {
          setProgress(buildLocalCourseProgress(loadedCourse));
          setUsesProgressFallback(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const moduleProgressById = useMemo(() => {
    return new Map(progress?.modules.map((module) => [module.id, module]) ?? []);
  }, [progress]);
  const activeModule =
    course?.modules.find((module) => module.id === progress?.progress.nextModule?.id) ??
    course?.modules.find((module) => !moduleProgressById.get(module.id)?.completed) ??
    course?.modules[0];
  const canSubmit = useMemo(() => {
    if (!activeModule) return false;
    return activeModule.questions.every((question) => answers[question.id]);
  }, [activeModule, answers]);

  async function handleSubmit() {
    if (!activeModule) return;

    const localScore = computeLocalScore(activeModule.questions, answers);
    const token = getAccessToken();

    if (token && !activeModule.id.startsWith('demo-')) {
      try {
        const backendResult = await completeModule(activeModule.id, token, {
          quizAnswers: answers,
          gameOrder: activeModule.game?.steps.map((step) => step.id),
        });
        setResult(
          `Module complété : ${backendResult.quizScore}% quiz, ${backendResult.gameScore}% mini-jeu, +${backendResult.pointsEarned} points.`
        );
        setProgress(await fetchCourseProgress(slug, token));
        setUsesProgressFallback(false);
        return;
      } catch {
        setResult(`Score local : ${localScore}%. L’enregistrement backend a échoué, mais le module reste testable.`);
        return;
      }
    }

    setResult(`Score local : ${localScore}%. Connecte-toi avec l’API disponible pour enregistrer la progression.`);
  }

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <p className="muted">Chargement du parcours...</p>
      </section>
    );
  }

  if (!course) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Parcours introuvable</h1>
        <Button href="/courses" style={{ marginTop: '1rem' }}>
          Retour aux parcours
        </Button>
      </section>
    );
  }

  const visual = getTrackVisual(course.track);
  const totalModules = progress?.progress.totalModules ?? course.modules.length;
  const completedModules = progress?.progress.completedModules ?? 0;
  const percent = progress?.progress.progressPercent ?? Math.round((completedModules / Math.max(totalModules, 1)) * 100);
  const level = inferLevelFromModules(totalModules);
  const reward = getRewardBadgeForTrack(course.track);
  const points = estimatePoints(totalModules, level);
  const duration = estimateDurationMinutes(totalModules);

  return (
    <section style={{ padding: '1rem 0 3rem' }}>
      <Link href="/courses" style={{ fontWeight: 700 }}>
        ← Tous les parcours
      </Link>

      <div
        className="card card-gradient"
        style={{
          marginTop: '1.25rem',
          background: visual.gradient,
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrackIcon track={course.track} size="lg" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.32)' }} />
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.88 }}>
                {formatTrack(course.track)}
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.15rem' }}>{course.title}</h1>
            </div>
          </div>
          {course.description && (
            <p style={{ marginTop: '0.75rem', maxWidth: 720, color: 'rgba(255,255,255,0.94)' }}>{course.description}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            <LevelPill level={level} />
            <Badge tone="neutral" icon="\u{23F1}\uFE0F" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.32)' }}>
              {formatDurationLabel(duration)}
            </Badge>
            <Badge tone="neutral" icon="\u{1F4DA}" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.32)' }}>
              {totalModules} unité{totalModules > 1 ? 's' : ''}
            </Badge>
            <Badge tone="warning" icon="\u2B50">
              {points} pts à gagner
            </Badge>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)',
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0 }}>
          {!hasToken && (
            <Card variant="soft" style={{ borderColor: '#f0cf7a', background: '#fff8e6' }}>
              <strong>Mode démo</strong>
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                Les questions fonctionnent localement. Connecte-toi pour enregistrer les scores quand le
                module vient de l’API.
              </p>
            </Card>
          )}

          {progress && (
            <Card style={{ marginTop: hasToken ? 0 : '1rem' }}>
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
                <div>
                  <p className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Progression
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{percent}%</p>
                  <p className="muted" style={{ marginTop: '0.25rem' }}>
                    {progress.progress.completedModules}/{progress.progress.totalModules} unités complétées · score moyen{' '}
                    {progress.progress.averageScore}%
                  </p>
                </div>
                {progress.progress.nextModule ? (
                  <Button href={`#module-${progress.progress.nextModule.slug}`} size="sm">
                    Reprendre
                  </Button>
                ) : (
                  <Badge tone="success" icon="\u{1F3C6}">
                    Parcours terminé
                  </Badge>
                )}
              </div>
              <ProgressBar value={percent} tone={percent >= 100 ? 'success' : 'accent'} style={{ marginTop: '0.85rem' }} />
              {usesProgressFallback && (
                <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  Progression affichée en mode démo. Connecte-toi pour la synchroniser via le backend.
                </p>
              )}
            </Card>
          )}

          <div style={{ display: 'grid', gap: '1.25rem', marginTop: '1.25rem' }}>
            {course.modules.map((module, index) => {
              const moduleProgress = moduleProgressById.get(module.id);
              const completed = moduleProgress?.completed ?? false;
              return (
                <Card
                  key={module.id}
                  id={`module-${module.slug}`}
                  as="article"
                  style={{
                    borderColor: completed ? '#a8d8b2' : 'var(--border)',
                    background: completed ? 'linear-gradient(135deg, #f4fbf6 0%, #ffffff 100%)' : 'var(--card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TrackIcon track={course.track} size="sm" />
                      <span className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Unité {index + 1}
                      </span>
                    </div>
                    {moduleProgress && (
                      <Badge tone={completed ? 'success' : 'neutral'} icon={completed ? '\u2705' : '\u23F3'}>
                        {completed ? 'Complétée' : 'À faire'}
                        {moduleProgress.score !== null ? ` · ${moduleProgress.score}%` : ''}
                      </Badge>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.5rem' }}>{module.title}</h2>
                  <p className="muted" style={{ marginTop: '0.4rem' }}>{module.summary}</p>
                  {moduleProgress?.completedAt && (
                    <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                      Terminée le {new Date(moduleProgress.completedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}

                  {module.game && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 14,
                        background: '#f8fafd',
                      }}
                    >
                      <h3 style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        <span aria-hidden style={{ marginRight: 6 }}>{'\u{1F9E9}'}</span>
                        Mini-scénario
                      </h3>
                      <p style={{ marginTop: '0.4rem' }}>{module.game.scenario}</p>
                      <ol style={{ marginTop: '0.6rem', paddingLeft: '1.25rem' }}>
                        {module.game.steps.map((step) => (
                          <li key={step.id} style={{ marginTop: '0.15rem' }}>
                            {step.label}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
                    {module.questions.map((question) => (
                      <fieldset
                        key={question.id}
                        style={{
                          border: '1px solid var(--border-soft)',
                          borderRadius: 14,
                          padding: '0.9rem 1rem',
                          background: '#ffffff',
                        }}
                      >
                        <legend style={{ fontWeight: 700, padding: '0 0.4rem' }}>{question.prompt}</legend>
                        <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.6rem' }}>
                          {question.options.map((option) => (
                            <label key={option.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={answers[question.id] === option.id}
                                onChange={() =>
                                  setAnswers((current) => ({ ...current, [question.id]: option.id }))
                                }
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                        {result && question.explanation && (
                          <p className="muted" style={{ marginTop: '0.65rem' }}>{question.explanation}</p>
                        )}
                      </fieldset>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {activeModule && (
            <Card style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <p className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Prochaine unité
                  </p>
                  <p style={{ fontWeight: 800, marginTop: '0.2rem' }}>
                    <a href={`#module-${activeModule.slug}`}>{activeModule.title}</a>
                  </p>
                </div>
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                  Valider l’unité
                </Button>
              </div>
              {result && (
                <p style={{ marginTop: '0.85rem', fontWeight: 700, color: 'var(--accent-strong)' }}>{result}</p>
              )}
            </Card>
          )}
        </div>

        <aside style={{ position: 'sticky', top: '5.5rem', display: 'grid', gap: '1rem' }}>
          <Card style={{ background: 'linear-gradient(135deg, #fff8e6 0%, #ffffff 70%)', borderColor: '#f0cf7a' }}>
            <p style={{ color: '#8a4a00', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Récompense parcours
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem' }}>
              <div
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #ffb02e 0%, #ffce5b 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.55rem',
                  color: '#4a2a00',
                  boxShadow: '0 6px 14px rgba(255, 176, 46, 0.35)',
                }}
              >
                {reward?.icon ?? '\u{1F3C5}'}
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem' }}>
                  {reward?.label ?? `Badge ${formatTrack(course.track)}`}
                </strong>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}>
                  Débloqué à la fin du parcours.
                </p>
              </div>
            </div>
            <hr className="divider" />
            <ul style={{ listStyle: 'none', display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="muted">Points totaux</span>
                <strong>{points} pts</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="muted">Niveau</span>
                <strong>{level}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="muted">Durée estimée</span>
                <strong>{formatDurationLabel(duration)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="muted">Unités</span>
                <strong>{totalModules}</strong>
              </li>
            </ul>
          </Card>

          <Card variant="soft">
            <p className="section-eyebrow">Préparer en sprint</p>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>
              Combine ce parcours à un sprint 7 ou 14 jours
            </h3>
            <p className="muted" style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Cadre ton effort, vise un badge et compare-toi à la communauté.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <Button href="/sprint" variant="primary" size="sm">
                Démarrer
              </Button>
              <Button href="/leaderboard" variant="ghost" size="sm">
                Voir le classement
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function computeLocalScore(questions: CourseDetail['modules'][number]['questions'], answers: Record<string, string>) {
  if (!questions.length) return 0;
  const correct = questions.filter((question) => question.correctOption && answers[question.id] === question.correctOption);
  return Math.round((correct.length / questions.length) * 100);
}

function buildLocalCourseProgress(course: CourseDetail): CourseProgressData {
  const completedCount = Math.round(((course.progressPercent ?? 0) / 100) * course.modules.length);
  const modules = course.modules.map((module, index) => {
    const completed = index < completedCount;
    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      sortOrder: index + 1,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      quizScore: null,
      gameScore: null,
      score: null,
    };
  });
  const nextModule = modules.find((module) => !module.completed) ?? null;

  return {
    course,
    progress: {
      totalModules: course.modules.length,
      completedModules: completedCount,
      progressPercent: course.progressPercent ?? 0,
      averageScore: 0,
      nextModule: nextModule ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title } : null,
    },
    modules,
  };
}
