import {
  appleCertPrepQuestions,
  intuneIosEnrollmentQuestions,
  jamfProFoundationsQuestions,
  moduleQuizQuestions,
  toDemoQuestions,
} from '@ama/shared/quiz-content';
import { getCoursePedagogy, getModulePedagogy } from '@ama/shared/course-content';
import { getModuleVideoDubFr, getModuleVideoDubFrSyncUrl } from '@ama/shared/video-dub-fr';
import { getModuleVideoHeyGenFr } from '@ama/shared/video-heygen-fr';
import { apiFetch } from './api';
import { getAccessToken } from './auth';

function demoModuleQuestions(moduleKey: string, questions: Parameters<typeof toDemoQuestions>[1]) {
  return moduleQuizQuestions(toDemoQuestions(moduleKey, questions)).map(
    ({ id, type, prompt, options, explanation }) => ({
      id,
      type,
      prompt,
      options,
      explanation,
    })
  );
}

export interface CourseQuestion {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; label: string }[];
  explanation?: string;
  /** Présent en mode démo local uniquement (jamais exposé par l’API). */
  correctOption?: string;
}

export interface CheckAnswerResult {
  correct: boolean;
  explanation?: string;
  correctOptionId?: string;
}

export interface CourseModule {
  id: string;
  slug: string;
  title: string;
  summary: string;
  learningObjectives?: string[];
  keyTakeaways?: string[];
  lessonContent?: string;
  videoUrl?: string | null;
  videoTitle?: string | null;
  videoDurationMinutes?: number | null;
  videoProvider?: import('@ama/shared/video-embed').VideoProvider;
  videoSourceLanguage?: 'fr' | 'en' | null;
  videoTranscriptFr?: string | null;
  videoDubFrSyncUrl?: string | null;
  videoDubFrUrl?: string | null;
  videoHeyGenFrUrl?: string | null;
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
  alreadyCompleted?: boolean;
  reviewMode?: boolean;
  courseCompletion?: CourseCompletionResult;
}

export { NEXT_COURSE_BY_SLUG } from '@ama/shared/constants';

function normalizeCourse(course: CourseDetail): CourseDetail {
  const pedagogy = getCoursePedagogy(course.slug);
  return {
    ...course,
    description: pedagogy?.description ?? course.description,
    modules: course.modules.map((module) => {
      const modulePedagogy = getModulePedagogy(course.slug, module.slug);
      return {
        ...module,
        summary: modulePedagogy?.summary ?? module.summary,
        learningObjectives: modulePedagogy?.learningObjectives ?? module.learningObjectives,
        keyTakeaways: modulePedagogy?.keyTakeaways ?? module.keyTakeaways,
        lessonContent: modulePedagogy?.lessonContent ?? module.lessonContent,
        videoUrl: module.videoUrl ?? modulePedagogy?.videoUrl ?? null,
        videoTitle: module.videoTitle ?? modulePedagogy?.videoTitle ?? null,
        videoDurationMinutes:
          module.videoDurationMinutes ?? modulePedagogy?.videoDurationMinutes ?? null,
        videoProvider: modulePedagogy?.videoProvider,
        videoSourceLanguage: modulePedagogy?.videoSourceLanguage ?? null,
        videoTranscriptFr: modulePedagogy?.videoTranscriptFr ?? null,
        videoDubFrSyncUrl: (() => {
          const dub = getModuleVideoDubFr(course.slug, module.slug);
          return dub ? getModuleVideoDubFrSyncUrl(dub) : null;
        })(),
        videoDubFrUrl: (() => {
          const dub = getModuleVideoDubFr(course.slug, module.slug);
          return dub ? getModuleVideoDubFrSyncUrl(dub) : null;
        })(),
        videoHeyGenFrUrl: getModuleVideoHeyGenFr(course.slug, module.slug)?.url ?? null,
      };
    }),
  };
}

export async function fetchCourse(slug: string): Promise<{ data: CourseDetail; source: 'api' | 'demo' }> {
  const token = await getAccessToken();
  if (!token) {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: normalizeCourse(demo), source: 'demo' };
  }

  try {
    const response = await apiFetch<{ course: CourseDetail }>(`/courses/${slug}`);
    return { data: normalizeCourse(response.course), source: 'api' };
  } catch {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: normalizeCourse(demo), source: 'demo' };
  }
}

