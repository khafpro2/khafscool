'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CourseDetail, CourseProgressData } from '@/lib/api';
import { completeModule, fetchCourse, fetchCourseProgress } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';

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
        <p style={{ color: 'var(--muted)' }}>Chargement du parcours...</p>
      </section>
    );
  }

  if (!course) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Parcours introuvable</h1>
        <Link className="btn" href="/courses" style={{ marginTop: '1rem' }}>
          Retour aux parcours
        </Link>
      </section>
    );
  }

  return (
    <section style={{ padding: '2rem 0' }}>
      <Link href="/courses" style={{ fontWeight: 600 }}>
        ← Tous les parcours
      </Link>
      <p style={{ color: 'var(--muted)', fontWeight: 700, marginTop: '1.5rem' }}>{formatTrack(course.track)}</p>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{course.title}</h1>
      {course.description && (
        <p style={{ color: 'var(--muted)', marginTop: '0.75rem', maxWidth: 760 }}>{course.description}</p>
      )}

      {!hasToken && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <strong>Mode démo</strong>
          <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
            Les questions fonctionnent localement. Connecte-toi pour tenter l’enregistrement backend quand le module
            vient de l’API.
          </p>
        </div>
      )}

      {progress && (
        <div
          className="card"
          style={{
            marginTop: '1.5rem',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'minmax(220px, 1fr) minmax(220px, 1.4fr)',
          }}
        >
          <div>
            <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Progression</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {progress.progress.progressPercent}%
            </p>
            <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
              {progress.progress.completedModules}/{progress.progress.totalModules} modules complétés · score moyen{' '}
              {progress.progress.averageScore}%
            </p>
          </div>
          <div>
            <div style={{ height: 10, background: '#e5e5ea', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress.progress.progressPercent}%`,
                  background: 'var(--accent)',
                }}
              />
            </div>
            {progress.progress.nextModule ? (
              <p style={{ marginTop: '0.75rem' }}>
                Prochain module :{' '}
                <a href={`#module-${progress.progress.nextModule.slug}`} style={{ fontWeight: 700 }}>
                  {progress.progress.nextModule.title}
                </a>
              </p>
            ) : (
              <p style={{ marginTop: '0.75rem', fontWeight: 700 }}>Parcours terminé.</p>
            )}
            {usesProgressFallback && (
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Progression affichée en mode démo car les données protégées ne sont pas disponibles.
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.25rem', marginTop: '2rem' }}>
        {course.modules.map((module, index) => {
          const moduleProgress = moduleProgressById.get(module.id);
          return (
          <article className="card" id={`module-${module.slug}`} key={module.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Module {index + 1}</p>
              {moduleProgress && (
                <span
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    padding: '0.2rem 0.6rem',
                    color: moduleProgress.completed ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {moduleProgress.completed ? 'Complété' : 'À faire'}
                  {moduleProgress.score !== null ? ` · ${moduleProgress.score}%` : ''}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.25rem' }}>{module.title}</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{module.summary}</p>
            {moduleProgress?.completedAt && (
              <p style={{ color: 'var(--muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                Terminé le {new Date(moduleProgress.completedAt).toLocaleDateString('fr-FR')}
              </p>
            )}

            {module.game && (
              <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 12 }}>
                <h3 style={{ fontWeight: 700 }}>Mini-scénario</h3>
                <p style={{ marginTop: '0.5rem' }}>{module.game.scenario}</p>
                <ol style={{ marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
                  {module.game.steps.map((step) => (
                    <li key={step.id}>{step.label}</li>
                  ))}
                </ol>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              {module.questions.map((question) => (
                <fieldset
                  key={question.id}
                  style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}
                >
                  <legend style={{ fontWeight: 700, padding: '0 0.25rem' }}>{question.prompt}</legend>
                  <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {question.options.map((option) => (
                      <label key={option.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {result && question.explanation && (
                    <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>{question.explanation}</p>
                  )}
                </fieldset>
              ))}
            </div>
          </article>
          );
        })}
      </div>

      {activeModule && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <button className="btn" type="button" disabled={!canSubmit} onClick={handleSubmit}>
            Valider le prochain module
          </button>
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
            Module ciblé : <a href={`#module-${activeModule.slug}`}>{activeModule.title}</a>
          </p>
          {result && <p style={{ marginTop: '1rem', fontWeight: 700 }}>{result}</p>}
        </div>
      )}
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
