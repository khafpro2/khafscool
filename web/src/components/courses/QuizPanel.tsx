'use client';

import { useMemo } from 'react';
import type { CourseModule, CourseQuestion } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const QUIZ_PASS_PERCENT = 50;

type QuizPanelProps = {
  module: CourseModule;
  answers: Record<string, string>;
  revealedQuestions: Set<string>;
  reviewMode: boolean;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onRevealQuestion: (questionId: string) => void;
  onRevealAll: () => void;
};

export function QuizPanel({
  module,
  answers,
  revealedQuestions,
  reviewMode,
  onSelectAnswer,
  onRevealQuestion,
  onRevealAll,
}: QuizPanelProps) {
  const questions = module.questions;
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, questions]
  );
  const estimatedScore = useMemo(
    () => computeQuizScorePercent(questions, answers),
    [answers, questions]
  );
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;
  const allRevealed = questions.every((question) => revealedQuestions.has(question.id));

  if (!totalQuestions) {
    return (
      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Aucune question pour cette unité.
      </p>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            <span aria-hidden style={{ marginRight: 6 }}>
              {'\u{1F4DD}'}
            </span>
            Quiz de l&apos;unité
          </h3>
          <p className="muted" style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
            {answeredCount}/{totalQuestions} question{totalQuestions > 1 ? 's' : ''} répondue
            {answeredCount > 1 ? 's' : ''}
            {answeredCount > 0 ? ` · score estimé ${estimatedScore}%` : ''}
          </p>
        </div>
        <Badge tone={allAnswered ? 'success' : 'warning'} icon={allAnswered ? '\u2705' : '\u{1F3AF}'}>
          {allAnswered ? 'Quiz complet' : 'En cours'}
        </Badge>
      </div>

      <ProgressBar
        value={answeredCount}
        max={totalQuestions}
        tone={allAnswered ? 'success' : 'accent'}
        label="Progression du quiz"
        style={{ marginTop: '0.75rem' }}
      />

      <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
        {questions.map((question, index) => (
          <QuizQuestionCard
            key={question.id}
            question={question}
            index={index}
            total={totalQuestions}
            selectedOptionId={answers[question.id]}
            revealed={revealedQuestions.has(question.id) || reviewMode}
            disabled={reviewMode}
            onSelect={(optionId) => onSelectAnswer(question.id, optionId)}
            onReveal={() => onRevealQuestion(question.id)}
          />
        ))}
      </div>

      {allAnswered && !allRevealed && !reviewMode && (
        <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button size="sm" variant="secondary" onClick={onRevealAll}>
            Voir le corrigé du quiz
          </Button>
        </div>
      )}

      {(allRevealed || reviewMode) && (
        <QuizRecap
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          estimatedScore={estimatedScore}
          passPercent={QUIZ_PASS_PERCENT}
        />
      )}
    </div>
  );
}

type QuizQuestionCardProps = {
  question: CourseQuestion;
  index: number;
  total: number;
  selectedOptionId?: string;
  revealed: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  onReveal: () => void;
};

