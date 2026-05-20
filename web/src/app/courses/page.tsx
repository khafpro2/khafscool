'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CourseSummary } from '@/lib/api';
import { fetchCourses } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LevelPill } from '@/components/ui/LevelPill';
import { TrailCard } from '@/components/ui/TrailCard';
import { inferLevelFromModules, type TrailLevel } from '@/lib/design';
import { getLearningPath, sortMvpCoursesFirst } from '@/lib/learningPaths';
import { TracksComparisonTable } from '@/components/courses/TracksComparisonTable';

const LEVELS: ('TOUS' | TrailLevel)[] = ['TOUS', 'Débutant', 'Intermédiaire', 'Avancé'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('TOUS');
  const [selectedLevel, setSelectedLevel] = useState<'TOUS' | TrailLevel>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    fetchCourses(token)
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const tracks = useMemo(
    () => ['TOUS', ...Array.from(new Set(courses.map((course) => course.track))).sort()],
    [courses]
  );

  const enrichedCourses = useMemo(
    () =>
      courses.map((course) => ({
        course,
        level: inferLevelFromModules(course.totalModules),
      })),
    [courses]
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const sortedCourses = useMemo(() => sortMvpCoursesFirst(enrichedCourses.map((e) => e.course)).map((course) => {
    const match = enrichedCourses.find((e) => e.course.slug === course.slug);
    return match ?? { course, level: inferLevelFromModules(course.totalModules) };
  }), [enrichedCourses]);

  const filteredCourses = useMemo(() => {
    return sortedCourses.filter(({ course, level }) => {
      if (selectedTrack !== 'TOUS' && course.track !== selectedTrack) return false;
      if (selectedLevel !== 'TOUS' && level !== selectedLevel) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        course.title,
        course.description ?? '',
        formatTrack(course.track),
        course.track,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [sortedCourses, normalizedSearch, selectedTrack, selectedLevel]);

  const moduleCount = courses.reduce((total, course) => total + (course.totalModules ?? 0), 0);
  const inProgressCount = courses.filter(
    (course) => (course.progressPercent ?? 0) > 0 && (course.progressPercent ?? 0) < 100
  ).length;

  return (
    <section style={{ padding: '1rem 0' }}>
      <div
        className="hero"
        style={{
          background: 'linear-gradient(135deg, #032d60 0%, #0070d2 55%, #16cdf1 100%)',
          marginTop: 0,
        }}
      >
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F4DA}'}</span> Catalogue MDM Academy
        </span>
        <h1>Trois parcours pour devenir expert MDM Apple, Jamf et Intune.</h1>
        <p style={{ marginTop: '0.85rem' }}>
          Support Apple Device Support, administration Jamf Pro et enrôlement Microsoft Intune — 3 unités par
          piste, quiz et scénarios pratiques.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Button href={hasToken ? '/dashboard' : '/auth'} variant="secondary" size="lg">
            {hasToken ? 'Voir mon tableau de bord' : 'Créer un compte'}
          </Button>
          <Button href="/sprint" size="lg" variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Lancer un sprint
          </Button>
        </div>
        <div
          style={{
            marginTop: '1.75rem',
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          }}
        >
          <CatalogHeroStat label="Parcours" value={String(Math.max(courses.length, 0))} />
          <CatalogHeroStat label="Unités cumulées" value={moduleCount ? String(moduleCount) : 'Démo'} />
          <CatalogHeroStat label="En cours" value={String(inProgressCount)} />
          <CatalogHeroStat label="Accès" value={hasToken ? 'Connecté' : 'Public'} />
        </div>
        <label
          htmlFor="courses-search"
          style={{
            display: 'block',
            marginTop: '1.25rem',
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            opacity: 0.9,
          }}
        >
          Rechercher
        </label>
        <input
          id="courses-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Titre, description ou piste (Apple, Jamf, Intune)…"
          style={{
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.14)',
            color: '#fff',
            font: 'inherit',
            marginTop: '0.5rem',
            padding: '0.85rem 1rem',
            width: '100%',
            maxWidth: 520,
          }}
        />
      </div>

      {!hasToken && (
        <Card
          variant="soft"
          style={{
            marginTop: '1.5rem',
            borderColor: '#f0cf7a',
            background: 'linear-gradient(135deg, #fff8e6 0%, #ffffff 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <strong>Mode public</strong>
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                Tu peux explorer le catalogue sans compte. Connecte-toi pour reprendre une unité, sauvegarder
                tes scores et alimenter ton sprint de certification.
              </p>
            </div>
            <Button href="/auth" size="sm">
              Se connecter
            </Button>
          </div>
        </Card>
      )}

      <TracksComparisonTable />

      <div className="section" style={{ marginTop: '2rem' }}>
        <FilterRow
          label="Piste"
          options={tracks}
          selected={selectedTrack}
          onSelect={setSelectedTrack}
          formatOption={(track) => (track === 'TOUS' ? 'Toutes les pistes' : formatTrack(track))}
        />
        <FilterRow
          label="Niveau"
          options={LEVELS}
          selected={selectedLevel}
          onSelect={(level) => setSelectedLevel(level as 'TOUS' | TrailLevel)}
          formatOption={(level) => (level === 'TOUS' ? 'Tous les niveaux' : level)}
        />

        {isLoading ? (
          <p className="muted" style={{ marginTop: '1.5rem' }}>
            Chargement des parcours...
          </p>
        ) : filteredCourses.length === 0 ? (
          <Card style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {normalizedSearch ? 'Aucun parcours ne correspond' : 'Aucun parcours ne correspond aux filtres'}
            </h2>
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              {normalizedSearch
                ? 'Essaie un autre mot-clé ou réinitialise la recherche et les filtres.'
                : 'Réinitialise les filtres ou explore un autre niveau pour découvrir le catalogue complet.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedTrack('TOUS');
                  setSelectedLevel('TOUS');
                  setSearchQuery('');
                }}
              >
                Réinitialiser
              </Button>
              <Button href="/sprint" variant="ghost">
                Lancer un sprint
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cards-lg" style={{ marginTop: '1.25rem' }}>
            {filteredCourses.map(({ course, level }) => (
              <TrailCard
                key={course.slug}
                href={`/courses/${course.slug}${course.nextModule ? `#module-${course.nextModule.slug}` : ''}`}
                title={course.title}
                description={course.description}
                track={course.track}
                trackLabel={formatTrack(course.track)}
                totalModules={course.totalModules}
                completedModules={course.completedModules}
                progressPercent={course.progressPercent}
                level={level}
                recommended={getLearningPath(course.slug)?.recommended}
              />
            ))}
          </div>
        )}
      </div>

      <Card variant="soft" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tu hésites ? Démarre par un sprint</h2>
            <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 600 }}>
              Sept ou quatorze jours, un objectif clair par piste : laisse-toi guider et reçois ton badge à la fin.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
              <Badge tone="success" icon="\u{1F3C1}">7 jours</Badge>
              <Badge tone="success" icon="\u{1F3C1}">14 jours</Badge>
              <LevelPill level="Intermédiaire" />
            </div>
          </div>
          <Button href="/sprint" size="lg">
            Lancer un sprint
          </Button>
        </div>
      </Card>

      <p className="muted" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
        Le catalogue reste consultable en local si l’API <Link href="/diagnostics">backend</Link> est
        indisponible. Tes scores ne sont sauvegardés qu’en étant connecté.
      </p>
    </section>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onSelect,
  formatOption,
}: {
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  formatOption: (value: string) => string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div className="chip-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="chip"
            aria-pressed={option === selected}
            onClick={() => onSelect(option)}
          >
            {formatOption(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CatalogHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.24)',
        borderRadius: 12,
        padding: '0.75rem 0.95rem',
        color: '#fff',
      }}
    >
      <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.86 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.2rem' }}>{value}</p>
    </div>
  );
}
