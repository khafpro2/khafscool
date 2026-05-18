export type TicketScorePayload = {
  shortDescription?: string;
  category?: string;
  priority?: string;
  resolutionNote?: string;
};

export type TicketScoreResult = {
  score: number;
  feedback: string[];
  suggestions: string[];
};

const ACCEPTED_CATEGORIES = new Set(['incident', 'request', 'problem', 'change']);
const ACCEPTED_PRIORITIES = new Set(['p1', 'p2', 'p3', 'p4', '1', '2', '3', '4']);
const RESOLUTION_KEYWORDS = [
  'diagnostic',
  'cause',
  'résolu',
  'resolu',
  'solution',
  'vérifié',
  'verifie',
  'utilisateur',
  'impact',
  'prévention',
  'prevention',
];

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizePriority(value: string | undefined) {
  return normalize(value).replace(/^priority\s*/, 'p');
}

export function scoreServiceNowTicket(payload: TicketScorePayload): TicketScoreResult {
  const shortDescription = payload.shortDescription?.trim() ?? '';
  const category = normalize(payload.category);
  const priority = normalizePriority(payload.priority);
  const resolutionNote = payload.resolutionNote?.trim() ?? '';
  const normalizedNote = normalize(payload.resolutionNote);

  let score = 0;
  const feedback: string[] = [];
  const suggestions: string[] = [];

  if (shortDescription.length >= 12) {
    score += 20;
    feedback.push('La description courte donne un contexte exploitable.');
  } else {
    suggestions.push('Ajoute une description courte d’au moins 12 caractères avec le symptôme principal.');
  }

  if (ACCEPTED_CATEGORIES.has(category)) {
    score += 15;
    feedback.push('La catégorie correspond à une famille ServiceNow attendue.');
  } else {
    suggestions.push('Choisis une catégorie claire: incident, request, problem ou change.');
  }

  if (ACCEPTED_PRIORITIES.has(priority)) {
    score += 15;
    feedback.push('La priorité est renseignée dans un format cohérent.');
  } else {
    suggestions.push('Renseigne une priorité P1 à P4 selon impact et urgence.');
  }

  if (resolutionNote.length >= 80) {
    score += 20;
    feedback.push('La note de résolution est suffisamment détaillée.');
  } else {
    suggestions.push('Développe la note de résolution: diagnostic, action réalisée et validation.');
  }

  const matchedKeywords = RESOLUTION_KEYWORDS.filter((keyword) => normalizedNote.includes(keyword));
  score += Math.min(30, matchedKeywords.length * 6);

  if (matchedKeywords.length >= 3) {
    feedback.push('La note couvre plusieurs éléments clés de clôture.');
  } else {
    suggestions.push('Mentionne au moins trois éléments: diagnostic, cause, solution, vérification ou prévention.');
  }

  return {
    score: Math.min(100, score),
    feedback:
      feedback.length > 0
        ? feedback
        : ['Le ticket est encore trop incomplet pour être évalué comme prêt à clôturer.'],
    suggestions,
  };
}
