import Link from 'next/link';

const MVP_SECTIONS = [
  {
    title: 'Auth web/mobile',
    description:
      'Connexion locale, inscription, stockage du token MVP et reprise de session pour le dashboard web et les écrans mobile.',
    href: '/auth',
    cta: 'Tester la connexion',
  },
  {
    title: 'Parcours et progression',
    description:
      'Parcours Apple, Jamf, Intune et ServiceNow avec progression, prochaine action recommandée, badges et quêtes côté dashboard.',
    href: '/dashboard',
    cta: 'Voir le dashboard',
  },
  {
    title: 'Certification Sprint',
    description:
      'Sprint de 7 ou 14 jours pour transformer un objectif de certification en plan de révision mesurable.',
    href: '/sprint',
    cta: 'Lancer un sprint',
  },
  {
    title: 'ServiceNow scoring',
    description:
      'Mini-jeu de qualification et scoring de ticket, utilisable en mode connecté ou en démonstration locale.',
    href: '/servicenow',
    cta: 'Jouer au scoring',
  },
  {
    title: 'Billing demo',
    description:
      'Page tarifs et checkout MVP avec redirection de connexion, appel backend et réponse de démonstration quand Stripe est simulé.',
    href: '/pricing',
    cta: 'Tester le billing',
  },
  {
    title: 'Ressources officielles',
    description:
      'Liens de référence Apple, Jamf, Microsoft Intune et ServiceNow pour vérifier les contenus avant une revue métier.',
    href: '/resources',
    cta: 'Ouvrir les sources',
  },
];

const TEST_CHECKLIST = [
  {
    label: 'Créer un compte ou se connecter',
    href: '/auth',
    detail: 'Vérifie la création de session locale, puis la redirection vers le dashboard.',
  },
  {
    label: 'Confirmer la progression',
    href: '/dashboard',
    detail: 'Contrôle les statistiques, badges, quêtes et accès rapides, connecté ou en fallback démo.',
  },
  {
    label: 'Explorer un parcours',
    href: '/courses',
    detail: 'Ouvre la liste des cours, puis un module pour vérifier les liens internes.',
  },
  {
    label: 'Démarrer un Certification Sprint',
    href: '/sprint',
    detail: 'Teste un sprint Apple, Jamf, Intune ou ServiceNow en 7 ou 14 jours.',
  },
  {
    label: 'Scorer un ticket ServiceNow',
    href: '/servicenow',
    detail: 'Soumets une note de résolution et vérifie le score obtenu.',
  },
  {
    label: 'Essayer le checkout démo',
    href: '/pricing',
    detail: 'Lance un plan mensuel, annuel ou entreprise et vérifie le message de démonstration.',
  },
  {
    label: 'Comparer avec les ressources officielles',
    href: '/resources',
    detail: 'Valide que les liens externes de référence restent accessibles.',
  },
];

const OFFICIAL_LINKS = [
  { label: 'Apple Training & Certifications', href: 'https://training.apple.com' },
  { label: 'Jamf Learning Hub', href: 'https://learn.jamf.com' },
  { label: 'Microsoft Learn - Intune', href: 'https://learn.microsoft.com/mem/intune/' },
  { label: 'ServiceNow Documentation', href: 'https://docs.servicenow.com' },
];

export default function MvpPage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 58%, #fff8e6 100%)',
          padding: '1.75rem',
        }}
      >
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
          MVP testable
        </p>
        <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.12, marginTop: '0.35rem' }}>
          Guide rapide pour reviewers et testeurs
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.85rem', maxWidth: 820 }}>
          Cette page regroupe les surfaces principales à vérifier pour la release MVP: authentification,
          apprentissage, sprint certification, scoring ServiceNow, billing de démonstration et sources officielles.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Link className="btn" href="/auth">
            Commencer le test
          </Link>
          <Link className="btn" href="/dashboard" style={{ background: '#1d1d1f' }}>
            Ouvrir le dashboard
          </Link>
        </div>
      </div>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Périmètre MVP</h2>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            marginTop: '1rem',
          }}
        >
          {MVP_SECTIONS.map((item) => (
            <article className="card" key={item.title}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{item.title}</h3>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{item.description}</p>
              <Link href={item.href} style={{ display: 'inline-block', fontWeight: 700, marginTop: '0.85rem' }}>
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className="card"
        style={{
          background: '#ffffff',
          marginTop: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Checklist de test</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Utilise ces liens dans l’ordre pour valider un scénario de revue court, puis répète les étapes clés sans
          session afin de confirmer les fallbacks de démonstration.
        </p>
        <ol style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem', paddingLeft: '1.25rem' }}>
          {TEST_CHECKLIST.map((item) => (
            <li key={item.href}>
              <Link href={item.href} style={{ fontWeight: 800 }}>
                {item.label}
              </Link>
              <p style={{ color: 'var(--muted)', marginTop: '0.2rem' }}>{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="card"
        style={{
          background: '#fff8e6',
          borderColor: '#f0cf7a',
          marginTop: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sources de vérité externes</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.45rem' }}>
          Les contenus pédagogiques du MVP sont originaux. Pour une revue métier ou certification, vérifie toujours les
          exigences à jour auprès des éditeurs.
        </p>
        <ul style={{ display: 'grid', gap: '0.5rem', listStyle: 'none', marginTop: '1rem' }}>
          {OFFICIAL_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="noopener noreferrer" target="_blank" style={{ fontWeight: 800 }}>
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
