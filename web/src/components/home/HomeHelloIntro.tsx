'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'apple-mdm-academy:hello-intro-seen:v1';

const GREETINGS = [
  'Hello',
  'Bonjour',
  'Hola',
  'Ciao',
  'Hallo',
  'Olá',
  'Hej',
  'Salam',
  'مرحبا',
  'こんにちは',
  '안녕하세요',
  '你好',
];

type HomeHelloIntroProps = {
  onFinish?: () => void;
};

function playWelcomeTone() {
  const AudioContextClass = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const master = context.createGain();
  const shimmer = context.createGain();
  const now = context.currentTime;

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.35);
  master.connect(context.destination);

  shimmer.gain.setValueAtTime(0.0001, now);
  shimmer.gain.exponentialRampToValueAtTime(0.045, now + 0.32);
  shimmer.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
  shimmer.connect(master);

  const notes = [261.63, 329.63, 392, 523.25];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = index === 0 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.035);
    oscillator.detune.setValueAtTime(index * 3, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28 / (index + 1), now + 0.16 + index * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9 + index * 0.08);

    oscillator.connect(gain);
    gain.connect(index > 1 ? shimmer : master);
    oscillator.start(now + index * 0.035);
    oscillator.stop(now + 2.45);
  });

  window.setTimeout(() => void context.close(), 2800);
}

export function HomeHelloIntro({ onFinish }: HomeHelloIntroProps) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [started, setStarted] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const alreadySeen = window.sessionStorage.getItem(STORAGE_KEY) === 'true';
    if (alreadySeen || prefersReducedMotion) {
      onFinish?.();
      return;
    }

    setVisible(true);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [onFinish, prefersReducedMotion]);

  const finish = () => {
    window.sessionStorage.setItem(STORAGE_KEY, 'true');
    setLeaving(true);

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 900);
  };

  const startIntro = () => {
    if (started) return;

    setStarted(true);
    playWelcomeTone();

    intervalRef.current = window.setInterval(() => {
      setIndex((current) => {
        if (current >= GREETINGS.length - 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          timeoutRef.current = window.setTimeout(finish, 760);
          return current;
        }

        return current + 1;
      });
    }, 620);
  };

  if (!visible) return null;

  return (
    <div className={`home-hello-intro${leaving ? ' home-hello-intro--leaving' : ''}`}>
      <div className="home-hello-intro__aurora" aria-hidden />
      <div className="home-hello-intro__content" aria-live="polite">
        <p className="home-hello-intro__eyebrow">Apple MDM Academy</p>
        <div key={GREETINGS[index]} className="home-hello-intro__word">
          {GREETINGS[index]}
        </div>
        {!started ? (
          <button className="home-hello-intro__start" type="button" onClick={startIntro}>
            Démarrer
          </button>
        ) : null}
      </div>
      <button className="home-hello-intro__skip" type="button" onClick={finish}>
        Passer
      </button>
    </div>
  );
}
