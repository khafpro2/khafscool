'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';

type KeyboardShortcutsHelpProps = {
  hasQuiz?: boolean;
  hasMinigame?: boolean;
};

const QUIZ_SHORTCUTS = [
  { keys: '↑ ↓ ou ← →', action: 'Parcourir les choix de réponse' },
  { keys: 'Entrée', action: 'Sélectionner une réponse ou valider' },
  { keys: 'Entrée (après correction)', action: 'Passer à la question suivante' },
];

const MINIGAME_SHORTCUTS = [
  { keys: 'Tab', action: 'Naviguer entre les étapes' },
  { keys: 'Espace', action: 'Sélectionner / déposer une étape' },
  { keys: '↑ ↓', action: 'Déplacer l’étape sélectionnée' },
  { keys: 'Échap', action: 'Annuler le déplacement en cours' },
];

export function KeyboardShortcutsHelp({ hasQuiz = true, hasMinigame = false }: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, open]);

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }
      if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, []);

  if (!hasQuiz && !hasMinigame) return null;

  return (
    <>
      <button
        type="button"
        className="keyboard-shortcuts-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Raccourcis <span aria-hidden>(?)</span>
      </button>

      {open ? (
        <div className="keyboard-shortcuts-overlay" role="presentation" onClick={close}>
          <div
            className="keyboard-shortcuts-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="keyboard-shortcuts-dialog__head">
              <h2 id={titleId} className="keyboard-shortcuts-dialog__title">
                Raccourcis clavier
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={close} aria-label="Fermer">
                Fermer
              </Button>
            </header>

            {hasQuiz ? (
              <section className="keyboard-shortcuts-section">
                <h3>Quiz</h3>
                <ul>
                  {QUIZ_SHORTCUTS.map((item) => (
                    <li key={item.keys}>
                      <kbd>{item.keys}</kbd>
                      <span>{item.action}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasMinigame ? (
              <section className="keyboard-shortcuts-section">
                <h3>Mini-scénario</h3>
                <ul>
                  {MINIGAME_SHORTCUTS.map((item) => (
                    <li key={item.keys}>
                      <kbd>{item.keys}</kbd>
                      <span>{item.action}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="keyboard-shortcuts-hint muted">
              Appuie sur <kbd>?</kbd> pour afficher ou masquer cette aide.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
