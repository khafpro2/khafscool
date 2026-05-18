'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  scoreServiceNowTicket,
  type TicketScorePayload,
  type TicketScoreResult,
} from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

const initialTicket: TicketScorePayload = {
  shortDescription: 'MacBook ne reçoit plus les profils MDM',
  category: 'incident',
  priority: 'p3',
  resolutionNote:
    "Diagnostic MDM réalisé: l'appareil n'avait plus de connectivité APNs. Cause identifiée côté réseau, solution appliquée avec renouvellement de l'enrôlement, vérifié avec l'utilisateur et prévention documentée.",
};

type ScoreSource = 'api' | 'demo';

export default function ServiceNowGamePage() {
  const [ticket, setTicket] = useState<TicketScorePayload>(initialTicket);
  const [result, setResult] = useState<TicketScoreResult | null>(null);
  const [source, setSource] = useState<ScoreSource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const token = getAccessToken();

    if (!token) {
      setResult(scoreTicketLocally(ticket));
      setSource('demo');
      setMessage('Score local de démo: connecte-toi pour utiliser le scoring privé ServiceNow.');
      setIsSubmitting(false);
      return;
    }

    try {
      setResult(await scoreServiceNowTicket(token, ticket));
      setSource('api');
      setMessage('Score calculé par le backend privé ServiceNow.');
    } catch {
      setResult(scoreTicketLocally(ticket));
      setSource('demo');
      setMessage("API indisponible ou session expirée: score local de démo affiché.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateTicket(field: keyof TicketScorePayload, value: string) {
    setTicket((current) => ({ ...current, [field]: value }));
  }

  return (
    <section style={{ padding: '2rem 0' }}>
      <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Mini-jeu ServiceNow</p>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
        Prépare un ticket prêt à clôturer
      </h1>
      <p style={{ color: 'var(--muted)', marginTop: '0.75rem', maxWidth: 760 }}>
        Renseigne les champs clés d’un ticket puis compare ton score aux attentes d’un support Apple/MDM:
        contexte, catégorie, priorité et note de résolution exploitable.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
        <form className="card" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label style={labelStyle}>
            Description courte
            <input
              required
              value={ticket.shortDescription}
              onChange={(event) => updateTicket('shortDescription', event.target.value)}
              placeholder="Ex: MacBook ne reçoit plus les profils MDM"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Catégorie
            <select
              value={ticket.category}
              onChange={(event) => updateTicket('category', event.target.value)}
              style={inputStyle}
            >
              <option value="incident">Incident</option>
              <option value="request">Request</option>
              <option value="problem">Problem</option>
              <option value="change">Change</option>
              <option value="other">Autre</option>
            </select>
          </label>

          <label style={labelStyle}>
            Priorité
            <select
              value={ticket.priority}
              onChange={(event) => updateTicket('priority', event.target.value)}
              style={inputStyle}
            >
              <option value="p1">P1 - Critique</option>
              <option value="p2">P2 - Haute</option>
              <option value="p3">P3 - Moyenne</option>
              <option value="p4">P4 - Basse</option>
            </select>
          </label>

          <label style={labelStyle}>
            Note de résolution
            <textarea
              required
              rows={7}
              value={ticket.resolutionNote}
              onChange={(event) => updateTicket('resolutionNote', event.target.value)}
              placeholder="Décris diagnostic, cause, action, validation utilisateur et prévention."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Calcul en cours...' : 'Évaluer le ticket'}
          </button>
        </form>

        <aside className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Résultat</h2>
          {!result ? (
            <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
              Lance l’évaluation pour obtenir un score, du feedback et des pistes d’amélioration.
            </p>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                {source === 'api' ? 'Scoring backend privé' : 'Scoring local de démo'}
              </p>
              <p style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{result.score}%</p>
              {message && <p style={{ color: source === 'api' ? 'var(--muted)' : '#b00020', marginTop: '0.5rem' }}>{message}</p>}

              <ScoreList title="Feedback" items={result.feedback} />
              <ScoreList title="Suggestions" items={result.suggestions} emptyLabel="Aucune suggestion: ticket solide." />
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1rem' }}>
            <p style={{ color: 'var(--muted)' }}>
              Le scoring connecté utilise <code>POST /servicenow/ticket-score</code> avec le token local
              <code> ama_access</code>.
            </p>
            <Link href="/auth" style={{ display: 'inline-block', marginTop: '0.75rem', fontWeight: 600 }}>
              Se connecter pour le score privé
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ScoreList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel?: string;
}) {
  return (
    <section style={{ marginTop: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
      {items.length > 0 ? (
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', display: 'grid', gap: '0.35rem' }}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{emptyLabel}</p>
      )}
    </section>
  );
}

function scoreTicketLocally(payload: TicketScorePayload): TicketScoreResult {
  const shortDescription = payload.shortDescription.trim();
  const category = payload.category.trim().toLowerCase();
  const priority = payload.priority.trim().toLowerCase().replace(/^priority\s*/, 'p');
  const resolutionNote = payload.resolutionNote.trim();
  const normalizedNote = resolutionNote.toLowerCase();
  const acceptedCategories = new Set(['incident', 'request', 'problem', 'change']);
  const acceptedPriorities = new Set(['p1', 'p2', 'p3', 'p4', '1', '2', '3', '4']);
  const keywords = [
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

  let score = 0;
  const feedback: string[] = [];
  const suggestions: string[] = [];

  if (shortDescription.length >= 12) {
    score += 20;
    feedback.push('La description courte donne un contexte exploitable.');
  } else {
    suggestions.push('Ajoute une description courte d’au moins 12 caractères avec le symptôme principal.');
  }

  if (acceptedCategories.has(category)) {
    score += 15;
    feedback.push('La catégorie correspond à une famille ServiceNow attendue.');
  } else {
    suggestions.push('Choisis une catégorie claire: incident, request, problem ou change.');
  }

  if (acceptedPriorities.has(priority)) {
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

  const matchedKeywords = keywords.filter((keyword) => normalizedNote.includes(keyword));
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

const labelStyle = {
  display: 'grid',
  gap: '0.35rem',
  fontWeight: 600,
};

const inputStyle = {
  border: '1px solid var(--border)',
  borderRadius: 10,
  font: 'inherit',
  padding: '0.75rem 0.9rem',
};
