import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const DELIVERED = [
  {
    title: 'Connexion web et mobile',
    description:
      'Connexion email, OAuth de développement, tokens MVP et reprise de session pour le tableau de bord et l’app mobile.',
    href: '/auth',
    cta: 'Tester la connexion',
  },
  {
    title: '3 parcours × 3 unités',
    description:
      'Apple Device Support, Jamf Pro et Intune iOS avec quiz, mini-scénarios et progression par unité.',
    href: '/courses',
    cta: 'Voir le catalogue',
  },
  {
    title: 'Tableau de bord Trailhead',
    description: 'Progression, badges, quêtes hebdo, classement et actions rapides par piste.',
    href: '/dashboard',
    cta: 'Ouvrir le tableau de bord',
  },
  {
    title: 'Badges & quêtes',
    description: 'Super-badges par piste et quêtes hebdomadaires avec points de récompense.',
    href: '/badges',
    cta: 'Voir mes badges',
  },
  {
    title: 'Sprint certification',
    description: 'Plans de révision 7 ou 14 jours pour Apple, Jamf ou Intune.',
    href: '/sprint',
    cta: 'Lancer un sprint',
  },
  {
    title: 'Paiement démo',
    description: 'Tarifs publics et paiement MVP simulé (mensuel, annuel, entreprise).',
    href: '/pricing',
    cta: 'Tester le paiement',
  },
];

const UPCOMING = [
  {
    title: 'Paiement Stripe réel',
    description: 'Paiements production avec webhooks et gestion d’abonnement.',
  },
  {
    title: 'Notifications push',
    description: 'Rappels de sprint, quêtes et streak sur mobile.',
  },
  {
    title: 'Parcours avancés',
    description: 'Modules supplémentaires, labs guidés et scénarios multi-étapes.',
  },
  {
    title: 'Équipes & entreprise',
    description: 'Invitations, reporting manager et parcours assignés.',
  },
];

const TEST_CHECKLIST = [
  { label: 'Créer un compte ou se connecter', href: '/auth', detail: 'Vérifie la session locale puis la redirection vers le tableau de bord.' },
  { label: 'Confirmer la progression', href: '/dashboard', detail: 'Statistiques, badges, quêtes et accès rapides (connecté ou fallback démo).' },
  { label: 'Explorer un parcours 3 modules', href: '/courses/apple-cert-prep', detail: 'Statuts à faire / en cours / terminé et validation d’unité.' },
  { label: 'Démarrer un sprint', href: '/sprint', detail: 'Sprint Apple, Jamf ou Intune en 7 ou 14 jours.' },
  { label: 'Essayer le paiement démo', href: '/pricing', detail: 'Plan mensuel, annuel ou entreprise avec message de démonstration.' },
  { label: 'Vérifier API & DB', href: '/diagnostics', detail: 'Health, Prisma, catalogue 3 slugs et tokens masqués.' },
];

const OFFICIAL_LINKS = [
  { label: 'Apple Training & Certifications', href: 'https://training.apple.com' },
  { label: 'Jamf Learning Hub', href: 'https://learn.jamf.com' },
  { label: 'Microsoft Learn — Intune', href: 'https://learn.microsoft.com/mem/intune/' },
];

export default function MvpPage() {
  return (
    <section style={{ padding: '1rem 0 2.5rem' }}>
      <div className="hero">
        <span className="hero-eyebrow">MVP testable</span>
        <h1>Roadmap MVP pour reviewers et testeurs</h1>
        <p style={{ marginTop: '0.75rem' }}>
          Vue d’ensemble des fonctionnalités livrées et des prochaines étapes — authentification, apprentissage
          gamifié, sprint certification et paiement de démonstration.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/auth" variant="secondary">
            Commencer le test
          </Button>
          <Button href="/dashboard" variant="dark">
            Tableau de bord
          </Button>
          <Button href="/diagnostics" variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Diagnostics
          </Button>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Livré</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>Fonctionnalités disponibles</h2>
          </div>
          <Badge tone="success" icon="\u2705">
            Release MVP
          </Badge>
        </div>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {DELIVERED.map((item) => (
            <Card key={item.title} variant="soft">
              <Badge tone="success" icon="\u2714\uFE0F">
                Livré
              </Badge>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>{item.title}</h3>
              <p className="muted" style={{ marginTop: '0.45rem', fontSize: '0.9rem' }}>{item.description}</p>
              <Button href={item.href} size="sm" style={{ marginTop: '0.75rem' }}>
                {item.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Prochainement</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>Sur la roadmap</h2>
          </div>
          <Badge tone="neutral" icon="\u{1F52E}">
            Planifié
          </Badge>
        </div>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {UPCOMING.map((item) => (
            <Card key={item.title} variant="flat" style={{ background: '#f5f5f7' }}>
              <Badge tone="outline" icon="\u{1F4C5}">
                À venir
              </Badge>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>{item.title}</h3>
              <p className="muted" style={{ marginTop: '0.45rem', fontSize: '0.9rem' }}>{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card style={{ marginTop: '2rem' }}>
        <p className="section-eyebrow">Checklist</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>Scénario de revue court</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Enchaîne ces étapes connecté, puis répète sans session pour valider les fallbacks démo.
        </p>
        <ol style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem', paddingLeft: '1.25rem' }}>
          {TEST_CHECKLIST.map((item) => (
            <li key={item.href}>
              <Button href={item.href} variant="ghost" size="sm" style={{ padding: 0, fontWeight: 800 }}>
                {item.label}
              </Button>
              <p className="muted" style={{ marginTop: '0.2rem', fontSize: '0.9rem' }}>{item.detail}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card variant="soft" style={{ marginTop: '1.5rem', borderColor: '#f0cf7a', background: '#fff8e6' }}>
        <p className="section-eyebrow">Références</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Sources de vérité externes</h2>
        <p className="muted" style={{ marginTop: '0.45rem' }}>
          Contenus pédagogiques originaux. Pour une revue métier ou certification, vérifie les exigences à jour
          auprès des éditeurs.
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
      </Card>
    </section>
  );
}
