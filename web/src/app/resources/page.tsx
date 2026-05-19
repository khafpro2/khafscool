'use client';

import { useMemo, useState } from 'react';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { getTrackVisual } from '@/lib/design';

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
  courseHref: string;
  resources: OfficialResource[];
};

const TRACK_SECTIONS: TrackSection[] = [
  {
    id: 'APPLE',
    label: 'Apple Device Support',
    focus: 'Support des appareils, sécurité, diagnostic et fondamentaux de gestion Apple.',
    certification: 'À utiliser comme source de vérité pour préparer les objectifs Apple.',
    courseHint: 'Relie ces lectures aux modules Device Support et MDM du parcours Apple.',
    courseHref: '/courses/apple-cert-prep',
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
    courseHref: '/courses/jamf-pro-foundations',
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
    courseHref: '/courses',
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
  ...TRACK_SECTIONS.map((section) => ({ label: formatTrack(section.id), value: section.id })),
];

const RESOURCES_GRADIENT = getTrackVisual('RESOURCES').gradient;

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
    <section style={{ padding: '1rem 0 2rem' }}>
      <div className="hero" style={{ background: RESOURCES_GRADIENT, marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F4DA}'}</span> Sources de référence
        </span>
        <h1>Ressources officielles</h1>
        <p style={{ marginTop: '0.85rem' }}>
          Les contenus pédagogiques de cette plateforme sont des synthèses, quiz et exercices originaux.
          Utilise les sources officielles pour vérifier les informations à jour avant un examen, un sprint
          de révision ou une décision de conformité.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/sprint" variant="secondary" size="lg">
            Préparer un sprint
          </Button>
          <Button href="/courses" variant="ghost" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Voir les parcours
          </Button>
        </div>
      </div>

      <Card
        variant="soft"
        style={{
          marginTop: '1.5rem',
          background: 'linear-gradient(135deg, #fff8e6 0%, #ffffff 100%)',
          borderColor: '#f0cf7a',
        }}
      >
        <Badge tone="warning" icon="\u26A0\uFE0F">
          Note de conformité
        </Badge>
        <p className="muted" style={{ marginTop: '0.65rem' }}>
          Apple MDM Academy n’est pas affilié à Apple, Jamf ou Microsoft. Les parcours internes restent du
          contenu original : ils orientent la pratique, mais les exigences officielles doivent être confirmées
          sur les sites des éditeurs.
        </p>
      </Card>

      <Card style={{ marginTop: '1rem' }}>
        <label htmlFor="resources-search" style={{ display: 'block', fontWeight: 800 }}>
          Rechercher une ressource
        </label>
        <input
          id="resources-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Apple, Jamf, Intune, conformité…"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            font: 'inherit',
            marginTop: '0.6rem',
            padding: '0.75rem 0.9rem',
            width: '100%',
          }}
        />
        <p
          className="muted"
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            marginTop: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Filtrer par piste
        </p>
        <div className="chip-row" style={{ marginTop: '0.65rem' }}>
          {TRACK_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className="chip"
              aria-pressed={selectedTrack === filter.value}
              onClick={() => setSelectedTrack(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      {visibleSections.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {visibleSections.map((section) => (
            <ResourceSectionCard key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <Card style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="muted">
            Aucune ressource ne correspond à ce filtre. Essaie un autre track ou un mot-clé plus large.
          </p>
          <Button
            variant="secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setQuery('');
              setSelectedTrack('ALL');
            }}
          >
            Réinitialiser les filtres
          </Button>
        </Card>
      )}

      <Card variant="soft" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transformer les sources en pratique</h2>
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              Ouvre un parcours pour t’exercer, puis lance un sprint court quand tu veux mesurer ta préparation.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Button href="/courses">Voir les parcours</Button>
            <Button href="/sprint" variant="dark">
              Lancer un sprint
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

function ResourceSectionCard({ section }: { section: TrackSection }) {
  const visual = getTrackVisual(section.id);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <TrackIcon track={section.id} size="sm" />
        <Badge tone="outline">{formatTrack(section.id)}</Badge>
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.75rem' }}>{section.label}</h2>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        {section.focus}
      </p>

      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginTop: '1rem',
        }}
      >
        <Card variant="flat" as="div" style={{ background: '#f5f5f7', border: 'none' }}>
          <strong>Certification</strong>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {section.certification}
          </p>
        </Card>
        <Card variant="flat" as="div" style={{ background: '#f5f5f7', border: 'none' }}>
          <strong>Parcours lié</strong>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {section.courseHint}
          </p>
        </Card>
      </div>

      <ul style={{ display: 'grid', gap: '0.75rem', listStyle: 'none', marginTop: '1rem', padding: 0 }}>
        {section.resources.map((resource) => (
          <li key={resource.url} style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '1.05rem', fontWeight: 800, color: visual.color }}
            >
              {resource.label} ↗
            </a>
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              {resource.description}
            </p>
          </li>
        ))}
      </ul>

      <Button href={section.courseHref} variant="secondary" style={{ marginTop: '1rem' }}>
        Ouvrir le parcours {formatTrack(section.id)}
      </Button>
    </Card>
  );
}

