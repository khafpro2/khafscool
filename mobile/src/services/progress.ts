import { DEMO_ACCOUNT } from '@ama/shared/constants';
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

export interface RecentActivityItem {
  id: string;
  slug: string;
  title: string;
  courseSlug: string;
  courseTitle: string;
  track: string;
  completedAt: string | Date | null;
  pointsEarned: number;
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
  isSupporter?: boolean;
  quests: { id: string; label: string; progress: number; target: number }[];
  courses: CourseSummary[];
  completedCourses?: CompletedCourseSummary[];
  learningStreak?: LearningStreak;
  recentActivity?: RecentActivityItem[];
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
      apiFetch<{
        completedCourses?: CompletedCourseSummary[];
        learningStreak?: LearningStreak;
        recentActivity?: RecentActivityItem[];
        isSupporter?: boolean;
      }>('/users/me/dashboard').catch(() => ({
        completedCourses: [],
        learningStreak: undefined,
        recentActivity: [],
        isSupporter: false,
      })),
    ]);
    return {
      data: {
        ...progress,
        isSupporter: dashboard.isSupporter ?? progress.badges.includes('supporter'),
        completedCourses: dashboard.completedCourses ?? [],
        learningStreak: dashboard.learningStreak,
        recentActivity: progress.recentActivity ?? dashboard.recentActivity ?? [],
      },
      source: 'api',
    };
  } catch {
    return { data: demoProgress, source: 'demo' };
  }
}

const demoProgress: LearnerProgress = {
  user: { id: 'demo', displayName: DEMO_ACCOUNT.displayName, email: DEMO_ACCOUNT.email },
  progress: {
    totalModules: 12,
    completedModules: 2,
    progressPercent: 17,
    averageScore: 86,
    points: 420,
    level: 'TECHNICIAN',
  },
  badges: ['apple-mdm-foundation'],
  learningStreak: { currentDays: 2, longestDays: 4, lastActivityDate: '2026-05-18' },
  quests: [{ id: 'weekly-apple-2', label: 'Valide 2 modules Apple', progress: 1, target: 2 }],
  recentActivity: [
    {
      id: 'demo-apple-module-2',
      slug: 'device-support',
      title: 'Support appareils Apple',
      courseSlug: 'apple-cert-prep',
      courseTitle: 'Parcours Apple Device Support & MDM',
      track: 'APPLE',
      completedAt: '2026-05-18T14:30:00.000Z',
      pointsEarned: 42,
    },
  ],
  courses: [
    {
      id: 'demo-apple',
      slug: 'apple-cert-prep',
      title: 'Parcours Apple Device Support & MDM',
      track: 'APPLE',
      totalModules: 4,
      completedModules: 2,
      progressPercent: 50,
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
      totalModules: 4,
      completedModules: 2,
      progressPercent: 50,
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
