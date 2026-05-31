'use client';

import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* iOS 26 Liquid Glass Hello Intro — v2 refined                         */
/* Gong de démarrage synthétisé via Web Audio API                       */
/* ------------------------------------------------------------------ */

/** Clé sessionStorage — mettre « true » pour ignorer l’intro (tests E2E). */
export const IOS_INTRO_SKIP_KEY = 'ama-intro-skip';

function playStartupGong() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.005);
    master.connect(ctx.destination);
    const delay1 = ctx.createDelay(0.5);
    const delay2 = ctx.createDelay(0.8);
    const delayGain = ctx.createGain();
    delay1.delayTime.value = 0.18;
    delay2.delayTime.value = 0.35;
    delayGain.gain.value = 0.22;
    master.connect(delay1);
    delay1.connect(delayGain);
    delay2.connect(delayGain);
    delayGain.connect(master);
    const partials = [
      { ratio: 1,     amp: 0.50, decay: 4.5 },
      { ratio: 1.505, amp: 0.30, decay: 3.2 },
      { ratio: 2.756, amp: 0.20, decay: 2.4 },
      { ratio: 3.832, amp: 0.12, decay: 1.8 },
      { ratio: 5.404, amp: 0.07, decay: 1.2 },
      { ratio: 8.933, amp: 0.04, decay: 0.8 },
    ];
    const BASE = 130.81;
    partials.forEach(({ ratio, amp, decay }) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = BASE * ratio;
      env.gain.setValueAtTime(0, ctx.currentTime);
      env.gain.linearRampToValueAtTime(amp, ctx.currentTime + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);
      osc.connect(env);
      env.connect(master);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + decay + 0.1);
    });
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(900, ctx.currentTime);
    click.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
    clickGain.gain.setValueAtTime(0.25, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    click.connect(clickGain);
    clickGain.connect(master);
    click.start(ctx.currentTime);
    click.stop(ctx.currentTime + 0.12);
  } catch {
    // AudioContext not available
  }
}

interface IOSHelloIntroProps {
  onDone: () => void;
}

export function IOSHelloIntro({ onDone }: IOSHelloIntroProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const doneRef = useRef(false);

  useEffect(() => {
    // Skip immédiat en mode test E2E
    if (typeof window !== 'undefined' &&
        window.sessionStorage.getItem(IOS_INTRO_SKIP_KEY) === 'true') {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
      return;
    }

    const tGong = setTimeout(() => playStartupGong(), 80);
    const t1 = setTimeout(() => setPhase('show'), 200);
    const t2 = setTimeout(() => setPhase('exit'), 4200);
    const t3 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 5100);

    return () => {
      clearTimeout(tGong);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const skip = () => {
    if (!doneRef.current) {
      doneRef.current = true;
      setPhase('exit');
      setTimeout(onDone, 700);
    }
  };

  // Ne pas rendre le splash si skip immédiat
  if (typeof window !== 'undefined' &&
      window.sessionStorage.getItem(IOS_INTRO_SKIP_KEY) === 'true') {
    return null;
  }

  return (
    <div
      className={`ios26-intro ios26-intro--${phase}`}
      onClick={skip}
      aria-hidden="true"
    >
      <div className="ios26-bloom" />
      <div className="ios26-hello-wrap">
        <span className="ios26-hello-text">Hello</span>
        <span className="ios26-hello-shimmer" aria-hidden="true" />
      </div>
      <div className="ios26-particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`ios26-particle ios26-particle--${i + 1}`} />
        ))}
      </div>
      <p className="ios26-skip-hint" aria-hidden="true">Appuyer pour passer</p>
    </div>
  );
}
