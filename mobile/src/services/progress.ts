import { getAccessToken } from './auth';
import { apiFetch } from './api';

export interface CourseNextModule {
  id: string;
  slug: string;
  title: string;
  courseSlug?: string | null;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  track: string;
  progressPercent?: number;
  totalModules?: number;
  completedModules?: number;
  nextModule?: CourseNextModule | null;
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

export interface LearnerProgress {
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
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
  courses: CourseSummary[];
  completedCourses?: CompletedCourseSummary[];
  learningStreak?: LearningStreak;
  tracks?: {
    track: string;
    totalModules: number;
    completedModules: number;
    progressPercent: number;
    averageScore: number;
    nextModule?: CourseNextModule | null;
  }[];
}

export interface LearnerDashboard {
  data: LearnerProgress;
  source: 'api' | 'demo';
}

export async function fetchLearnerDashboard(): Promise<LearnerDashboard> {
  const token = await getAccessToken();
  if (!token) return { data: demoProgress, source: 'demo' };

  try {
    const [progress, dashboard] = await Promise.all([
      apiFetch<LearnerProgress>('/users/me/progress'),
      apiFetch<{ completedCourses?: CompletedCourseSummary[]; learningStreak?: LearningStreak }>(
        '/users/me/dashboard'
      ).catch(() => ({ completedCourses: [], learningStreak: undefined })),
    ]);
    return {
      data: {
        ...progress,
        completedCourses: dashboard.completedCourses ?? [],
        learningStreak: dashboard.learningStreak,
      },
      source: 'api',
    };
  } catch {
    return { data: demoProgress, source: 'demo' };
  }
}

const demoProgress: LearnerProgress = {
  user: { id: 'demo', displayName: 'Technicien démo', email: 'demo@ama.dev' },
  progress: {
    totalModules: 6,
    completedModules: 2,
    progressPercent: 33,
    averageScore: 86,
    points: 420,
    level: 'TECHNICIAN',
  },
  badges: ['apple-mdm-foundation'],
  learningStreak: { currentDays: 2, longestDays: 4, lastActivityDate: '2026-05-18' },
  quests: [{ id: 'weekly-apple-3', label: 'Termine 3 unités Apple cette semaine', progress: 1, target: 3 }],
  courses: [
    {
      id: 'demo-apple',
      slug: 'apple-cert-prep',
      title: 'Parcours Apple Device Support & MDM',
      track: 'APPLE',
      totalModules: 3,
      completedModules: 2,
      progressPercent: 67,
      nextModule: {
        id: 'demo-apple-module-3',
        slug: 'mdm-basics',
        title: 'Bases MDM et enrôlement',
        courseSlug: 'apple-cert-prep',
      },
    },
  ],
  tracks: [
    {
      track: 'APPLE',
      totalModules: 3,
      completedModules: 2,
      progressPercent: 67,
      averageScore: 88,
      nextModule: {
        id: 'demo-apple-module-3',
        slug: 'mdm-basics',
        title: 'Bases MDM et enrôlement',
        courseSlug: 'apple-cert-prep',
      },
    },
  ],
};
