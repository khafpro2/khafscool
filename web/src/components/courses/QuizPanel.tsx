'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type CSSProperties, type RefObject } from 'react';
import type { CourseModule } from '@/lib/api';
import { resolveApiErrorMessage } from '@/lib/auth-errors';
import { getTrackVisual } from '@/lib/design';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const QUIZ_PASS_PERCENT = 50;

export type QuestionCheckResult = {
  correct: boolean;
  explanation?: string;
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
}: QuizPanelProps) {
  const questions = module.questions;
  const totalQuestions = questions.length;
  const trackVisual = getTrackVisual(track);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const correctCount = useMemo(
    () => countCorrectAnswers(questionResults),
    [questionResults]
  );
  const estimatedScore = useMemo(
    () => computeQuizScorePercent(totalQuestions, questionResults),
    [questionResults, totalQuestions]
  );
  const revealedCount = useMemo(
    () => questions.filter((question) => revealedQuestions.has(question.id)).length,
    [questions, revealedQuestions]
  );
  const allRevealed =
    reviewMode || (totalQuestions > 0 && revealedCount === totalQuestions);
  const progressStep = allRevealed ? totalQuestions : Math.max(revealedCount, currentIndex + 1);

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

  useEffect(() => {
    if (currentIndex > totalQuestions - 1 && totalQuestions > 0) {
      setCurrentIndex(totalQuestions - 1);
    }
  }, [currentIndex, totalQuestions]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalQuestions) return;
      setCurrentIndex(index);
      setFeedbackMessage(null);
      setShowConfetti(false);
    },
    [totalQuestions]
  );

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
              <p className="quiz-panel-eyebrow">Quiz · {trackVisual.label}</p>
              <h3 className="quiz-panel-title">Teste tes connaissances</h3>
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
        <ProgressBar
          value={progressStep}
          max={totalQuestions}
          tone={allRevealed ? 'success' : 'accent'}
          label={`Question ${Math.min(currentIndex + 1, totalQuestions)} sur ${totalQuestions}`}
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

          <span className="quiz-nav-dots" aria-hidden>
            {questions.map((question, index) => {
              const answered = Boolean(answers[question.id]);
              const revealed = revealedQuestions.has(question.id);
              const correct = questionResults[question.id]?.correct;
              let dotClass = 'quiz-dot';
              if (index === currentIndex) dotClass += ' quiz-dot-active';
              if (revealed && correct) dotClass += ' quiz-dot-correct';
              else if (revealed && !correct) dotClass += ' quiz-dot-incorrect';
              else if (answered) dotClass += ' quiz-dot-answered';

              return <span key={question.id} className={dotClass} />;
            })}
          </span>

          {currentIndex < totalQuestions - 1 ? (
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

        {allRevealed && (
          <QuizRecap
            correctCount={correctCount}
            totalQuestions={totalQuestions}
            estimatedScore={estimatedScore}
            passPercent={QUIZ_PASS_PERCENT}
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
  onSelect,
  onCheck,
  onEnterAdvance,
}: QuizQuestionStepProps) {
  const isCorrect = revealed && checkResult?.correct === true;
  const isIncorrect = revealed && checkResult?.correct === false;
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
          <span className="quiz-question-index" style={{ color: trackColor }}>
            Question {index + 1}/{total}
          </span>
          <h4 className="quiz-question-prompt">{question.prompt}</h4>
        </legend>

        <div className="quiz-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option, optionIndex) => {
            const selected = selectedOptionId === option.id;
            const isWrongSelection = revealed && selected && checkResult?.correct === false;
            const isCorrectSelection = revealed && selected && checkResult?.correct === true;

            let stateClass = 'quiz-option';
            if (isCorrectSelection) stateClass += ' quiz-option-correct';
            else if (isWrongSelection) stateClass += ' quiz-option-incorrect';
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
          </div>
        )}

        {revealed && checkResult?.explanation && (
          <aside className="quiz-explanation">
            <p className="quiz-explanation-title">
              <span aria-hidden>{'\u{1F4A1}'}</span> Explication
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
  passPercent,
}: {
  correctCount: number;
  totalQuestions: number;
  estimatedScore: number;
  passPercent: number;
}) {
  const minCorrect = Math.ceil((passPercent / 100) * totalQuestions);
  const meetsMinimum = estimatedScore >= passPercent;

  return (
    <div className={`quiz-recap${meetsMinimum ? ' quiz-recap-success' : ' quiz-recap-warning'}`}>
      <p style={{ fontWeight: 800 }}>Récapitulatif avant validation de l&apos;unité</p>
      <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {correctCount}/{totalQuestions} bonnes réponses · score quiz estimé{' '}
        <strong>{estimatedScore}%</strong>
        {totalQuestions > 0 && (
          <>
            {' '}
            · objectif recommandé <strong>{minCorrect}/{totalQuestions}</strong> ({passPercent}%+)
          </>
        )}
      </p>
      {!meetsMinimum && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#92400e' }}>
          Tu peux valider l&apos;unité, mais revoir les explications améliorera ton score et tes points.
        </p>
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
