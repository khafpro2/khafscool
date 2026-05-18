import Link from 'next/link';

const PLANS = [
  {
    name: 'Essai gratuit',
    price: '0 €',
    period: '14 jours',
    description: 'Valider le format, tester les parcours et lancer un sprint de démonstration.',
    cta: 'Démarrer gratuitement',
    href: '/auth',
    features: [
      'Accès découverte aux parcours Apple, Jamf, Intune et ServiceNow',
      'Sprint Certification en mode démo',
      'Mini-jeu ServiceNow pour pratiquer la qualification ticket',
      'Dashboard web/mobile avec progression locale',
    ],
  },
  {
    name: 'Individuel',
    price: '19 €',
    period: '/ mois',
    description: 'Pour préparer une certification et suivre une progression personnelle complète.',
    cta: 'Voir les parcours',
    href: '/courses',
    features: [
      'Tous les modules Apple, Jamf, Intune et ServiceNow',
      'Sprint Certification 7 ou 14 jours',
      'Ressources officielles et liens de révision',
      'Badges, progression et reprise sur dashboard/mobile',
    ],
    highlight: true,
  },
  {
    name: 'Entreprise',
    price: 'Sur devis',
    period: '',
    description: 'Pour former une équipe support, standardiser les pratiques et piloter l’adoption.',
    cta: 'Préparer un sprint',
    href: '/sprint',
    features: [
      'Parcours alignés Apple, Jamf, Intune et ServiceNow',
      'Plan de sprint partagé pour cohortes support',
      'Ressources officielles pour onboarding et montée en compétence',
      'Suivi équipe à brancher sur le dashboard admin',
    ],
  },
];

const MVP_FEATURES = [
  'Parcours guidés Apple, Jamf, Intune et ServiceNow',
  'Sprint Certification pour transformer les modules en plan de révision',
  'Mini-jeu ServiceNow pour s’entraîner à qualifier et prioriser les tickets',
  'Ressources officielles centralisées pour préparer les examens',
  'Dashboard responsive utilisable côté web et mobile',
];

export default function PricingPage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 55%, #fff8e6 100%)',
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          padding: '1.75rem',
        }}
      >
        <div>
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Tarifs MVP
          </p>
          <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.12, marginTop: '0.35rem' }}>
            Choisis le bon niveau pour apprendre Apple MDM
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.75rem', maxWidth: 760 }}>
            Apple MDM Academy combine parcours métier, sprint de certification, mini-jeu ServiceNow et ressources
            officielles. Le paiement Stripe est encore un stub: les CTA envoient vers l’inscription, les cours ou le
            sprint.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link className="btn" href="/auth">
              Essayer gratuitement
            </Link>
            <Link className="btn" href="/courses" style={{ background: '#1d1d1f' }}>
              Explorer les cours
            </Link>
          </div>
        </div>
        <aside
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '1rem',
          }}
        >
          <strong>Inclus dans le MVP</strong>
          <ul style={{ color: 'var(--muted)', marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
            {MVP_FEATURES.map((feature) => (
              <li key={feature} style={{ marginBottom: '0.45rem' }}>
                {feature}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className="card"
            style={{
              borderColor: plan.highlight ? 'var(--accent)' : 'var(--border)',
              borderWidth: plan.highlight ? 2 : 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {plan.highlight && (
              <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Recommandé
              </p>
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{plan.name}</h2>
            <p style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: 'var(--muted)' }}> {plan.period}</span>
            </p>
            <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>{plan.description}</p>
            <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', color: 'var(--muted)' }}>
              {plan.features.map((f) => (
                <li key={f} style={{ marginBottom: '0.35rem' }}>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              className="btn"
              href={plan.href}
              style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </div>

      <section className="card" style={{ background: '#fff8e6', borderColor: '#f0cf7a', marginTop: '1.5rem' }}>
        <strong>Paiement à brancher</strong>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          Les offres reflètent le MVP actuel. Le checkout Stripe, les taxes et la gestion d’abonnement restent à
          connecter avant une mise en production commerciale.
        </p>
      </section>
    </section>
  );
}
