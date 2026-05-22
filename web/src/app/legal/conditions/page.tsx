import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getContactEmail, getContactMailto } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation',
  description:
    'Conditions d’utilisation MDM Academy Pro : formation gratuite Apple, Jamf et Intune, usage pédagogique.',
  alternates: { canonical: '/legal/conditions' },
  openGraph: {
    locale: 'fr_FR',
    title: 'Conditions d’utilisation — MDM Academy',
    description:
      'Conditions d’usage de la plateforme de formation MDM gratuite : parcours, quiz, badges et classement.',
    url: '/legal/conditions',
  },
  robots: { index: true, follow: true },
};

export default function ConditionsPage() {
  const contactEmail = getContactEmail();
  const contactMailto = getContactMailto();

  return (
    <section className="legal-page" style={{ padding: '1rem 0 2.5rem' }}>
      <span className="section-eyebrow">Informations légales</span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>Conditions d’utilisation</h1>
      <p className="muted" style={{ marginTop: '0.75rem', maxWidth: 720 }}>
        En utilisant MDM Academy Pro, vous acceptez les présentes conditions. La plateforme propose une formation
        gratuite autour d’Apple Device Support, Jamf Pro et Microsoft Intune.
      </p>

      <Card className="legal-card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Objet du service</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          MDM Academy Pro met à disposition des parcours pédagogiques, quiz, mini-scénarios, badges, quêtes
          hebdomadaires et sprints de certification à titre informatif. Le contenu ne remplace pas la
          documentation officielle Apple, Jamf ou Microsoft ni une certification éditeur.
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Compte et usage acceptable</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Vous vous engagez à fournir des informations exactes lors de l’inscription et à ne pas tenter de
          perturber le service, d’accéder aux données d’autres apprenants ou de manipuler artificiellement le
          classement. Un compte peut être suspendu en cas d’abus manifeste.
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Gratuité et absence de vente de données</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          L’accès aux parcours principaux est gratuit. MDM Academy Pro ne revend pas vos données personnelles.
          D’éventuelles fonctionnalités premium ou partenariats futurs seront clairement identifiés et
          optionnels.
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Propriété intellectuelle et responsabilité</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Les contenus pédagogiques, la marque MDM Academy et l’interface sont protégés. Apple, Jamf et
          Microsoft sont des marques de leurs propriétaires respectifs ; MDM Academy Pro n’est affiliée à aucun
          éditeur. Le service est fourni « en l’état », sans garantie de disponibilité permanente.
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Contact</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Pour toute question sur l’utilisation du service, signaler un abus ou exercer vos droits relatifs aux
          données personnelles, contactez l’équipe HarmyTech à{' '}
          <a href={contactMailto} style={{ fontWeight: 700 }}>
            {contactEmail}
          </a>
          .
        </p>
      </Card>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <Button href="/courses" variant="secondary">
          Explorer les parcours
        </Button>
        <Link href="/legal/confidentialite" className="muted" style={{ alignSelf: 'center', fontWeight: 700 }}>
          Politique de confidentialité →
        </Link>
      </div>
    </section>
  );
}
