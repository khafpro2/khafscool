/** Métadonnées pédagogiques pour les types de questions du quiz. */
export type QuizQuestionTypeKey = 'SCENARIO' | 'TROUBLESHOOTING' | 'KNOWLEDGE';

export type QuizQuestionTypeMeta = {
  key: QuizQuestionTypeKey | 'OTHER';
  label: string;
  shortLabel: string;
  tip: string;
  icon: string;
};

const TYPE_META: Record<QuizQuestionTypeKey, QuizQuestionTypeMeta> = {
  SCENARIO: {
    key: 'SCENARIO',
    label: 'Mise en situation',
    shortLabel: 'Scénario',
    tip: 'Imagine le contexte terrain avant de choisir : qui appelle, quel symptôme, quelle contrainte MDM.',
    icon: '\u{1F3AF}',
  },
  TROUBLESHOOTING: {
    key: 'TROUBLESHOOTING',
    label: 'Dépannage',
    shortLabel: 'Triage',
    tip: 'Commence par les actions non destructives, puis escalade vers MDM ou restauration.',
    icon: '\u{1F527}',
  },
  KNOWLEDGE: {
    key: 'KNOWLEDGE',
    label: 'Concept clé',
    shortLabel: 'Savoir',
    tip: 'Relie la question aux objectifs de la leçon et au glossaire si un terme te bloque.',
    icon: '\u{1F4D6}',
  },
};

const DEFAULT_META: QuizQuestionTypeMeta = {
  key: 'OTHER',
  label: 'Question',
  shortLabel: 'Quiz',
  tip: 'Lis toute la question, élimine les réponses impossibles, puis valide.',
  icon: '\u{2753}',
};

export function getQuizQuestionTypeMeta(type: string | undefined | null): QuizQuestionTypeMeta {
  if (!type) return DEFAULT_META;
  const normalized = type.toUpperCase() as QuizQuestionTypeKey;
  return TYPE_META[normalized] ?? DEFAULT_META;
}

export type QuizAnswerCheck = {
  correct: boolean;
  explanation?: string;
  /** Identifiant de la bonne option (a–d), renvoyé après une erreur pour favoriser l’apprentissage. */
  correctOptionId?: string;
};

export function listIncorrectQuestionIds(
  questionIds: string[],
  results: Record<string, Pick<QuizAnswerCheck, 'correct'> | undefined>
): string[] {
  return questionIds.filter((id) => results[id] && results[id]?.correct === false);
}

export function truncateQuizPrompt(prompt: string, maxLength = 72): string {
  const trimmed = prompt.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}
