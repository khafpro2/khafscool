'use client';

import { HomeHelloIntro } from '@/components/home/HomeHelloIntro';
import { HomeTrackDock } from '@/components/home/HomeTrackDock';
import { HomeWhatsNewBanner } from '@/components/home/HomeWhatsNewBanner';
import { HomeOnboardingBanner } from '@/components/home/HomeOnboardingBanner';
import { ContinueLearningSection } from '@/components/home/ContinueLearningSection';
import { HomeStatsBar } from '@/components/home/HomeStatsBar';

export function HomeWelcomeScreen() {
  return (
    <>
      <HomeHelloIntro />

      <section
        className="home-welcome"
        aria-labelledby="home-hello-title"
      >
        <h1 id="home-hello-title" className="home-hello-title">
          Hello
        </h1>

        <p className="home-welcome-tagline">Je veux apprendre</p>

        <HomeTrackDock />
      </section>

      <HomeStatsBar />
      <HomeWhatsNewBanner />
      <ContinueLearningSection />
      <HomeOnboardingBanner />
    </>
  );
}
