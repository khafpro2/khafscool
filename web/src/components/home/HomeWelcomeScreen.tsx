'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { getTrackVisual } from '@/lib/design';
import { LEARNING_PATHS, type LearningPathMeta } from '@/lib/learningPaths';
import { IOSHelloIntro } from './IOSHelloIntro';

const TRACK_LABELS: Record<LearningPathMeta['track'], string> = {
  APPLE: 'Apple',
  JAMF: 'Jamf',
  INTUNE: 'Intune',
};

export function HomeWelcomeScreen() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {/* iOS 26 Liquid Glass Hello Intro */}
      {!introDone && (
        <IOSHelloIntro onDone={() => setIntroDone(true)} />
      )}

      {/* Main content */}
      <section
        className={`home-welcome ${introDone ? 'home-welcome--visible' : 'home-welcome--hidden'}`}
        aria-labelledby="home-hello-title"
      >
        {/* Apple-style cursive Hello */}
        <div className="apple-hello-wrapper" aria-hidden="true">
          <span className="apple-hello-text">Hello</span>
        </div>
        <h1 id="home-hello-title" className="sr-only">Hello</h1>

        <p className="home-welcome-tagline">Je veux apprendre</p>

        <ul className="home-track-choices" aria-label="Choix de piste MDM">
          {LEARNING_PATHS.map((path, index) => (
            <TrackChoiceLink key={path.slug} path={path} index={index} />
          ))}
        </ul>
      </section>
    </>
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
            animationDelay: `${1.4 + index * 0.12}s`,
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
