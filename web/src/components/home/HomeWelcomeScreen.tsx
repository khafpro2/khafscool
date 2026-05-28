'use client';

import { HomeTrackDock } from '@/components/home/HomeTrackDock';

const HELLO = 'Hello';

export function HomeWelcomeScreen() {
  return (
    <section className="home-welcome" aria-labelledby="home-hello-title">
      <h1 id="home-hello-title" className="home-hello-title">
        {HELLO.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="home-hello-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
            aria-hidden
          >
            {char}
          </span>
        ))}
        <span className="sr-only">Hello</span>
      </h1>

      <p className="home-welcome-tagline">Je veux apprendre</p>

      <HomeTrackDock />
    </section>
  );
}
