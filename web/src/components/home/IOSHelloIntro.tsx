'use client';

import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* iOS 26 Liquid Glass Hello Intro — v2 refined                         */
/* Gong de démarrage synthétisé via Web Audio API                       */
/* ------------------------------------------------------------------ */

function playStartupGong() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.005);
    master.connect(ctx.destination);

    // Reverb via delay nodes
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

    // Gong partials (inharmonic like a real gong)
    const partials = [
      { ratio: 1,     amp: 0.50, decay: 4.5 },
      { ratio: 1.505, amp: 0.30, decay: 3.2 },
      { ratio: 2.756, amp: 0.20, decay: 2.4 },
      { ratio: 3.832, amp: 0.12, decay: 1.8 },
      { ratio: 5.404, amp: 0.07, decay: 1.2 },
      { ratio: 8.933, amp: 0.04, decay: 0.8 },
    ];

    const BASE = 130.81; // C3 — warm and deep like an iPhone gong

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

    // Attack click / piano hammer transient
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
    // AudioContext not available (SSR or blocked)
  }
}

/* ------------------------------------------------------------------
   Component
------------------------------------------------------------------ */
interface IOSHelloIntroProps {
  onDone: () => void;
}

export function IOSHelloIntro({ onDone }: IOSHelloIntroProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const doneRef = useRef(false);

  useEffect(() => {
    // Léger délai avant le gong pour laisser le navigateur peindre
    const tGong = setTimeout(() => playStartupGong(), 80);

    // Phase show : Hello pleinement visible
    const t1 = setTimeout(() => setPhase('show'), 200);

    // Phase exit : allongé à 4 200 ms — l'écriture (1.5 s) + shimmer sont bien visibles
    const t2 = setTimeout(() => setPhase('exit'), 4200);

    // Unmount après la transition CSS (800 ms)
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
