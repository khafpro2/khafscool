import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité MDM Academy Pro : formation gratuite, données minimales, pas de revente.',
  alternates: { canonical: '/legal/confidentialite' },
};

export default function ConfidentialitePage() {
  return (
    <section className="legal-page" style={{ padding: '1rem 0 2.5rem' }}>
      <span className="section-eyebrow">Informations légales</span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>Politique de confidentialité</h1>
      <p className="muted" style={{ marginTop: '0.75rem', maxWidth: 720 }}>
        MDM Academy Pro est une plateforme de formation gratuite dédiée aux techniciens Apple et administrateurs
        MDM. Cette page décrit comment nous traitons vos données dans ce cadre.
      </p>

      <Card className="legal-card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Données collectées</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Lors de la création d’un compte ou de la connexion, nous enregistrons les informations nécessaires au
          suivi pédagogique : identifiant, adresse e-mail le cas échéant, progression sur les parcours, scores de
          quiz, badges, quêtes hebdomadaires et statistiques de gamification (points, rang).
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Finalité et gratuité</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Ces données servent uniquement à personnaliser votre apprentissage, afficher votre tableau de bord et
          alimenter le classement communautaire. MDM Academy Pro ne vend pas vos données et ne propose pas de
          publicité ciblée. La formation reste gratuite et accessible sans achat obligatoire.
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Conservation et sécurité</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Les données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de
          votre compte en nous contactant. Nous appliquons des mesures techniques raisonnables pour protéger
          l’accès à l’API et aux bases de données hébergeant votre progression.
        </p>
      </Card>

      <Card className="legal-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Cookies et stockage local</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Le site peut utiliser le stockage local du navigateur (tokens de session, préférences de thème, caches
          légers de navigation) pour améliorer l’expérience. Aucun traceur publicitaire tiers n’est requis pour
          suivre les parcours pédagogiques.
        </p>
      </Card>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <Button href="/about" variant="secondary">
          À propos du projet
        </Button>
        <Link href="/legal/conditions" className="muted" style={{ alignSelf: 'center', fontWeight: 700 }}>
          Conditions d’utilisation →
        </Link>
      </div>
    </section>
  );
}
