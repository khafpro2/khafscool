'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import Link from 'next/link';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { getTrackVisual } from '@/lib/design';
import { LEARNING_PATHS, type LearningPathMeta } from '@/lib/learningPaths';

const TRACK_LABELS: Record<LearningPathMeta['track'], string> = {
  APPLE: 'Apple',
  JAMF: 'Jamf',
  INTUNE: 'Intune',
};

const DOCK_MAX_SCALE = 1.22;
const DOCK_INFLUENCE_RADIUS = 140;

type DockTransform = { scale: number; lift: number };

function dockScaleFromDistance(distance: number): number {
  if (distance >= DOCK_INFLUENCE_RADIUS) return 1;
  const t = 1 - distance / DOCK_INFLUENCE_RADIUS;
  const eased = t * t * (3 - 2 * t);
  return 1 + (DOCK_MAX_SCALE - 1) * eased;
}

function dockLiftFromScale(scale: number): number {
  return -Math.round((scale - 1) * 56);
}

function useDockMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');

    const update = () => {
      setEnabled(hover.matches && !reduced.matches);
    };

    update();
    reduced.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      reduced.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  return enabled;
}

export function HomeTrackDock() {
  const dockEnabled = useDockMotionEnabled();
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const [transforms, setTransforms] = useState<Array<DockTransform | null>>(() =>
    LEARNING_PATHS.map(() => null),
  );

  const applyPointer = useCallback(() => {
    frameRef.current = null;
    const point = pendingPointer.current;
    if (!point) return;

    const next = LEARNING_PATHS.map((_, index) => {
      const el = itemRefs.current[index];
      if (!el) return { scale: 1, lift: 0 };

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(point.x - centerX, point.y - centerY);
      const scale = dockScaleFromDistance(distance);
      return { scale, lift: dockLiftFromScale(scale) };
    });

    setTransforms(next);
  }, []);

  const schedulePointer = useCallback(
    (x: number, y: number) => {
      pendingPointer.current = { x, y };
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(applyPointer);
    },
    [applyPointer],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLUListElement>) => {
      if (!dockEnabled) return;
      schedulePointer(event.clientX, event.clientY);
    },
    [dockEnabled, schedulePointer],
  );

  const handleMouseLeave = useCallback(() => {
    pendingPointer.current = null;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setTransforms(LEARNING_PATHS.map(() => null));
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <ul
      className="home-track-choices home-track-choices--dock"
      aria-label="Choix de piste MDM"
      onMouseMove={dockEnabled ? handleMouseMove : undefined}
      onMouseLeave={dockEnabled ? handleMouseLeave : undefined}
    >
      {LEARNING_PATHS.map((path, index) => (
        <TrackChoiceLink
          key={path.slug}
          path={path}
          index={index}
          dockTransform={dockEnabled ? transforms[index] : null}
          linkRef={(el) => {
            itemRefs.current[index] = el;
          }}
        />
      ))}
    </ul>
  );
}

function TrackChoiceLink({
  path,
  index,
  dockTransform,
  linkRef,
}: {
  path: LearningPathMeta;
  index: number;
  dockTransform: DockTransform | null;
  linkRef: (el: HTMLAnchorElement | null) => void;
}) {
  const visual = getTrackVisual(path.track);
  const label = TRACK_LABELS[path.track];

  const dockStyle: CSSProperties | undefined = dockTransform
    ? {
        transform: `translateY(${dockTransform.lift}px) scale(${dockTransform.scale})`,
      }
    : undefined;

  return (
    <li>
      <Link
        ref={linkRef}
        href={path.href}
        className="home-track-choice"
        data-track={path.track.toLowerCase()}
        data-dock-active={dockTransform && dockTransform.scale > 1.01 ? '' : undefined}
        style={
          {
            '--track-gradient': visual.gradient,
            animationDelay: `${0.35 + index * 0.12}s`,
            ...dockStyle,
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
