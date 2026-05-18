import { describe, expect, it } from 'vitest';

import { scoreServiceNowTicket } from '../src/services/servicenow-ticket-score.service.js';

describe('scoreServiceNowTicket', () => {
  it('awards a high score and positive feedback for a complete closure ticket', () => {
    const result = scoreServiceNowTicket({
      shortDescription: 'MacBook enrollment fails during ADE setup',
      category: 'incident',
      priority: 'Priority 2',
      resolutionNote:
        'Diagnostic réalisé avec l’utilisateur: la cause venait du profil MDM expiré. ' +
        'La solution a été de renouveler le profil, puis le démarrage a été vérifié. ' +
        'Impact documenté et prévention ajoutée pour éviter une récidive.',
    });

    expect(result.score).toBe(100);
    expect(result.suggestions).toEqual([]);
    expect(result.feedback).toEqual(
      expect.arrayContaining([
        'La description courte donne un contexte exploitable.',
        'La catégorie correspond à une famille ServiceNow attendue.',
        'La priorité est renseignée dans un format cohérent.',
        'La note de résolution est suffisamment détaillée.',
        'La note couvre plusieurs éléments clés de clôture.',
      ]),
    );
  });

  it('keeps an incomplete ticket low and returns actionable suggestions', () => {
    const result = scoreServiceNowTicket({
      shortDescription: 'Bug',
      category: 'other',
      priority: 'urgent',
      resolutionNote: 'Done.',
    });

    expect(result.score).toBe(0);
    expect(result.feedback).toEqual([
      'Le ticket est encore trop incomplet pour être évalué comme prêt à clôturer.',
    ]);
    expect(result.suggestions).toEqual(
      expect.arrayContaining([
        'Ajoute une description courte d’au moins 12 caractères avec le symptôme principal.',
        'Choisis une catégorie claire: incident, request, problem ou change.',
        'Renseigne une priorité P1 à P4 selon impact et urgence.',
        'Développe la note de résolution: diagnostic, action réalisée et validation.',
        'Mentionne au moins trois éléments: diagnostic, cause, solution, vérification ou prévention.',
      ]),
    );
  });
});
