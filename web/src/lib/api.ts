const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  provider?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface DashboardData {
  user: AuthUser;
  stats: {
    points: number;
    level: string;
    modulesCompleted: number;
    timeSpentMinutes: number;
    averageQuizScore: number;
    preparationScore?: number;
  };
  badges: string[];
  quests: { id: string; label: string; progress: number; target: number }[];
  courses: CourseSummary[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  track: string;
  description?: string;
  progressPercent?: number;
}

export interface CourseQuestion {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOption?: string;
  explanation?: string;
}

export interface CourseModule {
  id: string;
  slug: string;
  title: string;
  summary: string;
  questions: CourseQuestion[];
  game?: {
    id?: string;
    type: string;
    scenario: string;
    steps: { id: number; label: string }[];
  } | null;
}

export interface CourseDetail extends CourseSummary {
  modules: CourseModule[];
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string, displayName: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function fetchDashboard(token?: string): Promise<DashboardData> {
  try {
    return await apiRequest<DashboardData>('/users/me/dashboard', { headers: authHeader(token) });
  } catch {
    return mockDashboard();
  }
}

export async function fetchCourses(token?: string): Promise<CourseSummary[]> {
  try {
    const data = await apiRequest<{ courses: CourseSummary[] }>('/courses', { headers: authHeader(token) });
    return mergeMvpCourses(data.courses);
  } catch {
    return DEMO_COURSES.map(({ modules, ...course }) => course);
  }
}

export async function fetchCourse(slug: string, token?: string): Promise<CourseDetail> {
  try {
    const data = await apiRequest<{ course: CourseDetail }>(`/courses/${slug}`, { headers: authHeader(token) });
    return normalizeCourse(data.course);
  } catch {
    const fallback = DEMO_COURSES.find((course) => course.slug === slug);
    if (!fallback) throw new Error('Course not found');
    return fallback;
  }
}

export async function completeModule(
  moduleId: string,
  token: string,
  payload: { quizAnswers?: Record<string, string>; gameOrder?: number[] }
) {
  return apiRequest<{
    quizScore: number;
    gameScore: number;
    pointsEarned: number;
    level: string;
    badges: string[];
    preparationScore: number;
  }>(`/modules/${moduleId}/complete`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

function mockDashboard(): DashboardData {
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
      { id: '2', slug: 'jamf-pro-foundations', title: 'Fondamentaux Jamf Pro', track: 'JAMF', progressPercent: 0 },
    ],
  };
}

function mergeMvpCourses(courses: CourseSummary[]) {
  const tracks = new Set(courses.map((course) => course.track));
  const merged = [...courses];
  for (const demo of DEMO_COURSES) {
    if (!tracks.has(demo.track)) {
      const { modules: _modules, ...summary } = demo;
      merged.push(summary);
    }
  }
  return merged;
}

function normalizeCourse(course: CourseDetail): CourseDetail {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      questions: module.questions.map((question) => ({
        ...question,
        options: Array.isArray(question.options) ? question.options : [],
      })),
      game: module.game
        ? {
            ...module.game,
            steps: Array.isArray(module.game.steps) ? module.game.steps : [],
          }
        : null,
    })),
  };
}

const DEMO_COURSES: CourseDetail[] = [
  {
    id: 'demo-apple',
    slug: 'apple-cert-prep',
    title: 'Parcours Apple — Device Support & MDM',
    track: 'APPLE',
    description: 'Diagnostic, sécurité et préparation aux fondamentaux Apple Device Support.',
    progressPercent: 0,
    modules: [
      {
        id: 'demo-apple-module-1',
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        summary: 'Identifier une panne simple, sécuriser les données et choisir la bonne étape de support.',
        questions: [
          {
            id: 'demo-apple-q1',
            type: 'MULTIPLE_CHOICE',
            prompt: "Un iPhone ne s'allume plus après une chute. Quelle est la première étape logique ?",
            options: [
              { id: 'a', label: 'Remplacer la batterie immédiatement' },
              { id: 'b', label: 'Vérifier chargeur/câble et forcer le redémarrage' },
              { id: 'c', label: 'Restaurer sans sauvegarde' },
            ],
            correctOption: 'b',
            explanation: 'On élimine d’abord alimentation et redémarrage forcé avant toute réparation matérielle.',
          },
          {
            id: 'demo-apple-q2',
            type: 'TRUE_FALSE',
            prompt: 'Avant une restauration, il est recommandé de vérifier les sauvegardes disponibles.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'La protection des données passe avant les opérations destructrices.',
          },
        ],
        game: {
          type: 'SCENARIO_FIX',
          scenario: 'Un MacBook affiche une roue de chargement après une mise à jour macOS.',
          steps: [
            { id: 1, label: 'Démarrer en mode sans échec' },
            { id: 2, label: 'Vérifier l’espace disque disponible' },
            { id: 3, label: 'Réinstaller macOS en conservant les données' },
          ],
        },
      },
    ],
  },
  {
    id: 'demo-jamf',
    slug: 'jamf-pro-foundations',
    title: 'Fondamentaux Jamf Pro',
    track: 'JAMF',
    description: 'Découvrir inventaire, smart groups, politiques et bonnes pratiques MDM.',
    progressPercent: 0,
    modules: [
      {
        id: 'demo-jamf-module-1',
        slug: 'smart-groups-policies',
        title: 'Smart Groups et politiques',
        summary: 'Comprendre comment cibler des Mac et déclencher une politique Jamf Pro.',
        questions: [
          {
            id: 'demo-jamf-q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'À quoi sert principalement un Smart Group Jamf Pro ?',
            options: [
              { id: 'a', label: 'Créer un compte Apple Business Manager' },
              { id: 'b', label: 'Cibler dynamiquement des appareils selon des critères' },
              { id: 'c', label: 'Remplacer le serveur MDM' },
            ],
            correctOption: 'b',
            explanation: 'Un Smart Group regroupe automatiquement les appareils correspondant à des critères.',
          },
        ],
        game: {
          type: 'POLICY_ORDER',
          scenario: 'Préparer le déploiement d’un paquet sur un groupe pilote de Mac.',
          steps: [
            { id: 1, label: 'Créer ou vérifier le Smart Group pilote' },
            { id: 2, label: 'Associer la politique au paquet' },
            { id: 3, label: 'Limiter le scope puis tester sur un Mac' },
          ],
        },
      },
    ],
  },
];

export { API_URL };
