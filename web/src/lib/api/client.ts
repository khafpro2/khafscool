import { AuthRequestError, throwAuthRequestError } from '../auth-errors';
import { refreshSession } from '../auth';
import { recordApiFailure, recordApiSuccess } from '../api-status-store';
import { clearDemoMode, markDemoFallback } from '../demo-mode-store';
import {
  courseToProgress,
  courseToSummary,
  DEMO_COURSES,
  defaultLearningStreak,
  mergeMvpCourses,
  mockCertificationSprint,
  mockDashboard,
  mockLeaderboard,
  mockUserBadges,
  mockWeeklyQuests,
  normalizeCourse,
  normalizeWeeklyQuests,
  toDashboardData,
} from './demo-data';
import type {
  AuthResponse,
  AuthUser,
  BillingCheckoutResponse,
  BillingStatusResponse,
  CertificationSprintDays,
  CertificationSprintSummary,
  CertificationSprintTrack,
  CheckAnswerResult,
  CheckoutPlan,
  CompleteModuleResult,
  CourseDetail,
  CourseProgressData,
  CourseSummary,
  CurrentUserResponse,
  DashboardApiResponse,
  DashboardData,
  LeaderboardResponse,
  PublicCourseCatalogItem,
  UserBadgesResult,
  UserProgressData,
  WeeklyQuestsResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const requestInit = withJsonHeaders(init);

  try {
    let res = await fetch(`${API_URL}${path}`, requestInit);

    if (res.status === 401 && hasAuthorizationHeader(requestInit.headers)) {
      const refreshed = await refreshSession();
      if (refreshed) {
        res = await fetch(`${API_URL}${path}`, withAuthorizationHeader(requestInit, refreshed.accessToken));
      }
    }

    if (!res.ok) {
      recordApiFailure();
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        await throwAuthRequestError(res);
      }
      throw new Error(`Erreur API ${res.status}`);
    }

    recordApiSuccess();
    return (await res.json()) as T;
  } catch (error) {
    if (isNetworkError(error)) {
      recordApiFailure();
    }
    throw error;
  }
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && error.name === 'AbortError');
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

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      recordApiFailure();
      await throwAuthRequestError(res);
    }

    recordApiSuccess();
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof AuthRequestError) throw error;
    if (isNetworkError(error)) recordApiFailure();
    throw error;
  }
}

export function login(email: string, password: string, rememberMe = true) {
  return authRequest<AuthResponse>('/auth/login', { email, password, rememberMe });
}

export function register(email: string, password: string, displayName: string) {
  return authRequest<AuthResponse>('/auth/register', { email, password, displayName });
}

export function fetchBillingStatus() {
  return apiRequest<BillingStatusResponse>('/billing/status');
}

export function createBillingCheckout(token: string, plan: CheckoutPlan) {
  return apiRequest<BillingCheckoutResponse>('/billing/checkout', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ plan }),
  });
}

export async function fetchUserBadges(token?: string): Promise<UserBadgesResult> {
  if (!token) {
    markDemoFallback();
    return mockUserBadges();
  }

  try {
    const data = await apiRequest<{ badges: string[] }>('/users/me/dashboard', {
      headers: authHeader(token),
    });
    clearDemoMode();
    const slugs = Array.isArray(data.badges) ? data.badges : [];
    return {
      badges: slugs.map((slug) => ({ slug })),
      earnedSlugs: slugs,
      fromApi: true,
    };
  } catch {
    markDemoFallback();
    return mockUserBadges();
  }
}

export async function fetchCurrentUser(token?: string): Promise<CurrentUserResponse | null> {
  if (!token) return null;

  try {
    const user = await apiRequest<CurrentUserResponse>('/auth/me', { headers: authHeader(token) });
    clearDemoMode();
    return user;
  } catch {
    return null;
  }
}

