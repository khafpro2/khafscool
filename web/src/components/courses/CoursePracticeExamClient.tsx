'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  computePracticeExamScorePercent,
  formatPracticeExamElapsed,
  isPracticeExamOverRecommendedTime,
  PRACTICE_EXAM_PASS_PERCENT,
  PRACTICE_EXAM_QUESTION_COUNT,
  PRACTICE_EXAM_RECOMMENDED_MINUTES,
} from '@ama/shared/practice-exam';
import {
  checkModuleAnswer,
  fetchCourseProgress,
  fetchPracticeExam,
  recordPracticeExamScore,
  type PracticeExamData,
  type PracticeExamQuestion,
} from '@/lib/api';
import { buildAuthUrl, getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { toastBadgeUnlocked, toastQuestCompleted } from '@/lib/gamification-toasts';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrackIcon } from '@/components/ui/TrackIcon';
import {
  countCorrectAnswers,
  QuizPanel,
  type QuestionCheckResult,
} from '@/components/courses/QuizPanel';
import { getTrackVisual } from '@/lib/design';

type ExamState = {
  exam: PracticeExamData;
  moduleIdByQuestion: Record<string, string>;
  usesDemo: boolean;
};

export function CoursePracticeExamClient({ slug }: { slug: string }) {
  const [state, setState] = useState<ExamState | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionResults, setQuestionResults] = useState<Record<string, QuestionCheckResult>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set());
  const [examFinished, setExamFinished] = useState(false);
  const [scoreRecorded, setScoreRecorded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    fetchPracticeExam(slug, token ?? undefined)
      .then(async (exam) => {
        const moduleIdByQuestion = Object.fromEntries(
          exam.questions.map((question) => [question.id, question.moduleId])
        );

        if (!token) {
          setState({ exam, moduleIdByQuestion, usesDemo: true });
          return;
        }

        try {
          const progress = await fetchCourseProgress(slug, token);
          const isComplete = progress.progress.progressPercent >= 100;
          if (!isComplete) {
            setBlocked(true);
            return;
          }
          setState({ exam, moduleIdByQuestion, usesDemo: false });
        } catch {
          setBlocked(true);
        }
      })
      .catch(() => setBlocked(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const syntheticModule = useMemo(() => {
    if (!state) return null;
    return {
      id: `practice-exam-${slug}`,
      slug: 'examen-blanc',
      title: 'Examen blanc',
      summary: `${state.exam.questionCount} questions tirées aléatoirement`,
      questions: state.exam.questions.map(({ moduleId: _moduleId, ...question }) => question),
    };
  }, [slug, state]);

  const correctCount = useMemo(() => countCorrectAnswers(questionResults), [questionResults]);
  const scorePercent = useMemo(
    () => computePracticeExamScorePercent(correctCount, state?.exam.questionCount ?? 0),
    [correctCount, state?.exam.questionCount]
  );

  const allRevealed =
    state != null &&
    state.exam.questions.length > 0 &&
    state.exam.questions.every((question) => revealedQuestions.has(question.id));

  useEffect(() => {
    if (allRevealed) setExamFinished(true);
  }, [allRevealed]);

  useEffect(() => {
    if (!state || examFinished) return;

    setElapsedSeconds(0);
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examFinished, slug, state?.exam.attemptToken]);

  useEffect(() => {
    if (!examFinished || scoreRecorded || !state || state.usesDemo) return;

    const token = getAccessToken();
    const attemptToken = state.exam.attemptToken;
    if (!token || !attemptToken) return;

    const submissionAnswers = state.exam.questions.map((question) => ({
      questionId: question.id,
      selectedOption: answers[question.id],
    }));

    if (submissionAnswers.some((answer) => !answer.selectedOption)) return;

    setScoreRecorded(true);
    void recordPracticeExamScore(slug, token, {
      attemptToken,
      answers: submissionAnswers as { questionId: string; selectedOption: string }[],
    })
      .then((result) => {
        if (result.badgeEarned) toastBadgeUnlocked(result.badgeEarned);
        if (result.questCompleted) {
          toastQuestCompleted({
            label: 'Passe un examen blanc',
            rewardPoints: 25,
          });
        }
      })
      .catch(() => {
        setScoreRecorded(false);
      });
  }, [answers, examFinished, scoreRecorded, slug, state]);

  const handleSelectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }, []);

  const handleCheckAnswer = useCallback(
    async (questionId: string, selectedOption: string): Promise<QuestionCheckResult> => {
      if (!state) throw new Error('Examen non chargé');

      const moduleId = state.moduleIdByQuestion[questionId];
      const token = getAccessToken();
      const question = state.exam.questions.find((item) => item.id === questionId);
      const isExamOnly = question && 'examOnly' in question && (question as { examOnly?: boolean }).examOnly;

      let result: QuestionCheckResult;

      if (token && moduleId && !isExamOnly) {
        // Question normale : validation via l'API module
        try {
          const apiResult = await checkModuleAnswer(moduleId, token, { questionId, selectedOption });
          result = { correct: apiResult.correct, explanation: apiResult.explanation };
        } catch {
          // Fallback local si l'API ne connaît pas la question (ex: question retirée)
          if (question && 'correctOption' in question && question.correctOption) {
            const correct = question.correctOption === selectedOption;
            result = {
              correct,
              explanation: question.explanation ?? (correct ? 'Bonne réponse.' : 'Réponse incorrecte.'),
            };
          } else {
            throw new Error('Impossible de vérifier cette réponse pour le moment.');
          }
        }
      } else if (question && 'correctOption' in question && question.correctOption) {
        // Question examOnly ou mode démo : validation locale avec correctOption
        const correct = question.correctOption === selectedOption;
        result = {
          correct,
          explanation: question.explanation ?? (correct ? 'Bonne réponse.' : 'Réponse incorrecte.'),
        };
      } else {
        // Question examOnly connecté sans correctOption : enregistrer sans afficher d'erreur
        result = {
          correct: false,
          explanation: 'Réponse enregistrée — résultat disponible après la correction finale.',
        };
      }

      setQuestionResults((current) => ({ ...current, [questionId]: result }));
      setRevealedQuestions((current) => new Set(current).add(questionId));
      return result;
    },
    [state]
  );

  const handleRevealAll = useCallback(async () => {
    if (!state) return;
    const token = getAccessToken();

    for (const question of state.exam.questions) {
      const selectedOption = answers[question.id];
      if (!selectedOption || revealedQuestions.has(question.id)) continue;

      const moduleId = state.moduleIdByQuestion[question.id];
      const isExamOnly = 'examOnly' in question && (question as { examOnly?: boolean }).examOnly;

      if (token && moduleId && !isExamOnly) {
        try {
          const apiResult = await checkModuleAnswer(moduleId, token, {
            questionId: question.id,
            selectedOption,
          });
          setQuestionResults((current) => ({
            ...current,
            [question.id]: { correct: apiResult.correct, explanation: apiResult.explanation },
          }));
        } catch {
          // Fallback local pour les questions inconnues de l'API
          if ('correctOption' in question && question.correctOption) {
            const correct = question.correctOption === selectedOption;
            setQuestionResults((current) => ({
              ...current,
              [question.id]: {
                correct,
                explanation: question.explanation ?? (correct ? 'Bonne réponse.' : 'Réponse incorrecte.'),
              },
            }));
          }
        }
      } else if ('correctOption' in question && question.correctOption) {
        // Validation locale (examOnly ou démo)
        const correct = question.correctOption === selectedOption;
        setQuestionResults((current) => ({
          ...current,
          [question.id]: {
            correct,
            explanation: question.explanation ?? (correct ? 'Bonne réponse.' : 'Réponse incorrecte.'),
          },
        }));
      } else {
        // examOnly connecté sans correctOption : marquer comme révélé
        setQuestionResults((current) => ({
          ...current,
          [question.id]: {
            correct: false,
            explanation: 'Réponse enregistrée.',
          },
        }));
      }
      setRevealedQuestions((current) => new Set(current).add(question.id));
    }
  }, [answers, revealedQuestions, state]);

  if (isLoading) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <p className="muted">Préparation de l&apos;examen blanc…</p>
      </section>
    );
  }

  if (blocked || !state || !syntheticModule) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Examen blanc verrouillé</h1>
        <p className="muted" style={{ marginTop: '0.5rem', maxWidth: 560 }}>
          Termine les 4 modules du parcours pour accéder à l&apos;examen blanc — pool de{' '}
          {state?.exam.poolSize ?? 44} questions, {PRACTICE_EXAM_QUESTION_COUNT} tirées au hasard.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button href={`/courses/${slug}`}>Reprendre le parcours</Button>
          {!hasToken ? (
            <Button href={buildAuthUrl(`/courses/${slug}/examen`)} variant="secondary">
              Se connecter
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  const { exam, usesDemo } = state;
  const visual = getTrackVisual(exam.course.track);
  const timerOverRecommended = isPracticeExamOverRecommendedTime(elapsedSeconds);

  return (
    <section className="practice-exam-page" style={{ padding: '1rem 0 3rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Parcours', href: '/courses' },
          { label: exam.course.title, href: `/courses/${slug}` },
          { label: 'Fiche révision', href: `/courses/${slug}/revision` },
          { label: 'Examen blanc' },
        ]}
      />

      <div className="hero practice-exam-hero no-print-dark" style={{ marginTop: '0.75rem', background: visual.gradient }}>
        <p style={{ fontWeight: 800, fontSize: '0.85rem', opacity: 0.92 }}>{'\u{1F4DD}'} Examen blanc</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, marginTop: '0.5rem' }}>
          {exam.course.title}
        </h1>
        <p style={{ marginTop: '0.55rem', maxWidth: 640, color: 'rgba(255,255,255,0.94)' }}>
          Pool de {exam.poolSize} questions · {exam.questionCount} tirées au hasard · piste{' '}
          {formatTrack(exam.course.track)} — entraînement sans impact sur ta progression.
        </p>
        <p style={{ marginTop: '0.45rem', maxWidth: 640, color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem' }}>
          Objectif certification : ≥ {PRACTICE_EXAM_PASS_PERCENT} % pour débloquer le badge « Examen blanc réussi ».
        </p>
        {!examFinished ? (
          <p
            className={`practice-exam-timer${timerOverRecommended ? ' practice-exam-timer--over' : ''}`}
            role="status"
            aria-live="polite"
            style={{
              marginTop: '0.65rem',
              padding: '0.45rem 0.7rem',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.2)',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            Temps écoulé : {formatPracticeExamElapsed(elapsedSeconds)} · objectif ~{PRACTICE_EXAM_RECOMMENDED_MINUTES}{' '}
            min
            {timerOverRecommended ? ' — prends le temps de relire les explications.' : ''}
          </p>
        ) : null}
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
            Mode démo — connecte-toi après complétion pour synchroniser avec l&apos;API.
          </p>
        ) : null}
      </div>

      {!examFinished ? (
        <QuizPanel
          module={syntheticModule}
          track={exam.course.track}
          answers={answers}
          questionResults={questionResults}
          revealedQuestions={revealedQuestions}
          reviewMode={false}
          onSelectAnswer={handleSelectAnswer}
          onCheckAnswer={handleCheckAnswer}
          onRevealAll={handleRevealAll}
          onFinishQuiz={() => setExamFinished(true)}
        />
      ) : (
        <PracticeExamResults
          slug={slug}
          courseTitle={exam.course.title}
          track={exam.course.track}
          correctCount={correctCount}
          totalQuestions={exam.questionCount}
          scorePercent={scorePercent}
          questions={exam.questions}
          questionResults={questionResults}
        />
      )}
    </section>
  );
}

