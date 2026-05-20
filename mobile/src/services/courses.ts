import { apiFetch } from './api';
import { getAccessToken } from './auth';

export interface CourseQuestion {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; label: string }[];
  explanation?: string;
}

export interface CheckAnswerResult {
  correct: boolean;
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

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  track: string;
  description?: string;
  progressPercent?: number;
  totalModules?: number;
  completedModules?: number;
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
    nextModule: { id: string; slug: string; title: string } | null;
  };
  modules: CourseProgressModule[];
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
  'apple-cert-prep': { slug: 'jamf-pro-foundations', title: 'Fondations Jamf Pro' },
  'jamf-pro-foundations': { slug: 'intune-ios-enrollment', title: 'Microsoft Intune pour Apple' },
};

export async function fetchCourse(slug: string): Promise<{ data: CourseDetail; source: 'api' | 'demo' }> {
  const token = await getAccessToken();
  if (!token) {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: demo, source: 'demo' };
  }

  try {
    const response = await apiFetch<{ course: CourseDetail }>(`/courses/${slug}`);
    return { data: response.course, source: 'api' };
  } catch {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: demo, source: 'demo' };
  }
}

export async function fetchCourseProgress(
  slug: string
): Promise<{ data: CourseProgressData; source: 'api' | 'demo' }> {
  const token = await getAccessToken();
  if (!token) {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: courseToProgress(demo), source: 'demo' };
  }

  try {
    const data = await apiFetch<CourseProgressData>(`/courses/${slug}/progress`);
    return { data, source: 'api' };
  } catch {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: courseToProgress(demo), source: 'demo' };
  }
}

export async function checkModuleAnswer(
  moduleId: string,
  payload: { questionId: string; selectedOption: string }
): Promise<CheckAnswerResult> {
  return apiFetch<CheckAnswerResult>(`/modules/${moduleId}/check-answer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function completeModule(
  moduleId: string,
  payload: { quizAnswers?: Record<string, string>; gameOrder?: number[] }
): Promise<CompleteModuleResult> {
  return apiFetch<CompleteModuleResult>(`/modules/${moduleId}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface PublicCourseCatalogItem {
  slug: string;
  track: string;
  title: string;
  description: string;
  moduleCount: number;
}

export async function fetchCourses(): Promise<{ data: CourseSummary[]; source: 'api' | 'demo' }> {
  const token = await getAccessToken();

  if (token) {
    try {
      const data = await apiFetch<{ courses: CourseSummary[] }>('/users/me/progress');
      return { data: data.courses, source: 'api' };
    } catch {
      // fall through to catalog or demo
    }
  }

  try {
    const data = await apiFetch<{ courses: PublicCourseCatalogItem[] }>('/catalog');
    return {
      data: data.courses.map((course) => ({
        id: course.slug,
        slug: course.slug,
        title: course.title,
        track: course.track,
        description: course.description,
        totalModules: course.moduleCount,
        completedModules: 0,
        progressPercent: 0,
      })),
      source: 'api',
    };
  } catch {
    return {
      data: Object.values(DEMO_COURSES).map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        track: course.track,
        description: course.description,
        totalModules: course.modules.length,
        completedModules: course.completedModules ?? 0,
        progressPercent: course.progressPercent ?? 0,
      })),
      source: 'demo',
    };
  }
}

function courseToProgress(course: CourseDetail): CourseProgressData {
  const completedCount = course.completedModules ?? 0;
  const progressPercent =
    course.progressPercent ??
    (course.modules.length ? Math.round((completedCount / course.modules.length) * 100) : 0);
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
      gameScore: completed ? 80 : null,
      score: completed ? 82 : null,
    };
  });
  const next = modules.find((module) => !module.completed) ?? null;

  return {
    course,
    progress: {
      totalModules: course.modules.length,
      completedModules: completedCount,
      progressPercent,
      averageScore: completedCount > 0 ? 82 : 0,
      nextModule: next ? { id: next.id, slug: next.slug, title: next.title } : null,
    },
    modules,
  };
}

