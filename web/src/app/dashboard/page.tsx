import { cookies } from 'next/headers';
import { ProgressOverview } from '@/components/dashboard/ProgressOverview';
import { fetchDashboard, type DashboardCourse, type DashboardQuest } from '@/lib/api';

export default async function DashboardPage() {
  const token = (await cookies()).get('ama_access')?.value;
  const data = await fetchDashboard(token);
  const { user, stats, badges, quests, courses } = data;

  return (
    <section style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tableau de bord</h1>
      <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
        Bonjour, {user.displayName ?? 'Technicien'}
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        Niveau : <strong>{stats.level}</strong> · {stats.points} points
      </p>

      <ProgressOverview
        modulesCompleted={stats.modulesCompleted}
        timeSpentMinutes={stats.timeSpentMinutes}
        averageQuizScore={stats.averageQuizScore}
        badges={badges}
        preparationScore={stats.preparationScore}
      />

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Parcours</h2>
        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {courses.map((c: DashboardCourse) => (
            <article key={c.id} className="card">
              <h3 style={{ fontWeight: 600 }}>{c.title}</h3>
              <p style={{ marginTop: '0.25rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                Track {c.track}
              </p>
              <div style={{ marginTop: '0.75rem', height: 8, background: '#e5e5ea', borderRadius: 4 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${c.progressPercent}%`,
                    background: 'var(--accent)',
                    borderRadius: 4,
                  }}
                />
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                {c.progressPercent}% complété
              </p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Quêtes de la semaine</h2>
        <ul style={{ marginTop: '1rem', listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
          {quests.map((q: DashboardQuest) => (
            <li key={q.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{q.label}</span>
              <span style={{ fontWeight: 600 }}>
                {q.progress}/{q.target}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
