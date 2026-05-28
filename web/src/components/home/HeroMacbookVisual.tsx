'use client';

/**
 * Hero MacBook — CSS 3D interactif avec « Hello » sur l’écran.
 * Pas de dépendance three.js ; poster/vidéo Blender désactivés pour un LCP léger.
 */

import { useEffect, useState } from 'react';
import styles from './HeroMacbookVisual.module.css';

const HELLO = 'Hello';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function MacbookScreenHello({ animate }: { animate: boolean }) {
  return (
    <div className={styles.screenContent} aria-hidden>
      <div className={styles.screenHello}>
        {HELLO.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={styles.screenHelloLetter}
            style={animate ? { animationDelay: `${index * 0.12}s` } : undefined}
          >
            {char}
          </span>
        ))}
      </div>
      <p className={styles.screenSubtitle}>MDM Academy</p>
    </div>
  );
}

function CssMacbook3D({ reducedMotion }: { reducedMotion: boolean }) {
  const animate = !reducedMotion;

  return (
    <div className={styles.scene} role="img" aria-label="MacBook affichant Hello">
      <div className={styles.orbit} data-animate={animate ? 'true' : undefined}>
        <div className={styles.laptop} data-animate={animate ? 'true' : undefined}>
          <div className={styles.lid} data-animate={animate ? 'true' : undefined}>
            <div className={styles.shell} />
            <div className={styles.bezel}>
              <div className={styles.notch} />
              <div className={styles.screen} data-animate={animate ? 'true' : undefined}>
                <MacbookScreenHello animate={animate} />
              </div>
            </div>
          </div>
          <div className={styles.hinge} />
          <div className={styles.base} />
          <div className={styles.glow} />
          <div className={styles.floorShadow} />
        </div>
      </div>
    </div>
  );
}

export function HeroMacbookVisual() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div className={styles.wrap}>
      <CssMacbook3D reducedMotion={reducedMotion} />
    </div>
  );
}
