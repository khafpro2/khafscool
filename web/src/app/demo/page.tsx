import { DEMO_ACCOUNT } from '@ama/shared/constants';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BrandIcon } from '@/components/ui/BrandIcon';
import type { BrandId } from '@/lib/brands';

const GUIDED_STEPS: {
  brand?: BrandId;
  cta: string;
  description: string;
  href: string;
  icon?: string;
  title: string;
}[] = [
  {
    title: 'Compte démo',
    icon: '\u{1F464}',
    description:
      'Explore le catalogue, le tableau de bord et le classement sans inscription. Crée un compte sur /auth pour sauvegarder ta progression.',
    href: '/courses',
    cta: 'Explorer sans compte',
  },
  {
    title: 'Parcours MDM',
    brand: 'apple',
    description:
      'Ouvre un parcours Apple, Jamf ou Intune — 3 unités chacun, statuts à faire / en cours / terminé et reprise automatique.',
    href: '/courses/apple-cert-prep',
    cta: 'Ouvrir le parcours Apple',
  },
  {
    title: 'Quiz et mini-scénarios',
    brand: 'jamf',
    description:
      'Valide une unité avec le QCM et le mini-jeu interactif. Les points et badges se mettent à jour dans le tableau de bord.',
    href: '/courses/jamf-pro-foundations',
    cta: 'Tester un quiz Jamf',
  },
  {
    title: 'Quêtes hebdo',
    icon: '\u{1F3AF}',
    description:
      'Consulte les défis de la semaine, filtre par piste (Apple / Jamf / Intune) et vérifie la progression des récompenses bonus.',
    href: '/quests',
    cta: 'Voir les quêtes',
  },
  {
    title: 'Classement',
    icon: '\u{1F3C6}',
    description:
      'Compare ta progression à la communauté, filtre par piste et repère ton rang (#) dans le header ou sur cette page.',
    href: '/leaderboard',
    cta: 'Ouvrir le classement',
  },
  {
    title: 'Certificat de complétion',
    brand: 'microsoft',
    description:
      'Termine les 3 unités d’un parcours pour débloquer le certificat imprimable (mode démo OK sur apple-cert-prep).',
    href: '/courses/apple-cert-prep/certificate',
    cta: 'Voir un certificat démo',
  },
];

const QUICK_ROUTES = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/badges', label: 'Badges' },
  { href: '/sprint', label: 'Sprint' },
  { href: '/resources', label: 'Ressources' },
  { href: '/diagnostics', label: 'Diagnostics' },
];

export default function DemoPage() {
  return (
    <section className="demo-page" style={{ padding: '1rem 0 2.5rem' }}>
      <div className="hero">
        <span className="hero-eyebrow">Guide de démonstration</span>
        <h1>Tester Apple MDM Academy en 6 étapes</h1>
        <p style={{ marginTop: '0.75rem', maxWidth: 720 }}>
          Parcours guidé en français pour valider le MVP : compte démo, parcours, quiz, quêtes, classement et
          certificat — avec liens directs et support du thème sombre.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/courses" variant="secondary">
            Commencer sans compte
          </Button>
          <Button href="/auth" variant="dark">
            Créer une session
          </Button>
          <Button href="/diagnostics" variant="warm">
            Vérifier API / DB
          </Button>
        </div>
      </div>

      <div className="demo-credentials-banner" role="note" aria-label="Identifiants compte démo">
        <div className="demo-credentials-banner__inner">
          <Badge tone="neutral" icon="\u{1F4E7}">
            Compte démo
          </Badge>
          <p className="demo-credentials-banner__title">
            <strong>{DEMO_ACCOUNT.displayName}</strong> · <code>{DEMO_ACCOUNT.email}</code>
          </p>
          <p className="demo-credentials-banner__hint">
            Mot de passe API (après <code>pnpm db:seed</code>) : <code>{DEMO_ACCOUNT.password}</code>. Sans
            connexion, le mode local affiche des données de démonstration dans le navigateur. Connecte-toi sur{' '}
            <a href="/auth">/auth</a> pour enregistrer ta progression réelle.
          </p>
        </div>
      </div>

      <Card as="section" className="demo-guided-card" style={{ marginTop: '1.5rem' }}>
        <p className="section-eyebrow">Parcours guidé</p>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>
          6 étapes pour une revue complète
        </h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Suis l’ordre recommandé ou clique directement sur une étape. Chaque lien ouvre la surface à valider.
        </p>
        <ol className="demo-guided-list">
          {GUIDED_STEPS.map((step, index) => (
            <li key={step.title} className="demo-guided-step">
              <Card variant="flat" className="demo-guided-step__inner">
                <div className="demo-guided-step__row">
                  <span className="demo-guided-step__index" aria-hidden>
                    {index + 1}
                  </span>
                  <div className="demo-guided-step__icon" aria-hidden>
                    {step.brand ? (
                      <BrandIcon brand={step.brand} size="md" />
                    ) : (
                      <span className="demo-guided-step__emoji">{step.icon}</span>
                    )}
                  </div>
                  <div className="demo-guided-step__body">
                    <h3 className="demo-guided-step__title">{step.title}</h3>
                    <p className="muted demo-guided-step__description">{step.description}</p>
                    <Button href={step.href} size="sm" style={{ marginTop: '0.55rem' }}>
                      {step.cta}
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Card>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginTop: '1.5rem',
        }}
      >
        <Card variant="soft" className="demo-prereq-card">
          <Badge tone="neutral" icon="\u{1F6E1}">
            Prérequis revue
          </Badge>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.75rem' }}>Statut requis avant revue</h2>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Le backend et la base doivent répondre pour tester inscription, tableau de bord et sprint connecté.
            La page diagnostics vérifie API, Prisma, catalogue (3 parcours) et tokens locaux sans afficher de secret.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            <Button href="/diagnostics">Ouvrir les diagnostics</Button>
            <Button href="/mvp" variant="dark">
              Lire le résumé MVP
            </Button>
          </div>
        </Card>

        <Card className="demo-tracks-card">
          <p className="section-eyebrow">Trois pistes MDM</p>
          <div className="demo-tracks-row">
            <BrandIcon brand="apple" size="lg" />
            <BrandIcon brand="jamf" size="lg" />
            <BrandIcon brand="microsoft" size="lg" />
          </div>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Apple Device Support, Jamf Pro et Microsoft Intune — quiz, badges et sprints gratuits.
          </p>
          <Button href="/courses" variant="secondary" size="sm" style={{ marginTop: '0.85rem' }}>
            Voir le catalogue
          </Button>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <p className="section-eyebrow">Accès rapides</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Routes complémentaires</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {QUICK_ROUTES.map((route) => (
            <Button key={route.href} href={route.href} variant="dark" size="sm">
              {route.label}
            </Button>
          ))}
        </div>
      </Card>
    </section>
  );
}
