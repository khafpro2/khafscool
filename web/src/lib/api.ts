import { refreshSession } from './auth';
import { formatTrack } from './tracks';

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
  certificationSprint?: CertificationSprintSummary | null;
  courses: CourseSummary[];
}

export type CertificationSprintTrack = 'APPLE' | 'JAMF' | 'INTUNE' | 'SERVICENOW';
export type CertificationSprintDays = 7 | 14;

export interface CertificationSprintSummary {
  id: string;
  questKey: string;
  track: CertificationSprintTrack;
  label: string;
  days: CertificationSprintDays;
  startedAt: string;
  endsAt: string;
  target: number;
  progress: number;
  progressPercent: number;
  remainingModules: number;
  completed: boolean;
  expired: boolean;
}

export interface CourseNextModule {
  id: string;
  slug: string;
  title: string;
  courseSlug?: string | null;
}

export interface UserProgressData {
  user: AuthUser;
  progress: {
    totalModules: number;
    completedModules: number;
    progressPercent: number;
    averageScore: number;
    points: number;
    level: string;
  };
  badges: string[];
  quests: { id: string; label: string; progress: number; target: number }[];
  certificationSprint?: CertificationSprintSummary | null;
  courses: CourseSummary[];
  tracks: {
    track: string;
    totalModules: number;
    completedModules: number;
    progressPercent: number;
    averageScore: number;
    nextModule?: CourseNextModule | null;
  }[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  track: string;
  description?: string;
  progressPercent?: number;
  totalModules?: number;
  completedModules?: number;
  nextModule?: CourseNextModule | null;
}

export interface PublicCourseCatalogItem {
  slug: string;
  track: string;
  title: string;
  description: string;
  moduleCount: number;
}

export interface CourseQuestion {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOption?: string;
  explanation?: string;
}

export interface TicketScorePayload {
  shortDescription: string;
  category: string;
  priority: string;
  resolutionNote: string;
}

export interface TicketScoreResult {
  score: number;
  feedback: string[];
  suggestions: string[];
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

export interface CourseProgressModule {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sortOrder?: number;
  completed: boolean;
  completedAt: string | null;
  quizScore: number | null;
  gameScore: number | null;
  score: number | null;
}

export interface CourseProgressData {
  course: CourseSummary;
  progress: {
    totalModules: number;
    completedModules: number;
    progressPercent: number;
    averageScore: number;
    nextModule: CourseNextModule | null;
  };
  modules: CourseProgressModule[];
}

export type CheckoutPlan = 'monthly' | 'yearly' | 'enterprise';

export interface BillingCheckoutResponse {
  mode?: 'demo' | 'live';
  provider?: string;
  plan: CheckoutPlan;
  checkoutUrl?: string;
  stripe?: {
    configured: boolean;
    checkoutEnabled: boolean;
  };
  message?: string;
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const requestInit = withJsonHeaders(init);
  let res = await fetch(`${API_URL}${path}`, requestInit);

  if (res.status === 401 && hasAuthorizationHeader(requestInit.headers)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(`${API_URL}${path}`, withAuthorizationHeader(requestInit, refreshed.accessToken));
    }
  }

  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

function withJsonHeaders(init: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  };
}

function hasAuthorizationHeader(headers: RequestInit['headers']) {
  return Boolean(headers && 'Authorization' in headers && headers.Authorization);
}

function withAuthorizationHeader(init: RequestInit, token: string): RequestInit {
  return {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  };
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

export function createBillingCheckout(token: string, plan: CheckoutPlan) {
  return apiRequest<BillingCheckoutResponse>('/billing/checkout', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ plan }),
  });
}

export async function fetchDashboard(token?: string): Promise<DashboardData> {
  try {
    const data = await apiRequest<UserProgressData>('/users/me/progress', { headers: authHeader(token) });
    return toDashboardData(data);
  } catch {
    return mockDashboard();
  }
}

