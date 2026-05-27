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

/** Dérive un entier 32 bits à partir d’une chaîne (ordre stable par question). */
export function hashSeedString(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mélange Fisher-Yates déterministe (même ordre pour un même seed de session). */
export function shuffleWithSeed<T>(items: readonly T[], seed: string): T[] {
  const shuffled = [...items];
  let state = hashSeedString(seed);

  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

/** Mélange les options d’une question (les ids a–d restent liés aux libellés). */
export function shuffleQuizQuestionOptions<T extends { id: string }>(
  options: readonly T[],
  questionId: string
): T[] {
  if (options.length <= 1) return [...options];
  return shuffleWithSeed(options, questionId);
}

export function withShuffledQuizOptions<T extends { id: string; options: { id: string }[] }>(
  questions: readonly T[]
): T[] {
  return questions.map((question) => ({
    ...question,
    options: shuffleQuizQuestionOptions(question.options, question.id),
  }));
}

/** Lettre affichée (A–D) pour une option après mélange. */
export function getQuizOptionDisplayLetter(
  options: readonly { id: string }[],
  optionId: string
): string | undefined {
  const index = options.findIndex((option) => option.id === optionId);
  if (index < 0) return undefined;
  return String.fromCharCode(65 + index);
}
