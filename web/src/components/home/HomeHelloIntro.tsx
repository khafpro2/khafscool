'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HomeHelloIntro.module.css';

const STORAGE_KEY = 'apple-mdm-academy:hello-intro-seen:v2';

const GREETINGS = [
  'Hello',
  'Bonjour',
  'Hola',
  'Ciao',
  'Hallo',
  'Olá',
  'Salam',
  'こんにちは',
  '안녕하세요',
  '你好',
];

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
  master.gain.exponentialRampToValueAtTime(0.16, now + 0.12);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
  master.connect(context.destination);

  shimmer.gain.setValueAtTime(0.0001, now);
  shimmer.gain.exponentialRampToValueAtTime(0.04, now + 0.45);
  shimmer.gain.exponentialRampToValueAtTime(0.0001, now + 2.75);
  shimmer.connect(master);

  const notes = [261.63, 329.63, 392, 523.25, 659.25];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = index < 2 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.045);
    oscillator.detune.setValueAtTime(index * 2.5, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24 / (index + 1), now + 0.2 + index * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.15 + index * 0.1);

    oscillator.connect(gain);
    gain.connect(index > 1 ? shimmer : master);
    oscillator.start(now + index * 0.045);
    oscillator.stop(now + 3);
  });

  window.setTimeout(() => void context.close(), 3300);
}

export function HomeHelloIntro({ onFinish }: HomeHelloIntroProps) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    window.sessionStorage.setItem(STORAGE_KEY, 'true');
    setLeaving(true);

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 1000);
  }, [onFinish]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const forceIntro = searchParams.get('intro') === '1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = window.sessionStorage.getItem(STORAGE_KEY) === 'true';

    if ((alreadySeen && !forceIntro) || reducedMotion) {
      onFinish?.();
      return;
    }

    setVisible(true);

    intervalRef.current = window.setInterval(() => {
      setIndex((current) => {
        if (current >= GREETINGS.length - 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          timeoutRef.current = window.setTimeout(finish, 1150);
          return current;
        }

        return current + 1;
      });
    }, 760);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [finish, onFinish]);

  const enableSound = () => {
    if (soundEnabled) return;
    setSoundEnabled(true);
    playWelcomeTone();
  };

  if (!visible) return null;

  const word = GREETINGS[index];

  return (
    <div className={`${styles.intro}${leaving ? ` ${styles.leaving}` : ''}`}>
      <div className={styles.noise} aria-hidden />
      <div className={styles.glow} aria-hidden />
      <div className={styles.content} aria-live="polite">
        <svg className={styles.wordSvg} viewBox="0 0 1200 340" role="img" aria-label={word}>
          <defs>
            <linearGradient id="helloIntroGradient" x1="0%" x2="100%" y1="30%" y2="70%">
              <stop offset="0%" stopColor="#ff4fd8" />
              <stop offset="22%" stopColor="#8b5cf6" />
              <stop offset="46%" stopColor="#38bdf8" />
              <stop offset="68%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>
          <text
            key={word}
            x="50%"
            y="58%"
            className={styles.wordStroke}
            dominantBaseline="middle"
            textAnchor="middle"
          >
            {word}
          </text>
          <text
            key={`${word}-fill`}
            x="50%"
            y="58%"
            className={styles.wordFill}
            dominantBaseline="middle"
            textAnchor="middle"
          >
            {word}
          </text>
        </svg>
      </div>
      {!soundEnabled ? (
        <button className={styles.sound} type="button" onClick={enableSound}>
          Activer le son
        </button>
      ) : null}
      <button className={styles.skip} type="button" onClick={finish}>
        Passer
      </button>
    </div>
  );
}
