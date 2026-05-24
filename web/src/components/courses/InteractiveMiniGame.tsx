'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from 'react';
import type { CourseModule } from '@/lib/api';
import { getTrackVisual } from '@/lib/design';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BrandIcon } from '@/components/ui/BrandIcon';

type GameStep = { id: number; label: string };

export type MiniGameData = NonNullable<CourseModule['game']> & {
  correctOrder?: number[];
};

type InteractiveMiniGameProps = {
  game: MiniGameData;
  track?: string | null;
  order: number[];
  onOrderChange: (order: number[]) => void;
  onTouched: () => void;
  disabled?: boolean;
};

const GAME_TYPE_LABELS: Record<string, string> = {
  POLICY_ORDER: 'Ordre des politiques MDM',
  ENROLLMENT_RUNBOOK: 'Runbook d’enrôlement',
  INVENTORY_TRIAGE: 'Triage inventaire',
  COMPLIANCE_TRIAGE: 'Triage conformité',
  MAM_POLICY_ORDER: 'Ordre App Protection',
  SCENARIO_FIX: 'Scénario de dépannage',
  IOS_TRIAGE: 'Triage iOS',
  EXAM_RUNBOOK: 'Runbook examen',
};

const HINT_BY_TYPE: Record<string, string> = {
  POLICY_ORDER: 'Place les étapes du plus logique au plus risqué : ciblage, déploiement, test.',
  ENROLLMENT_RUNBOOK: 'Commence par les prérequis plateforme, puis l’assignation, puis la validation terrain.',
  INVENTORY_TRIAGE: 'Vérifie d’abord la gestion MDM, puis l’état machine, puis l’action corrective.',
  COMPLIANCE_TRIAGE: 'Lis les rapports, traite les risques critiques, puis les exigences progressives.',
  MAM_POLICY_ORDER: 'Politique MAM, Conditional Access, puis validation utilisateur.',
  SCENARIO_FIX: 'Diagnostic progressif avant toute action destructive.',
  IOS_TRIAGE: 'Réseau et horloge, puis console MDM, puis remédiation.',
  EXAM_RUNBOOK: 'Sécurité d’abord, diagnostic officiel, documentation avant réparation.',
};

const KEYBOARD_INSTRUCTIONS =
  'Glisse une étape avec la souris, ou utilise le clavier : Tab pour naviguer, Espace pour sélectionner une étape, flèches Haut/Bas pour la déplacer, Espace pour la déposer, Échap pour annuler. Les boutons Monter et Descendre restent disponibles.';

function labelForGameType(type: string) {
  return GAME_TYPE_LABELS[type] ?? 'Mini-scénario MDM';
}

function hintForGameType(type: string) {
  return HINT_BY_TYPE[type] ?? 'Réordonne les étapes pour refléter la bonne procédure terrain.';
}

function scoreOrder(userOrder: number[], correctOrder: number[]) {
  if (!correctOrder.length) return 0;
  let matches = 0;
  for (let i = 0; i < correctOrder.length; i += 1) {
    if (userOrder[i] === correctOrder[i]) matches += 1;
  }
  return Math.round((matches / correctOrder.length) * 100);
}

