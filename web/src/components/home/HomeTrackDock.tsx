'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
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

const DOCK_MAX_SCALE = 1.22;
const DOCK_INFLUENCE_RADIUS = 140;
/** Extra genie suction on pointer down (0–1), layered on hover proximity. */
const GENIE_PRESS_BOOST = 0.72;
/** Softer press on touch — avoids stacking with :active keyframe on narrow viewports. */
const GENIE_PRESS_BOOST_TOUCH = 0.38;
/** Skip React updates when dock transforms are visually unchanged. */
const DOCK_TRANSFORM_EPS = 0.008;

type DockTransform = { scale: number; lift: number; genie: number };

type MotionPrefs = {
  dockEnabled: boolean;
  genieEnabled: boolean;
};

function dockScaleFromDistance(distance: number): number {
  if (distance >= DOCK_INFLUENCE_RADIUS) return 1;
  const t = 1 - distance / DOCK_INFLUENCE_RADIUS;
  const eased = t * t * (3 - 2 * t);
  return 1 + (DOCK_MAX_SCALE - 1) * eased;
}

function dockLiftFromScale(scale: number): number {
  return -Math.round((scale - 1) * 56);
}

/** Genie warp intensity from dock magnification (smoothstep 0→1). */
function genieFromDockScale(scale: number): number {
  if (scale <= 1.01) return 0;
  const t = (scale - 1) / (DOCK_MAX_SCALE - 1);
  return t * t * (3 - 2 * t);
}

function useMotionPrefs(): MotionPrefs {
  const [prefs, setPrefs] = useState<MotionPrefs>({
    dockEnabled: false,
    genieEnabled: false,
  });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');

    const update = () => {
      setPrefs({
        dockEnabled: hover.matches && !reduced.matches,
        genieEnabled: !reduced.matches,
      });
    };

    update();
    reduced.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      reduced.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  return prefs;
}

function dockTransformsEqual(
  a: Array<DockTransform | null>,
  b: Array<DockTransform | null>,
): boolean {
  if (a.length !== b.length) return false;
  return a.every((next, index) => {
    const prev = b[index];
    if (!next || !prev) return next === prev;
    return (
      Math.abs(next.scale - prev.scale) < DOCK_TRANSFORM_EPS &&
      Math.abs(next.lift - prev.lift) < DOCK_TRANSFORM_EPS &&
      Math.abs(next.genie - prev.genie) < DOCK_TRANSFORM_EPS
    );
  });
}

function buildDockTransformStyle(
  dock: DockTransform,
  pressBoost: number,
): CSSProperties {
  const genie = Math.min(1, dock.genie + pressBoost);
  const { scale, lift } = dock;

  if (genie <= 0.001 && scale === 1 && lift === 0) {
    return {};
  }

  const scaleY = 1 + genie * 0.2;
  const skewX = genie * -5;
  const sinkY = Math.round(genie * 10);
  const perspective = genie > 0.01 ? 'perspective(560px) ' : '';

  return {
    transform: `${perspective}translate3d(0, ${lift + sinkY}px, 0) scale(${scale}) scaleY(${scaleY}) skewX(${skewX}deg)`,
    ['--genie-intensity' as string]: String(genie),
  };
}