function PracticeExamResults({
  slug,
  courseTitle,
  track,
  correctCount,
  totalQuestions,
  scorePercent,
  questions,
  questionResults,
}: {
  slug: string;
  courseTitle: string;
  track: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  questions: PracticeExamQuestion[];
  questionResults: Record<string, QuestionCheckResult>;
}) {
  const visual = getTrackVisual(track);
  const passed = scorePercent >= PRACTICE_EXAM_PASS_PERCENT;

  return (
    <Card style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <TrackIcon track={track} size="md" style={{ background: visual.gradient }} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <p className="muted" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
            Résultat examen blanc
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.35rem' }}>
            {correctCount}/{totalQuestions} — {scorePercent}%
          </h2>
          <p style={{ marginTop: '0.5rem', lineHeight: 1.55 }}>
            {passed
              ? `Seuil de réussite atteint (≥ ${PRACTICE_EXAM_PASS_PERCENT} %) — le badge « Examen blanc réussi » est enregistré sur ton profil. Revois les explications des questions manquées avant la certification.`
              : `Score inférieur à ${PRACTICE_EXAM_PASS_PERCENT} % — continue avec la fiche révision et les modules du parcours, puis retente l'examen pour viser le badge « Examen blanc réussi ».`}
          </p>
        </div>
      </div>

      <ul style={{ marginTop: '1.25rem', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
        {questions.map((question, index) => {
          const result = questionResults[question.id];
          const icon = result?.correct ? '\u2705' : result ? '\u274C' : '\u2014';
          return (
            <li key={question.id} style={{ marginBottom: '0.35rem' }}>
              {icon} Question {index + 1} — {question.prompt.slice(0, 80)}
              {question.prompt.length > 80 ? '…' : ''}
            </li>
          );
        })}
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1.25rem' }}>
        <Button href={`/courses/${slug}/revision`} icon={'\u{1F4D1}'}>
          Retour fiche révision
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.location.assign(`/courses/${slug}/examen`)}>
          Refaire l&apos;examen
        </Button>
        <Button href={`/courses/${slug}`} variant="ghost">
          Parcours {courseTitle}
        </Button>
      </div>
    </Card>
  );
}
