import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Merci pour votre soutien',
  description: 'Votre don à MDM Academy Pro a bien été enregistré. La formation reste 100 % gratuite.',
  openGraph: {
    locale: 'fr_FR',
    title: 'Merci pour votre soutien — MDM Academy Pro',
    description: 'Votre don volontaire aide la communauté MDM. La formation reste 100 % gratuite.',
    url: '/soutenir/merci',
  },
  robots: { index: false, follow: true },
  alternates: {
    canonical: '/soutenir/merci',
  },
};

type MerciPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function DonationMerciPage({ searchParams }: MerciPageProps) {
  const params = await searchParams;
  const hasSession = Boolean(params.session_id?.trim());

  return (
    <section style={{ padding: '1rem 0 2rem', maxWidth: 760 }}>
      <span className="section-eyebrow">Communauté</span>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, marginTop: '0.35rem' }}>
        Merci pour votre soutien !
      </h1>
      <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 640, lineHeight: 1.6 }}>
        Votre don volontaire aide à faire vivre MDM Academy Pro — hébergement, contenu et outils pour la
        communauté MDM. La formation Apple, Jamf et Intune reste <strong>100 % gratuite</strong> pour tous.
      </p>

      {hasSession ? (
        <Card variant="soft" style={{ marginTop: '1.25rem' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Paiement confirmé</p>
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Nous avons bien reçu votre contribution. Un reçu vous sera envoyé par e-mail si vous en avez
            indiqué un lors du paiement.
          </p>
        </Card>
      ) : (
        <Card variant="soft" style={{ marginTop: '1.25rem' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Merci !</p>
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Si vous venez de finaliser un don, la confirmation peut prendre quelques instants.
          </p>
        </Card>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
        <Button href="/">Retour à l&apos;accueil</Button>
        <Button href="/courses" variant="secondary">
          Voir les parcours
        </Button>
        <Button href="/dashboard" variant="ghost">
          Mon apprentissage
        </Button>
      </div>

      <Card variant="soft" style={{ marginTop: '1.5rem' }}>
        <span className="section-eyebrow">Et ensuite ?</span>
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
            <Link href="/courses">Parcours — Apple Device Support, Jamf Pro et Microsoft Intune</Link>
          </li>
          <li>
            <Link href="/profile">Profil — badges, certificats et progression</Link>
          </li>
          <li>
            <Link href="/soutenir">Soutenir à nouveau le projet</Link>
          </li>
        </ul>
      </Card>
    </section>
  );
}
