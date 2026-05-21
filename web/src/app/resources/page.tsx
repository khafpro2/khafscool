'use client';

import { useMemo, useState } from 'react';
import type { BrandId } from '@/lib/brands';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getTrackVisual } from '@/lib/design';

type ResourceTrack = 'APPLE' | 'JAMF' | 'INTUNE';

type OfficialResource = {
  label: string;
  url: string;
  description: string;
};

type TrackSection = {
  id: ResourceTrack;
  brand: BrandId;
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
    brand: 'apple',
    label: 'Apple Device Support & MDM',
    focus: 'Support des appareils, sécurité, diagnostic et fondamentaux de gestion Apple pour flottes iOS et macOS.',
    certification: 'Référence officielle pour préparer Apple Device Support et valider les exigences MDM Apple.',
    courseHint: 'Relie ces lectures aux unités Device Support et MDM du parcours Apple.',
    courseHref: '/courses/apple-cert-prep?track=APPLE',
    resources: [
      {
        label: 'Apple Training & Certifications',
        url: 'https://training.apple.com',
        description: 'Portail officiel Apple pour les formations, objectifs d’examen et certifications.',
      },
      {
        label: 'Guide de déploiement Apple (Platform Deployment)',
        url: 'https://support.apple.com/guide/deployment/welcome/web',
        description: 'Documentation Apple sur l’enrôlement, ABM/ASM, supervision et politiques MDM.',
      },
      {
        label: 'Documentation Device Management (Apple Developer)',
        url: 'https://developer.apple.com/documentation/devicemanagement',
        description: 'Référence technique MDM : profils, commandes, restrictions et protocoles Apple.',
      },
    ],
  },
  {
    id: 'JAMF',
    brand: 'jamf',
    label: 'Jamf Pro',
    focus: 'Administration Jamf Pro, inventaire, smart groups, politiques et bonnes pratiques MDM en entreprise.',
    certification: 'À consulter avant les révisions Jamf Pro et les exercices de configuration.',
    courseHint: 'Relie ces lectures aux unités Jamf Pro Foundations et aux quêtes de pratique.',
    courseHref: '/courses/jamf-pro-foundations?track=JAMF',
    resources: [
      {
        label: 'Jamf Learning Hub',
        url: 'https://learn.jamf.com',
        description: 'Cours, parcours et contenus de formation officiels publiés par Jamf.',
      },
      {
        label: 'Documentation Jamf Pro',
        url: 'https://docs.jamf.com',
        description: 'Guides administrateur Jamf Pro : enrôlement, politiques, inventaire et dépannage.',
      },
    ],
  },
  {
    id: 'INTUNE',
    brand: 'microsoft',
    label: 'Microsoft Intune',
    focus: 'Enrôlement Apple via Intune, conformité, profils et gestion des appareils avec Microsoft Endpoint Manager.',
    certification: 'À utiliser pour valider les détails Microsoft Learn et les prérequis de conformité.',
    courseHint: 'Relie ces lectures aux unités Microsoft Intune et aux sprints de révision.',
    courseHref: '/courses/intune-ios-enrollment?track=INTUNE',
    resources: [
      {
        label: 'Microsoft Learn — Intune',
        url: 'https://learn.microsoft.com/mem/intune/',
        description: 'Documentation officielle Microsoft pour Intune et Microsoft Endpoint Manager.',
      },
      {
        label: 'Enrôlement Apple avec Intune (ADE / ABM)',
        url: 'https://learn.microsoft.com/mem/intune/enrollment/apple-enrollment-program',
        description: 'Guide Microsoft pour configurer l’enrôlement automatisé des appareils Apple.',
      },
    ],
  },
];

const TRACK_FILTERS: Array<{ label: string; value: ResourceTrack | 'ALL' }> = [
  { label: 'Toutes', value: 'ALL' },
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
    <section className="resources-page" style={{ padding: '1rem 0 2rem' }}>
      <div className="hero" style={{ background: RESOURCES_GRADIENT, marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F4DA}'}</span> MDM Academy Pro · Sources de référence
        </span>
        <h1>Ressources officielles Apple, Jamf et Intune</h1>
        <p style={{ marginTop: '0.85rem', maxWidth: 680 }}>
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

      <Card variant="soft" className="resources-notice" style={{ marginTop: '1.5rem' }}>
        <Badge tone="outline" icon="\u26A0\uFE0F">
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
          className="resources-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Apple MDM, Jamf Pro, Intune, conformité…"
        />
        <p className="resources-filter-label">Filtrer par piste</p>
        <div className="chip-row" style={{ marginTop: '0.65rem' }} role="group" aria-label="Filtrer les ressources par piste">
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
        <div className="resources-grid">
          {visibleSections.map((section) => (
            <ResourceSectionCard key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <Card style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="muted">
            Aucune ressource ne correspond à ce filtre. Essaie une autre piste ou un mot-clé plus large.
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
    <Card className="resource-section-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <BrandIcon brand={section.brand} size="md" />
        <Badge tone="outline">{formatTrack(section.id)}</Badge>
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.75rem' }}>{section.label}</h2>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        {section.focus}
      </p>

      <div className="resource-meta-grid">
        <Card variant="flat" as="div" className="resource-meta-card">
          <strong>Certification</strong>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {section.certification}
          </p>
        </Card>
        <Card variant="flat" as="div" className="resource-meta-card">
          <strong>Parcours lié</strong>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {section.courseHint}
          </p>
        </Card>
      </div>

      <ul className="resource-link-list">
        {section.resources.map((resource) => (
          <li key={resource.url} className="resource-link-item">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <BrandIcon brand={section.brand} size="sm" />
              <div style={{ minWidth: 0 }}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-external-link"
                  style={{ color: visual.color }}
                >
                  {resource.label} ↗
                </a>
                <p className="muted" style={{ marginTop: '0.35rem' }}>
                  {resource.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Button href={section.courseHref} variant="secondary" style={{ marginTop: '1rem' }}>
        Ouvrir le parcours {formatTrack(section.id)}
      </Button>
    </Card>
  );
}
