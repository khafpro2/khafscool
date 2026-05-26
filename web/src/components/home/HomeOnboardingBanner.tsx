'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildAuthUrl, getAccessToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const FIRST_QUIZ_HREF = '/courses/apple-cert-prep';
const STEPS = [
  {
    step: '1',
    title: 'Choisir une piste',
    description: 'Apple, Jamf ou Intune — chaque parcours compte 3 unités courtes.',
  },
  {
    step: '2',
    title: 'Quiz + scénario',
    description: 'Valide une compétence en 10 à 15 minutes : QCM, mini-jeu et cas terrain.',
  },
  {
    step: '3',
    title: 'Badge',
    description: 'Termine les 3 unités pour débloquer le super-badge de ta piste.',
  },
];

export function HomeOnboardingBanner() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
  }, []);

  if (hasToken === null) {
    return null;
  }

  if (hasToken) {
    return <HowItWorksSection marginTop="2.5rem" />;
  }

  return (
    <>
      <section className="container" style={{ marginTop: '1.5rem' }}>
        <Card
          variant="gradient"
          style={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              className="hero-eyebrow"
              style={{ background: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.32)' }}
            >
              <span aria-hidden>{'\u{1F680}'}</span> Première étape
            </span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.75rem', color: '#fff' }}>
              Lance ton premier quiz en moins de 15 minutes.
            </h2>
            <p style={{ marginTop: '0.5rem', maxWidth: 560, color: 'rgba(255,255,255,0.92)' }}>
              Commence par la piste Apple : fondamentaux Device Support et MDM, sans compte requis pour
              explorer.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'stretch' }}>
            <Button href={FIRST_QUIZ_HREF} variant="secondary" size="lg">
              Lancer mon premier quiz
            </Button>
            <Button
              href={buildAuthUrl(FIRST_QUIZ_HREF)}
              size="lg"
              variant="ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Créer un compte pour sauvegarder
            </Button>
          </div>
        </Card>
      </section>
      <HowItWorksSection marginTop="2rem" />
    </>
  );
}

function HowItWorksSection({ marginTop = '2.5rem' }: { marginTop?: string }) {
  return (
    <section className="section container" style={{ marginTop }}>
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Comment ça marche</span>
          <h2>Trois étapes pour progresser</h2>
          <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 620 }}>
            MDM Academy Pro transforme la certification terrain en parcours ludique — 100 % gratuit.
          </p>
        </div>
        <Link href="/courses" style={{ fontWeight: 700 }}>
          Voir le catalogue →
        </Link>
      </div>
      <div className="grid grid-cards">
        {STEPS.map((item) => (
          <Card key={item.step} variant="elevated">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'var(--gradient-accent)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
              }}
              aria-hidden
            >
              {item.step}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.85rem' }}>{item.title}</h3>
            <p className="muted" style={{ marginTop: '0.4rem' }}>{item.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
