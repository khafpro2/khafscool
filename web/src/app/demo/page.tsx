import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const WITHOUT_ACCOUNT_STEPS = [
  {
    title: 'Catalogue public',
    description: 'Parcours Apple, Jamf et Intune consultables sans session pour valider le contenu 3×3 unités.',
    href: '/courses',
    cta: 'Explorer le catalogue',
  },
  {
    title: 'Ressources officielles',
    description: 'Liens Apple, Jamf et Microsoft pour comparer les références pendant la revue.',
    href: '/resources',
    cta: 'Ouvrir les ressources',
  },
  {
    title: 'Commencer gratuitement',
    description: 'Créer un compte ou explorer le catalogue sans engagement — tous les parcours sont accessibles.',
    href: '/auth',
    cta: 'Créer un compte',
  },
];

const WITH_ACCOUNT_STEPS = [
  {
    title: 'Authentification',
    description: 'Créer un compte local ou se connecter, puis vérifier que la session redirige vers le tableau de bord.',
    href: '/auth',
    cta: 'Créer une session',
  },
  {
    title: 'Tableau de bord',
    description: 'Contrôler progression, badges, quêtes, actions rapides et reprise de parcours connectée.',
    href: '/dashboard',
    cta: 'Ouvrir le tableau de bord',
  },
  {
    title: 'Sprint certification',
    description: 'Démarrer un sprint de certification 7 ou 14 jours et vérifier son suivi dans le tableau de bord.',
    href: '/sprint',
    cta: 'Tester un sprint',
  },
  {
    title: 'Progression parcours',
    description: 'Ouvrir un parcours, viser une unité et confirmer les statuts à faire / en cours / terminé.',
    href: '/courses/apple-cert-prep',
    cta: 'Continuer un parcours',
  },
  {
    title: 'Classement',
    description: 'Comparer ta progression à la communauté et vérifier ton rang.',
    href: '/leaderboard',
    cta: 'Voir le classement',
  },
];

const PRIMARY_ROUTES = [
  { href: '/auth', label: 'Connexion' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/badges', label: 'Badges' },
  { href: '/quests', label: 'Quêtes' },
  { href: '/sprint', label: 'Sprint' },
  { href: '/courses', label: 'Catalogue' },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/resources', label: 'Ressources' },
  { href: '/diagnostics', label: 'Diagnostics' },
  { href: '/mvp', label: 'Résumé MVP' },
];

export default function DemoPage() {
  return (
    <section style={{ padding: '1rem 0 2.5rem' }}>
      <div className="hero">
        <span className="hero-eyebrow">Guide de démonstration</span>
        <h1>Tester Apple MDM Academy sans te perdre</h1>
        <p style={{ marginTop: '0.75rem' }}>
          Parcours guidé pour valider le MVP en français : surfaces publiques, scénario connecté, prérequis API/DB
          et accès directs aux routes principales.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/courses" variant="secondary">
            Tester sans compte
          </Button>
          <Button href="/auth" variant="dark">
            Tester avec compte
          </Button>
          <Button href="/diagnostics" variant="warm">
            Vérifier API / DB
          </Button>
        </div>
      </div>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginTop: '1.5rem',
        }}
      >
        <DemoFlowCard
          description="Commence ici pour valider les contenus et fallbacks visibles par un reviewer non connecté."
          steps={WITHOUT_ACCOUNT_STEPS}
          title="Tester sans compte"
        />
        <DemoFlowCard
          description="Utilise ensuite un compte local pour confirmer les flux qui dépendent du token navigateur."
          steps={WITH_ACCOUNT_STEPS}
          title="Tester avec compte"
        />
      </section>

      <Card variant="soft" style={{ marginTop: '1.5rem', borderColor: '#85bfff', background: '#eef6ff' }}>
        <Badge tone="neutral" icon="\u{1F6E1}">
          Prérequis revue
        </Badge>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.75rem' }}>Statut requis avant revue</h2>
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

      <Card style={{ marginTop: '1.5rem' }}>
        <p className="section-eyebrow">Accès rapides</p>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>Routes principales</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Reprends un test interrompu ou vérifie une route précise.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {PRIMARY_ROUTES.map((route) => (
            <Button key={route.href} href={route.href} variant="dark" size="sm">
              {route.label}
            </Button>
          ))}
        </div>
      </Card>
    </section>
  );
}

function DemoFlowCard({
  description,
  steps,
  title,
}: {
  description: string;
  steps: { cta: string; description: string; href: string; title: string }[];
  title: string;
}) {
  return (
    <Card as="article">
      <p className="section-eyebrow">{title}</p>
      <p className="muted" style={{ marginTop: '0.35rem' }}>{description}</p>
      <ol style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem', listStyle: 'none', padding: 0 }}>
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card variant="flat" style={{ background: '#f8fafd' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <span
                  aria-hidden
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{step.title}</h3>
                  <p className="muted" style={{ marginTop: '0.2rem', fontSize: '0.9rem' }}>{step.description}</p>
                  <Button href={step.href} size="sm" style={{ marginTop: '0.5rem' }}>
                    {step.cta}
                  </Button>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </Card>
  );
}
