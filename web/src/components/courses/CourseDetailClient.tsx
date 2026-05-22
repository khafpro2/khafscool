'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CourseDetail, CourseProgressData, CourseProgressModule } from '@/lib/api';
import { checkModuleAnswer, completeModule, fetchCourse, fetchCourseProgress } from '@/lib/api';
import { AuthRequestError, resolveApiErrorMessage } from '@/lib/auth-errors';
import { buildAuthUrl, getAccessToken } from '@/lib/auth';
import { KeyboardShortcutsHelp } from '@/components/courses/KeyboardShortcutsHelp';
import { formatTrack } from '@/lib/tracks';
import {
  InteractiveMiniGame,
  shuffleGameOrder,
} from '@/components/courses/InteractiveMiniGame';
import {
  computeQuizScorePercent,
  countCorrectAnswers,
  QUIZ_PASS_PERCENT,
  QuizPanel,
  type QuestionCheckResult,
} from '@/components/courses/QuizPanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LevelPill } from '@/components/ui/LevelPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CourseDetailPageSkeleton } from '@/components/ui/Skeleton';
import { TrackIcon } from '@/components/ui/TrackIcon';
import {
  estimateDurationMinutes,
  estimatePoints,
  formatDurationLabel,
  getBadgeVisual,
  getRewardBadgeForTrack,
  getTrackVisual,
  inferLevelFromModules,
} from '@/lib/design';
import { toastBadgeUnlocked, toastModuleCompleted } from '@/lib/gamification-toasts';
import { scoreGameOrder } from '@/lib/points';

