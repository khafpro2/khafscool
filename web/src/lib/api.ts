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

export interface CompletedCourseSummary {
  slug: string;
  title: string;
  track: string;
  completedAt: string;
}

export interface LearningStreak {
  currentDays: number;
  longestDays: number;
  lastActivityDate: string | null;
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
  quests: { id: string; questKey?: string; label: string; progress: number; target: number; completed?: boolean }[];
  certificationSprint?: CertificationSprintSummary | null;
  courses: CourseSummary[];
  completedCourses?: CompletedCourseSummary[];
  learningStreak?: LearningStreak;
}

export type CertificationSprintTrack = 'APPLE' | 'JAMF' | 'INTUNE';
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

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  displayName: string;
  email?: string | null;
  points: number;
  level: string;
  badges: string[];
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
}

export interface WeeklyQuest {
  id: string;
  questKey: string;
  label: string;
  description?: string | null;
  target: number;
  progress: number;
  completed: boolean;
  weekStart?: string | null;
  rewardPoints?: number | null;
  track?: string | null;
}

export interface WeeklyQuestsResponse {
  quests: WeeklyQuest[];
  weekStart?: string | null;
  weekEnd?: string | null;
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

export interface UserBadge {
  slug: string;
  earnedAt?: string | null;
}

export interface UserBadgesResult {
  badges: UserBadge[];
  earnedSlugs: string[];
  fromApi: boolean;
}

export async function fetchUserBadges(token?: string): Promise<UserBadgesResult> {
  if (!token) return mockUserBadges();

  try {
    const data = await apiRequest<{ badges: string[] }>('/users/me/dashboard', {
      headers: authHeader(token),
    });
    const slugs = Array.isArray(data.badges) ? data.badges : [];
    return {
      badges: slugs.map((slug) => ({ slug })),
      earnedSlugs: slugs,
      fromApi: true,
    };
  } catch {
    return mockUserBadges();
  }
}

function mockUserBadges(): UserBadgesResult {
  const slugs = ['apple-mdm-foundation'];
  return {
    badges: [
      { slug: 'apple-mdm-foundation', earnedAt: '2026-03-12T10:30:00.000Z' },
    ],
    earnedSlugs: slugs,
    fromApi: false,
  };
}

export interface CurrentUserResponse {
  user: AuthUser;
  progress: {
    points: number;
    level: string;
    badges: string[];
    totalModules?: number;
    completedModules?: number;
  } | null;
  subscription: { plan: string; status: string } | null;
}

export async function fetchCurrentUser(token?: string): Promise<CurrentUserResponse | null> {
  if (!token) return null;

  try {
    return await apiRequest<CurrentUserResponse>('/auth/me', { headers: authHeader(token) });
  } catch {
    return null;
  }
}

interface DashboardApiResponse {
  user: AuthUser;
  stats: {
    points: number;
    level: string;
    modulesCompleted: number;
    timeSpentMinutes: number;
    averageQuizScore: number;
    preparationScore?: number;
  };
  learningStreak?: LearningStreak;
  badges: string[];
  quests: { id: string; label: string; progress: number; target: number; completed?: boolean }[];
  certificationSprint?: CertificationSprintSummary | null;
  courses: CourseSummary[];
  completedCourses?: CompletedCourseSummary[];
}

export async function fetchDashboard(token?: string): Promise<DashboardData> {
  try {
    if (token) {
      const data = await apiRequest<DashboardApiResponse>('/users/me/dashboard', {
        headers: authHeader(token),
      });
      return {
        user: data.user,
        stats: data.stats,
        badges: data.badges,
        quests: data.quests,
        certificationSprint: data.certificationSprint ?? null,
        courses: data.courses,
        completedCourses: data.completedCourses ?? [],
        learningStreak: data.learningStreak ?? defaultLearningStreak(),
      };
    }

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

export interface CourseCompletionResult {
  slug: string;
  title: string;
  pointsEarned: number;
  badgeEarned?: string;
}

export interface CompleteModuleResult {
  quizScore: number;
  gameScore: number;
  pointsEarned: number;
  level: string;
  badges: string[];
  preparationScore: number;
  courseCompleted: boolean;
  courseCompletion?: CourseCompletionResult;
}

export const NEXT_COURSE_BY_SLUG: Record<string, { slug: string; title: string }> = {
  'apple-cert-prep': { slug: 'jamf-pro-foundations', title: 'Fondamentaux Jamf Pro' },
  'jamf-pro-foundations': { slug: 'intune-ios-enrollment', title: 'Microsoft Intune pour Apple' },
};

export async function completeModule(
  moduleId: string,
  token: string,
  payload: { quizAnswers?: Record<string, string>; gameOrder?: number[] }
) {
  return apiRequest<CompleteModuleResult>(`/modules/${moduleId}/complete`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function fetchLeaderboard(token?: string): Promise<LeaderboardResponse> {
  if (!token) return mockLeaderboard();

  try {
    return await apiRequest<LeaderboardResponse>('/leaderboard', { headers: authHeader(token) });
  } catch {
    return mockLeaderboard();
  }
}

export async function fetchWeeklyQuests(token?: string): Promise<WeeklyQuestsResponse> {
  if (!token) return mockWeeklyQuests();

  try {
    const data = await apiRequest<WeeklyQuestsResponse>('/quests/weekly', {
      headers: authHeader(token),
    });
    return normalizeWeeklyQuests(data);
  } catch {
    return mockWeeklyQuests();
  }
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

function startOfIsoWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy;
}

function endOfIsoWeek(date: Date): Date {
  const start = startOfIsoWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}

function normalizeWeeklyQuests(data: WeeklyQuestsResponse): WeeklyQuestsResponse {
  const quests = Array.isArray(data?.quests) ? data.quests : [];
  const firstWeekStart = data?.weekStart ?? quests.find((quest) => quest.weekStart)?.weekStart ?? null;
  const computedStart = firstWeekStart ? new Date(firstWeekStart) : startOfIsoWeek(new Date());
  const computedEnd = data?.weekEnd ? new Date(data.weekEnd) : endOfIsoWeek(computedStart);

  return {
    quests: quests.map((quest) => ({
      ...quest,
      progress: Math.max(0, quest.progress ?? 0),
      target: Math.max(0, quest.target ?? 0),
      completed: quest.completed ?? (quest.target > 0 && quest.progress >= quest.target),
      weekStart: quest.weekStart ?? computedStart.toISOString(),
    })),
    weekStart: computedStart.toISOString(),
    weekEnd: computedEnd.toISOString(),
  };
}

function mockWeeklyQuests(): WeeklyQuestsResponse {
  const weekStart = startOfIsoWeek(new Date()).toISOString();
  const weekEnd = endOfIsoWeek(new Date()).toISOString();

  return {
    weekStart,
    weekEnd,
    quests: [
      {
        id: 'demo-weekly-apple-2',
        questKey: 'weekly-apple-2',
        label: 'Valide 2 modules Apple',
        description: 'Renforce ton socle Device Support et MDM Apple en validant 2 modules complets.',
        target: 2,
        progress: 1,
        completed: false,
        rewardPoints: 40,
        track: 'APPLE',
        weekStart,
      },
      {
        id: 'demo-weekly-jamf-2',
        questKey: 'weekly-jamf-2',
        label: 'Valide 2 modules Jamf Pro',
        description: 'Smart groups, politiques et inventaire : confirme tes acquis Jamf.',
        target: 2,
        progress: 2,
        completed: true,
        rewardPoints: 40,
        track: 'JAMF',
        weekStart,
      },
      {
        id: 'demo-weekly-intune-2',
        questKey: 'weekly-intune-2',
        label: 'Termine 2 modules Intune',
        description: 'Enrôlement iOS, profils de configuration et conformité côté Microsoft.',
        target: 2,
        progress: 0,
        completed: false,
        rewardPoints: 40,
        track: 'INTUNE',
        weekStart,
      },
      {
        id: 'demo-weekly-mdm-4',
        questKey: 'weekly-mdm-4',
        label: 'Termine 4 modules MDM (toutes pistes)',
        description: 'Avance sur Apple, Jamf ou Intune pour décrocher le bonus hebdo.',
        target: 4,
        progress: 2,
        completed: false,
        rewardPoints: 80,
        track: null,
        weekStart,
      },
    ],
  };
}

function mockLeaderboard(): LeaderboardResponse {
  return {
    leaderboard: [
      {
        rank: 1,
        displayName: 'Camille — Apple Pro',
        points: 980,
        level: 'EXPERT',
        badges: ['apple-mdm-foundation', 'jamf-engineer'],
        isCurrentUser: false,
      },
      {
        rank: 2,
        displayName: 'Yanis — Jamf Lead',
        points: 845,
        level: 'EXPERT',
        badges: ['jamf-engineer'],
        isCurrentUser: false,
      },
      {
        rank: 3,
        displayName: 'Léa — Intune Specialist',
        points: 760,
        level: 'TECHNICIAN',
        badges: ['intune-professional'],
        isCurrentUser: false,
      },
      {
        rank: 4,
        displayName: 'Technicien démo (toi)',
        points: 120,
        level: 'TECHNICIAN',
        badges: ['apple-mdm-foundation'],
        isCurrentUser: true,
      },
    ],
    currentUserRank: 4,
  };
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
    completedCourses: [
      {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        track: 'APPLE',
        completedAt: '2026-03-12T10:30:00.000Z',
      },
    ],
    learningStreak: {
      currentDays: 2,
      longestDays: 4,
      lastActivityDate: new Date().toISOString().slice(0, 10),
    },
  };
}

function defaultLearningStreak(): LearningStreak {
  return { currentDays: 0, longestDays: 0, lastActivityDate: null };
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
  const target = 4;
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
      {
        id: 'demo-apple-module-2',
        slug: 'ios-troubleshooting',
        title: 'Dépannage iOS et iPadOS',
        summary: 'Diagnostiquer connectivité, batterie et blocages courants sur iPhone/iPad.',
        questions: [
          {
            id: 'demo-apple-q3',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Un iPhone ne se connecte plus au Wi-Fi d’entreprise. Quelle étape privilégier en premier ?',
            options: [
              { id: 'a', label: 'Oublier le réseau puis se reconnecter avec les bons identifiants' },
              { id: 'b', label: 'Restaurer l’appareil immédiatement' },
              { id: 'c', label: 'Désactiver le chiffrement du disque' },
            ],
            correctOption: 'a',
            explanation: 'Réinitialiser l’association Wi-Fi élimine souvent un profil ou mot de passe obsolète.',
          },
          {
            id: 'demo-apple-q4',
            type: 'TRUE_FALSE',
            prompt: 'Un redémarrage forcé peut résoudre un écran figé sans effacer les données.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Le redémarrage forcé interrompt les processus bloqués tout en préservant le contenu.',
          },
        ],
        game: {
          type: 'IOS_TRIAGE',
          scenario: 'Un iPad ne synchronise plus les apps MDM. Ordonne les vérifications.',
          steps: [
            { id: 1, label: 'Confirmer Wi-Fi/cellulaire et date/heure correctes' },
            { id: 2, label: 'Vérifier profil MDM et dernière check-in dans la console' },
            { id: 3, label: 'Forcer une synchronisation ou réinstaller le profil si nécessaire' },
          ],
        },
      },
      {
        id: 'demo-apple-module-3',
        slug: 'acmt-exam-prep',
        title: 'Préparation examen Device Support (ACMT)',
        summary: 'Réviser sécurité, sauvegarde, restauration et bonnes pratiques atelier.',
        questions: [
          {
            id: 'demo-apple-q5',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Avant de remettre un Mac réparé au client, quelle vérification est essentielle ?',
            options: [
              { id: 'a', label: 'Tests fonctionnels, mises à jour et effacement des données temporaires' },
              { id: 'b', label: 'Laisser le compte technicien administrateur actif' },
              { id: 'c', label: 'Désactiver FileVault pour accélérer le démarrage' },
            ],
            correctOption: 'a',
            explanation: 'La remise en service inclut validation complète, OS à jour et respect de la confidentialité.',
          },
          {
            id: 'demo-apple-q6',
            type: 'TRUE_FALSE',
            prompt: 'Apple Diagnostics aide à isoler une panne matérielle avant ouverture.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Les tests intégrés orientent le diagnostic vers le composant défaillant.',
          },
        ],
        game: {
          type: 'EXAM_RUNBOOK',
          scenario: 'Un Mac ne démarre plus après une panne d’alimentation. Ordonne les étapes de diagnostic.',
          steps: [
            { id: 1, label: 'Vérifier alimentation, câbles et prise secteur' },
            { id: 2, label: 'Lancer Apple Diagnostics et noter les codes erreur' },
            { id: 3, label: 'Documenter les résultats avant toute réparation matérielle' },
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
        summary:
          'Comprendre comment cibler des Mac et déclencher une politique Jamf Pro sur un périmètre pilote.',
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
            explanation:
              'Un Smart Group regroupe automatiquement les appareils correspondant à des critères.',
          },
          {
            id: 'demo-jamf-q2',
            type: 'TRUE_FALSE',
            prompt:
              'Une politique de configuration peut être limitée à un Smart Group sans toucher au reste de la flotte.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Le scope par Smart Group permet de tester et déployer progressivement.',
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
      {
        id: 'demo-jamf-module-2',
        slug: 'inventory-basics',
        title: 'Inventaire et conformité',
        summary:
          'Lire l’inventaire Jamf, interpréter la conformité et prioriser les actions sur les appareils hors norme.',
        questions: [
          {
            id: 'demo-jamf-q3',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Où consultes-tu en priorité l’état d’un Mac dans Jamf Pro ?',
            options: [
              { id: 'a', label: 'Fiche inventaire de l’ordinateur' },
              { id: 'b', label: 'Console Apple Business Manager uniquement' },
              { id: 'c', label: 'Journal système local du Mac' },
            ],
            correctOption: 'a',
            explanation: 'La fiche inventaire centralise hardware, OS et statut MDM.',
          },
        ],
        game: {
          type: 'INVENTORY_TRIAGE',
          scenario: 'Prioriser les alertes inventaire sur un parc Mac.',
          steps: [
            { id: 1, label: 'Confirmer la gestion MDM et la dernière check-in' },
            { id: 2, label: 'Vérifier version macOS et espace disque' },
            { id: 3, label: 'Lancer une politique corrective' },
          ],
        },
      },
      {
        id: 'demo-jamf-module-3',
        slug: 'enrollment-apple-integration',
        title: 'Enrôlement et intégration Apple',
        summary:
          'Relier Apple Business Manager, certificats Push et enrôlement automatisé pour une flotte supervisée.',
        questions: [
          {
            id: 'demo-jamf-q4',
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Quel prérequis permet à Jamf Pro de recevoir les appareils assignés depuis Apple Business Manager ?',
            options: [
              { id: 'a', label: 'Un jeton serveur MDM Apple valide' },
              { id: 'b', label: 'Un compte iCloud personnel partagé' },
              { id: 'c', label: 'Un profil Wi-Fi installé manuellement' },
            ],
            correctOption: 'a',
            explanation: 'Le jeton serveur MDM synchronise les appareils ABM avec Jamf Pro.',
          },
        ],
        game: {
          type: 'ENROLLMENT_RUNBOOK',
          scenario: 'Mettre en service 20 Mac neufs via Jamf Pro et Apple Business Manager.',
          steps: [
            { id: 1, label: 'Vérifier le jeton MDM et le certificat Push' },
            { id: 2, label: 'Assigner les appareils au serveur Jamf dans ABM' },
            { id: 3, label: 'Activer un Mac et valider l’assistant d’enrôlement' },
          ],
        },
      },
    ],
  },
  {
    id: 'demo-intune',
    slug: 'intune-ios-enrollment',
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    track: 'INTUNE',
    description: 'Enrôlement ADE, conformité et App Protection pour flottes Apple dans Intune.',
    progressPercent: 0,
    modules: [
      {
        id: 'demo-intune-module-1',
        slug: 'ade-enrollment-basics',
        title: 'Préparer Automated Device Enrollment',
        summary: 'Associer Apple Business Manager à Intune et valider l’expérience Setup Assistant.',
        questions: [
          {
            id: 'demo-intune-q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quel prérequis relie Apple Business Manager à Intune pour synchroniser les appareils supervisés ?',
            options: [
              { id: 'a', label: 'Un jeton serveur MDM Apple valide' },
              { id: 'b', label: 'Un profil Wi-Fi installé manuellement' },
              { id: 'c', label: 'Une sauvegarde iCloud partagée' },
            ],
            correctOption: 'a',
            explanation: 'Le jeton serveur MDM permet à Intune de récupérer les appareils assignés depuis ABM.',
          },
          {
            id: 'demo-intune-q2',
            type: 'TRUE_FALSE',
            prompt: 'Un profil ADE peut imposer la supervision et masquer certaines étapes de Setup Assistant.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Les profils ADE contrôlent l’expérience initiale et la supervision des appareils Apple.',
          },
        ],
        game: {
          type: 'ENROLLMENT_RUNBOOK',
          scenario: '30 iPad neufs dans Apple Business Manager. Ordonne les étapes pour les rendre prêts via Intune.',
          steps: [
            { id: 1, label: 'Affecter les appareils au serveur MDM Intune dans Apple Business Manager' },
            { id: 2, label: 'Créer et assigner un profil ADE dans Intune' },
            { id: 3, label: 'Démarrer un iPad et vérifier l’assistant d’enrôlement' },
          ],
        },
      },
      {
        id: 'demo-intune-module-2',
        slug: 'compliance-policies',
        title: 'Politiques de conformité iOS',
        summary: 'Définir conformité OS, PIN, jailbreak et actions correctives dans Intune.',
        questions: [
          {
            id: 'demo-intune-q3',
            type: 'MULTIPLE_CHOICE',
            prompt: 'À quoi sert une politique de conformité Intune pour iOS ?',
            options: [
              { id: 'a', label: 'Vérifier que l’appareil respecte des exigences avant l’accès aux ressources' },
              { id: 'b', label: 'Remplacer Apple Business Manager' },
              { id: 'c', label: 'Installer des apps depuis l’App Store personnel' },
            ],
            correctOption: 'a',
            explanation: 'La conformité évalue version OS, code PIN et état de l’appareil.',
          },
          {
            id: 'demo-intune-q4',
            type: 'TRUE_FALSE',
            prompt: 'Un appareil non conforme peut être bloqué de l’accès e-mail via Conditional Access.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Intune signale l’état de conformité à Entra ID pour appliquer les restrictions.',
          },
        ],
        game: {
          type: 'COMPLIANCE_TRIAGE',
          scenario: 'Prioriser OS obsolète, PIN absent et jailbreak détecté sur trois iPhone.',
          steps: [
            { id: 1, label: 'Examiner le rapport de conformité par appareil dans Intune' },
            { id: 2, label: 'Prioriser jailbreak et appliquer blocage ou retrait du parc' },
            { id: 3, label: 'Envoyer notification de mise à jour OS ou exigence PIN' },
          ],
        },
      },
      {
        id: 'demo-intune-module-3',
        slug: 'app-protection-conditional-access',
        title: 'App Protection et Conditional Access',
        summary: 'Protéger les données M365 sur iOS avec MAM et Conditional Access.',
        questions: [
          {
            id: 'demo-intune-q5',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quelle différence clé entre MAM et MDM complet sur iOS ?',
            options: [
              { id: 'a', label: 'MAM protège les données des apps sans enrôler entièrement l’appareil' },
              { id: 'b', label: 'MAM remplace le certificat Push Apple' },
              { id: 'c', label: 'MAM ne fonctionne que sur Android' },
            ],
            correctOption: 'a',
            explanation: 'App Protection sécurise Outlook, Teams, etc. sans contrôle total de l’appareil.',
          },
          {
            id: 'demo-intune-q6',
            type: 'TRUE_FALSE',
            prompt: 'Conditional Access peut exiger un appareil conforme avant d’autoriser l’accès à Exchange Online.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Les stratégies CA combinent état Intune, localisation et risque utilisateur.',
          },
        ],
        game: {
          type: 'MAM_POLICY_ORDER',
          scenario: 'Déployer Outlook et Teams protégés sur des iPhone BYOD.',
          steps: [
            { id: 1, label: 'Créer et assigner une politique App Protection iOS/iPadOS' },
            { id: 2, label: 'Configurer Conditional Access exigeant apps approuvées ou appareil conforme' },
            { id: 3, label: 'Valider l’accès et le conteneur de données sur un iPhone pilote' },
          ],
        },
      },
    ],
  },
];

export { API_URL };
