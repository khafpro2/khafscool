'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MDM_GLOSSARY, searchGlossary, type GlossaryTerm } from '@ama/shared/glossary';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getTrackVisual } from '@/lib/design';

const CATEGORY_TONES: Record<GlossaryTerm['category'], 'neutral' | 'outline' | 'success' | 'warning'> = {
  Apple: 'neutral',
  Jamf: 'warning',
  Intune: 'outline',
  MDM: 'success',
  Sécurité: 'outline',
};

const GLOSSARY_GRADIENT = getTrackVisual('RESOURCES').gradient;

export function GlossaryPageClient() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryTerm['category'] | 'ALL'>('ALL');

  const categories = useMemo(() => {
    return Array.from(new Set(MDM_GLOSSARY.map((entry) => entry.category))).sort();
  }, []);

  const visibleTerms = useMemo(() => {
    const searched = searchGlossary(query);
    if (selectedCategory === 'ALL') return searched;
    return searched.filter((entry) => entry.category === selectedCategory);
  }, [query, selectedCategory]);

  return (
    <section className="glossary-page" style={{ padding: '1rem 0 2rem' }}>
      <div className="hero" style={{ background: GLOSSARY_GRADIENT, marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F4D6}'}</span> MDM Academy Pro · Référence
        </span>
        <h1>Glossaire MDM Apple, Jamf et Intune</h1>
        <p style={{ marginTop: '0.85rem', maxWidth: 680 }}>
          {MDM_GLOSSARY.length} termes en français pour décrypter ABM, ADE, supervision, Smart Groups,
          conformité et les commandes MDM du quotidien.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/resources" variant="secondary" size="lg">
            Ressources officielles
          </Button>
          <Button href="/courses" variant="ghost" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Voir les parcours
          </Button>
        </div>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <label htmlFor="glossary-search" style={{ display: 'block', fontWeight: 800 }}>
          Rechercher un terme
        </label>
        <input
          id="glossary-search"
          type="search"
          className="resources-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="SCEP, wipe sélectif, VPP, Conditional Access…"
        />
        <p className="resources-filter-label">Filtrer par catégorie</p>
        <div className="chip-row" style={{ marginTop: '0.65rem' }} role="group" aria-label="Filtrer le glossaire par catégorie">
          <button
            type="button"
            className="chip"
            aria-pressed={selectedCategory === 'ALL'}
            onClick={() => setSelectedCategory('ALL')}
          >
            Toutes
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className="chip"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </Card>

      {visibleTerms.length > 0 ? (
        <div className="glossary-grid">
          {visibleTerms.map((entry) => (
            <GlossaryTermCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <Card style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="muted">Aucun terme ne correspond à cette recherche.</p>
          <Button
            variant="secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setQuery('');
              setSelectedCategory('ALL');
            }}
          >
            Réinitialiser
          </Button>
        </Card>
      )}

      <Card variant="soft" style={{ marginTop: '1.5rem' }}>
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          Retrouve ces concepts dans les leçons des parcours Apple, Jamf et Intune. Pour approfondir,
          consulte aussi les{' '}
          <Link href="/resources">ressources officielles</Link>.
        </p>
      </Card>
    </section>
  );
}

function GlossaryTermCard({ entry }: { entry: GlossaryTerm }) {
  return (
    <Card className="glossary-term-card" id={entry.id}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{entry.term}</h2>
        <Badge tone={CATEGORY_TONES[entry.category]}>{entry.category}</Badge>
      </div>
      <p style={{ marginTop: '0.65rem', lineHeight: 1.6 }}>{entry.definition}</p>
      {entry.related?.length ? (
        <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.85rem' }}>
          Voir aussi :{' '}
          {entry.related.map((relatedId, index) => {
            const related = MDM_GLOSSARY.find((item) => item.id === relatedId);
            if (!related) return null;
            return (
              <span key={relatedId}>
                {index > 0 ? ' · ' : ''}
                <a href={`#${relatedId}`}>{related.term.split('(')[0]?.trim() ?? related.term}</a>
              </span>
            );
          })}
        </p>
      ) : null}
    </Card>
  );
}
