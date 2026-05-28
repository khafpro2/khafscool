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

export function HeroMacbookVisual() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isNarrow = useMediaQuery('(max-width: 540px)');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>(HERO_MEDIA.posterSvg);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const hasWebp = await mediaExists(HERO_MEDIA.posterWebp);
      if (!cancelled && hasWebp) {
        setPosterUrl(HERO_MEDIA.posterWebp);
      }

      if (reducedMotion) return;

      const hasWebm = await mediaExists(HERO_MEDIA.webm);
      if (!cancelled && hasWebm) {
        setVideoSrc(HERO_MEDIA.webm);
        return;
      }

      const hasMp4 = await mediaExists(HERO_MEDIA.mp4);
      if (!cancelled && hasMp4) {
        setVideoSrc(HERO_MEDIA.mp4);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  const showVideo = Boolean(videoSrc) && !reducedMotion && !videoFailed;
  const showStaticPoster = !showVideo && (reducedMotion || isNarrow);
  const showCss3d = !showVideo && !reducedMotion && !isNarrow;

  return (
    <div className={styles.wrap}>
      {showVideo ? (
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={posterUrl}
          aria-hidden
          onError={() => setVideoFailed(true)}
        >
          {videoSrc === HERO_MEDIA.webm ? (
            <source src={HERO_MEDIA.webm} type="video/webm" />
          ) : null}
          <source src={videoSrc ?? HERO_MEDIA.mp4} type="video/mp4" />
        </video>
      ) : null}

      {showStaticPoster ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster décoratif statique
        <img
          className={styles.posterImg}
          src={posterUrl}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
        />
      ) : null}

      {showCss3d ? <CssMacbookFallback /> : null}
    </div>
  );
}
