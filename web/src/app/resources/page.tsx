'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatTrack } from '@/lib/tracks';

type ResourceTrack = 'APPLE' | 'JAMF' | 'INTUNE';

type OfficialResource = {
  label: string;
  url: string;
  description: string;
};

type TrackSection = {
  id: ResourceTrack;
  label: string;
  focus: string;
  certification: string;
  courseHint: string;
  resources: OfficialResource[];
};

const TRACK_SECTIONS: TrackSection[] = [
  {
    id: 'APPLE',
    label: 'Apple Device Support',
    focus: 'Support des appareils, sécurité, diagnostic et fondamentaux de gestion Apple.',
    certification: 'À utiliser comme source de vérité pour préparer les objectifs Apple.',
    courseHint: 'Relie ces lectures aux modules Device Support et MDM du parcours Apple.',
    resources: [
      {
        label: 'Apple Training & Certifications',
        url: 'https://training.apple.com',
        description: 'Portail officiel Apple pour les formations, objectifs et certifications.',
      },
    ],
  },
  {
    id: 'JAMF',
    label: 'Jamf Pro',
    focus: 'Administration Jamf Pro, inventaire, smart groups, politiques et bonnes pratiques MDM.',
    certification: 'À consulter avant les révisions Jamf Pro et les exercices de configuration.',
    courseHint: 'Relie ces lectures aux modules Jamf Pro Foundations et aux quêtes de pratique.',
    resources: [
      {
        label: 'Jamf Learning Hub',
        url: 'https://learn.jamf.com',
        description: 'Documentation et contenus de formation officiels publiés par Jamf.',
      },
    ],
  },
  {
    id: 'INTUNE',
    label: 'Microsoft Intune',
    focus: 'Enrôlement, conformité, profils et gestion des appareils Apple avec Microsoft Intune.',
    certification: 'À utiliser pour valider les détails Microsoft Learn et les prérequis de conformité.',
    courseHint: 'Relie ces lectures aux modules Intune et aux sprints de révision Microsoft.',
    resources: [
      {
        label: 'Microsoft Learn - Intune',
        url: 'https://learn.microsoft.com/mem/intune/',
        description: 'Documentation officielle Microsoft pour Intune et Microsoft Endpoint Manager.',
      },
    ],
  },
];

const TRACK_FILTERS: Array<{ label: string; value: ResourceTrack | 'ALL' }> = [
  { label: 'Tous', value: 'ALL' },
  ...TRACK_SECTIONS.map((section) => ({ label: section.label, value: section.id })),
];

export default function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<ResourceTrack | 'ALL'>('ALL');

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return TRACK_SECTIONS.filter((section) => {
      if (selectedTrack !== 'ALL' && section.id !== selectedTrack) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        section.label,
        section.focus,
        section.certification,
        section.courseHint,
        ...section.resources.flatMap((resource) => [resource.label, resource.description, resource.url]),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query, selectedTrack]);

  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        style={{
          alignItems: 'end',
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
        }}
      >
        <div>
          <p style={{ color: 'var(--muted)', fontWeight: 800 }}>Sources de référence</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Ressources officielles
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem', maxWidth: 760 }}>
            Les contenus pédagogiques de cette plateforme sont des synthèses, quiz et exercices originaux.
            Utilise les sources officielles pour vérifier les informations à jour avant un examen, un sprint
            de révision ou une décision de conformité.
          </p>
        </div>
        <Link className="btn" href="/sprint" style={{ background: '#1d1d1f' }}>
          Préparer un sprint
        </Link>
      </div>

      <section
        className="card"
        style={{
          background: '#fff8e6',
          borderColor: '#f0cf7a',
          marginTop: '1.5rem',
        }}
      >
        <strong>Note de conformité</strong>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          Apple MDM Academy n’est pas affilié à Apple, Jamf ou Microsoft. Les parcours internes
          restent du contenu original: ils orientent la pratique, mais les exigences officielles doivent être
          confirmées sur les sites des éditeurs.
        </p>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <label htmlFor="resources-search" style={{ display: 'block', fontWeight: 800 }}>
          Rechercher une ressource
        </label>
        <input
          id="resources-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Apple, Jamf, Intune, conformité, ITSM..."
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            font: 'inherit',
            marginTop: '0.6rem',
            padding: '0.75rem 0.9rem',
            width: '100%',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
          {TRACK_FILTERS.map((filter) => {
            const isSelected = selectedTrack === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedTrack(filter.value)}
                style={{
                  background: isSelected ? 'var(--accent)' : '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  color: isSelected ? '#ffffff' : 'var(--fg)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  padding: '0.5rem 0.85rem',
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </section>

      {visibleSections.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {visibleSections.map((section) => (
            <article className="card" key={section.id}>
              <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800 }}>{formatTrack(section.id)}</p>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>{section.label}</h2>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{section.focus}</p>

              <div
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  marginTop: '1rem',
                }}
              >
                <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '1rem' }}>
                  <strong>Certification</strong>
                  <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>{section.certification}</p>
                </div>
                <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '1rem' }}>
                  <strong>Parcours lié</strong>
                  <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>{section.courseHint}</p>
                </div>
              </div>

              <ul style={{ display: 'grid', gap: '0.75rem', listStyle: 'none', marginTop: '1rem' }}>
                {section.resources.map((resource) => (
                  <li key={resource.url} style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '1.05rem', fontWeight: 800 }}
                    >
                      {resource.label} ↗
                    </a>
                    <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>{resource.description}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <p className="card" style={{ color: 'var(--muted)', marginTop: '1.5rem' }}>
          Aucune ressource ne correspond à ce filtre. Essaie un autre track ou un mot-clé plus large.
        </p>
      )}

      <section
        className="card"
        style={{
          alignItems: 'center',
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          marginTop: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transformer les sources en pratique</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
            Ouvre un parcours pour t’exercer, puis lance un sprint court quand tu veux mesurer ta préparation.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link className="btn" href="/courses">
            Voir les parcours
          </Link>
          <Link className="btn" href="/sprint" style={{ background: '#1d1d1f' }}>
            Lancer un sprint
          </Link>
        </div>
      </section>
    </section>
  );
}