const DEMO_COURSES: Record<string, CourseDetail> = {
  'apple-cert-prep': {
    id: 'demo-apple',
    slug: 'apple-cert-prep',
    title: 'Parcours Apple Device Support & MDM',
    track: 'APPLE',
    description: 'Prépare la certification Apple et les fondamentaux MDM.',
    totalModules: 3,
    completedModules: 2,
    progressPercent: 67,
    modules: [
      {
        id: 'demo-apple-module-1',
        slug: 'apple-hardware',
        title: 'Matériel et dépannage Apple',
        summary: 'Identifier les modèles, diagnostics et pièces.',
        questions: [
          {
            id: 'q1',
            type: 'single',
            prompt: 'Quel outil Apple est recommandé pour le diagnostic matériel ?',
            options: [
              { id: 'a', label: 'Apple Diagnostics' },
              { id: 'b', label: 'Jamf Remote' },
              { id: 'c', label: 'Intune Portal' },
            ],
          },
        ],
      },
      {
        id: 'demo-apple-module-2',
        slug: 'apple-services',
        title: 'Services Apple et comptes',
        summary: 'Apple ID, ABM et configuration de base.',
        questions: [
          {
            id: 'q2',
            type: 'single',
            prompt: 'Où gére-t-on les appareils d’entreprise Apple ?',
            options: [
              { id: 'a', label: 'Apple Business Manager' },
              { id: 'b', label: 'Google Admin' },
              { id: 'c', label: 'Azure AD uniquement' },
            ],
          },
        ],
      },
      {
        id: 'demo-apple-module-3',
        slug: 'mdm-basics',
        title: 'Bases MDM et enrôlement',
        summary: 'Profils, supervision et flux d’enrôlement.',
        questions: [
          {
            id: 'q3',
            type: 'single',
            prompt: 'Quel profil est requis pour la supervision iOS ?',
            options: [
              { id: 'a', label: 'Profil de supervision via MDM' },
              { id: 'b', label: 'Profil Wi-Fi uniquement' },
              { id: 'c', label: 'Certificat utilisateur' },
            ],
          },
        ],
      },
    ],
  },
  'jamf-pro-foundations': {
    id: 'demo-jamf',
    slug: 'jamf-pro-foundations',
    title: 'Fondations Jamf Pro',
    track: 'JAMF',
    description: 'Découvrir Jamf Pro, les politiques et l’inventaire.',
    totalModules: 3,
    completedModules: 0,
    progressPercent: 0,
    modules: [
      {
        id: 'demo-jamf-1',
        slug: 'jamf-console',
        title: 'Console Jamf et inventaire',
        summary: 'Navigation, groupes et recherche.',
        questions: [],
      },
      {
        id: 'demo-jamf-2',
        slug: 'jamf-policies',
        title: 'Politiques et scripts',
        summary: 'Déployer des configurations ciblées.',
        questions: [],
      },
      {
        id: 'demo-jamf-3',
        slug: 'jamf-enrollment',
        title: 'Enrôlement Jamf',
        summary: 'ADE, PreStage et flux utilisateur.',
        questions: [],
      },
    ],
  },
  'intune-ios-enrollment': {
    id: 'demo-intune',
    slug: 'intune-ios-enrollment',
    title: 'Intune — enrôlement iOS',
    track: 'INTUNE',
    description: 'Company Portal, profils et conformité Intune.',
    totalModules: 3,
    completedModules: 0,
    progressPercent: 0,
    modules: [
      {
        id: 'demo-intune-1',
        slug: 'intune-basics',
        title: 'Portail Intune et apps',
        summary: 'Découvrir le portail et les applications gérées.',
        questions: [],
      },
      {
        id: 'demo-intune-2',
        slug: 'intune-compliance',
        title: 'Conformité et conditions',
        summary: 'Règles de conformité et accès conditionnel.',
        questions: [],
      },
      {
        id: 'demo-intune-3',
        slug: 'intune-enrollment',
        title: 'Enrôlement iOS',
        summary: 'ABM, profils et expérience utilisateur.',
        questions: [],
      },
    ],
  },
};
