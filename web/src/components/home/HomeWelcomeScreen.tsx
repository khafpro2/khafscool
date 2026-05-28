'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { HeroMacbookVisual } from '@/components/home/HeroMacbookVisual';
import { getTrackVisual } from '@/lib/design';
import { LEARNING_PATHS, type LearningPathMeta } from '@/lib/learningPaths';

const HELLO = 'Hello';

const TRACK_LABELS: Record<LearningPathMeta['track'], string> = {
  APPLE: 'Apple',
  JAMF: 'Jamf',
  INTUNE: 'Intune',
};

export function HomeWelcomeScreen() {
  return (
    <section className="home-welcome" aria-labelledby="home-hello-title">
      <HeroMacbookVisual />
      <h1 id="home-hello-title" className="home-hello-title">
        {HELLO.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="home-hello-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
            aria-hidden
          >
            {char}
          </span>
        ))}
        <span className="sr-only">Hello</span>
      </h1>

      <p className="home-welcome-tagline">Je veux apprendre</p>

      <ul className="home-track-choices" aria-label="Choix de piste MDM">
        {LEARNING_PATHS.map((path, index) => (
          <TrackChoiceLink key={path.slug} path={path} index={index} />
        ))}
      </ul>
    </section>
  );
}

function TrackChoiceLink({ path, index }: { path: LearningPathMeta; index: number }) {
  const visual = getTrackVisual(path.track);
  const label = TRACK_LABELS[path.track];

  return (
    <li>
      <Link
        href={path.href}
        className="home-track-choice"
        data-track={path.track.toLowerCase()}
      style={
        {
          '--track-gradient': visual.gradient,
          animationDelay: `${0.35 + index * 0.12}s`,
        } as CSSProperties
      }
      aria-label={`Parcours ${label} — commencer`}
    >
      <span className="home-track-choice-icon" aria-hidden>
        <BrandIcon brand={path.brand} size="lg" variant="onColor" />
      </span>
        <span className="home-track-choice-label">{label}</span>
      </Link>
    </li>
  );
}
