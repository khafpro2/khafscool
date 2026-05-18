'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
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
type ScoreLevel = {
  label: string;
  color: string;
  background: string;
};
type TicketExample = {
  title: string;
  tag: string;
  description: string;
  ticket: TicketScorePayload;
};
type ScoreHistoryEntry = {
  id: string;
  score: number;
  level: string;
  summary: string;
  source: ScoreSource;
  createdAt: string;
};

const scoreHistoryStorageKey = 'ama_servicenow_score_history';

const ticketExamples: TicketExample[] = [
  {
    title: 'iPhone enrôlement Jamf/Intune',
    tag: 'Mobile',
    description: "L'utilisateur ne voit pas l'appareil dans l'inventaire après enrôlement.",
    ticket: {
      shortDescription: 'iPhone non visible après enrôlement Jamf/Intune',
      category: 'incident',
      priority: 'p2',
      resolutionNote:
        "Diagnostic réalisé sur l'enrôlement iOS: appareil présent dans Apple Business Manager mais profil MDM non appliqué. Cause identifiée: assignation MDM Jamf/Intune incorrecte. Solution appliquée avec réassignation, synchronisation du serveur, réenrôlement supervisé, vérification utilisateur et prévention documentée pour les prochains lots.",
    },
  },
  {
    title: 'Mac MDM bloqué',
    tag: 'macOS',
    description: 'Le Mac reste bloqué sur les commandes MDM en attente.',
    ticket: {
      shortDescription: 'Mac bloqué avec commandes MDM en attente',
      category: 'problem',
      priority: 'p3',
      resolutionNote:
        "Diagnostic MDM effectué depuis la console et le Mac: commandes en attente, inventaire obsolète et communication APNs instable. Cause confirmée côté réseau avec accès Apple Push filtré. Solution appliquée par ouverture des flux, renouvellement du profil MDM, exécution d'un recon et vérification utilisateur. Prévention ajoutée dans la checklist réseau.",
    },
  },
  {
    title: 'Profil Wi-Fi absent',
    tag: 'Réseau',
    description: "Le profil Wi-Fi d'entreprise ne descend pas sur un appareil géré.",
    ticket: {
      shortDescription: 'Profil Wi-Fi entreprise absent sur appareil géré',
      category: 'request',
      priority: 'p4',
      resolutionNote:
        "Diagnostic du scope MDM et des groupes dynamiques réalisé: l'appareil était conforme mais exclu du profil Wi-Fi. Cause identifiée: critère de smart group trop restrictif. Solution appliquée en corrigeant le ciblage, forçant la mise à jour de l'inventaire, vérifiant la connexion Wi-Fi avec l'utilisateur et documentant la prévention.",
    },
  },
];