export async function fetchCourseProgress(
  slug: string
): Promise<{ data: CourseProgressData; source: 'api' | 'demo' }> {
  const token = await getAccessToken();
  if (!token) {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: courseToProgress(normalizeCourse(demo)), source: 'demo' };
  }

  try {
    const data = await apiFetch<CourseProgressData>(`/courses/${slug}/progress`);
    return { data, source: 'api' };
  } catch {
    const demo = DEMO_COURSES[slug];
    if (!demo) throw new Error('COURSE_NOT_FOUND');
    return { data: courseToProgress(normalizeCourse(demo)), source: 'demo' };
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
  payload: { quizAnswers?: Record<string, string>; gameOrder?: number[]; reviewMode?: boolean }
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
    title: 'Parcours Apple — Device Support & MDM',
    track: 'APPLE',
    description: 'Diagnostic, sécurité et préparation aux fondamentaux Apple Device Support.',
    totalModules: 4,
    completedModules: 0,
    progressPercent: 0,
    modules: [
      {
        id: 'demo-apple-module-1',
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        summary: 'Diagnostic matériel/logiciel, sauvegarde et réinitialisation sécurisée.',
        questions: demoModuleQuestions(
          'device-support-basics',
          toDemoQuestions('device-support-basics', appleCertPrepQuestions['device-support-basics'])
        ),
      },
      {
        id: 'demo-apple-module-2',
        slug: 'ios-troubleshooting',
        title: 'Dépannage iOS et iPadOS',
        summary: 'Connectivité, batterie et blocages courants sur iPhone/iPad.',
        questions: demoModuleQuestions(
          'ios-troubleshooting',
          toDemoQuestions('ios-troubleshooting', appleCertPrepQuestions['ios-troubleshooting'])
        ),
      },
      {
        id: 'demo-apple-module-3',
        slug: 'acmt-exam-prep',
        title: 'Préparation examen Device Support (ACMT)',
        summary: 'Sécurité, sauvegarde, restauration et bonnes pratiques atelier.',
        questions: demoModuleQuestions(
          'acmt-exam-prep',
          toDemoQuestions('acmt-exam-prep', appleCertPrepQuestions['acmt-exam-prep'])
        ),
      },
      {
        id: 'demo-apple-module-4',
        slug: 'apps-vpp-management',
        title: 'Gestion des apps et VPP',
        summary: 'VPP, apps gérées et triage support sur iPhone supervisé.',
        questions: demoModuleQuestions(
          'apps-vpp-management',
          toDemoQuestions('apps-vpp-management', appleCertPrepQuestions['apps-vpp-management'])
        ),
      },
    ],
  },
  'jamf-pro-foundations': {
    id: 'demo-jamf',
    slug: 'jamf-pro-foundations',
    title: 'Fondamentaux Jamf Pro',
    track: 'JAMF',
    description: 'Inventaire, smart groups, politiques et bonnes pratiques MDM.',
    totalModules: 4,
    completedModules: 0,
    progressPercent: 0,
    modules: [
      {
        id: 'demo-jamf-module-1',
        slug: 'smart-groups-policies',
        title: 'Smart Groups et politiques',
        summary: 'Cibler des Mac et déployer une politique sur un périmètre pilote.',
        questions: demoModuleQuestions(
          'smart-groups-policies',
          toDemoQuestions('smart-groups-policies', jamfProFoundationsQuestions['smart-groups-policies'])
        ),
      },
      {
        id: 'demo-jamf-module-2',
        slug: 'inventory-basics',
        title: 'Inventaire et conformité',
        summary: 'Lire l’inventaire Jamf et prioriser les appareils hors norme.',
        questions: demoModuleQuestions(
          'inventory-basics',
          toDemoQuestions('inventory-basics', jamfProFoundationsQuestions['inventory-basics'])
        ),
      },
      {
        id: 'demo-jamf-module-3',
        slug: 'enrollment-apple-integration',
        title: 'Enrôlement et intégration Apple',
        summary: 'ABM, certificats Push et enrôlement automatisé.',
        questions: demoModuleQuestions(
          'enrollment-apple-integration',
          toDemoQuestions(
            'enrollment-apple-integration',
            jamfProFoundationsQuestions['enrollment-apple-integration']
          )
        ),
      },
      {
        id: 'demo-jamf-module-4',
        slug: 'api-automation-advanced-policies',
        title: 'Automatisation et extension API',
        summary: 'API Jamf Pro, extension attributes et politiques récurrentes à l’échelle.',
        questions: demoModuleQuestions(
          'api-automation-advanced-policies',
          toDemoQuestions(
            'api-automation-advanced-policies',
            jamfProFoundationsQuestions['api-automation-advanced-policies']
          )
        ),
      },
    ],
  },
  'intune-ios-enrollment': {
    id: 'demo-intune',
    slug: 'intune-ios-enrollment',
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    track: 'INTUNE',
    description: 'ADE, conformité et App Protection pour flottes Apple.',
    totalModules: 4,
    completedModules: 0,
    progressPercent: 0,
    modules: [
      {
        id: 'demo-intune-module-1',
        slug: 'ade-enrollment-basics',
        title: 'Préparer Automated Device Enrollment',
        summary: 'Associer Apple Business Manager à Intune et valider Setup Assistant.',
        questions: demoModuleQuestions(
          'ade-enrollment-basics',
          toDemoQuestions('ade-enrollment-basics', intuneIosEnrollmentQuestions['ade-enrollment-basics'])
        ),
      },
      {
        id: 'demo-intune-module-2',
        slug: 'compliance-policies',
        title: 'Politiques de conformité iOS',
        summary: 'OS, PIN, jailbreak et actions correctives.',
        questions: demoModuleQuestions(
          'compliance-policies',
          toDemoQuestions('compliance-policies', intuneIosEnrollmentQuestions['compliance-policies'])
        ),
      },
      {
        id: 'demo-intune-module-3',
        slug: 'app-protection-conditional-access',
        title: 'App Protection et Conditional Access',
        summary: 'Protéger les données M365 sur iOS avec MAM et CA.',
        questions: demoModuleQuestions(
          'app-protection-conditional-access',
          toDemoQuestions(
            'app-protection-conditional-access',
            intuneIosEnrollmentQuestions['app-protection-conditional-access']
          )
        ),
      },
      {
        id: 'demo-intune-module-4',
        slug: 'vpp-abm-business-apps',
        title: 'Apps métier et Apple Business Manager dans Intune',
        summary: 'VPP, apps store/LOB et diagnostic Pending sur flotte supervisée.',
        questions: demoModuleQuestions(
          'vpp-abm-business-apps',
          toDemoQuestions('vpp-abm-business-apps', intuneIosEnrollmentQuestions['vpp-abm-business-apps'])
        ),
      },
    ],
  },
};
