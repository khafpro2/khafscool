'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HomeHelloIntro.module.css';

const STORAGE_KEY = 'apple-mdm-academy:hello-intro-seen:v6';
const HELLO_DURATION_MS = 4200;
const BRAND_DURATION_MS = 2200;
const EXIT_DURATION_MS = 900;

type IntroPhase = 'hello' | 'brand' | 'leaving';

type HomeHelloIntroProps = {
  onFinish?: () => void;
};

export function HomeHelloIntro({ onFinish }: HomeHelloIntroProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>('hello');
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const finish = useCallback(() => {
    window.sessionStorage.setItem(STORAGE_KEY, 'true');
    clearTimers();
    setPhase('leaving');

    const timer = window.setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, EXIT_DURATION_MS);

    timersRef.current.push(timer);
  }, [clearTimers, onFinish]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceIntro = params.get('intro') === '1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = window.sessionStorage.getItem(STORAGE_KEY) === 'true';

    if ((alreadySeen && !forceIntro) || reducedMotion) {
      onFinish?.();
      return;
    }

    setVisible(true);

    const brandTimer = window.setTimeout(() => setPhase('brand'), HELLO_DURATION_MS);
    const finishTimer = window.setTimeout(finish, HELLO_DURATION_MS + BRAND_DURATION_MS);

    timersRef.current.push(brandTimer, finishTimer);

    return clearTimers;
  }, [clearTimers, finish, onFinish]);

  if (!visible) return null;

  return (
    <div className={`${styles.intro} ${phase === 'leaving' ? styles.leaving : ''}`}>
      {phase === 'hello' ? (
        <div className={styles.helloStage} aria-label="hello" role="img">
          <span className={styles.helloAura} aria-hidden>
            hello
          </span>
          <span className={styles.helloText} aria-hidden>
            hello
          </span>
          <span className={styles.helloMask} aria-hidden>
            hello
          </span>
        </div>
      ) : null}

      {phase === 'brand' ? (
        <div className={styles.brandStage} aria-live="polite">
          <p className={styles.brandTitle}>Apple MDM Academy</p>
          <p className={styles.brandTagline}>Learn. Manage. Certify.</p>
        </div>
      ) : null}
    </div>
  );
}
