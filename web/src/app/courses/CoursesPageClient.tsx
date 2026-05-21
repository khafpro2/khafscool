'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseSummary } from '@/lib/api';
import { fetchCourses } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { formatTrack } from '@/lib/tracks';
import {
  formatLeaderboardTrackFilter,
  LEADERBOARD_TRACK_FILTERS,
  type LeaderboardTrackFilter,
} from '@/lib/leaderboard-tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LevelPill } from '@/components/ui/LevelPill';
import { TrailCard } from '@/components/ui/TrailCard';
import { inferLevelFromModules, type TrailLevel } from '@/lib/design';
import { getLearningPath, sortMvpCoursesFirst } from '@/lib/learningPaths';
import { TracksComparisonTable } from '@/components/courses/TracksComparisonTable';
import { TrailCardSkeleton } from '@/components/ui/Skeleton';

const LEVELS: ('TOUS' | TrailLevel)[] = ['TOUS', 'Débutant', 'Intermédiaire', 'Avancé'];

type CoursesPageClientProps = {
  initialTrack: LeaderboardTrackFilter;
};

export function CoursesPageClient({ initialTrack }: CoursesPageClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<LeaderboardTrackFilter>(initialTrack);
  const [selectedLevel, setSelectedLevel] = useState<'TOUS' | TrailLevel>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSelectedTrack(initialTrack);
  }, [initialTrack]);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));
    fetchCourses(token)
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const setTrackFilter = useCallback(
    (track: LeaderboardTrackFilter) => {
      setSelectedTrack(track);
      const query = track === 'TOUS' ? '' : `?track=${track}`;
      router.replace(`/courses${query}`, { scroll: false });
    },
    [router]
  );

  const resetFilters = useCallback(() => {
    setSelectedTrack('TOUS');
    setSelectedLevel('TOUS');
    setSearchQuery('');
    router.replace('/courses', { scroll: false });
  }, [router]);

  const enrichedCourses = useMemo(
    () =>
      courses.map((course) => ({
        course,
        level: inferLevelFromModules(course.totalModules),
      })),
    [courses]
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const sortedCourses = useMemo(
    () =>
      sortMvpCoursesFirst(enrichedCourses.map((e) => e.course)).map((course) => {
        const match = enrichedCourses.find((e) => e.course.slug === course.slug);
        return match ?? { course, level: inferLevelFromModules(course.totalModules) };
      }),
    [enrichedCourses]
  );

  const filteredCourses = useMemo(() => {
    return sortedCourses.filter(({ course, level }) => {
      if (selectedTrack !== 'TOUS' && course.track !== selectedTrack) return false;
      if (selectedLevel !== 'TOUS' && level !== selectedLevel) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        course.title,
        course.description ?? '',
        course.slug,
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
      <div className="hero" style={{ marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F4DA}'}</span> Catalogue · 100 % gratuit
        </span>
        <h1>Trois parcours pour devenir expert MDM Apple, Jamf et Intune.</h1>
        <p style={{ marginTop: '0.85rem' }}>
          Support Apple Device Support, administration Jamf Pro et enrôlement Microsoft Intune — 3 unités par
          piste, quiz et scénarios pratiques. Aucun abonnement requis.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Button href={hasToken ? '/dashboard' : '/auth'} variant="secondary" size="lg">
            {hasToken ? 'Voir mon tableau de bord' : 'Commencer gratuitement'}
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
        <label htmlFor="courses-search" className="courses-search-label">
          Rechercher
        </label>
        <input
          id="courses-search"
          type="search"
          role="searchbox"
          className="courses-search-input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Titre, description, slug ou piste (Apple, Jamf, Intune)…"
          aria-describedby="courses-search-hint"
          autoComplete="off"
        />
        <p id="courses-search-hint" className="sr-only">
          Filtre les parcours affichés par titre, description, identifiant ou piste.
        </p>
      </div>

      {!hasToken && (
        <Card variant="soft" className="notice-demo" style={{ marginTop: '1.5rem' }}>
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
        <TrackFilterRow selected={selectedTrack} onSelect={setTrackFilter} />
        <FilterRow
          label="Niveau"
          options={LEVELS}
          selected={selectedLevel}
          onSelect={(level) => setSelectedLevel(level as 'TOUS' | TrailLevel)}
          formatOption={(level) => (level === 'TOUS' ? 'Tous les niveaux' : level)}
        />

        {isLoading ? (
          <div
            className="grid grid-cards-lg"
            style={{ marginTop: '1.25rem' }}
            aria-busy="true"
            aria-label="Chargement du catalogue"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <TrailCardSkeleton key={index} />
            ))}
          </div>
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
              <Button variant="secondary" onClick={resetFilters}>
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

function TrackFilterRow({
  selected,
  onSelect,
}: {
  selected: LeaderboardTrackFilter;
  onSelect: (track: LeaderboardTrackFilter) => void;
}) {
  return (
    <div
      className="courses-track-filters"
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}
    >
      <span
        className="muted"
        style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Piste
      </span>
      <div className="chip-row" role="group" aria-label="Filtrer le catalogue par piste">
        {LEADERBOARD_TRACK_FILTERS.map((track) => (
          <button
            key={track}
            type="button"
            className="chip"
            aria-pressed={track === selected}
            onClick={() => onSelect(track)}
          >
            {formatLeaderboardTrackFilter(track)}
          </button>
        ))}
      </div>
    </div>
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
