'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HomeHelloIntro.module.css';

const STORAGE_KEY = 'apple-mdm-academy:hello-intro-seen:v3';
const WORD_DURATION_MS = 1180;
const BRAND_DURATION_MS = 2300;
const EXIT_DURATION_MS = 1100;

const GREETINGS = ['Hello', 'Bonjour', 'Hola', 'Ciao', 'Olá', 'Salam', 'مرحبا', 'こんにちは', '你好'];

type IntroPhase = 'words' | 'brand' | 'leaving';

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
  const shimmer = context.createGain();
  const now = context.currentTime;

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.12, now + 0.18);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 3.15);
  master.connect(context.destination);

  shimmer.gain.setValueAtTime(0.0001, now);
  shimmer.gain.exponentialRampToValueAtTime(0.035, now + 0.52);
  shimmer.gain.exponentialRampToValueAtTime(0.0001, now + 3);
  shimmer.connect(master);

  const notes = [261.63, 329.63, 392, 523.25, 659.25];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = index < 2 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.04);
    oscillator.detune.setValueAtTime(index * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2 / (index + 1), now + 0.18 + index * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2 + index * 0.09);

    oscillator.connect(gain);
    gain.connect(index > 1 ? shimmer : master);
    oscillator.start(now + index * 0.04);
    oscillator.stop(now + 3.2);
  });

  window.setTimeout(() => void context.close(), 3500);
}

export function HomeHelloIntro({ onFinish }: HomeHelloIntroProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>('words');
  const [index, setIndex] = useState(0);
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

    GREETINGS.slice(1).forEach((_, nextIndex) => {
      const timer = window.setTimeout(() => setIndex(nextIndex + 1), WORD_DURATION_MS * (nextIndex + 1));
      timersRef.current.push(timer);
    });

    const brandTimer = window.setTimeout(() => setPhase('brand'), WORD_DURATION_MS * GREETINGS.length + 420);
    const finishTimer = window.setTimeout(
      finish,
      WORD_DURATION_MS * GREETINGS.length + 420 + BRAND_DURATION_MS,
    );

    timersRef.current.push(brandTimer, finishTimer);

    return clearTimers;
  }, [clearTimers, finish, onFinish]);

  const enableSound = () => {
    if (soundEnabled) return;
    setSoundEnabled(true);
    playWelcomeTone();
  };

  if (!visible) return null;

  const word = GREETINGS[index];

  return (
    <div className={`${styles.intro} ${phase === 'leaving' ? styles.leaving : ''}`}>
      <div className={styles.starField} aria-hidden />
      <div className={styles.lensGlow} aria-hidden />

      {phase === 'words' ? (
        <div className={styles.wordStage} aria-live="polite">
          <svg className={styles.wordSvg} viewBox="0 0 1400 420" role="img" aria-label={word}>
            <defs>
              <linearGradient id="helloIntroGradient" x1="0%" x2="100%" y1="18%" y2="82%">
                <stop offset="0%" stopColor="#ff3ecf" />
                <stop offset="18%" stopColor="#a855f7" />
                <stop offset="38%" stopColor="#38bdf8" />
                <stop offset="62%" stopColor="#22c55e" />
                <stop offset="82%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
              <filter id="helloIntroGlow" x="-30%" y="-40%" width="160%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.95 0"
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <text
              key={`${word}-shadow`}
              x="50%"
              y="56%"
              className={styles.wordShadow}
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {word}
            </text>
            <text
              key={`${word}-stroke`}
              x="50%"
              y="56%"
              className={styles.wordStroke}
              dominantBaseline="middle"
              textAnchor="middle"
              filter="url(#helloIntroGlow)"
            >
              {word}
            </text>
            <text
              key={`${word}-fill`}
              x="50%"
              y="56%"
              className={styles.wordFill}
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {word}
            </text>
          </svg>
        </div>
      ) : null}

      {phase === 'brand' ? (
        <div className={styles.brandStage} aria-live="polite">
          <div className={styles.brandMark} aria-hidden>
            MDM
          </div>
          <p className={styles.brandTitle}>Apple MDM Academy</p>
          <p className={styles.brandTagline}>Learn. Manage. Certify.</p>
        </div>
      ) : null}

      {!soundEnabled && phase !== 'leaving' ? (
        <button className={styles.sound} type="button" onClick={enableSound}>
          Activer le son
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
