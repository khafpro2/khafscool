'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CourseDetail, CourseProgressData, CourseProgressModule } from '@/lib/api';
import { checkModuleAnswer, completeModule, fetchCourse, fetchCourseProgress } from '@/lib/api';
import { AuthRequestError, resolveApiErrorMessage } from '@/lib/auth-errors';
import { buildAuthUrl, getAccessToken } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { KeyboardShortcutsHelp } from '@/components/courses/KeyboardShortcutsHelp';
import { LessonContent, ModuleObjectives } from '@/components/courses/LessonContent';
const ModuleVideoSection = dynamic(
  () => import('@/components/courses/ModuleVideoSection').then((m) => ({ default: m.ModuleVideoSection })),
  { ssr: false }
);
import { formatTrack } from '@/lib/tracks';
import { formatDateParis } from '@ama/shared/locale';
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
  estimatePoints,
  formatDurationLabel,
  getBadgeVisual,
  getRewardBadgeForTrack,
  getTrackVisual,
  inferLevelFromModules,
} from '@/lib/design';
import { toastBadgeUnlocked, toastModuleCompleted } from '@/lib/gamification-toasts';
import {
  applyLocalCompletionsToProgress,
  clearLocalModuleCompletion,
  hasLocalCourseProgress,
  markLocalModuleComplete,
} from '@/lib/local-course-progress';
import { modulePointsFromScores, scoreGameOrder } from '@/lib/points';
import {
  countLessonWords,
  formatCourseHeroBanner,
  formatReadingTimeLabel,
  sumLessonReadingMinutes,
} from '@ama/shared/reading-time';
import { QUESTIONS_PER_MODULE } from '@ama/shared/constants';
import { countCourseVideoModules } from '@ama/shared/course-content';
import { moduleHasVideo } from '@ama/shared/video-embed';
import { isVideoWatched, VIDEO_WATCHED_EVENT } from '@/lib/video-watched';

