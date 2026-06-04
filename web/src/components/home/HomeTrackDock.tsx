'use client';

import {
  useCallback,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import Link from 'next/link';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { getTrackVisual } from '@/lib/design';
import { LEARNING_PATHS, type LearningPathMeta } from '@/lib/learningPaths';
import styles from './HomeTrackDock.module.css';

const TRACK_LABELS: Record<LearningPathMeta['track'], string> = {
  APPLE: 'Apple',
  JAMF: 'Jamf',
  INTUNE: 'Intune',
};

const TRACK_DESCRIPTIONS: Record<LearningPathMeta['track'], string> = {
  APPLE: 'Support Device, sauvegardes et bases MDM Apple.',
  JAMF: 'Smart groups, politiques et inventaire Jamf Pro.',
  INTUNE: 'Enrôlement iOS/iPadOS et conformité Microsoft Intune.',
};

export function HomeTrackDock() {
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLUListElement>) => {
    const { key } = event;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;

    const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % LEARNING_PATHS.length;
    } else if (key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + LEARNING_PATHS.length) % LEARNING_PATHS.length;
    } else if (key === 'Home') {
      nextIndex = 0;
    } else if (key === 'End') {
      nextIndex = LEARNING_PATHS.length - 1;
    }

    if (nextIndex === currentIndex) return;

    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  }, []);

  return (
    <div className={styles.dockShell}>
      <ul
        data-testid="home-track-dock"
        className="home-track-choices home-track-choices--dock"
        aria-label="Choix de piste MDM"
        onKeyDown={handleKeyDown}
      >
        {LEARNING_PATHS.map((path, index) => (
          <TrackChoiceLink
            key={path.slug}
            path={path}
            linkRef={(el) => {
              itemRefs.current[index] = el;
            }}
          />
        ))}
      </ul>
      <div className={styles.dockReflection} aria-hidden />
    </div>
  );
}

function TrackChoiceLink({
  path,
  linkRef,
}: {
  path: LearningPathMeta;
  linkRef: (el: HTMLAnchorElement | null) => void;
}) {
  const visual = getTrackVisual(path.track);
  const label = TRACK_LABELS[path.track];
  const description = TRACK_DESCRIPTIONS[path.track];

  return (
    <li>
      <Link
        ref={linkRef}
        href={path.href}
        className="home-track-choice"
        data-track={path.track.toLowerCase()}
        style={{ '--track-gradient': visual.gradient } as CSSProperties}
        aria-label={`Parcours ${label} — ${description}`}
      >
        <span className="home-track-choice-icon" aria-hidden>
          <BrandIcon brand={path.brand} size="lg" variant="onColor" />
        </span>
        <span className="home-track-choice-text">
          <span className="home-track-choice-label">{label}</span>
          <span className="home-track-choice-desc">{description}</span>
        </span>
      </Link>
    </li>
  );
}
