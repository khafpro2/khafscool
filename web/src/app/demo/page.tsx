import Link from 'next/link';

const WITHOUT_ACCOUNT_STEPS = [
  {
    title: 'Catalogue public',
    description: 'Parcours Apple, Jamf, Intune et ServiceNow consultables sans session pour valider le contenu.',
    href: '/courses',
    cta: 'Explorer le catalogue',
  },
  {
    title: 'Ressources officielles',
    description: 'Liens Apple, Jamf, Microsoft et ServiceNow pour comparer les références pendant la revue.',
    href: '/resources',
    cta: 'Ouvrir les ressources',
  },
  {
    title: 'Pricing',
    description: 'Page tarifs visible publiquement, avec redirection vers la connexion au moment du checkout.',
    href: '/pricing',
    cta: 'Voir les tarifs',
  },
  {
    title: 'ServiceNow fallback demo',
    description: 'Mini-jeu de scoring utilisable même sans token pour tester le scénario de démonstration local.',
    href: '/servicenow',
    cta: 'Lancer le fallback',
  },
];

const WITH_ACCOUNT_STEPS = [
  {
    title: 'Auth / register',
    description: 'Créer un compte local ou se connecter, puis vérifier que la session redirige vers le dashboard.',
    href: '/auth',
    cta: 'Créer une session',
  },
  {
    title: 'Dashboard',
    description: 'Contrôler progression, badges, quêtes, actions rapides et reprise de parcours connectée.',
    href: '/dashboard',
    cta: 'Ouvrir le dashboard',
  },
  {
    title: 'Sprint',
    description: 'Démarrer un sprint de certification 7 ou 14 jours et vérifier son suivi dans le dashboard.',
    href: '/sprint',
    cta: 'Tester un sprint',
  },
  {
    title: 'Progression',
    description: 'Ouvrir un parcours, viser un module et confirmer les pourcentages affichés côté compte.',
    href: '/courses',
    cta: 'Continuer un parcours',
  },
  {
    title: 'Billing demo',
    description: 'Depuis une session active, déclencher un checkout MVP et vérifier la réponse Stripe simulée.',
    href: '/pricing',
    cta: 'Tester le billing',
  },
];

const PRIMARY_ROUTES = [
  { href: '/auth', label: 'Auth / register' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sprint', label: 'Sprint' },
  { href: '/courses', label: 'Catalogue' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/servicenow', label: 'ServiceNow' },
  { href: '/resources', label: 'Ressources' },
  { href: '/diagnostics', label: 'Diagnostics API/DB' },
  { href: '/mvp', label: 'Résumé MVP' },
];

export default function DemoPage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 55%, #fff8e6 100%)',
          padding: '1.75rem',
        }}
      >
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
          Guide de démonstration
        </p>
        <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.12, marginTop: '0.35rem' }}>
          Tester Apple MDM Academy sans se perdre
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.85rem', maxWidth: 840 }}>
          Cette page donne aux testeurs un parcours court pour vérifier le MVP en français: surfaces publiques,
          scénario connecté, prérequis API/DB et accès directs aux routes principales.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Link className="btn" href="/courses">
            Tester sans compte
          </Link>
          <Link className="btn" href="/auth" style={{ background: '#1d1d1f' }}>
            Tester avec compte
          </Link>
          <Link className="btn" href="/diagnostics" style={{ background: '#0f7a3b' }}>
            Vérifier API / DB
          </Link>
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

      <section
        className="card"
        style={{
          background: '#eef6ff',
          borderColor: '#85bfff',
          marginTop: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Statut requis avant revue</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Le backend et la base doivent répondre pour tester inscription, dashboard, sprint connecté et billing demo.
          La page diagnostics vérifie depuis le navigateur les endpoints API, la DB Prisma, le catalogue public et la
          présence des tokens locaux sans afficher de secret.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          <Link className="btn" href="/diagnostics">
            Ouvrir les diagnostics API/DB
          </Link>
          <Link className="btn" href="/mvp" style={{ background: '#1d1d1f' }}>
            Lire le résumé MVP
          </Link>
        </div>
      </section>

      <section className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Boutons vers les routes principales</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Utilise ces accès rapides pour reprendre un test interrompu ou vérifier une route précise.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {PRIMARY_ROUTES.map((route) => (
            <Link className="btn" href={route.href} key={route.href} style={{ background: '#1d1d1f' }}>
              {route.label}
            </Link>
          ))}
        </div>
      </section>
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
    <article className="card">
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{title}</h2>
      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{description}</p>
      <ol style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem', paddingLeft: '1.25rem' }}>
        {steps.map((step) => (
          <li key={step.title}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{step.title}</h3>
            <p style={{ color: 'var(--muted)', marginTop: '0.2rem' }}>{step.description}</p>
            <Link href={step.href} style={{ display: 'inline-block', fontWeight: 800, marginTop: '0.35rem' }}>
              {step.cta}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
