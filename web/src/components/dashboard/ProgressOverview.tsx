interface Props {
  modulesCompleted: number;
  timeSpentMinutes: number;
  averageQuizScore: number;
  badges: string[];
  preparationScore?: number;
}

export function ProgressOverview({
  modulesCompleted,
  timeSpentMinutes,
  averageQuizScore,
  badges,
  preparationScore,
}: Props) {
  return (
    <section className="card" style={{ marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Vue d’ensemble</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
        }}
      >
        <Stat label="Modules terminés" value={String(modulesCompleted)} />
        <Stat label="Temps passé" value={`${timeSpentMinutes} min`} />
        <Stat label="Score quiz moyen" value={`${averageQuizScore}%`} />
        {preparationScore != null && (
          <Stat label="Préparation certif. Apple" value={`${preparationScore}%`} />
        )}
      </div>
      {badges.length > 0 && (
        <div>
          <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Badges</p>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.5rem',
              listStyle: 'none',
            }}
          >
            {badges.map((b) => (
              <li
                key={b}
                style={{
                  background: '#e8f4ff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 999,
                  fontSize: '0.85rem',
                }}
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
    </div>
  );
}
