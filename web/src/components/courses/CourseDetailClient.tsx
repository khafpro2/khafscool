'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CourseDetail } from '@/lib/api';
import { completeModule, fetchCourse } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export function CourseDetailClient({ slug }: { slug: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    fetchCourse(slug, token)
      .then(setCourse)
      .finally(() => setIsLoading(false));
  }, [slug]);

  const firstModule = course?.modules[0];
  const canSubmit = useMemo(() => {
    if (!firstModule) return false;
    return firstModule.questions.every((question) => answers[question.id]);
  }, [answers, firstModule]);

  async function handleSubmit() {
    if (!firstModule) return;

    const localScore = computeLocalScore(firstModule.questions, answers);
    const token = getAccessToken();

    if (token && !firstModule.id.startsWith('demo-')) {
      try {
        const backendResult = await completeModule(firstModule.id, token, {
          quizAnswers: answers,
          gameOrder: firstModule.game?.steps.map((step) => step.id),
        });
        setResult(
          `Module complété : ${backendResult.quizScore}% quiz, ${backendResult.gameScore}% mini-jeu, +${backendResult.pointsEarned} points.`
        );
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
      <p style={{ color: 'var(--muted)', fontWeight: 700, marginTop: '1.5rem' }}>{course.track}</p>
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

      <div style={{ display: 'grid', gap: '1.25rem', marginTop: '2rem' }}>
        {course.modules.map((module, index) => (
          <article className="card" key={module.id}>
            <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Module {index + 1}</p>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.25rem' }}>{module.title}</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{module.summary}</p>

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
        ))}
      </div>

      {firstModule && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <button className="btn" type="button" disabled={!canSubmit} onClick={handleSubmit}>
            Valider le premier module
          </button>
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
