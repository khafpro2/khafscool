'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HomeHelloIntro.module.css';

const STORAGE_KEY = 'apple-mdm-academy:hello-intro-seen:v5';
const HELLO_DURATION_MS = 4300;
const BRAND_DURATION_MS = 2200;
const EXIT_DURATION_MS = 900;

type IntroPhase = 'hello' | 'brand' | 'leaving';

type HomeHelloIntroProps = {
  onFinish?: () => void;
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

function playWelcomeTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const master = context.createGain();
  const now = context.currentTime;

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.11, now + 0.18);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
  master.connect(context.destination);

  [261.63, 329.63, 392, 523.25].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.05);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.19 / (index + 1), now + 0.22 + index * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2 + index * 0.08);

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now + index * 0.05);
    oscillator.stop(now + 3);
  });

  window.setTimeout(() => void context.close(), 3300);
}

export function HomeHelloIntro({ onFinish }: HomeHelloIntroProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>('hello');
  const [soundEnabled, setSoundEnabled] = useState(false);
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

  const enableSound = () => {
    if (soundEnabled) return;
    setSoundEnabled(true);
    playWelcomeTone();
  };

  if (!visible) return null;

  return (
    <div className={`${styles.intro} ${phase === 'leaving' ? styles.leaving : ''}`}>
      {phase === 'hello' ? (
        <div className={styles.helloStage} aria-label="hello" role="img">
          <span className={styles.helloGhost} aria-hidden>
            hello
          </span>
          <span className={styles.helloReveal} aria-hidden>
            hello
          </span>
          <span className={styles.lightSweep} aria-hidden />
        </div>
      ) : null}

      {phase === 'brand' ? (
        <div className={styles.brandStage} aria-live="polite">
          <p className={styles.brandTitle}>Apple MDM Academy</p>
          <p className={styles.brandTagline}>Learn. Manage. Certify.</p>
        </div>
      ) : null}

      {!soundEnabled && phase !== 'leaving' ? (
        <button className={styles.sound} type="button" onClick={enableSound}>
          Son
        </button>
      ) : null}
      {phase !== 'leaving' ? (
        <button className={styles.skip} type="button" onClick={finish}>
          Passer
        </button>
      ) : null}
    </div>
  );
}