function QuizQuestionCard({
  question,
  index,
  total,
  selectedOptionId,
  revealed,
  disabled,
  onSelect,
  onReveal,
}: QuizQuestionCardProps) {
  const isCorrect = revealed && selectedOptionId === question.correctOption;
  const isIncorrect = revealed && selectedOptionId && selectedOptionId !== question.correctOption;
  const canReveal = Boolean(selectedOptionId) && !revealed && !disabled;

  return (
    <fieldset
      style={{
        border: `1px solid ${revealed ? (isCorrect ? '#a8d8b2' : isIncorrect ? '#f0b4b4' : 'var(--border-soft)') : 'var(--border-soft)'}`,
        borderRadius: 14,
        padding: '0.9rem 1rem',
        background: revealed
          ? isCorrect
            ? '#f4fbf6'
            : isIncorrect
              ? '#fff5f5'
              : '#ffffff'
          : '#ffffff',
        margin: 0,
      }}
    >
      <legend style={{ padding: '0 0.4rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="muted" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
            Question {index + 1}/{total}
          </span>
          {revealed && (
            <Badge tone={isCorrect ? 'success' : 'neutral'} icon={isCorrect ? '\u2705' : '\u274C'}>
              {isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
            </Badge>
          )}
        </div>
        <p style={{ fontWeight: 700, marginTop: '0.35rem', lineHeight: 1.45 }}>{question.prompt}</p>
      </legend>

      <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.6rem' }} role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id;
          const isCorrectOption = revealed && option.id === question.correctOption;
          const isWrongSelection = revealed && selected && option.id !== question.correctOption;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled || (revealed && !selected && option.id !== question.correctOption)}
              onClick={() => {
                if (!disabled && !revealed) onSelect(option.id);
              }}
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'center',
                textAlign: 'left',
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 12,
                border: `2px solid ${
                  isCorrectOption
                    ? '#6fbf84'
                    : isWrongSelection
                      ? '#e08b8b'
                      : selected
                        ? 'var(--accent)'
                        : 'var(--border-soft)'
                }`,
                background: isCorrectOption
                  ? '#e8f7ec'
                  : isWrongSelection
                    ? '#fdeeee'
                    : selected
                      ? '#f0f7ff'
                      : '#fafbfd',
                cursor: disabled || revealed ? 'default' : 'pointer',
                font: 'inherit',
                color: 'inherit',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? 'var(--accent-strong)' : 'var(--border)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: selected ? 'var(--accent-strong)' : '#fff',
                }}
              >
                {selected && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#fff',
                    }}
                  />
                )}
              </span>
              <span style={{ fontWeight: selected ? 700 : 500 }}>{option.label}</span>
              {isCorrectOption && (
                <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#2f7a45' }} aria-hidden>
                  {'\u2705'}
                </span>
              )}
              {isWrongSelection && (
                <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#b44' }} aria-hidden>
                  {'\u274C'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {canReveal && (
        <Button size="sm" variant="ghost" style={{ marginTop: '0.65rem' }} onClick={onReveal}>
          Valider ma réponse
        </Button>
      )}

      {revealed && question.explanation && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 0.85rem',
            borderRadius: 12,
            background: '#f8fafd',
            border: '1px solid var(--border-soft)',
          }}
        >
          <p style={{ fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Explication
          </p>
          <p className="muted" style={{ marginTop: '0.35rem', lineHeight: 1.5 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </fieldset>
  );
}

function QuizRecap({
  answeredCount,
  totalQuestions,
  estimatedScore,
  passPercent,
}: {
  answeredCount: number;
  totalQuestions: number;
  estimatedScore: number;
  passPercent: number;
}) {
  const minCorrect = Math.ceil((passPercent / 100) * totalQuestions);
  const meetsMinimum = estimatedScore >= passPercent;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '0.9rem 1rem',
        borderRadius: 14,
        border: `1px solid ${meetsMinimum ? '#a8d8b2' : '#f0cf7a'}`,
        background: meetsMinimum ? '#f4fbf6' : '#fff8e6',
      }}
    >
      <p style={{ fontWeight: 800 }}>Récapitulatif avant validation de l&apos;unité</p>
      <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {answeredCount}/{totalQuestions} réponses · score quiz estimé <strong>{estimatedScore}%</strong>
        {totalQuestions > 0 && (
          <>
            {' '}
            · objectif recommandé <strong>{minCorrect}/{totalQuestions}</strong> ({passPercent}%+)
          </>
        )}
      </p>
      {!meetsMinimum && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#8a4a00' }}>
          Tu peux valider l&apos;unité, mais revoir les explications améliorera ton score et tes points.
        </p>
      )}
    </div>
  );
}

export function computeQuizScorePercent(questions: CourseQuestion[], answers: Record<string, string>) {
  if (!questions.length) return 0;
  const correct = questions.filter(
    (question) => question.correctOption && answers[question.id] === question.correctOption
  ).length;
  return Math.round((correct / questions.length) * 100);
}

export function countCorrectAnswers(questions: CourseQuestion[], answers: Record<string, string>) {
  return questions.filter(
    (question) => question.correctOption && answers[question.id] === question.correctOption
  ).length;
}