export async function fetchCourses(token?: string): Promise<CourseSummary[]> {
  try {
    if (token) {
      const progressData = await apiRequest<UserProgressData>('/users/me/progress', { headers: authHeader(token) });
      return mergeMvpCourses(progressData.courses);
    }

    const data = await apiRequest<{ courses: PublicCourseCatalogItem[] }>('/catalog');
    return mergeMvpCourses(
      data.courses.map((course) => ({
        id: course.slug,
        slug: course.slug,
        title: course.title,
        track: course.track,
        description: course.description,
        totalModules: course.moduleCount,
        completedModules: 0,
        progressPercent: 0,
      }))
    );
  } catch {
    return DEMO_COURSES.map(courseToSummary);
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

export async function fetchCourseProgress(slug: string, token?: string): Promise<CourseProgressData> {
  if (!token) {
    const fallback = DEMO_COURSES.find((course) => course.slug === slug);
    if (!fallback) throw new Error('Course not found');
    return courseToProgress(fallback);
  }

  try {
    return apiRequest<CourseProgressData>(`/courses/${slug}/progress`, { headers: authHeader(token) });
  } catch {
    const fallback = DEMO_COURSES.find((course) => course.slug === slug);
    if (!fallback) throw new Error('Course progress not found');
    return courseToProgress(fallback);
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

export function scoreServiceNowTicket(token: string, payload: TicketScorePayload) {
  return apiRequest<TicketScoreResult>('/servicenow/ticket-score', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentCertificationSprint(token?: string): Promise<CertificationSprintSummary | null> {
  if (!token) return mockCertificationSprint();

  try {
    const data = await apiRequest<{ certificationSprint: CertificationSprintSummary | null }>(
      '/sprints/certification/current',
      { headers: authHeader(token) }
    );
    return data.certificationSprint;
  } catch {
    return mockCertificationSprint();
  }
}

export async function startCertificationSprint(
  token: string | undefined,
  payload: { track: CertificationSprintTrack; days: CertificationSprintDays }
): Promise<CertificationSprintSummary> {
  if (!token) return mockCertificationSprint(payload.track, payload.days);

  try {
    const data = await apiRequest<{ certificationSprint: CertificationSprintSummary }>(
      '/sprints/certification/start',
      {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
      }
    );
    return data.certificationSprint;
  } catch {
    return mockCertificationSprint(payload.track, payload.days);
  }
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
    certificationSprint: mockCertificationSprint(),
    courses: [
      { id: '1', slug: 'apple-cert-prep', title: 'Parcours Apple', track: 'APPLE', progressPercent: 100 },
      { id: '2', slug: 'jamf-pro-foundations', title: 'Fondamentaux Jamf Pro', track: 'JAMF', progressPercent: 0 },
    ],
  };
}

function toDashboardData(data: UserProgressData): DashboardData {
  const appleTrack = data.tracks.find((track) => track.track === 'APPLE');

  return {
    user: data.user,
    stats: {
      points: data.progress.points,
      level: data.progress.level,
      modulesCompleted: data.progress.completedModules,
      timeSpentMinutes: data.progress.completedModules * 12,
      averageQuizScore: data.progress.averageScore,
      preparationScore: appleTrack?.progressPercent ?? data.progress.progressPercent,
    },
    badges: data.badges,
    quests: data.quests,
    certificationSprint: data.certificationSprint ?? null,
    courses: data.courses,
  };
}

function mockCertificationSprint(
  track: CertificationSprintTrack = 'APPLE',
  days: CertificationSprintDays = 7
): CertificationSprintSummary {
  const startedAt = new Date();
  const endsAt = new Date(startedAt);
  endsAt.setDate(startedAt.getDate() + days);
  const target = track === 'SERVICENOW' ? 3 : 4;
  const progress = track === 'APPLE' ? 1 : 0;

  return {
    id: `demo-sprint-${track.toLowerCase()}`,
    questKey: `demo:sprint:${track}:${days}`,
    track,
    label: `Certification Sprint ${formatTrack(track)} - ${days} jours`,
    days,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    target,
    progress,
    progressPercent: Math.round((progress / target) * 100),
    remainingModules: Math.max(target - progress, 0),
    completed: progress >= target,
    expired: false,
  };
}

function mergeMvpCourses(courses: CourseSummary[]) {
  const tracks = new Set(courses.map((course) => course.track));
  const merged = [...courses];
  for (const demo of DEMO_COURSES) {
    if (!tracks.has(demo.track)) {
      merged.push(courseToSummary(demo));
    }
  }
  return merged;
}

function courseToSummary(course: CourseDetail): CourseSummary {
  const completedModules = course.completedModules ?? 0;
  const nextModule = course.modules[completedModules] ?? course.modules.find((module) => module);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    track: course.track,
    description: course.description,
    progressPercent: course.progressPercent ?? 0,
    totalModules: course.modules.length,
    completedModules,
    nextModule: nextModule
      ? {
          id: nextModule.id,
          slug: nextModule.slug,
          title: nextModule.title,
          courseSlug: course.slug,
        }
      : null,
  };
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

function courseToProgress(course: CourseDetail): CourseProgressData {
  const completedModules = course.completedModules ?? 0;
  const progressPercent =
    course.progressPercent ?? (course.modules.length ? Math.round((completedModules / course.modules.length) * 100) : 0);
  const completedCount = Math.round((progressPercent / 100) * course.modules.length);
  const modules = course.modules.map((module, index) => {
    const completed = index < completedCount;
    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      sortOrder: index + 1,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      quizScore: completed ? 85 : null,
      gameScore: completed ? 90 : null,
      score: completed ? 88 : null,
    };
  });
  const nextModule = modules.find((module) => !module.completed) ?? null;

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      track: course.track,
      description: course.description,
      progressPercent,
      totalModules: course.modules.length,
      completedModules: completedCount,
      nextModule: nextModule ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title } : null,
    },
    progress: {
      totalModules: course.modules.length,
      completedModules: completedCount,
      progressPercent,
      averageScore: modules.some((module) => module.score !== null) ? 88 : 0,
      nextModule: nextModule ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title } : null,
    },
    modules,
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
