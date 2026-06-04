import { useEffect } from 'react';
import { Platform } from 'react-native';
import { resolveQuizOptionIndexFromKey } from '@ama/shared/quiz-learning';

type UseQuizLetterKeysOptions = {
  enabled: boolean;
  revealed: boolean;
  disabled?: boolean;
  options: readonly { id: string }[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  onCheck: () => void;
};

/** Raccourcis A–D sur web (Expo) ; clavier matériel iPad via le même flux navigateur. */
export function useQuizLetterKeys({
  enabled,
  revealed,
  disabled = false,
  options,
  selectedOptionId,
  onSelect,
  onCheck,
}: UseQuizLetterKeysOptions) {
  const canValidate = Boolean(selectedOptionId) && !revealed && !disabled;

  useEffect(() => {
    if (!enabled || Platform.OS !== 'web' || typeof window === 'undefined') return;

    function onKeyDown(event: KeyboardEvent) {
      if (revealed || disabled) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      const letterIndex = resolveQuizOptionIndexFromKey(event.key, options.length);
      if (letterIndex == null) return;

      event.preventDefault();
      const option = options[letterIndex];
      if (!option) return;

      if (selectedOptionId === option.id && canValidate) {
        onCheck();
        return;
      }
      onSelect(option.id);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    canValidate,
    disabled,
    enabled,
    onCheck,
    onSelect,
    options,
    revealed,
    selectedOptionId,
  ]);
}
