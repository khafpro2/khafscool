import Link from 'next/link';

export default function HomePage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15 }}>
        Formez vos techniciens Apple &amp; MDM en mode jeu
      </h1>
      <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: 'var(--muted)', maxWidth: 640 }}>
        Parcours Apple, Jamf Pro, Microsoft Intune et ServiceNow — quiz, mini‑jeux, badges et
        préparation aux certifications. Contenus originaux inspirés de la documentation officielle.
      </p>
      <p style={{ marginTop: '0.75rem', color: 'var(--muted)' }}>
        Reviewer ou testeur ? Consulte le <Link href="/mvp">résumé MVP testable</Link>.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/auth" className="btn">
          Démarrer le MVP
        </Link>
        <Link href="/courses" className="btn" style={{ background: '#1d1d1f' }}>
          Explorer les parcours
        </Link>
        <Link href="/resources" className="btn" style={{ background: '#0f7a3b' }}>
          Vérifier les sources officielles
        </Link>
        <Link href="/servicenow" className="btn" style={{ background: '#4f46e5' }}>
          Jouer au scoring ServiceNow
        </Link>
      </div>
      <div
        style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          { title: 'Parcours Apple', desc: 'Device Support, déploiement, sécurité' },
          { title: 'Jamf Pro', desc: 'MDM, ABM, politiques et alertes' },
          { title: 'Intune', desc: 'Gestion Apple en environnement hybride' },
          { title: 'ServiceNow', desc: 'Tickets, priorités, notes de résolution', href: '/servicenow' },
        ].map((f) => (
          <article key={f.title} className="card">
            <h3 style={{ fontWeight: 700 }}>{f.title}</h3>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>{f.desc}</p>
            {typeof f.href === 'string' && (
              <Link href={f.href} style={{ display: 'inline-block', marginTop: '0.75rem', fontWeight: 600 }}>
                Ouvrir le mini-jeu
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