export function HomeTrackDock() {
  const { dockEnabled, genieEnabled } = useMotionPrefs();
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const transformsRef = useRef<Array<DockTransform | null>>(
    LEARNING_PATHS.map(() => null),
  );
  const [transforms, setTransforms] = useState<Array<DockTransform | null>>(() =>
    LEARNING_PATHS.map(() => null),
  );
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const applyPointer = useCallback(() => {
    frameRef.current = null;
    const point = pendingPointer.current;
    if (!point) return;

    const next = LEARNING_PATHS.map((_, index) => {
      const el = itemRefs.current[index];
      if (!el) return { scale: 1, lift: 0, genie: 0 };

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(point.x - centerX, point.y - centerY);
      const scale = dockScaleFromDistance(distance);
      return {
        scale,
        lift: dockLiftFromScale(scale),
        genie: genieEnabled ? genieFromDockScale(scale) * 0.85 : 0,
      };
    });

    if (dockTransformsEqual(next, transformsRef.current)) return;

    transformsRef.current = next;
    setTransforms(next);
  }, [genieEnabled]);

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
    const reset = LEARNING_PATHS.map(() => null);
    transformsRef.current = reset;
    setTransforms(reset);
    setPressedIndex(null);
  }, []);

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

  const handlePointerDown = useCallback(
    (index: number) => {
      if (!genieEnabled) return;
      setPressedIndex(index);
    },
    [genieEnabled],
  );

  const handlePointerUp = useCallback(() => {
    setPressedIndex(null);
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const dockLive = dockEnabled;
  const dockTouch = genieEnabled && !dockEnabled;

  return (
    <>
      {genieEnabled ? (
        <svg className={styles.genieFilter} aria-hidden>
          <defs>
            <filter
              id="home-genie-warp"
              x="-12%"
              y="-12%"
              width="124%"
              height="124%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.045"
                numOctaves="1"
                seed="4"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      ) : null}

      <div className={styles.dockShell}>
        <ul
          data-testid="home-track-dock"
          className={[
            'home-track-choices',
            'home-track-choices--dock',
            dockLive ? 'home-track-choices--dock-live' : '',
            dockLive ? styles.dockLive : '',
            dockTouch ? styles.dockTouch : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="Choix de piste MDM"
          onMouseMove={dockEnabled ? handleMouseMove : undefined}
          onMouseLeave={dockEnabled ? handleMouseLeave : undefined}
          onKeyDown={handleKeyDown}
        >
          {LEARNING_PATHS.map((path, index) => (
            <TrackChoiceLink
              key={path.slug}
              path={path}
              index={index}
              dockTransform={dockEnabled ? transforms[index] : null}
              geniePress={genieEnabled && pressedIndex === index}
              geniePressBoost={dockTouch ? GENIE_PRESS_BOOST_TOUCH : GENIE_PRESS_BOOST}
              onGeniePointerDown={() => handlePointerDown(index)}
              onGeniePointerUp={handlePointerUp}
              linkRef={(el) => {
                itemRefs.current[index] = el;
              }}
            />
          ))}
        </ul>
        <div className={styles.dockReflection} aria-hidden />
      </div>
    </>
  );
}

function TrackChoiceLink({
  path,
  index,
  dockTransform,
  geniePress,
  geniePressBoost,
  onGeniePointerDown,
  onGeniePointerUp,
  linkRef,
}: {
  path: LearningPathMeta;
  index: number;
  dockTransform: DockTransform | null;
  geniePress: boolean;
  geniePressBoost: number;
  onGeniePointerDown: () => void;
  onGeniePointerUp: () => void;
  linkRef: (el: HTMLAnchorElement | null) => void;
}) {
  const visual = getTrackVisual(path.track);
  const label = TRACK_LABELS[path.track];

  const dock = dockTransform ?? { scale: 1, lift: 0, genie: 0 };
  const pressBoost = geniePress ? geniePressBoost : 0;
  const genieIntensity = Math.min(1, dock.genie + pressBoost);
  const dockStyle = buildDockTransformStyle(dock, pressBoost);

  const onPointerDown = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.button !== 0) return;
    onGeniePointerDown();
  };

  return (
    <li>
      <Link
        ref={linkRef}
        href={path.href}
        className="home-track-choice"
        data-track={path.track.toLowerCase()}
        data-dock-active={dockTransform && dockTransform.scale > 1.01 ? '' : undefined}
        data-genie-active={genieIntensity > 0.08 ? '' : undefined}
        data-genie-press={geniePress ? '' : undefined}
        style={
          {
            '--track-gradient': visual.gradient,
            animationDelay: `${0.35 + index * 0.12}s`,
            ...dockStyle,
          } as CSSProperties
        }
        aria-label={`Parcours ${label} — commencer`}
        onPointerDown={onPointerDown}
        onPointerUp={onGeniePointerUp}
        onPointerCancel={onGeniePointerUp}
      >
        <span className="home-track-choice-icon" aria-hidden>
          <BrandIcon brand={path.brand} size="lg" variant="onColor" />
        </span>
        <span className="home-track-choice-label">{label}</span>
      </Link>
    </li>
  );
}