export function CourseDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [usesProgressFallback, setUsesProgressFallback] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionResults, setQuestionResults] = useState<Record<string, QuestionCheckResult>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(() => new Set());
  const [result, setResult] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<SuccessNotice | null>(null);
  const [gameOrders, setGameOrders] = useState<Record<string, number[]>>({});
  const [gameTouched, setGameTouched] = useState<Record<string, boolean>>({});
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hashHighlightSlug, setHashHighlightSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!course) return;
    setGameOrders((current) => {
      let changed = false;
      const next = { ...current };
      for (const module of course.modules) {
        if (module.game?.steps.length && !next[module.id]) {
          next[module.id] = shuffleGameOrder(module.game.steps.map((step) => step.id));
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [course]);

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

  useEffect(() => {
    if (isLoading || !course) return;

    let highlightTimer: number | undefined;

    function focusModuleFromHash() {
      const hash = window.location.hash;
      if (!hash.startsWith('#module-')) return;

      const moduleSlug = decodeURIComponent(hash.slice('#module-'.length));
      const target = document.getElementById(`module-${moduleSlug}`);
      if (!target) return;

      setHashHighlightSlug(moduleSlug);
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      if (highlightTimer) window.clearTimeout(highlightTimer);
      highlightTimer = window.setTimeout(() => setHashHighlightSlug(null), 4_000);
    }

    focusModuleFromHash();
    window.addEventListener('hashchange', focusModuleFromHash);
    return () => {
      window.removeEventListener('hashchange', focusModuleFromHash);
      if (highlightTimer) window.clearTimeout(highlightTimer);
    };
  }, [course, isLoading]);

  const moduleProgressById = useMemo(() => {
    return new Map(progress?.modules.map((module) => [module.id, module]) ?? []);
  }, [progress]);
  const activeModule =
    course?.modules.find((module) => module.id === progress?.progress.nextModule?.id) ??
    course?.modules.find((module) => !moduleProgressById.get(module.id)?.completed) ??
    course?.modules[0];
  const activeQuestionIds = useMemo(
    () => new Set(activeModule?.questions.map((question) => question.id) ?? []),
    [activeModule]
  );
  const activeRevealedQuestions = useMemo(
    () => new Set([...revealedQuestions].filter((id) => activeQuestionIds.has(id))),
    [activeQuestionIds, revealedQuestions]
  );
  const activeQuestionResults = useMemo(() => {
    const next: Record<string, QuestionCheckResult> = {};
    for (const questionId of activeQuestionIds) {
      if (questionResults[questionId]) next[questionId] = questionResults[questionId];
    }
    return next;
  }, [activeQuestionIds, questionResults]);
  const answeredActiveCount = useMemo(
    () => activeModule?.questions.filter((question) => answers[question.id]).length ?? 0,
    [activeModule, answers]
  );
  const activeGameOrder = activeModule ? gameOrders[activeModule.id] : undefined;
  const activeGameReady = Boolean(!activeModule?.game || gameTouched[activeModule.id]);

  const canSubmit = useMemo(() => {
    if (!activeModule) return false;
    const quizComplete = activeModule.questions.every((question) => answers[question.id]);
    const gameComplete = !activeModule.game || Boolean(gameTouched[activeModule.id]);
    return quizComplete && gameComplete;
  }, [activeModule, answers, gameTouched]);
  const estimatedActiveScore = useMemo(
    () =>
      activeModule
        ? computeQuizScorePercent(activeModule.questions.length, activeQuestionResults)
        : 0,
    [activeModule, activeQuestionResults]
  );
  const estimatedActiveGameScore = useMemo(() => {
    if (!activeModule?.game?.correctOrder?.length || !activeGameOrder?.length) return 0;
    if (!gameTouched[activeModule.id]) return 0;
    return scoreGameOrder(activeGameOrder, activeModule.game.correctOrder);
  }, [activeGameOrder, activeModule, gameTouched]);

  const resetActiveQuizState = useCallback(() => {
    setAnswers((current) => {
      const next = { ...current };
      for (const questionId of activeQuestionIds) {
        delete next[questionId];
      }
      return next;
    });
    setRevealedQuestions((current) => {
      const next = new Set(current);
      for (const questionId of activeQuestionIds) {
        next.delete(questionId);
      }
      return next;
    });
    setQuestionResults((current) => {
      const next = { ...current };
      for (const questionId of activeQuestionIds) {
        delete next[questionId];
      }
      return next;
    });
  }, [activeQuestionIds]);

  function handleSelectAnswer(questionId: string, optionId: string) {
    if (revealedQuestions.has(questionId)) return;
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setResult(null);
  }

  async function resolveCheckAnswer(questionId: string, selectedOption: string): Promise<QuestionCheckResult> {
    const token = getAccessToken();

    if (token && activeModule && !activeModule.id.startsWith('demo-')) {
      return checkModuleAnswer(activeModule.id, token, { questionId, selectedOption });
    }

    const question = activeModule?.questions.find((item) => item.id === questionId);
    const correct = Boolean(question?.correctOption && question.correctOption === selectedOption);
    return {
      correct,
      explanation: question?.explanation,
    };
  }

  async function handleCheckAnswer(questionId: string, selectedOption: string): Promise<QuestionCheckResult> {
    const result = await resolveCheckAnswer(questionId, selectedOption);
    setQuestionResults((current) => ({ ...current, [questionId]: result }));
    setRevealedQuestions((current) => new Set(current).add(questionId));
    return result;
  }

  async function revealAllActiveQuestions(): Promise<Record<string, QuestionCheckResult>> {
    if (!activeModule) return {};

    const results = { ...activeQuestionResults };
    for (const question of activeModule.questions) {
      const selectedOption = answers[question.id];
      if (!selectedOption || results[question.id]) continue;
      const result = await resolveCheckAnswer(question.id, selectedOption);
      results[question.id] = result;
      setQuestionResults((current) => ({ ...current, [question.id]: result }));
      setRevealedQuestions((current) => new Set(current).add(question.id));
    }

    return results;
  }

  async function handleRevealAllQuestions() {
    await revealAllActiveQuestions();
  }

  async function handleSubmit() {
    if (!activeModule) return;

    const checkedResults = await revealAllActiveQuestions();
    const localScore = computeQuizScorePercent(activeModule.questions.length, checkedResults);
    const correctCount = countCorrectAnswers(checkedResults);
    const token = getAccessToken();
    setSuccessNotice(null);

    if (token && !activeModule.id.startsWith('demo-')) {
      try {
        const payload: { quizAnswers: Record<string, string>; gameOrder?: number[] } = {
          quizAnswers: answers,
        };
        if (activeModule.game && gameTouched[activeModule.id] && activeGameOrder?.length) {
          payload.gameOrder = activeGameOrder;
        }

        const backendResult = await completeModule(activeModule.id, token, payload);
        const updatedProgress = await fetchCourseProgress(slug, token);
        const courseJustCompleted =
          backendResult.courseCompleted ||
          updatedProgress.progress.progressPercent >= 100 ||
          !updatedProgress.progress.nextModule;

        if (courseJustCompleted) {
          const completion = backendResult.courseCompletion ?? {
            slug,
            title: course?.title ?? updatedProgress.course.title,
            pointsEarned: sumModuleProgressPoints(updatedProgress.modules),
            badgeEarned: backendResult.badges?.find((badge) =>
              ['apple-mdm-foundation', 'jamf-engineer', 'intune-professional'].includes(badge)
            ),
          };
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`course-completion:${slug}`, JSON.stringify(completion));
          }
          router.push(`/courses/${slug}/complete`);
          return;
        }

        setSuccessNotice({
          badges: backendResult.badges ?? [],
          gameScore: backendResult.gameScore,
          moduleTitle: activeModule.title,
          pointsEarned: backendResult.pointsEarned,
          quizScore: backendResult.quizScore,
        });
        toastModuleCompleted(
          activeModule.title,
          backendResult.pointsEarned,
          backendResult.quizScore,
          backendResult.gameScore
        );
        for (const badgeSlug of backendResult.badges ?? []) {
          toastBadgeUnlocked(badgeSlug);
        }
        setResult(null);
        resetActiveQuizState();
        setProgress(updatedProgress);
        setUsesProgressFallback(false);
        return;
      } catch (error) {
        if (error instanceof AuthRequestError) {
          setResult(resolveApiErrorMessage(error, 'module'));
          return;
        }
        setResult(
          `Score local : ${correctCount}/${activeModule.questions.length} (${localScore}%). L’enregistrement backend a échoué, mais l’unité reste testable.`
        );
        return;
      }
    }

    setResult(
      `Score local : ${correctCount}/${activeModule.questions.length} (${localScore}%). Connectez-vous pour enregistrer la progression via l’API.`
    );
  }

  if (isLoading) {
    return <CourseDetailPageSkeleton />;
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
      <Breadcrumbs
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Parcours', href: '/courses' },
          { label: course.title },
        ]}
      />

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
            <Badge tone="neutral" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.32)' }}>
              {formatDurationLabel(duration)}
            </Badge>
            <Badge tone="neutral" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.32)' }}>
              {totalModules} unité{totalModules > 1 ? 's' : ''}
            </Badge>
            <Badge tone="warning">
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
            <Card variant="soft" className="notice-demo">
              <strong>Mode démo</strong>
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                Les questions fonctionnent localement. Connectez-vous pour enregistrer les scores quand le
                contenu provient de l’API.
              </p>
              <Button href={buildAuthUrl(`/courses/${slug}`)} size="sm" style={{ marginTop: '0.85rem' }}>
                Se connecter pour enregistrer
              </Button>
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
                  Progression affichée en mode démo. Connectez-vous pour la synchroniser via le backend.
                </p>
              )}
              <ModuleStatusStrip
                course={course}
                moduleProgressById={moduleProgressById}
                nextModuleId={progress.progress.nextModule?.id}
              />
            </Card>
          )}

          {successNotice && (
            <Card className="notice-success" style={{ marginTop: '1rem' }}>
              <Badge tone="success" icon="\u{1F389}">
                Unité terminée
              </Badge>
              <p style={{ fontWeight: 800, marginTop: '0.5rem', fontSize: '1.05rem' }}>
                Bravo ! « {successNotice.moduleTitle} » est complétée.
              </p>
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                Quiz {successNotice.quizScore}% · mini-scénario {successNotice.gameScore}% ·{' '}
                <strong>+{successNotice.pointsEarned} points</strong>
              </p>
              {successNotice.badges.length > 0 ? (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  {successNotice.badges.map((badgeSlug) => {
                    const visual = getBadgeVisual(badgeSlug);
                    return (
                      <Badge key={badgeSlug} tone="warning" brand={visual.brand}>
                        Super-badge : {visual.label}
                      </Badge>
                    );
                  })}
                  <Button href="/badges" size="sm" variant="ghost">
                    Voir mes badges
                  </Button>
                </div>
              ) : (
                <Button href="/badges" size="sm" style={{ marginTop: '0.75rem' }}>
                  Voir la collection de badges
                </Button>
              )}
            </Card>
          )}

          <div style={{ display: 'grid', gap: '1.25rem', marginTop: '1.25rem' }}>
            {course.modules.map((module, index) => {
              const moduleProgress = moduleProgressById.get(module.id);
              const completed = moduleProgress?.completed ?? false;
              const moduleStatus = getModuleStatus(module.id, moduleProgress, progress?.progress.nextModule?.id);
              const isActiveModule = activeModule?.id === module.id;
              const isLockedModule = moduleStatus === 'todo';
              return (
                <Card
                  key={module.id}
                  id={`module-${module.slug}`}
                  as="article"
                  className={[
                    completed ? 'card-completed' : undefined,
                    hashHighlightSlug === module.slug ? 'course-module-hash-highlight' : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    borderColor: completed ? undefined : 'var(--border)',
                    background: completed ? undefined : 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TrackIcon track={course.track} size="sm" />
                      <span className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Unité {index + 1}
                      </span>
                    </div>
                    <Badge
                      tone={moduleStatus === 'completed' ? 'success' : moduleStatus === 'in_progress' ? 'warning' : 'neutral'}
                      icon={moduleStatusIcon(moduleStatus)}
                    >
                      {moduleStatusLabel(moduleStatus)}
                      {moduleProgress?.score !== null && moduleProgress?.score !== undefined
                        ? ` · ${moduleProgress.score}%`
                        : ''}
                    </Badge>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.5rem' }}>{module.title}</h2>
                  <p className="muted" style={{ marginTop: '0.4rem' }}>{module.summary}</p>
                  {moduleProgress?.completedAt && (
                    <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                      Terminée le {new Date(moduleProgress.completedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}

                  {isLockedModule ? (
                    <Card variant="soft" style={{ marginTop: '1rem' }}>
                      <p className="muted" style={{ fontSize: '0.9rem' }}>
                        Termine l'unité précédente pour débloquer le quiz ({module.questions.length} question
                        {module.questions.length > 1 ? 's' : ''}).
                      </p>
                    </Card>
                  ) : isActiveModule ? (
                    <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <KeyboardShortcutsHelp
                        hasQuiz={module.questions.length > 0}
                        hasMinigame={Boolean(module.game?.steps.length)}
                      />
                    </div>
                    {module.game && gameOrders[module.id] && (
                      <InteractiveMiniGame
                        game={module.game}
                        track={course.track}
                        order={gameOrders[module.id]}
                        onOrderChange={(order) =>
                          setGameOrders((current) => ({ ...current, [module.id]: order }))
                        }
                        onTouched={() =>
                          setGameTouched((current) => ({ ...current, [module.id]: true }))
                        }
                      />
                    )}
                    <QuizPanel
                      module={module}
                      track={course.track}
                      answers={answers}
                      questionResults={activeQuestionResults}
                      revealedQuestions={activeRevealedQuestions}
                      reviewMode={false}
                      onSelectAnswer={handleSelectAnswer}
                      onCheckAnswer={handleCheckAnswer}
                      onRevealAll={handleRevealAllQuestions}
                      estimatedGameScore={estimatedActiveGameScore}
                      onFinishQuiz={() => {
                        document
                          .getElementById('course-unit-submit')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    />
                    </>
                  ) : completed ? (
                    <Card variant="soft" style={{ marginTop: '1rem' }}>
                      <Badge tone="success" icon="\u2705">
                        Quiz terminé
                      </Badge>
                      <p className="muted" style={{ marginTop: '0.45rem', fontSize: '0.9rem' }}>
                        {module.questions.length} question{module.questions.length > 1 ? 's' : ''} complétée
                        {module.questions.length > 1 ? 's' : ''}
                        {moduleProgress?.quizScore !== null && moduleProgress?.quizScore !== undefined
                          ? ` · score ${moduleProgress.quizScore}%`
                          : ''}
                      </p>
                    </Card>
                  ) : null}
                </Card>
              );
            })}
          </div>

          {activeModule && (
            <Card id="course-unit-submit" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <p className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Prochaine unité
                  </p>
                  <p style={{ fontWeight: 800, marginTop: '0.2rem' }}>
                    <a href={`#module-${activeModule.slug}`}>{activeModule.title}</a>
                  </p>
                  <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
                    Quiz : {answeredActiveCount}/{activeModule.questions.length} réponses
                    {answeredActiveCount > 0 ? ` · score estimé ${estimatedActiveScore}%` : ''}
                    {activeModule.questions.length > 0 && (
                      <>
                        {' '}
                        · objectif {Math.ceil((QUIZ_PASS_PERCENT / 100) * activeModule.questions.length)}/
                        {activeModule.questions.length}
                      </>
                    )}
                  </p>
                </div>
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                  Valider l’unité
                </Button>
              </div>
              {!canSubmit && activeModule.questions.length > 0 && (
                <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.85rem' }}>
                  {!activeModule.questions.every((question) => answers[question.id])
                    ? 'Réponds à toutes les questions du quiz pour activer la validation.'
                    : activeModule.game && !activeGameReady
                      ? 'Réordonne le mini-scénario (glisser ou flèches) puis clique « Vérifier mon ordre ».'
                      : 'Complète le quiz et le mini-scénario pour valider l’unité.'}
                </p>
              )}
              {result && (
                <p style={{ marginTop: '0.85rem', fontWeight: 700, color: 'var(--accent-strong)' }}>{result}</p>
              )}
            </Card>
          )}
        </div>

        <aside style={{ position: 'sticky', top: '5.5rem', display: 'grid', gap: '1rem' }}>
          <Card className="notice-demo">
            <p style={{ color: '#92400e', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Récompense parcours
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem' }}>
              <div
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gradient-accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.55rem',
                  color: '#fff',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {reward?.brand ? (
                  <BrandIcon brand={reward.brand} size="lg" />
                ) : (
                  '\u{1F3C5}'
                )}
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

type ModuleStatus = 'completed' | 'in_progress' | 'todo';

type SuccessNotice = {
  badges: string[];
  gameScore: number;
  moduleTitle: string;
  pointsEarned: number;
  quizScore: number;
};

function getModuleStatus(
  moduleId: string,
  moduleProgress: CourseProgressModule | undefined,
  nextModuleId?: string | null
): ModuleStatus {
  if (moduleProgress?.completed) return 'completed';
  if (moduleId === nextModuleId) return 'in_progress';
  return 'todo';
}

function moduleStatusLabel(status: ModuleStatus) {
  if (status === 'completed') return 'Terminé';
  if (status === 'in_progress') return 'En cours';
  return 'Verrouillé';
}

function moduleStatusIcon(status: ModuleStatus) {
  if (status === 'completed') return '\u2705';
  if (status === 'in_progress') return '\u{1F3AF}';
  return '\u{1F512}';
}

function ModuleStatusStrip({
  course,
  moduleProgressById,
  nextModuleId,
}: {
  course: CourseDetail;
  moduleProgressById: Map<string, CourseProgressModule>;
  nextModuleId?: string | null;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.5rem',
        marginTop: '1rem',
        gridTemplateColumns: `repeat(${Math.min(course.modules.length, 3)}, minmax(0, 1fr))`,
      }}
    >
      {course.modules.map((module, index) => {
        const moduleProgress = moduleProgressById.get(module.id);
        const status = getModuleStatus(module.id, moduleProgress, nextModuleId);
        return (
          <div
            key={module.id}
            style={{
              border: `1px solid ${status === 'completed' ? '#6ee7b7' : status === 'in_progress' ? '#fcd34d' : 'var(--border-soft)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.75rem',
              background:
                status === 'completed'
                  ? 'var(--success-soft)'
                  : status === 'in_progress'
                    ? 'var(--warning-soft)'
                    : 'var(--bg)',
            }}
          >
            <p className="muted" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Unité {index + 1}
            </p>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '0.15rem' }}>{module.title}</p>
            <Badge
              tone={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'neutral'}
              icon={moduleStatusIcon(status)}
              style={{ marginTop: '0.35rem' }}
            >
              {moduleStatusLabel(status)}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

function sumModuleProgressPoints(
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
