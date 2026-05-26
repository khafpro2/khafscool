'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type CSSProperties, type RefObject } from 'react';
import Link from 'next/link';
import type { CourseModule } from '@/lib/api';
import { findGlossaryTermInText, glossaryWebHref } from '@ama/shared/glossary';
import {
  getQuizQuestionTypeMeta,
  listIncorrectQuestionIds,
  truncateQuizPrompt,
  type QuizQuestionTypeMeta,
} from '@ama/shared/quiz-learning';
import { resolveApiErrorMessage } from '@/lib/auth-errors';
import { getTrackVisual } from '@/lib/design';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { modulePointsFromScores } from '@/lib/points';

export const QUIZ_PASS_PERCENT = 50;

export type QuestionCheckResult = {
  correct: boolean;
  explanation?: string;
  correctOptionId?: string;
};

type QuizPanelProps = {
  module: CourseModule;
  track?: string | null;
  answers: Record<string, string>;
  questionResults: Record<string, QuestionCheckResult>;
  revealedQuestions: Set<string>;
  reviewMode: boolean;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onCheckAnswer: (questionId: string, selectedOption: string) => Promise<QuestionCheckResult>;
  onRevealAll: () => Promise<void>;
  onFinishQuiz?: () => void;
  estimatedGameScore?: number;
  /** Points clés de la leçon — affichés dans le récap si score faible. */
  keyTakeaways?: string[];
};

const CORRECT_MESSAGES = [
  'Bien joué !',
  'Excellent choix !',
  'Tu maîtrises ce point.',
  'C’est la bonne réponse !',
  'Bravo, continue comme ça.',
];

const INCORRECT_MESSAGES = [
  'Presque — relis l’explication.',
  'Pas tout à fait, mais tu progresses.',
  'Ce n’est pas la bonne piste, étudie le détail ci-dessous.',
  'À revoir : l’explication t’aidera à mémoriser.',
  'Raté cette fois — le corrigé t’éclaire.',
];

function pickRandomMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0];
}

function computeStreak(
  questions: CourseModule['questions'],
  questionResults: Record<string, QuestionCheckResult>,
  upToIndex: number
) {
  let streak = 0;
  for (let index = 0; index <= upToIndex; index += 1) {
    const question = questions[index];
    const result = questionResults[question?.id ?? ''];
    if (!result) break;
    if (result.correct) streak += 1;
    else streak = 0;
  }
  return streak;
}

