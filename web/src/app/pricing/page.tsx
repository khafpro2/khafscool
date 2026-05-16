const PLANS = [
  {
    name: 'Essai gratuit',
    price: '0 €',
    period: '14 jours',
    features: ['2 modules par parcours', 'Badges de base', 'Tableau de bord'],
  },
  {
    name: 'Individuel',
    price: '19 €',
    period: '/ mois',
    features: ['Tous les parcours', 'Quêtes hebdomadaires', 'Certification Sprint'],
    highlight: true,
  },
  {
    name: 'Entreprise',
    price: 'Sur devis',
    period: '',
    features: ['Sièges multiples', 'Tableau admin équipe', 'Support prioritaire'],
  },
];

export default function PricingPage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tarifs</h1>
      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
        Abonnement mensuel ou annuel. Paiement via Stripe (Apple Pay / Google Pay supportés).
      </p>
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
            style={plan.highlight ? { borderColor: 'var(--accent)', borderWidth: 2 } : undefined}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{plan.name}</h2>
            <p style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: 'var(--muted)' }}> {plan.period}</span>
            </p>
            <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', color: 'var(--muted)' }}>
              {plan.features.map((f) => (
                <li key={f} style={{ marginBottom: '0.35rem' }}>
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
