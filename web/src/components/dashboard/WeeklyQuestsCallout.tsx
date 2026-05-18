import Link from 'next/link';

export function WeeklyQuestsCallout() {
  return (
    <section
      className="card"
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f4fbf6 100%)',
        borderColor: '#a8d8b2',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        marginTop: '1.5rem',
      }}
    >
      <div>
        <p style={{ color: '#0f7a3b', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
          Quêtes hebdo
        </p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Avance tes objectifs de la semaine
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          Suis tes quêtes Apple, Jamf, Intune et ServiceNow, leur progression et les points à débloquer
          avant la réinitialisation hebdomadaire.
        </p>
      </div>
      <Link className="btn" href="/quests">
        Voir mes quêtes
      </Link>
    </section>
  );
}