export function QuizPanel({
  module,
  track,
  answers,
  questionResults,
  revealedQuestions,
  reviewMode,
  onSelectAnswer,
  onCheckAnswer,
  onFinishQuiz,
  estimatedGameScore = 0,
  keyTakeaways = [],
}: QuizPanelProps) {
  const questions = module.questions;
  const totalQuestions = questions.length;
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const trackVisual = getTrackVisual(track);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusWrongOnly, setFocusWrongOnly] = useState(false);
  const [learningTipDismissed, setLearningTipDismissed] = useState(false);
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setLearningTipDismissed(sessionStorage.getItem('ama-quiz-learning-tip') === '1');
    } catch {
      setLearningTipDismissed(false);
    }
  }, []);

  const correctCount = useMemo(
    () => countCorrectAnswers(questionResults),
    [questionResults]
  );
  const estimatedScore = useMemo(
    () => computeQuizScorePercent(totalQuestions, questionResults),
    [questionResults, totalQuestions]
  );
  const estimatedPointsEarned = useMemo(
    () => modulePointsFromScores(estimatedScore, estimatedGameScore),
    [estimatedGameScore, estimatedScore]
  );
  const revealedCount = useMemo(
    () => questions.filter((question) => revealedQuestions.has(question.id)).length,
    [questions, revealedQuestions]
  );
  const allRevealed =
    reviewMode || (totalQuestions > 0 && revealedCount === totalQuestions);
  const incorrectQuestionIds = useMemo(
    () => listIncorrectQuestionIds(questionIds, questionResults),
    [questionIds, questionResults]
  );
  const wrongReviewIndices = useMemo(
    () =>
      incorrectQuestionIds
        .map((id) => questions.findIndex((question) => question.id === id))
        .filter((index) => index >= 0),
    [incorrectQuestionIds, questions]
  );
  const progressStep = allRevealed ? totalQuestions : Math.max(revealedCount, currentIndex + 1);
  const wrongReviewPosition =
    focusWrongOnly && wrongReviewIndices.length > 0
      ? wrongReviewIndices.indexOf(currentIndex) + 1
      : 0;

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id;
  const selectedOptionId = currentQuestionId ? answers[currentQuestionId] : undefined;
  const checkResult = currentQuestionId ? questionResults[currentQuestionId] : undefined;
  const currentRevealed = currentQuestionId
    ? revealedQuestions.has(currentQuestionId) || reviewMode
    : false;
  const isChecking = checkingQuestionId === currentQuestionId;
  const streak = useMemo(
    () => computeStreak(questions, questionResults, currentIndex),
    [questions, questionResults, currentIndex]
  );
  const showStreakBadge = streak >= 3 && currentRevealed && checkResult?.correct;

  const glossaryTerm = useMemo(() => {
    if (!currentRevealed || !currentQuestion) return undefined;
    const haystack = [currentQuestion.prompt, checkResult?.explanation ?? ''].join(' ');
    return findGlossaryTermInText(haystack);
  }, [checkResult?.explanation, currentQuestion, currentRevealed]);

  useEffect(() => {
    if (currentIndex > totalQuestions - 1 && totalQuestions > 0) {
      setCurrentIndex(totalQuestions - 1);
    }
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    setFocusWrongOnly(false);
    setCurrentIndex(0);
  }, [module.id]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalQuestions) return;
      setCurrentIndex(index);
      setFeedbackMessage(null);
      setShowConfetti(false);
    },
    [totalQuestions]
  );

  const goToNextWrong = useCallback(() => {
    if (!wrongReviewIndices.length) return;
    const pos = wrongReviewIndices.indexOf(currentIndex);
    const nextIndex = pos < 0 ? wrongReviewIndices[0] : wrongReviewIndices[(pos + 1) % wrongReviewIndices.length];
    goToQuestion(nextIndex);
  }, [currentIndex, goToQuestion, wrongReviewIndices]);

  const startWrongReview = useCallback(() => {
    if (!wrongReviewIndices.length) return;
    setFocusWrongOnly(true);
    goToQuestion(wrongReviewIndices[0]);
  }, [goToQuestion, wrongReviewIndices]);

  function dismissLearningTip() {
    setLearningTipDismissed(true);
    try {
      sessionStorage.setItem('ama-quiz-learning-tip', '1');
    } catch {
      /* ignore */
    }
  }

  async function handleCheckAnswer() {
    if (!currentQuestionId || !selectedOptionId || currentRevealed) return;

    setCheckingQuestionId(currentQuestionId);
    setFeedbackMessage(null);
    setCheckError(null);
    setShowConfetti(false);

    try {
      const result = await onCheckAnswer(currentQuestionId, selectedOptionId);
      const message = result.correct
        ? pickRandomMessage(CORRECT_MESSAGES)
        : pickRandomMessage(INCORRECT_MESSAGES);
      setFeedbackMessage(message);
      if (result.correct) {
        setShowConfetti(true);
        window.setTimeout(() => setShowConfetti(false), 1200);
      }
      feedbackRef.current?.focus({ preventScroll: true });
    } catch (error) {
      setCheckError(resolveApiErrorMessage(error, 'quiz'));
    } finally {
      setCheckingQuestionId(null);
    }
  }

  function handleFinishQuiz() {
    if (onFinishQuiz) {
      onFinishQuiz();
      return;
    }
    document.getElementById('course-unit-submit')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (!totalQuestions) {
    return (
      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Aucune question pour cette unité.
      </p>
    );
  }

  const panelStyle = { '--quiz-accent': trackVisual.color } as CSSProperties;

  return (
    <section
      className="quiz-panel"
      aria-label="Quiz de l'unité"
      style={{ marginTop: '1rem', ...panelStyle }}
    >
      <header className="quiz-panel-header" style={{ background: trackVisual.gradient }}>
        <div className="quiz-panel-header-inner">
          <div className="quiz-panel-brand">
            {trackVisual.brand ? (
              <BrandIcon brand={trackVisual.brand} size="sm" variant="onColor" />
            ) : (
              <span aria-hidden className="quiz-panel-emoji">
                {trackVisual.icon ?? '\u{1F4DD}'}
              </span>
            )}
            <div>
              <p className="quiz-panel-eyebrow">
                {reviewMode ? 'Révision' : 'Mode apprentissage'} · {trackVisual.label}
              </p>
              <h3 className="quiz-panel-title">
                {reviewMode ? 'Réentraîne-toi sur cette unité' : 'Teste tes connaissances'}
              </h3>
            </div>
          </div>
          <div className="quiz-panel-stats" aria-live="polite" aria-atomic="true">
            <span className="quiz-score-pill">
              <strong>{correctCount}</strong>/{totalQuestions} bonnes réponses
            </span>
            {revealedCount > 0 && (
              <span className="quiz-score-estimate">{estimatedScore}%</span>
            )}
          </div>
        </div>
      </header>

      <div className="quiz-panel-body">
        {!learningTipDismissed && !allRevealed && (
          <aside className="quiz-learning-tip" aria-label="Conseils pour apprendre">
            <p className="quiz-learning-tip-title">
              <span aria-hidden>{'\u{1F9E0}'}</span> Comment tirer le meilleur de ce quiz
            </p>
            <ul className="quiz-learning-tip-list">
              <li>Une question à la fois — lis l’explication avant de passer à la suivante.</li>
              <li>Les badges indiquent le type (scénario, dépannage, concept).</li>
              <li>En cas d’erreur, la bonne réponse s’affiche pour ancrer le savoir.</li>
            </ul>
            <Button type="button" size="sm" variant="secondary" onClick={dismissLearningTip}>
              Compris
            </Button>
          </aside>
        )}

        {focusWrongOnly && wrongReviewIndices.length > 0 && (
          <p className="quiz-wrong-focus-banner" role="status">
            Révision ciblée : erreur {wrongReviewPosition}/{wrongReviewIndices.length}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="quiz-wrong-focus-exit"
              onClick={() => setFocusWrongOnly(false)}
            >
              Voir tout le quiz
            </Button>
          </p>
        )}

        <ProgressBar
          value={progressStep}
          max={totalQuestions}
          tone={allRevealed ? 'success' : 'accent'}
          label={
            focusWrongOnly && wrongReviewIndices.length > 0
              ? `Erreur ${wrongReviewPosition} sur ${wrongReviewIndices.length} · question ${currentIndex + 1}/${totalQuestions}`
              : `Question ${Math.min(currentIndex + 1, totalQuestions)} sur ${totalQuestions}`
          }
          showValueLabel
          className="quiz-progress"
        />

        {showStreakBadge && (
          <p className="quiz-streak-badge" role="status">
            <span aria-hidden>{'\u{1F525}'}</span> Série de {streak} bonnes réponses
          </p>
        )}

        {checkError ? (
          <p className="form-alert-error" role="alert" style={{ marginTop: '0.75rem' }}>
            {checkError}
          </p>
        ) : null}

        {currentQuestion && (
          <QuizQuestionStep
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIndex}
            total={totalQuestions}
            trackColor={trackVisual.color}
            selectedOptionId={selectedOptionId}
            checkResult={checkResult}
            revealed={currentRevealed}
            disabled={reviewMode}
            isChecking={isChecking}
            showConfetti={showConfetti}
            feedbackMessage={feedbackMessage}
            feedbackRef={feedbackRef}
            glossaryTerm={glossaryTerm}
            typeMeta={getQuizQuestionTypeMeta(currentQuestion.type)}
            correctOptionFallback={currentQuestion.correctOption}
            correctOptionId={checkResult?.correctOptionId}
            onSelect={(optionId) => {
              if (!currentRevealed) onSelectAnswer(currentQuestion.id, optionId);
            }}
            onCheck={() => void handleCheckAnswer()}
            onEnterAdvance={() => {
              if (!currentRevealed) {
                void handleCheckAnswer();
                return;
              }
              if (currentIndex < totalQuestions - 1) {
                goToQuestion(currentIndex + 1);
                return;
              }
              handleFinishQuiz();
            }}
          />
        )}

        <nav className="quiz-nav" aria-label="Navigation du quiz">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            Précédent
          </Button>

          <span className="quiz-nav-dots" role="tablist" aria-label="Questions du quiz">
            {questions.map((question, index) => {
              const answered = Boolean(answers[question.id]);
              const revealed = revealedQuestions.has(question.id);
              const correct = questionResults[question.id]?.correct;
              let dotClass = 'quiz-dot';
              if (index === currentIndex) dotClass += ' quiz-dot-active';
              if (revealed && correct) dotClass += ' quiz-dot-correct';
              else if (revealed && !correct) dotClass += ' quiz-dot-incorrect';
              else if (answered) dotClass += ' quiz-dot-answered';

              return (
                <button
                  key={question.id}
                  type="button"
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Question ${index + 1}${revealed ? (correct ? ', correcte' : ', à revoir') : ''}`}
                  className={dotClass}
                  disabled={!revealed}
                  onClick={() => goToQuestion(index)}
                />
              );
            })}
          </span>

          {focusWrongOnly && wrongReviewIndices.length > 0 ? (
            <Button type="button" size="sm" onClick={goToNextWrong} disabled={!currentRevealed}>
              Erreur suivante
            </Button>
          ) : currentIndex < totalQuestions - 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => goToQuestion(currentIndex + 1)}
              disabled={!currentRevealed}
            >
              Suivant
            </Button>
          ) : currentRevealed ? (
            <Button type="button" size="sm" onClick={handleFinishQuiz}>
              Terminer le quiz
            </Button>
          ) : (
            <Button type="button" size="sm" disabled>
              Suivant
            </Button>
          )}
        </nav>

        {allRevealed && incorrectQuestionIds.length > 0 && !focusWrongOnly && (
          <div className="quiz-wrong-actions">
            <Button type="button" size="sm" onClick={startWrongReview}>
              Revoir mes {incorrectQuestionIds.length} erreur
              {incorrectQuestionIds.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {allRevealed && (
          <QuizRecap
            correctCount={correctCount}
            totalQuestions={totalQuestions}
            estimatedScore={estimatedScore}
            estimatedPointsEarned={estimatedPointsEarned}
            passPercent={QUIZ_PASS_PERCENT}
            keyTakeaways={keyTakeaways}
            wrongQuestions={questions.filter((question) =>
              incorrectQuestionIds.includes(question.id)
            )}
            onReviewQuestion={(questionId) => {
              const index = questions.findIndex((item) => item.id === questionId);
              if (index < 0) return;
              setFocusWrongOnly(false);
              goToQuestion(index);
            }}
          />
        )}

        {!reviewMode && revealedCount > 0 && revealedCount < totalQuestions && (
          <p className="quiz-hint muted">
            Valide chaque réponse pour débloquer la question suivante.
          </p>
        )}
      </div>
    </section>
  );
}

type QuizQuestionStepProps = {
  question: CourseModule['questions'][number];
  index: number;
  total: number;
  trackColor: string;
  selectedOptionId?: string;
  checkResult?: QuestionCheckResult;
  revealed: boolean;
  disabled: boolean;
  isChecking: boolean;
  showConfetti: boolean;
  feedbackMessage: string | null;
  feedbackRef: RefObject<HTMLDivElement | null>;
  glossaryTerm?: { id: string; term: string };
  typeMeta: QuizQuestionTypeMeta;
  correctOptionId?: string;
  correctOptionFallback?: string;
  onSelect: (optionId: string) => void;
  onCheck: () => void;
  onEnterAdvance: () => void;
};

function QuizQuestionStep({
  question,
  index,
  total,
  trackColor,
  selectedOptionId,
  checkResult,
  revealed,
  disabled,
  isChecking,
  showConfetti,
  feedbackMessage,
  feedbackRef,
  glossaryTerm,
  typeMeta,
  correctOptionId,
  correctOptionFallback,
  onSelect,
  onCheck,
  onEnterAdvance,
}: QuizQuestionStepProps) {
  const isCorrect = revealed && checkResult?.correct === true;
  const isIncorrect = revealed && checkResult?.correct === false;
  const revealedCorrectOptionId =
    correctOptionId ?? (isIncorrect && correctOptionFallback ? correctOptionFallback : undefined);
  const canValidate = Boolean(selectedOptionId) && !revealed && !disabled;
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    optionRefs.current = [];
  }, [question.id]);

  function focusOption(index: number) {
    const safeIndex = Math.max(0, Math.min(index, question.options.length - 1));
    optionRefs.current[safeIndex]?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) {
    const optionCount = question.options.length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (optionIndex + 1) % optionCount;
      focusOption(nextIndex);
      if (!revealed && !disabled) onSelect(question.options[nextIndex].id);
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (optionIndex - 1 + optionCount) % optionCount;
      focusOption(prevIndex);
      if (!revealed && !disabled) onSelect(question.options[prevIndex].id);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (revealed || disabled || isChecking) {
        if (revealed) onEnterAdvance();
        return;
      }
      const option = question.options[optionIndex];
      if (!option) return;
      if (selectedOptionId === option.id && canValidate) {
        onCheck();
        return;
      }
      onSelect(option.id);
    }
  }

  return (
    <article
      className={`quiz-question-card${revealed ? (isCorrect ? ' quiz-question-correct' : isIncorrect ? ' quiz-question-incorrect' : '') : ''}`}
    >
      {showConfetti && isCorrect && (
        <div className="quiz-confetti" aria-hidden>
          {CONFETTI_PIECES.map((piece) => (
            <span
              key={piece.id}
              className="quiz-confetti-piece"
              style={
                {
                  '--x': piece.x,
                  '--delay': piece.delay,
                  '--hue': piece.hue,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <fieldset className="quiz-fieldset">
        <legend className="quiz-legend">
          <div className="quiz-question-meta-row">
            <span className="quiz-question-index" style={{ color: trackColor }}>
              Question {index + 1}/{total}
            </span>
            <Badge tone="neutral" icon={typeMeta.icon}>
              {typeMeta.shortLabel}
            </Badge>
          </div>
          <p className="quiz-question-type-tip muted">{typeMeta.tip}</p>
          <h4 className="quiz-question-prompt">{question.prompt}</h4>
        </legend>

        <div className="quiz-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option, optionIndex) => {
            const selected = selectedOptionId === option.id;
            const isWrongSelection = revealed && selected && checkResult?.correct === false;
            const isCorrectSelection = revealed && selected && checkResult?.correct === true;
            const isRevealedCorrect =
              revealed &&
              revealedCorrectOptionId &&
              option.id === revealedCorrectOptionId &&
              !isCorrectSelection;

            let stateClass = 'quiz-option';
            if (isCorrectSelection) stateClass += ' quiz-option-correct';
            else if (isWrongSelection) stateClass += ' quiz-option-incorrect';
            else if (isRevealedCorrect) stateClass += ' quiz-option-reveal-correct';
            else if (selected) stateClass += ' quiz-option-selected';

            return (
              <button
                key={option.id}
                ref={(node) => {
                  optionRefs.current[optionIndex] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected || (optionIndex === 0 && !selectedOptionId) ? 0 : -1}
                disabled={disabled || revealed}
                className={stateClass}
                style={{ animationDelay: `${optionIndex * 40}ms` }}
                onClick={() => onSelect(option.id)}
                onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
              >
                <span className="quiz-option-letter" aria-hidden>
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="quiz-option-label">{option.label}</span>
                {isCorrectSelection && (
                  <span className="quiz-option-icon quiz-option-icon-correct" aria-hidden>
                    {'\u2713'}
                  </span>
                )}
                {isWrongSelection && (
                  <span className="quiz-option-icon quiz-option-icon-incorrect" aria-hidden>
                    {'\u2717'}
                  </span>
                )}
                {isRevealedCorrect && (
                  <span className="quiz-option-icon quiz-option-icon-correct" aria-hidden>
                    {'\u2713'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {canValidate && (
          <Button
            type="button"
            size="sm"
            className="quiz-validate-btn"
            onClick={onCheck}
            disabled={isChecking}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onCheck();
              }
            }}
          >
            {isChecking ? 'Vérification…' : 'Valider ma réponse'}
          </Button>
        )}

        {revealed && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className="quiz-feedback-region"
            aria-live="polite"
            aria-atomic="true"
          >
            {feedbackMessage && (
              <p
                className={`quiz-feedback-message${isCorrect ? ' quiz-feedback-success' : ' quiz-feedback-error'}`}
              >
                {feedbackMessage}
              </p>
            )}
            <Badge tone={isCorrect ? 'success' : 'neutral'} icon={isCorrect ? '\u2705' : '\u274C'}>
              {isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
            </Badge>
            {glossaryTerm ? (
              <p className="quiz-glossary-link-wrap">
                <Link href={glossaryWebHref(glossaryTerm.id)} className="quiz-glossary-link">
                  Voir « {glossaryTerm.term.split('(')[0]?.trim() ?? glossaryTerm.term} » dans le glossaire
                </Link>
              </p>
            ) : null}
          </div>
        )}

        {revealed && isIncorrect && revealedCorrectOptionId && (
          <p className="quiz-correct-answer-hint" role="status">
            La bonne réponse est l’option{' '}
            <strong>{revealedCorrectOptionId.toUpperCase()}</strong> — relis l’explication ci-dessous.
          </p>
        )}

        {revealed && checkResult?.explanation && (
          <aside className={`quiz-explanation${isIncorrect ? ' quiz-explanation-emphasis' : ''}`}>
            <p className="quiz-explanation-title">
              <span aria-hidden>{'\u{1F4A1}'}</span> {isIncorrect ? 'Pourquoi ?' : 'Explication'}
            </p>
            <p className="quiz-explanation-text">{checkResult.explanation}</p>
          </aside>
        )}
      </fieldset>
    </article>
  );
}

function QuizRecap({
  correctCount,
  totalQuestions,
  estimatedScore,
  estimatedPointsEarned,
  passPercent,
  keyTakeaways,
  wrongQuestions,
  onReviewQuestion,
}: {
  correctCount: number;
  totalQuestions: number;
  estimatedScore: number;
  estimatedPointsEarned: number;
  passPercent: number;
  keyTakeaways?: string[];
  wrongQuestions: CourseModule['questions'];
  onReviewQuestion: (questionId: string) => void;
}) {
  const minCorrect = Math.ceil((passPercent / 100) * totalQuestions);
  const meetsMinimum = estimatedScore >= passPercent;

  return (
    <div className={`quiz-recap${meetsMinimum ? ' quiz-recap-success' : ' quiz-recap-warning'}`}>
      <p style={{ fontWeight: 800 }}>Récapitulatif avant validation de l'unité</p>
      <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {correctCount}/{totalQuestions} bonnes réponses · score quiz{' '}
        <strong>{estimatedScore}%</strong>
        {estimatedPointsEarned > 0 ? (
          <>
            {' '}
            · <strong>+{estimatedPointsEarned} points</strong> estimés
          </>
        ) : null}
        {totalQuestions > 0 && (
          <>
            {' '}
            · objectif recommandé <strong>{minCorrect}/{totalQuestions}</strong> ({passPercent}%+)
          </>
        )}
      </p>
      {!meetsMinimum && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#92400e' }}>
          Tu peux valider l'unité, mais revoir les explications améliorera ton score et tes points.
        </p>
      )}

      {wrongQuestions.length > 0 && (
        <div className="quiz-recap-wrong-list">
          <p className="quiz-recap-wrong-title">À revoir avant de valider</p>
          <ul>
            {wrongQuestions.map((question) => (
              <li key={question.id}>
                <span className="quiz-recap-wrong-prompt">{truncateQuizPrompt(question.prompt)}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onReviewQuestion(question.id)}
                >
                  Revoir
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!meetsMinimum && keyTakeaways && keyTakeaways.length > 0 && (
        <div className="quiz-recap-takeaways">
          <p className="quiz-recap-takeaways-title">Rappel — points clés de la leçon</p>
          <ul>
            {keyTakeaways.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const CONFETTI_PIECES = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  x: `${(index % 6) * 16 - 40}%`,
  delay: `${index * 45}ms`,
  hue: `${(index * 37) % 360}`,
}));

export function computeQuizScorePercent(
  totalQuestions: number,
  questionResults: Record<string, QuestionCheckResult>
) {
  if (!totalQuestions) return 0;
  const checkedCount = Object.keys(questionResults).length;
  if (!checkedCount) return 0;
  const correct = Object.values(questionResults).filter((result) => result.correct).length;
  return Math.round((correct / totalQuestions) * 100);
}

export function countCorrectAnswers(questionResults: Record<string, QuestionCheckResult>) {
  return Object.values(questionResults).filter((result) => result.correct).length;
}