export async function updateDisplayName(token: string, displayName: string): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>('/users/me', {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ displayName }),
  });
  clearDemoMode();
  return data.user;
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>('/users/me/password', {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function logoutAllSessions(token: string): Promise<{ ok: true; revokedCount: number }> {
  return apiRequest<{ ok: true; revokedCount: number }>('/auth/logout-all', {
    method: 'POST',
    headers: authHeader(token),
  });
}

export type UserDataExport = {
  exportedAt: string;
  profile: {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
  progress: {
    points: number;
    level: string;
    badges: string[];
  } | null;
  moduleProgress: Array<{
    moduleSlug: string;
    moduleTitle: string;
    courseSlug: string;
    courseTitle: string;
    track: string;
    quizScore: number | null;
    gameScore: number | null;
    completedAt: string | null;
  }>;
  quests: Array<{
    questKey: string;
    label: string;
    target: number;
    progress: number;
    completed: boolean;
    rewardClaimed: boolean;
    weekStart: string;
  }>;
  subscription: unknown;
};

export async function exportUserData(token: string): Promise<UserDataExport> {
  const data = await apiRequest<UserDataExport>('/users/me/export', {
    headers: authHeader(token),
  });
  clearDemoMode();
  return data;
}

export async function deleteAccount(token: string, confirm: 'SUPPRIMER'): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>('/users/me', {
    method: 'DELETE',
    headers: authHeader(token),
    body: JSON.stringify({ confirm }),
  });
}

export async function fetchDashboard(token?: string): Promise<DashboardData> {
  try {
    if (token) {
      const data = await apiRequest<DashboardApiResponse>('/users/me/dashboard', {
        headers: authHeader(token),
      });
      clearDemoMode();
      return {
        user: data.user,
        stats: data.stats,
        badges: data.badges,
        quests: data.quests,
        certificationSprint: data.certificationSprint ?? null,
        courses: data.courses,
        completedCourses: data.completedCourses ?? [],
        learningStreak: data.learningStreak ?? defaultLearningStreak(),
        recentActivity: data.recentActivity ?? [],
      };
    }

    const data = await apiRequest<UserProgressData>('/users/me/progress', { headers: authHeader(token) });
    clearDemoMode();
    return toDashboardData(data);
  } catch {
    markDemoFallback();
    return mockDashboard();
  }
}

export async function fetchCourses(token?: string): Promise<CourseSummary[]> {
  try {
    if (token) {
      const progressData = await apiRequest<UserProgressData>('/users/me/progress', { headers: authHeader(token) });
      clearDemoMode();
      return mergeMvpCourses(progressData.courses);
    }

    const data = await apiRequest<{ courses: PublicCourseCatalogItem[] }>('/catalog');
    clearDemoMode();
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
    markDemoFallback();
    return DEMO_COURSES.map(courseToSummary);
  }
}

export async function fetchCourse(slug: string, token?: string): Promise<CourseDetail> {
  try {
    const data = await apiRequest<{ course: CourseDetail }>(`/courses/${slug}`, { headers: authHeader(token) });
    clearDemoMode();
    return normalizeCourse(data.course);
  } catch {
    const fallback = DEMO_COURSES.find((course) => course.slug === slug);
    if (!fallback) throw new Error('Parcours introuvable');
    markDemoFallback();
    return fallback;
  }
}

export async function fetchCourseProgress(slug: string, token?: string): Promise<CourseProgressData> {
  if (!token) {
    markDemoFallback();
    const fallback = DEMO_COURSES.find((course) => course.slug === slug);
    if (!fallback) throw new Error('Parcours introuvable');
    return courseToProgress(fallback);
  }

  try {
    const progress = await apiRequest<CourseProgressData>(`/courses/${slug}/progress`, {
      headers: authHeader(token),
    });
    clearDemoMode();
    return progress;
  } catch {
    const fallback = DEMO_COURSES.find((course) => course.slug === slug);
    if (!fallback) throw new Error('Progression du parcours introuvable');
    markDemoFallback();
    return courseToProgress(fallback);
  }
}

export async function checkModuleAnswer(
  moduleId: string,
  token: string,
  payload: { questionId: string; selectedOption: string }
) {
  return apiRequest<CheckAnswerResult>(`/modules/${moduleId}/check-answer`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

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
  if (!token) {
    markDemoFallback();
    return mockLeaderboard();
  }

  try {
    const leaderboard = await apiRequest<LeaderboardResponse>('/leaderboard', { headers: authHeader(token) });
    clearDemoMode();
    return leaderboard;
  } catch {
    markDemoFallback();
    return mockLeaderboard();
  }
}

export async function fetchWeeklyQuests(token?: string): Promise<WeeklyQuestsResponse> {
  if (!token) {
    markDemoFallback();
    return mockWeeklyQuests();
  }

  try {
    const data = await apiRequest<WeeklyQuestsResponse>('/quests/weekly', {
      headers: authHeader(token),
    });
    clearDemoMode();
    return normalizeWeeklyQuests(data);
  } catch {
    markDemoFallback();
    return mockWeeklyQuests();
  }
}

export async function fetchCurrentCertificationSprint(token?: string): Promise<CertificationSprintSummary | null> {
  if (!token) {
    markDemoFallback();
    return mockCertificationSprint();
  }

  try {
    const data = await apiRequest<{ certificationSprint: CertificationSprintSummary | null }>(
      '/sprints/certification/current',
      { headers: authHeader(token) }
    );
    clearDemoMode();
    return data.certificationSprint;
  } catch {
    markDemoFallback();
    return mockCertificationSprint();
  }
}

export async function startCertificationSprint(
  token: string | undefined,
  payload: { track: CertificationSprintTrack; days: CertificationSprintDays }
): Promise<CertificationSprintSummary> {
  if (!token) {
    markDemoFallback();
    return mockCertificationSprint(payload.track, payload.days);
  }

  try {
    const data = await apiRequest<{ certificationSprint: CertificationSprintSummary }>(
      '/sprints/certification/start',
      {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
      }
    );
    clearDemoMode();
    return data.certificationSprint;
  } catch {
    markDemoFallback();
    return mockCertificationSprint(payload.track, payload.days);
  }
}

export { API_URL };
