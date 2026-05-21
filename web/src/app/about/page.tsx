import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { getTrackVisual } from '@/lib/design';

export const metadata: Metadata = {
  title: 'À propos — Mission et vision',
  description:
    'MDM Academy Pro : formation gratuite Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, badges et sprints pour techniciens MDM.',
  openGraph: {
    title: 'À propos — MDM Academy Pro',
    description:
      'Formation gamifiée gratuite pour techniciens Apple et administrateurs MDM : Apple Device Support, Jamf Pro et Intune.',
  },
  alternates: {
    canonical: '/about',
  },
};

const PILLARS = [
  {
    track: 'APPLE' as const,
    title: 'Apple Device Support',
    description:
      'Support des appareils, diagnostic, sécurité et fondamentaux de gestion pour flottes iOS et macOS.',
  },
  {
    track: 'JAMF' as const,
    title: 'Jamf Pro',
    description:
      'Administration Jamf, inventaire, smart groups et politiques MDM — exercices courts et scénarios terrain.',
  },
  {
    track: 'INTUNE' as const,
    title: 'Microsoft Intune',
    description:
      'Enrôlement Apple via Intune, conformité, profils et bonnes pratiques Microsoft Endpoint Manager.',
  },
];

const ABOUT_GRADIENT = getTrackVisual('DEFAULT').gradient;

export default function AboutPage() {
  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <div className="hero" style={{ background: ABOUT_GRADIENT, marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F393}'}</span> MDM Academy Pro
        </span>
        <h1>Former les pros Apple et MDM, gratuitement.</h1>
        <p style={{ marginTop: '0.85rem', maxWidth: 640 }}>
          MDM Academy est une plateforme de formation gamifiée pour techniciens et administrateurs qui
          gèrent des flottes Apple. Notre mission : rendre accessibles Apple Device Support, Jamf Pro et
          Microsoft Intune — sans abonnement, sans limite.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/courses" size="lg">
            Commencer gratuitement
          </Button>
          <Button
            href="/courses"
            variant="ghost"
            size="lg"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            Voir les parcours
          </Button>
        </div>
      </div>

      <section className="section" style={{ marginTop: '2rem' }}>
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Notre approche</span>
            <h2>Trois piliers, un même objectif</h2>
            <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 620 }}>
              Chaque piste combine quiz, mini-jeux et scénarios de 10 à 15 minutes. Tu progresses à ton rythme
              avec badges, quêtes hebdo et sprints certification.
            </p>
          </div>
        </div>
        <div className="grid grid-cards">
          {PILLARS.map((pillar) => {
            const visual = getTrackVisual(pillar.track);
            return (
              <Card key={pillar.track} variant="elevated">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <TrackIcon track={pillar.track} size="sm" />
                  <Badge tone="outline">{visual.label}</Badge>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.85rem' }}>{pillar.title}</h3>
                <p className="muted" style={{ marginTop: '0.4rem' }}>{pillar.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <Card variant="soft" style={{ marginTop: '1.5rem' }}>
        <span className="section-eyebrow">Équipe & vision</span>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>
          Des praticiens MDM pour des praticiens MDM
        </h2>
        <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
          Nous sommes une équipe de formateurs et administrateurs MDM qui enseignent au quotidien le support
          Apple et la gestion de parc. Notre vision : un parcours clair, ludique et 100 % gratuit — du premier
          diagnostic iPhone au déploiement Jamf ou Intune en entreprise.
        </p>
        <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
          MDM Academy n’est pas affilié à Apple Inc., Jamf ou Microsoft. Les contenus pédagogiques sont
          originaux ; consulte les sources officielles avant un examen ou une décision de conformité.
        </p>
      </Card>

      <Card
        variant="soft"
        style={{
          marginTop: '1.5rem',
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, #ffffff 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Prêt à t&apos;exercer ?</h2>
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              Choisis une piste Apple, Jamf ou Intune et débloque tes premiers badges dès aujourd&apos;hui.
            </p>
          </div>
          <Button href="/courses" size="lg">
            Commencer gratuitement
          </Button>
        </div>
      </Card>
    </section>
  );
}
