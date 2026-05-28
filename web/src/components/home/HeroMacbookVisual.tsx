'use client';

/**
 * Hero MacBook — vidéo Blender si exportée, sinon MacBook CSS 3D.
 * Remplacer par l’export Blender : /media/hero/macbook-hero.webm (+ .mp4)
 * Pipeline : assets/blender/hero-macbook/
 */

import { useEffect, useState } from 'react';
import styles from './HeroMacbookVisual.module.css';

const HERO_MEDIA = {
  webm: '/media/hero/macbook-hero.webm',
  mp4: '/media/hero/macbook-hero.mp4',
  posterWebp: '/media/hero/macbook-hero-poster.webp',
  posterSvg: '/media/hero/macbook-hero-poster.svg',
} as const;

async function mediaExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

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

function CssMacbookFallback() {
  return (
    <div className={styles.scene} aria-hidden>
      <div className={styles.orbit}>
        <div className={styles.laptop}>
          <div className={styles.lid}>
            <div className={styles.shell} />
            <div className={styles.screen}>
              <div className={styles.screenContent}>
                <span className={styles.screenDot} />
                <span>MDM Academy</span>
              </div>
            </div>
          </div>
          <div className={styles.base} />
          <div className={styles.glow} />
        </div>
      </div>
    </div>
  );
}

function HeroMacbookSkeleton() {
  return (
    <div
      className={styles.skeleton}
      role="status"
      aria-live="polite"
      aria-label="Chargement de l’illustration MacBook"
    >
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

export function HeroMacbookVisual() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isNarrow = useMediaQuery('(max-width: 540px)');
  const [mediaReady, setMediaReady] = useState(false);
  const [hasWebm, setHasWebm] = useState(false);
  const [hasMp4, setHasMp4] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string>(HERO_MEDIA.posterSvg);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const hasWebp = await mediaExists(HERO_MEDIA.posterWebp);
      if (!cancelled && hasWebp) {
        setPosterUrl(HERO_MEDIA.posterWebp);
      }

      if (!reducedMotion) {
        const webmOk = await mediaExists(HERO_MEDIA.webm);
        if (!cancelled) setHasWebm(webmOk);

        const mp4Ok = await mediaExists(HERO_MEDIA.mp4);
        if (!cancelled) setHasMp4(mp4Ok);
      }

      if (!cancelled) setMediaReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  const showVideo =
    mediaReady && (hasWebm || hasMp4) && !reducedMotion && !videoFailed;
  const showStaticPoster = mediaReady && !showVideo && (reducedMotion || isNarrow);
  const showCss3d = mediaReady && !showVideo && !reducedMotion && !isNarrow;

  return (
    <div className={styles.wrap} aria-hidden={showVideo || showCss3d}>
      {!mediaReady ? <HeroMacbookSkeleton /> : null}

      {showVideo ? (
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl}
          aria-hidden
          onError={() => setVideoFailed(true)}
        >
          {hasWebm ? <source src={HERO_MEDIA.webm} type="video/webm" /> : null}
          {hasMp4 ? <source src={HERO_MEDIA.mp4} type="video/mp4" /> : null}
        </video>
      ) : null}

      {showStaticPoster ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster décoratif statique
        <img
          className={styles.posterImg}
          src={posterUrl}
          alt=""
          aria-hidden
          loading="eager"
          decoding="async"
        />
      ) : null}

      {showCss3d ? <CssMacbookFallback /> : null}
    </div>
  );
}
