'use client';

/**
 * Hero MacBook — vidéo Blender si exportée, sinon poster photoréal (AI) ou SVG.
 * Pipeline vidéo : /media/hero/macbook-hero.webm (+ .mp4)
 * Poster AI : /media/hero/macbook-hero-ai.webp (+ .png)
 */

import { useCallback, useEffect, useState } from 'react';
import styles from './HeroMacbookVisual.module.css';

const HERO_MEDIA = {
  webm: '/media/hero/macbook-hero.webm',
  mp4: '/media/hero/macbook-hero.mp4',
  posterAiWebp: '/media/hero/macbook-hero-ai.webp',
  posterAiPng: '/media/hero/macbook-hero-ai.png',
  posterWebp: '/media/hero/macbook-hero-poster.webp',
  posterSvg: '/media/hero/macbook-hero-poster.svg',
} as const;

const POSTER_CASCADE = [
  HERO_MEDIA.posterAiWebp,
  HERO_MEDIA.posterAiPng,
  HERO_MEDIA.posterWebp,
  HERO_MEDIA.posterSvg,
] as const;

type PosterUrl = (typeof POSTER_CASCADE)[number];

async function mediaExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

function nextPosterInCascade(current: string): PosterUrl | null {
  const index = POSTER_CASCADE.indexOf(current as PosterUrl);
  if (index < 0 || index >= POSTER_CASCADE.length - 1) return null;
  return POSTER_CASCADE[index + 1] ?? null;
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
            <div className={styles.bezel}>
              <div className={styles.notch} />
              <div className={styles.screen}>
                <div className={styles.screenContent}>
                  <span className={styles.screenDot} />
                  <span>MDM Academy</span>
                </div>
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
  const [mediaReady, setMediaReady] = useState(false);
  const [hasWebm, setHasWebm] = useState(false);
  const [hasMp4, setHasMp4] = useState(false);
  const [posterUrl, setPosterUrl] = useState<PosterUrl>(HERO_MEDIA.posterSvg);
  const [videoFailed, setVideoFailed] = useState(false);

  const handlePosterError = useCallback(() => {
    setPosterUrl((current) => nextPosterInCascade(current) ?? current);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const candidate of POSTER_CASCADE) {
        if (await mediaExists(candidate)) {
          if (!cancelled) setPosterUrl(candidate);
          break;
        }
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
  const showStaticPoster = mediaReady && !showVideo;
  const showCss3d = false;

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
          onError={handlePosterError}
        />
      ) : null}

      {showCss3d ? <CssMacbookFallback /> : null}
    </div>
  );
}
