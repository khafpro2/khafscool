export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  provider?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  rememberMe?: boolean;
  accessTokenTtlMinutes?: number;
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

export interface RecentActivityItem {
  id: string;
  slug: string;
  title: string;
  courseSlug: string;
  courseTitle: string;
  track: string;
  completedAt: string | Date | null;
  quizScore: number | null;
  gameScore: number | null;
  pointsEarned: number;
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
  isSupporter?: boolean;
  quests: { id: string; questKey?: string; label: string; progress: number; target: number; completed?: boolean }[];
  certificationSprint?: CertificationSprintSummary | null;
  courses: CourseSummary[];
  completedCourses?: CompletedCourseSummary[];
  learningStreak?: LearningStreak;
  recentActivity?: RecentActivityItem[];
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
  recentActivity?: RecentActivityItem[];
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
  /** Présent uniquement en mode démo hors-ligne */
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
    /** Présent en mode démo pour le feedback local du mini-jeu */
    correctOrder?: number[];
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
  /** Piste principale pour le filtre client (démo ou inférée des badges) */
  primaryTrack?: 'APPLE' | 'JAMF' | 'INTUNE' | null;
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
  rewardClaimed?: boolean;
  track?: string | null;
}

export interface WeeklyQuestsResponse {
  quests: WeeklyQuest[];
  weekStart?: string | null;
  weekEnd?: string | null;
}

export type CheckoutPlan = 'monthly' | 'yearly' | 'enterprise';

export interface BillingStatusResponse {
  mode: 'demo' | 'live';
  demo: boolean;
  stripe: {
    configured: boolean;
    checkoutEnabled: boolean;
  };
}

export interface BillingCheckoutResponse {
  demo?: boolean;
  mode?: 'demo' | 'live';
  provider?: string;
  plan: CheckoutPlan;
  checkoutUrl?: string;
  sessionId?: string;
  stripe?: {
    configured: boolean;
    checkoutEnabled: boolean;
  };
  message?: string;
}

export type DonationMode = 'live' | 'fallback' | 'unavailable';

export interface DonationStatusResponse {
  mode: DonationMode;
  stripe: {
    configured: boolean;
    checkoutEnabled: boolean;
  };
  fallbackUrl?: string | null;
  suggestedAmountsCents: number[];
  message?: string;
}

export interface DonationCheckoutResponse {
  mode: 'live' | 'fallback';
  checkoutUrl?: string;
  amountCents: number;
  sessionId?: string;
  message?: string;
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

export interface DashboardApiResponse {
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
  isSupporter?: boolean;
  quests: { id: string; label: string; progress: number; target: number; completed?: boolean }[];
  certificationSprint?: CertificationSprintSummary | null;
  courses: CourseSummary[];
  completedCourses?: CompletedCourseSummary[];
  recentActivity?: RecentActivityItem[];
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
  courseCompletion?: CourseCompletionResult;
}

export interface CheckAnswerResult {
  correct: boolean;
  explanation?: string;
}
