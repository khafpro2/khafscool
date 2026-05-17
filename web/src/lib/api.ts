const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface DashboardCourse {
  id: string;
  slug: string;
  title: string;
  track: string;
  progressPercent: number;
}

export interface DashboardQuest {
  id: string;
  label: string;
  progress: number;
  target: number;
}

export interface DashboardData {
  user: { id: string; displayName: string | null; email: string | null };
  stats: {
    points: number;
    level: string;
    modulesCompleted: number;
    timeSpentMinutes: number;
    averageQuizScore: number;
    preparationScore: number;
  };
  badges: string[];
  quests: DashboardQuest[];
  courses: DashboardCourse[];
}

export async function fetchDashboard(token?: string): Promise<DashboardData> {
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
      { id: '2', slug: 'jamf-pro-foundations', title: 'Parcours Jamf Pro', track: 'JAMF', progressPercent: 35 },
      { id: '3', slug: 'intune-apple-basics', title: 'Parcours Intune Apple', track: 'INTUNE', progressPercent: 0 },
    ],
  };
}

export { API_URL };