export function CourseDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [usesProgressFallback, setUsesProgressFallback] = useState(false);
  const [usesLocalProgressPending, setUsesLocalProgressPending] = useState(false);
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
  const [viewModuleId, setViewModuleId] = useState<string | null>(null);

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
    setUsesLocalProgressPending(false);
    fetchCourse(slug, token)
      .then(async (loadedCourse) => {
        setCourse(loadedCourse);
        try {
          const loadedProgress = await fetchCourseProgress(slug, token);
          const mergedProgress = hasLocalCourseProgress(slug)
            ? applyLocalCompletionsToProgress(slug, loadedCourse, loadedProgress)
            : loadedProgress;
          setProgress(mergedProgress);
          setUsesProgressFallback(!token || loadedProgress.course.id.startsWith('demo-'));
          setUsesLocalProgressPending(hasLocalCourseProgress(slug));
        } catch {
          const localBase = buildLocalCourseProgress(loadedCourse);
          setProgress(
            hasLocalCourseProgress(slug)
              ? applyLocalCompletionsToProgress(slug, loadedCourse, localBase)
              : localBase
          );
          setUsesProgressFallback(true);
          setUsesLocalProgressPending(hasLocalCourseProgress(slug));
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const moduleProgressById = useMemo(() => {
    return new Map(progress?.modules.map((module) => [module.id, module]) ?? []);
  }, [progress]);

  const inProgressModule =
    course?.modules.find((module) => module.id === progress?.progress.nextModule?.id) ??
    course?.modules.find((module) => !moduleProgressById.get(module.id)?.completed) ??
    course?.modules[0];

  const displayModule =
    course?.modules.find((module) => module.id === viewModuleId) ?? inProgressModule;

  const displayModuleStatus = displayModule
    ? getModuleStatus(
        displayModule.id,
        moduleProgressById.get(displayModule.id),
        progress?.progress.nextModule?.id
      )
    : 'todo';
  const isReviewMode = displayModuleStatus === 'completed';

  useEffect(() => {
    if (!course || !progress) return;

    const hash = window.location.hash;
    if (hash.startsWith('#module-')) {
      const moduleSlug = decodeURIComponent(hash.slice('#module-'.length));
      const targetModule = course.modules.find((module) => module.slug === moduleSlug);
      if (targetModule) {
        const status = getModuleStatus(
          targetModule.id,
          moduleProgressById.get(targetModule.id),
          progress.progress.nextModule?.id
        );
        if (status !== 'todo') {
          setViewModuleId(targetModule.id);
          return;
        }
      }
    }

    setViewModuleId(
      progress.progress.nextModule?.id ??
        course.modules.find((module) => !moduleProgressById.get(module.id)?.completed)?.id ??
        course.modules[0]?.id ??
        null
    );
  }, [course, progress, moduleProgressById]);

  useEffect(() => {
    if (isLoading || !course || !viewModuleId) return;

    let highlightTimer: number | undefined;

    function focusModuleFromHash() {
      const hash = window.location.hash;
      if (!hash.startsWith('#module-')) return;

      const moduleSlug = decodeURIComponent(hash.slice('#module-'.length));
      const targetModule = course?.modules.find((module) => module.slug === moduleSlug);
      if (!targetModule) return;

      const status = getModuleStatus(
        targetModule.id,
        moduleProgressById.get(targetModule.id),
        progress?.progress.nextModule?.id
      );
      if (status === 'todo') return;

      setViewModuleId(targetModule.id);
      setHashHighlightSlug(moduleSlug);

      requestAnimationFrame(() => {
        document.getElementById('course-active-module')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  }, [course, isLoading, moduleProgressById, progress, viewModuleId]);

  const activeQuestionIds = useMemo(
    () => new Set(displayModule?.questions.map((question) => question.id) ?? []),
    [displayModule]
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
    () => displayModule?.questions.filter((question) => answers[question.id]).length ?? 0,
    [displayModule, answers]
  );
  const activeGameOrder = displayModule ? gameOrders[displayModule.id] : undefined;
  const activeGameReady = Boolean(!displayModule?.game || gameTouched[displayModule.id]);

  const canSubmit = useMemo(() => {
    if (!displayModule || isReviewMode) return false;
    const quizComplete = displayModule.questions.every((question) => answers[question.id]);
    const gameComplete = !displayModule.game || Boolean(gameTouched[displayModule.id]);
    return quizComplete && gameComplete;
  }, [displayModule, answers, gameTouched, isReviewMode]);
  const canSubmitReview = useMemo(() => {
    if (!displayModule || !isReviewMode) return false;
    return displayModule.questions.every(
      (question) => answers[question.id] && revealedQuestions.has(question.id)
    );
  }, [displayModule, answers, revealedQuestions, isReviewMode]);
  const estimatedActiveScore = useMemo(
    () =>
      displayModule
        ? computeQuizScorePercent(displayModule.questions.length, activeQuestionResults)
        : 0,
    [displayModule, activeQuestionResults]
  );
  const estimatedActiveGameScore = useMemo(() => {
    if (!displayModule?.game?.correctOrder?.length || !activeGameOrder?.length) return 0;
    if (!gameTouched[displayModule.id]) return 0;
    return scoreGameOrder(activeGameOrder, displayModule.game.correctOrder);
  }, [activeGameOrder, displayModule, gameTouched]);

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

    if (token && displayModule && !displayModule.id.startsWith('demo-')) {
      return checkModuleAnswer(displayModule.id, token, { questionId, selectedOption });
    }

    const question = displayModule?.questions.find((item) => item.id === questionId);
    const correct = Boolean(question?.correctOption && question.correctOption === selectedOption);
    return {
      correct,
      explanation: question?.explanation,
      ...(!correct && question?.correctOption ? { correctOptionId: question.correctOption } : {}),
    };
  }

  async function handleCheckAnswer(questionId: string, selectedOption: string): Promise<QuestionCheckResult> {
    const result = await resolveCheckAnswer(questionId, selectedOption);
    setQuestionResults((current) => ({ ...current, [questionId]: result }));
    setRevealedQuestions((current) => new Set(current).add(questionId));
    return result;
  }

  async function revealAllActiveQuestions(): Promise<Record<string, QuestionCheckResult>> {
    if (!displayModule) return {};

    const results = { ...activeQuestionResults };
    for (const question of displayModule.questions) {
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

  function completeModuleLocally(localScore: number, gameScore: number) {
    if (!course || !displayModule || localScore < QUIZ_PASS_PERCENT) return false;

    markLocalModuleComplete(slug, displayModule.id, { quizScore: localScore, gameScore });
    const base = progress ?? buildLocalCourseProgress(course);
    const updatedProgress = applyLocalCompletionsToProgress(slug, course, base);
    setProgress(updatedProgress);
    setUsesLocalProgressPending(true);
    if (!hasToken) {
      setUsesProgressFallback(true);
    }

    const pointsEarned = modulePointsFromScores(localScore, gameScore);
    const courseJustCompleted = updatedProgress.progress.progressPercent >= 100;

    if (courseJustCompleted) {
      const reward = getRewardBadgeForTrack(course.track);
      const completion = {
        slug,
        title: course.title,
        pointsEarned: sumModuleProgressPoints(updatedProgress.modules),
        ...(reward ? { badgeEarned: reward.badgeSlug } : {}),
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`course-completion:${slug}`, JSON.stringify(completion));
      }
      router.push(`/courses/${slug}/complete`);
      return true;
    }

    setSuccessNotice({
      badges: [],
      gameScore,
      moduleTitle: displayModule.title,
      pointsEarned,
      quizScore: localScore,
      nextModule: updatedProgress.progress.nextModule,
    });
    toastModuleCompleted(displayModule.title, pointsEarned, localScore, gameScore);
    setResult(null);
    resetActiveQuizState();
    if (updatedProgress.progress.nextModule) {
      navigateToModule(
        updatedProgress.progress.nextModule.id,
        updatedProgress.progress.nextModule.slug
      );
    }
    return true;
  }

  function navigateToModule(moduleId: string, moduleSlug: string) {
    if (moduleId !== viewModuleId) {
      resetActiveQuizState();
      setResult(null);
    }
    setViewModuleId(moduleId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#module-${moduleSlug}`);
    }
    requestAnimationFrame(() => {
      document.getElementById('course-active-module')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function handleSubmit() {
    if (!displayModule || isReviewMode) return;

    const checkedResults = await revealAllActiveQuestions();
    const localScore = computeQuizScorePercent(displayModule.questions.length, checkedResults);
    const correctCount = countCorrectAnswers(checkedResults);
    const token = getAccessToken();
    setSuccessNotice(null);

    if (token && !displayModule.id.startsWith('demo-')) {
      try {
        const payload: { quizAnswers: Record<string, string>; gameOrder?: number[] } = {
          quizAnswers: answers,
        };
        if (displayModule.game && gameTouched[displayModule.id] && activeGameOrder?.length) {
          payload.gameOrder = activeGameOrder;
        }

        const backendResult = await completeModule(displayModule.id, token, payload);
        clearLocalModuleCompletion(slug, displayModule.id);
        setUsesLocalProgressPending(hasLocalCourseProgress(slug));
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
          moduleTitle: displayModule.title,
          pointsEarned: backendResult.pointsEarned,
          quizScore: backendResult.quizScore,
          nextModule: updatedProgress.progress.nextModule,
        });
        toastModuleCompleted(
          displayModule.title,
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
        if (updatedProgress.progress.nextModule) {
          navigateToModule(
            updatedProgress.progress.nextModule.id,
            updatedProgress.progress.nextModule.slug
          );
        }
        return;
      } catch (error) {
        if (error instanceof AuthRequestError) {
          setResult(resolveApiErrorMessage(error, 'module'));
          return;
        }
        if (completeModuleLocally(localScore, estimatedActiveGameScore)) {
          setResult(
            'Progression enregistrée sur cet appareil. Reconnecte-toi plus tard pour synchroniser avec le serveur.'
          );
          return;
        }
        setResult(
          `Score local : ${correctCount}/${displayModule.questions.length} (${localScore}%). L’enregistrement a échoué — il faut au moins ${QUIZ_PASS_PERCENT} % pour valider l’unité hors ligne.`
        );
        return;
      }
    }

    if (completeModuleLocally(localScore, estimatedActiveGameScore)) {
      if (!hasToken) {
        setResult(
          'Unité validée en mode local. Connecte-toi pour synchroniser ta progression sur tous tes appareils.'
        );
      }
      return;
    }

    setResult(
      `Score local : ${correctCount}/${displayModule.questions.length} (${localScore}%). Connecte-toi et atteins ${QUIZ_PASS_PERCENT} % pour valider l’unité.`
    );
  }

  async function handleReviewSubmit() {
    if (!displayModule || !isReviewMode) return;

    const checkedResults = await revealAllActiveQuestions();
    const localScore = computeQuizScorePercent(displayModule.questions.length, checkedResults);
    const correctCount = countCorrectAnswers(checkedResults);
    const token = getAccessToken();
    setSuccessNotice(null);

    if (token && !displayModule.id.startsWith('demo-')) {
      try {
        const backendResult = await completeModule(displayModule.id, token, {
          quizAnswers: answers,
          reviewMode: true,
        });
        setResult(
          `Mode révision — score ${backendResult.quizScore}% (${correctCount}/${displayModule.questions.length} bonnes réponses). Aucun point enregistré.`
        );
        resetActiveQuizState();
        return;
      } catch (error) {
        if (error instanceof AuthRequestError) {
          setResult(resolveApiErrorMessage(error, 'module'));
          return;
        }
        setResult(
          `Mode révision — score local ${localScore}% (${correctCount}/${displayModule.questions.length}). Aucun point enregistré.`
        );
        return;
      }
    }

    setResult(
      `Mode révision — score local ${localScore}% (${correctCount}/${displayModule.questions.length}). Aucun point enregistré.`
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
  const totalReadingMinutes = sumLessonReadingMinutes(
    course.modules.map((module) => module.lessonContent ?? '')
  );
  const videoModuleCount = countCourseVideoModules(slug);
  const heroBanner = formatCourseHeroBanner(
    totalModules,
    totalReadingMinutes,
    QUESTIONS_PER_MODULE,
    videoModuleCount
  );

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
          {course.modules.length > 0 ? (
            <ol
              style={{
                marginTop: '0.85rem',
                paddingLeft: '1.15rem',
                display: 'grid',
                gap: '0.2rem',
                maxWidth: 720,
                fontSize: '0.88rem',
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              {course.modules.map((module, index) => (
                <li key={module.id} style={{ fontWeight: 600 }}>
                  {index + 1}. {module.title}
                </li>
              ))}
            </ol>
          ) : null}
          <p
            style={{
              marginTop: '0.85rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.98)',
              letterSpacing: '0.01em',
            }}
          >
            {heroBanner}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            <LevelPill level={level} />
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
              {usesLocalProgressPending && (
                <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  {hasToken
                    ? 'Certaines unités sont enregistrées localement en attente de synchronisation serveur.'
                    : 'Progression enregistrée sur cet appareil. Connecte-toi pour la synchroniser.'}
                </p>
              )}
              {usesProgressFallback && !usesLocalProgressPending && (
                <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  Progression affichée en mode démo. Connecte-toi pour la synchroniser via le backend.
                </p>
              )}
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
              {successNotice.nextModule ? (
                <Button
                  size="sm"
                  style={{ marginTop: '0.85rem' }}
                  onClick={() =>
                    navigateToModule(successNotice.nextModule!.id, successNotice.nextModule!.slug)
                  }
                >
                  Module suivant : {successNotice.nextModule.title}
                </Button>
              ) : null}
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

          {displayModule && displayModuleStatus !== 'todo' ? (
            (() => {
              const module = displayModule;
              const moduleProgress = moduleProgressById.get(module.id);
              const moduleIndex = course.modules.findIndex((item) => item.id === module.id);
              const moduleStatus = displayModuleStatus;

              return (
                <Card
                  key={module.id}
                  id="course-active-module"
                  as="article"
                  className={[
                    isReviewMode ? 'card-completed' : undefined,
                    hashHighlightSlug === module.slug ? 'course-module-hash-highlight' : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ marginTop: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TrackIcon track={course.track} size="sm" />
                      <span className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Unité {moduleIndex + 1}
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
                  {module.lessonContent ? (
                    <Badge tone="neutral" style={{ marginTop: '0.5rem' }}>
                      {formatReadingTimeLabel(countLessonWords(module.lessonContent))}
                    </Badge>
                  ) : null}
                  <ModuleObjectives
                    learningObjectives={module.learningObjectives}
                    keyTakeaways={module.keyTakeaways}
                  />
                  {moduleProgress?.completedAt && (
                    <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                      Terminée le {formatDateParis(moduleProgress.completedAt)}
                    </p>
                  )}

                  {isReviewMode ? (
                    <>
                      <Card variant="soft" style={{ marginTop: '1rem' }}>
                        <Badge tone="neutral" icon={'\u{1F504}'}>
                          Mode révision — aucun point
                        </Badge>
                        <p className="muted" style={{ marginTop: '0.45rem', fontSize: '0.9rem' }}>
                          Refais le quiz pour t&apos;entraîner : ta progression et tes points ne seront pas modifiés.
                        </p>
                      </Card>
                      <ModuleVideoSection
                        moduleId={module.id}
                        videoUrl={module.videoUrl}
                        videoTitle={module.videoTitle}
                        videoDurationMinutes={module.videoDurationMinutes}
                        videoProvider={module.videoProvider}
                        videoSourceLanguage={module.videoSourceLanguage}
                        videoTranscriptFr={module.videoTranscriptFr}
                        videoHeyGenFrUrl={module.videoHeyGenFrUrl}
                        videoDubFrSyncUrl={module.videoDubFrSyncUrl}
                        videoDubFrUrl={module.videoDubFrUrl}
                        moduleTitle={module.title}
                      />
                      {module.lessonContent ? <LessonContent content={module.lessonContent} /> : null}
                      <QuizPanel
                        module={module}
                        track={course.track}
                        answers={answers}
                        questionResults={activeQuestionResults}
                        revealedQuestions={activeRevealedQuestions}
                        reviewMode
                        keyTakeaways={module.keyTakeaways}
                        onSelectAnswer={handleSelectAnswer}
                        onCheckAnswer={handleCheckAnswer}
                        onRevealAll={handleRevealAllQuestions}
                        estimatedGameScore={estimatedActiveGameScore}
                      />
                    </>
                  ) : (
                    <>
                      <ModuleVideoSection
                        moduleId={module.id}
                        videoUrl={module.videoUrl}
                        videoTitle={module.videoTitle}
                        videoDurationMinutes={module.videoDurationMinutes}
                        videoProvider={module.videoProvider}
                        videoSourceLanguage={module.videoSourceLanguage}
                        videoTranscriptFr={module.videoTranscriptFr}
                        videoHeyGenFrUrl={module.videoHeyGenFrUrl}
                        videoDubFrSyncUrl={module.videoDubFrSyncUrl}
                        videoDubFrUrl={module.videoDubFrUrl}
                        moduleTitle={module.title}
                      />
                      {module.lessonContent ? <LessonContent content={module.lessonContent} /> : null}
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
                        keyTakeaways={module.keyTakeaways}
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
                  )}
                </Card>
              );
            })()
          ) : null}

          {displayModule && isReviewMode && (
            <Card id="course-unit-submit" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <p className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Mode révision
                  </p>
                  <p style={{ fontWeight: 800, marginTop: '0.2rem' }}>{displayModule.title}</p>
                  <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
                    Quiz : {answeredActiveCount}/{displayModule.questions.length} réponses · aucun point
                  </p>
                </div>
                <Button onClick={() => void handleReviewSubmit()} disabled={!canSubmitReview}>
                  Terminer la révision
                </Button>
              </div>
              {!canSubmitReview && displayModule.questions.length > 0 && (
                <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.85rem' }}>
                  Valide chaque question du quiz pour terminer la révision.
                </p>
              )}
              {result && (
                <ResultMessage result={result} />
              )}
            </Card>
          )}

          {displayModule && !isReviewMode && displayModuleStatus === 'in_progress' && (
            <Card id="course-unit-submit" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <p className="muted" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Unité en cours
                  </p>
                  <p style={{ fontWeight: 800, marginTop: '0.2rem' }}>{displayModule.title}</p>
                  <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
                    Quiz : {answeredActiveCount}/{displayModule.questions.length} réponses
                    {answeredActiveCount > 0 ? ` · score estimé ${estimatedActiveScore}%` : ''}
                    {displayModule.questions.length > 0 && (
                      <>
                        {' '}
                        · objectif {Math.ceil((QUIZ_PASS_PERCENT / 100) * displayModule.questions.length)}/
                        {displayModule.questions.length}
                      </>
                    )}
                  </p>
                </div>
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                  Valider l’unité
                </Button>
              </div>
              {!canSubmit && displayModule.questions.length > 0 && (
                <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.85rem' }}>
                  {!displayModule.questions.every((question) => answers[question.id])
                    ? 'Réponds à toutes les questions du quiz pour activer la validation.'
                    : displayModule.game && !activeGameReady
                      ? 'Réordonne le mini-scénario (glisser ou flèches) puis clique « Vérifier mon ordre ».'
                      : 'Complète le quiz et le mini-scénario pour valider l’unité.'}
                </p>
              )}
              {result && (
                <ResultMessage result={result} />
              )}
            </Card>
          )}
        </div>

        <aside style={{ position: 'sticky', top: '5.5rem', display: 'grid', gap: '1rem' }}>
          <ModuleSidebarNav
            course={course}
            moduleProgressById={moduleProgressById}
            nextModuleId={progress?.progress.nextModule?.id}
            activeModuleId={displayModule?.id}
            onSelectModule={(moduleId, moduleSlug) => navigateToModule(moduleId, moduleSlug)}
          />

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
                <strong>{formatDurationLabel(totalReadingMinutes)}</strong>
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

          <p className="muted" style={{ fontSize: '0.82rem', textAlign: 'center', margin: 0 }}>
            Ce contenu vous aide ?{' '}
            <Link href="/soutenir?amount=5" style={{ fontWeight: 700 }}>
              Soutenir le projet
            </Link>
          </p>
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
  nextModule?: { id: string; slug: string; title: string } | null;
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
  if (status === 'in_progress') return '\u25B6';
  return '\u{1F512}';
}

function ModuleSidebarNav({
  course,
  moduleProgressById,
  nextModuleId,
  activeModuleId,
  onSelectModule,
}: {
  course: CourseDetail;
  moduleProgressById: Map<string, CourseProgressModule>;
  nextModuleId?: string | null;
  activeModuleId?: string;
  onSelectModule: (moduleId: string, moduleSlug: string) => void;
}) {
  const [watchedModuleIds, setWatchedModuleIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const sync = () => {
      const ids = course.modules
        .filter((module) => moduleHasVideo(module) && isVideoWatched(module.id))
        .map((module) => module.id);
      setWatchedModuleIds(new Set(ids));
    };
    sync();
    window.addEventListener(VIDEO_WATCHED_EVENT, sync);
    return () => window.removeEventListener(VIDEO_WATCHED_EVENT, sync);
  }, [course.modules]);

  return (
    <Card variant="soft">
      <p className="section-eyebrow">Unités du parcours</p>
      <nav aria-label="Unités du parcours" style={{ display: 'grid', gap: '0.5rem', marginTop: '0.65rem' }}>
        {course.modules.map((module, index) => {
          const moduleProgress = moduleProgressById.get(module.id);
          const status = getModuleStatus(module.id, moduleProgress, nextModuleId);
          const isActive = activeModuleId === module.id;
          const isLocked = status === 'todo';

          return (
            <button
              key={module.id}
              type="button"
              id={`module-${module.slug}`}
              disabled={isLocked}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => {
                if (!isLocked) onSelectModule(module.id, module.slug);
              }}
              style={{
                display: 'grid',
                gap: '0.2rem',
                textAlign: 'left',
                border: `1px solid ${isActive ? 'var(--accent)' : status === 'completed' ? '#6ee7b7' : status === 'in_progress' ? '#fcd34d' : 'var(--border-soft)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.75rem',
                background: isActive
                  ? 'var(--accent-soft)'
                  : status === 'completed'
                    ? 'var(--success-soft)'
                    : status === 'in_progress'
                      ? 'var(--warning-soft)'
                      : 'var(--bg)',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.72 : 1,
              }}
            >
              <span className="muted" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Unité {index + 1}
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--fg)' }}>{module.title}</span>
              {isActive && module.lessonContent ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)' }}>
                  {formatReadingTimeLabel(countLessonWords(module.lessonContent))}
                </span>
              ) : null}
              {moduleHasVideo(module) ? (
                <Badge tone="neutral" style={{ width: 'fit-content', fontSize: '0.68rem' }}>
                  {'\u{1F3AC}'} {watchedModuleIds.has(module.id) ? 'Vidéo vue' : 'Vidéo'}
                </Badge>
              ) : null}
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)' }}>
                {moduleStatusIcon(status)} {moduleStatusLabel(status)}
              </span>
            </button>
          );
        })}
      </nav>
    </Card>
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

/** Affiche le résultat de validation d'une unité avec la couleur adaptée (succès / avertissement / erreur). */
function ResultMessage({ result }: { result: string }) {
  const isError =
    result.startsWith('Score local') ||
    result.includes('Impossible') ||
    result.includes('échoué');
  const isWarning =
    !isError &&
    (result.includes('local') || result.includes('sync') || result.includes('déconnect'));
  const isSuccess = !isError && !isWarning;

  const colors = isError
    ? { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' }
    : isWarning
      ? { color: '#92400e', bg: 'var(--warning-soft)', border: '#fcd34d' }
      : { color: '#065f46', bg: 'var(--success-soft, #ecfdf5)', border: '#6ee7b7' };

  return (
    <p
      style={{
        marginTop: '0.85rem',
        fontWeight: 600,
        fontSize: '0.92rem',
        color: colors.color,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '0.65rem 0.85rem',
        lineHeight: 1.55,
      }}
      role="status"
      aria-live="assertive"
    >
      {isSuccess ? '✅ ' : isWarning ? '⚠️ ' : '❌ '}
      {result}
    </p>
  );
}
