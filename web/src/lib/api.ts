const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchDashboard(token?: string) {
  try {
    const res = await fetch(`${API_URL}/users/me/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    return mockDashboard();
  }
}

function mockDashboard() {
  return {
    user: { id: 'demo', displayName: 'Technicien démo', email: 'demo@ama.dev' },
    stats: {
      points: 120,
      level: 'TECHNICIAN',
      modulesCompleted: 1,
      timeSpentMinutes: 12,
      averageQuizScore: 85,
      preparationScore: 72,
    },
    badges: ['apple-mdm-foundation'],
    quests: [{ id: '1', label: 'Termine 3 modules Apple cette semaine', progress: 1, target: 3 }],
    courses: [
      { id: '1', slug: 'apple-cert-prep', title: 'Parcours Apple', track: 'APPLE', progressPercent: 100 },
    ],
  };
}

export { API_URL };
