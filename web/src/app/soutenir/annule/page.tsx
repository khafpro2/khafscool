import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Don annulé',
  description: 'Le paiement du don à MDM Academy Pro a été annulé. La formation reste gratuite.',
  openGraph: {
    locale: 'fr_FR',
    title: 'Don annulé — MDM Academy Pro',
    description: 'Aucun paiement effectué. La formation MDM reste entièrement gratuite.',
    url: '/soutenir/annule',
  },
  robots: { index: false, follow: true },
  alternates: {
    canonical: '/soutenir/annule',
  },
};

export default function DonationAnnulePage() {
  return (
    <section style={{ padding: '1rem 0 2rem', maxWidth: 760 }}>
      <span className="section-eyebrow">Communauté</span>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, marginTop: '0.35rem' }}>
        Don annulé
      </h1>
      <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 640, lineHeight: 1.6 }}>
        Aucun paiement n&apos;a été effectué. Vous pouvez reprendre quand vous le souhaitez — MDM Academy Pro
        reste entièrement gratuit, avec ou sans don.
      </p>

      <Card variant="soft" style={{ marginTop: '1.25rem' }}>
        <p style={{ margin: 0, fontWeight: 700 }}>Pas de souci</p>
        <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Votre progression, vos badges et l&apos;accès aux parcours ne changent pas. Un don reste toujours
          optionnel.
        </p>
      </Card>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
        <Button href="/soutenir">Revenir à la page Soutenir</Button>
        <Button href="/" variant="secondary">
          Retour à l&apos;accueil
        </Button>
        <Button href="/courses" variant="ghost">
          Voir les parcours
        </Button>
      </div>

      <Card variant="soft" style={{ marginTop: '1.5rem' }}>
        <span className="section-eyebrow">Continuer la formation</span>
        <ul
          className="muted"
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            listStyle: 'none',
            padding: 0,
            fontSize: '0.95rem',
          }}
        >
          <li>
            <Link href="/dashboard">Mon apprentissage — reprendre là où vous en étiez</Link>
          </li>
          <li>
            <Link href="/courses">Catalogue des parcours MDM</Link>
          </li>
        </ul>
      </Card>
    </section>
  );
}