export default function ServiceNowGamePage() {
  const [ticket, setTicket] = useState<TicketScorePayload>(initialTicket);
  const [result, setResult] = useState<TicketScoreResult | null>(null);
  const [source, setSource] = useState<ScoreSource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const scoreLevel = result ? getScoreLevel(result.score) : null;

  useEffect(() => {
    try {
      const storedHistory = window.localStorage.getItem(scoreHistoryStorageKey);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory) as ScoreHistoryEntry[]);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const token = getAccessToken();

    if (!token) {
      const localResult = scoreTicketLocally(ticket);
      applyScoreResult(localResult, 'demo');
      setMessage('Score local de démo: connecte-toi pour utiliser le scoring privé ServiceNow.');
      setIsSubmitting(false);
      return;
    }

    try {
      const apiResult = await scoreServiceNowTicket(token, ticket);
      applyScoreResult(apiResult, 'api');
      setMessage('Score calculé par le backend privé ServiceNow.');
    } catch {
      const localResult = scoreTicketLocally(ticket);
      applyScoreResult(localResult, 'demo');
      setMessage("API indisponible ou session expirée: score local de démo affiché.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateTicket(field: keyof TicketScorePayload, value: string) {
    setTicket((current) => ({ ...current, [field]: value }));
  }

  function fillExample(example: TicketExample) {
    setTicket(example.ticket);
    setResult(null);
    setSource(null);
    setMessage(`Exemple chargé: ${example.title}. Tu peux l'ajuster avant d'évaluer.`);
  }

  function applyScoreResult(scoreResult: TicketScoreResult, scoreSource: ScoreSource) {
    setResult(scoreResult);
    setSource(scoreSource);
    const historyEntry: ScoreHistoryEntry = {
      id: `${Date.now()}-${Math.round(scoreResult.score)}`,
      score: scoreResult.score,
      level: getScoreLevel(scoreResult.score).label,
      summary: ticket.shortDescription,
      source: scoreSource,
      createdAt: new Date().toISOString(),
    };

    setHistory((currentHistory) => {
      const nextHistory = [historyEntry, ...currentHistory].slice(0, 5);
      try {
        window.localStorage.setItem(scoreHistoryStorageKey, JSON.stringify(nextHistory));
      } catch {
        // L'historique reste disponible en mémoire si le stockage local est bloqué.
      }
      return nextHistory;
    });
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

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Scénarios prêts à tester</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.75rem',
          }}
        >
          {ticketExamples.map((example) => (
            <article className="card" key={example.title} style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <span style={pillStyle}>{example.tag}</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.6rem' }}>{example.title}</h3>
                <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>{example.description}</p>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() => fillExample(example)}
                style={{ justifySelf: 'start' }}
              >
                Remplir cet exemple
              </button>
            </article>
          ))}
        </div>
      </section>

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
            <>
              <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
                Lance l’évaluation pour obtenir un score, du feedback et des pistes d’amélioration.
              </p>
              {message && <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>{message}</p>}
            </>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                {source === 'api' ? 'Scoring backend privé' : 'Scoring local de démo'}
              </p>
              <div
                style={{
                  border: `1px solid ${scoreLevel?.color}`,
                  borderRadius: 16,
                  background: scoreLevel?.background,
                  marginTop: '0.75rem',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: scoreLevel?.color }}>
                    {result.score}%
                  </p>
                  <span style={{ ...pillStyle, color: scoreLevel?.color, borderColor: scoreLevel?.color }}>
                    {scoreLevel?.label}
                  </span>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 999, height: 10, marginTop: '0.85rem' }}>
                  <div
                    style={{
                      background: scoreLevel?.color,
                      borderRadius: 999,
                      height: '100%',
                      width: `${result.score}%`,
                    }}
                  />
                </div>
              </div>
              {message && (
                <p style={{ color: source === 'api' ? 'var(--muted)' : '#b00020', marginTop: '0.75rem' }}>
                  {message}
                </p>
              )}

              <ScoreList title="Points forts" items={result.feedback} />
              <ScoreList title="Prochaines améliorations" items={result.suggestions} emptyLabel="Aucune suggestion: ticket solide." />
            </div>
          )}

          <ScoreHistory history={history} />

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

function ScoreHistory({ history }: { history: ScoreHistoryEntry[] }) {
  return (
    <section style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Historique local</h3>
      {history.length > 0 ? (
        <ol style={{ display: 'grid', gap: '0.65rem', marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
          {history.map((entry) => (
            <li key={entry.id}>
              <strong>
                {entry.score}% - {entry.level}
              </strong>
              <p style={{ color: 'var(--muted)', marginTop: '0.15rem' }}>
                {entry.summary} · {entry.source === 'api' ? 'backend' : 'démo locale'} ·{' '}
                {new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(entry.createdAt))}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Les 5 derniers scores seront conservés dans ce navigateur.
        </p>
      )}
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

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 85) {
    return { label: 'Prêt à clôturer', color: '#0f7a3b', background: '#ecfdf3' };
  }
  if (score >= 65) {
    return { label: 'À consolider', color: '#946200', background: '#fff8e6' };
  }
  return { label: 'À retravailler', color: '#b00020', background: '#fff1f3' };
}

const pillStyle = {
  border: '1px solid var(--border)',
  borderRadius: 999,
  color: 'var(--muted)',
  display: 'inline-block',
  fontSize: '0.8rem',
  fontWeight: 700,
  padding: '0.2rem 0.55rem',
};

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