export function InteractiveMiniGame({
  game,
  track,
  order,
  onOrderChange,
  onTouched,
  disabled = false,
}: InteractiveMiniGameProps) {
  const trackVisual = getTrackVisual(track);
  const stepsById = useMemo(() => new Map(game.steps.map((step) => [step.id, step])), [game.steps]);
  const listRef = useRef<HTMLOListElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const orderedSteps = useMemo(
    () =>
      order
        .map((id) => stepsById.get(id))
        .filter((step): step is GameStep => Boolean(step)),
    [order, stepsById]
  );

  const correctOrder = game.correctOrder;
  const localScore = correctOrder && checked ? scoreOrder(order, correctOrder) : null;
  const allCorrect = localScore === 100;

  const applyOrder = useCallback(
    (nextOrder: number[]) => {
      onOrderChange(nextOrder);
      onTouched();
      setChecked(false);
      setFeedback(null);
    },
    [onOrderChange, onTouched]
  );

  const moveStep = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (disabled || fromIndex === toIndex || toIndex < 0 || toIndex >= order.length) return false;
      const next = [...order];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      applyOrder(next);
      return true;
    },
    [applyOrder, disabled, order]
  );

  useEffect(() => {
    if (pickedIndex !== null && pickedIndex >= orderedSteps.length) {
      setPickedIndex(null);
    }
  }, [orderedSteps.length, pickedIndex]);

  function focusItem(index: number) {
    const item = listRef.current?.children.item(index) as HTMLElement | null;
    item?.focus();
  }

  function handleDragStart(index: number) {
    if (disabled) return;
    setDragIndex(index);
    setPickedIndex(null);
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>, index: number) {
    event.preventDefault();
    if (disabled || dragIndex === null || dragIndex === index) return;
    if (moveStep(dragIndex, index)) setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  function handleKeyboardReorder(event: KeyboardEvent<HTMLLIElement>, index: number) {
    if (disabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (pickedIndex === null) {
        setPickedIndex(index);
        return;
      }
      if (pickedIndex === index) {
        setPickedIndex(null);
        return;
      }
      if (moveStep(pickedIndex, index)) {
        setPickedIndex(index);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setPickedIndex(null);
      return;
    }

    if (pickedIndex !== null && pickedIndex !== index) return;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (pickedIndex !== null) {
        if (moveStep(pickedIndex, pickedIndex - 1)) {
          setPickedIndex(pickedIndex - 1);
          focusItem(pickedIndex - 1);
        }
      } else if (index > 0) {
        focusItem(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (pickedIndex !== null) {
        if (moveStep(pickedIndex, pickedIndex + 1)) {
          setPickedIndex(pickedIndex + 1);
          focusItem(pickedIndex + 1);
        }
      } else if (index < orderedSteps.length - 1) {
        focusItem(index + 1);
      }
    }
  }

  function handleVerify() {
    if (!correctOrder) {
      setChecked(true);
      setFeedback('Ordre enregistré. Valide l’unité pour obtenir ton score officiel.');
      onTouched();
      return;
    }
    const score = scoreOrder(order, correctOrder);
    setChecked(true);
    if (score === 100) {
      setFeedback('Parfait ! Tu as trouvé le bon enchaînement.');
    } else if (score >= 66) {
      setFeedback(`Presque : ${score}% des positions sont correctes. Ajuste encore quelques étapes.`);
    } else {
      setFeedback(`Continue : ${score}% seulement. Reprends la logique du scénario.`);
    }
    onTouched();
  }

  const panelStyle = { '--quiz-accent': trackVisual.color } as CSSProperties;
  const instructionsId = 'mini-game-keyboard-help';

  return (
    <section className="mini-game-panel" aria-label="Mini-scénario interactif" style={panelStyle}>
      <header className="mini-game-header" style={{ background: trackVisual.gradient }}>
        <div className="mini-game-header-inner">
          <div className="mini-game-brand">
            {trackVisual.brand ? (
              <BrandIcon brand={trackVisual.brand} size="sm" variant="onColor" />
            ) : (
              <span aria-hidden className="mini-game-emoji">
                {'\u{1F9E9}'}
              </span>
            )}
            <div>
              <p className="mini-game-eyebrow">{labelForGameType(game.type)}</p>
              <h3 className="mini-game-title">Ordonne les étapes</h3>
            </div>
          </div>
          {localScore !== null && (
            <Badge
              tone={allCorrect ? 'success' : 'warning'}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            >
              {localScore}%
            </Badge>
          )}
        </div>
      </header>

      <div className="mini-game-body">
        <p className="mini-game-scenario">{game.scenario}</p>
        <p className="mini-game-hint">{hintForGameType(game.type)}</p>
        <p id={instructionsId} className="mini-game-a11y-instructions">
          {KEYBOARD_INSTRUCTIONS}
        </p>

        <ol
          ref={listRef}
          className="mini-game-steps"
          aria-label="Étapes à ordonner"
          aria-describedby={instructionsId}
        >
          {orderedSteps.map((step, index) => {
            const positionCorrect =
              checked && correctOrder ? correctOrder[index] === step.id : null;
            const isPicked = pickedIndex === index;
            const stepLabel = `Étape ${index + 1} sur ${orderedSteps.length} : ${step.label}`;

            return (
              <li
                key={step.id}
                className={[
                  'mini-game-step',
                  dragIndex === index ? 'mini-game-step-dragging' : '',
                  isPicked ? 'mini-game-step-picked' : '',
                  positionCorrect === true ? 'mini-game-step-correct' : '',
                  positionCorrect === false ? 'mini-game-step-incorrect' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                draggable={!disabled}
                tabIndex={disabled ? -1 : 0}
                aria-label={stepLabel}
                aria-selected={isPicked}
                aria-grabbed={isPicked}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDragEnd={handleDragEnd}
                onKeyDown={(event) => handleKeyboardReorder(event, index)}
              >
                <span className="mini-game-step-rank" aria-hidden>
                  {index + 1}
                </span>
                <span className="mini-game-step-grip" aria-hidden>
                  ⋮⋮
                </span>
                <span className="mini-game-step-label">{step.label}</span>
                <span className="mini-game-step-actions" aria-label={`Actions pour l’étape ${index + 1}`}>
                  <button
                    type="button"
                    className="mini-game-step-btn"
                    disabled={disabled || index === 0}
                    onClick={() => moveStep(index, index - 1)}
                    aria-label={`Monter l’étape ${index + 1}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="mini-game-step-btn"
                    disabled={disabled || index === order.length - 1}
                    onClick={() => moveStep(index, index + 1)}
                    aria-label={`Descendre l’étape ${index + 1}`}
                  >
                    ↓
                  </button>
                </span>
                {isPicked && (
                  <span className="mini-game-step-picked-label" aria-live="polite">
                    Sélectionnée
                  </span>
                )}
                {positionCorrect === true && (
                  <span className="mini-game-step-icon mini-game-step-icon-ok" aria-label="Position correcte">
                    ✓
                  </span>
                )}
                {positionCorrect === false && (
                  <span className="mini-game-step-icon mini-game-step-icon-ko" aria-label="Position incorrecte">
                    ✗
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {pickedIndex !== null && (
          <p className="mini-game-live-status" role="status" aria-live="polite">
            Étape {pickedIndex + 1} sélectionnée — utilise les flèches pour la déplacer, Espace pour la déposer,
            Échap pour annuler.
          </p>
        )}

        <div className="mini-game-actions">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              setPickedIndex(null);
              applyOrder([...order].reverse());
            }}
          >
            Inverser l’ordre
          </Button>
          <Button type="button" size="sm" disabled={disabled} onClick={handleVerify}>
            Vérifier mon ordre
          </Button>
        </div>

        {feedback && (
          <p
            className={`mini-game-feedback ${allCorrect ? 'mini-game-feedback-success' : ''}`}
            role="status"
          >
            {feedback}
          </p>
        )}
      </div>
    </section>
  );
}

export function shuffleGameOrder(stepIds: number[]): number[] {
  if (stepIds.length < 2) return [...stepIds];
  let next = [...stepIds];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    next = [...stepIds];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    const isShuffled = next.some((id, index) => id !== stepIds[index]);
    if (isShuffled) return next;
  }
  return [...stepIds].reverse();
}
