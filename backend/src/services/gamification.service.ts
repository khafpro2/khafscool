import { PRACTICE_EXAM_PASS_BADGE, PRACTICE_EXAM_PASS_PERCENT } from '@ama/shared/practice-exam';
import { moduleQuizQuestions } from '@ama/shared/quiz-content';
import { CourseTrack, UserLevel, type UserQuest } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { isSupporterFromBadges } from './supporter-badge.service.js';

export { PRACTICE_EXAM_PASS_BADGE, PRACTICE_EXAM_PASS_PERCENT };

export const WEEKLY_PRACTICE_EXAM_QUEST_KEY = 'weekly-practice-exam';

export type CertificationSprintDays = 7 | 14;

const CERTIFICATION_SPRINT_PREFIX = 'sprint:';
const DEFAULT_CERTIFICATION_SPRINT_DAYS: CertificationSprintDays = 7;
const CERTIFICATION_SPRINT_DAYS = [7, 14] as const;

const LEVEL_THRESHOLDS: { level: UserLevel; min: number }[] = [
  { level: UserLevel.APPLE_READY, min: 3000 },
  { level: UserLevel.MDM_ADMIN, min: 1500 },
  { level: UserLevel.TECHNICIAN, min: 500 },
  { level: UserLevel.NOVICE, min: 0 },
];

const TRACK_BADGES: Partial<Record<CourseTrack, string>> = {
  [CourseTrack.APPLE]: 'apple-mdm-foundation',
  [CourseTrack.JAMF]: 'jamf-engineer',
  [CourseTrack.INTUNE]: 'intune-professional',
};

export type CourseCompletionPayload = {
  slug: string;
  title: string;
  pointsEarned: number;
  badgeEarned?: string;
};

export function modulePointsFromScores(quizScore: number, gameScore: number) {
  return Math.round(quizScore * 0.1 + gameScore * 0.2);
}

export function sumCoursePointsFromProgress(
  rows: { quizScore: number | null; gameScore: number | null }[]
) {
  return rows.reduce(
    (sum, row) => sum + modulePointsFromScores(row.quizScore ?? 0, row.gameScore ?? 0),
    0
  );
}

type RecentModuleProgressRow = {
  module: {
    id: string;
    slug: string;
    title: string;
    course: { slug: string; title: string; track: CourseTrack };
  };
  completedAt: Date | null;
  quizScore: number | null;
  gameScore: number | null;
};

export function mapRecentActivity(rows: RecentModuleProgressRow[]) {
  return rows.map((progress) => ({
    id: progress.module.id,
    slug: progress.module.slug,
    title: progress.module.title,
    courseSlug: progress.module.course.slug,
    courseTitle: progress.module.course.title,
    track: progress.module.course.track,
    completedAt: progress.completedAt,
    quizScore: progress.quizScore,
    gameScore: progress.gameScore,
    pointsEarned: modulePointsFromScores(progress.quizScore ?? 0, progress.gameScore ?? 0),
  }));
}

async function fetchRecentCompletedModules(userId: string, take = 5) {
  return prisma.moduleProgress.findMany({
    where: { userId, completedAt: { not: null } },
    include: { module: { include: { course: true } } },
    orderBy: { completedAt: 'desc' },
    take,
  });
}

export type CompletedCourseSummary = {
  slug: string;
  title: string;
  track: CourseTrack;
  completedAt: string;
};

export function buildCompletedCourses(
  courses: {
    slug: string;
    title: string;
    track: CourseTrack;
    modules: { progresses: { completedAt: Date | null }[] }[];
  }[]
): CompletedCourseSummary[] {
  return courses
    .filter((course) => {
      const total = course.modules.length;
      if (!total) return false;
      return course.modules.every((module) =>
        module.progresses.some((progress) => progress.completedAt)
      );
    })
    .map((course) => {
      const dates = course.modules
        .flatMap((module) => module.progresses.map((progress) => progress.completedAt))
        .filter((date): date is Date => date != null);
      const completedAt =
        dates.length > 0
          ? new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString()
          : new Date().toISOString();
      return {
        slug: course.slug,
        title: course.title,
        track: course.track,
        completedAt,
      };
    });
}

export function buildCourseCompletionResult(
  course: { slug: string; title: string; track: CourseTrack },
  completedModules: number,
  totalModules: number,
  badges: string[],
  coursePointsEarned: number
): { courseCompleted: boolean; courseCompletion?: CourseCompletionPayload } {
  const courseCompleted = totalModules > 0 && completedModules >= totalModules;
  if (!courseCompleted) {
    return { courseCompleted: false };
  }

  const trackBadge = TRACK_BADGES[course.track];
  return {
    courseCompleted: true,
    courseCompletion: {
      slug: course.slug,
      title: course.title,
      pointsEarned: coursePointsEarned,
      ...(trackBadge && badges.includes(trackBadge) ? { badgeEarned: trackBadge } : {}),
    },
  };
}

const WEEKLY_QUESTS = [
  {
    questKey: 'weekly-apple-2',
    label: 'Valide 2 modules Apple',
    target: 2,
  },
  {
    questKey: 'weekly-jamf-2',
    label: 'Valide 2 modules Jamf Pro',
    target: 2,
  },
  {
    questKey: 'weekly-intune-2',
    label: 'Termine 2 modules Intune',
    target: 2,
  },
  {
    questKey: 'weekly-mdm-4',
    label: 'Termine 4 modules MDM cette semaine',
    target: 4,
  },
  {
    questKey: WEEKLY_PRACTICE_EXAM_QUEST_KEY,
    label: 'Passe un examen blanc',
    target: 1,
  },
];

const TRACK_LABELS: Record<CourseTrack, string> = {
  [CourseTrack.APPLE]: 'Apple',
  [CourseTrack.JAMF]: 'Jamf',
  [CourseTrack.INTUNE]: 'Intune',
};

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type LearningStreak = {
  currentDays: number;
  longestDays: number;
  lastActivityDate: string | null;
};

export function buildLearningStreak(completedAts: Date[], now = new Date()): LearningStreak {
  if (!completedAts.length) {
    return { currentDays: 0, longestDays: 0, lastActivityDate: null };
  }

  const activityDays = new Set<string>();
  for (const completedAt of completedAts) {
    activityDays.add(dateKey(startOfDay(completedAt)));
  }

  const sortedDays = [...activityDays].sort();
  const lastActivityDate = sortedDays[sortedDays.length - 1] ?? null;

  let longestDays = 1;
  let run = 1;
  for (let index = 1; index < sortedDays.length; index += 1) {
    const previous = new Date(`${sortedDays[index - 1]}T00:00:00`);
    const current = new Date(`${sortedDays[index]}T00:00:00`);
    const dayGap = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
    if (dayGap === 1) {
      run += 1;
      longestDays = Math.max(longestDays, run);
    } else {
      run = 1;
    }
  }

  const todayKey = dateKey(startOfDay(now));
  const yesterdayKey = dateKey(addDays(startOfDay(now), -1));
  const anchorKey = activityDays.has(todayKey)
    ? todayKey
    : activityDays.has(yesterdayKey)
      ? yesterdayKey
      : null;

  let currentDays = 0;
  if (anchorKey) {
    let cursor = new Date(`${anchorKey}T00:00:00`);
    while (activityDays.has(dateKey(cursor))) {
      currentDays += 1;
      cursor = addDays(cursor, -1);
    }
  }

  return { currentDays, longestDays, lastActivityDate };
}

async function computeLearningStreak(userId: string) {
  const rows = await prisma.moduleProgress.findMany({
    where: { userId, completedAt: { not: null } },
    select: { completedAt: true },
  });

  return buildLearningStreak(
    rows
      .map((row) => row.completedAt)
      .filter((completedAt): completedAt is Date => completedAt != null)
  );
}

export const WEEKLY_QUEST_REWARD_POINTS: Record<string, number> = {
  'weekly-apple-2': 40,
  'weekly-jamf-2': 40,
  'weekly-intune-2': 40,
  'weekly-mdm-4': 80,
  [WEEKLY_PRACTICE_EXAM_QUEST_KEY]: 25,
};

export function weeklyQuestTrack(questKey: string): CourseTrack | null {
  if (questKey.startsWith('weekly-apple')) return CourseTrack.APPLE;
  if (questKey.startsWith('weekly-jamf')) return CourseTrack.JAMF;
  if (questKey.startsWith('weekly-intune')) return CourseTrack.INTUNE;
  return null;
}

function endOfWeek(weekStart: Date) {
  return addDays(weekStart, 7);
}

export function buildCertificationSprintQuestKey(
  track: CourseTrack,
  startDate: Date,
  days: CertificationSprintDays
) {
  return `${CERTIFICATION_SPRINT_PREFIX}${track}:${dateKey(startDate)}:${days}`;
}

export function parseCertificationSprintQuestKey(questKey: string) {
  const match = questKey.match(/^sprint:(APPLE|JAMF|INTUNE):(\d{4}-\d{2}-\d{2}):(7|14)$/);
  if (!match) return null;

  return {
    track: match[1] as CourseTrack,
    startDate: startOfDay(new Date(Number(match[2].slice(0, 4)), Number(match[2].slice(5, 7)) - 1, Number(match[2].slice(8, 10)))),
    days: Number(match[3]) as CertificationSprintDays,
  };
}

function sprintSummary(quest: UserQuest, now = new Date()) {
  const parsed = parseCertificationSprintQuestKey(quest.questKey);
  if (!parsed) return null;

  const endsAt = addDays(parsed.startDate, parsed.days);
  const remainingModules = Math.max(quest.target - quest.progress, 0);

  return {
    id: quest.id,
    questKey: quest.questKey,
    track: parsed.track,
    label: quest.label,
    days: parsed.days,
    startedAt: parsed.startDate,
    endsAt,
    target: quest.target,
    progress: quest.progress,
    progressPercent: quest.target ? Math.min(100, Math.round((quest.progress / quest.target) * 100)) : 0,
    remainingModules,
    completed: quest.completed,
    expired: now >= endsAt,
  };
}

function isCurrentSprintQuest(quest: UserQuest, now = new Date()) {
  const summary = sprintSummary(quest, now);
  return Boolean(summary && !summary.completed && !summary.expired);
}

export function normalizeCertificationSprintDays(days?: number): CertificationSprintDays {
  if (days === undefined) return DEFAULT_CERTIFICATION_SPRINT_DAYS;
  if (CERTIFICATION_SPRINT_DAYS.includes(days as CertificationSprintDays)) {
    return days as CertificationSprintDays;
  }
  throw new Error('INVALID_SPRINT_DAYS');
}

function computeLevel(points: number): UserLevel {
  for (const t of LEVEL_THRESHOLDS) {
    if (points >= t.min) return t.level;
  }
  return UserLevel.NOVICE;
}

export async function isTrackFullyCompleted(userId: string, track: CourseTrack) {
  const totalModules = await prisma.module.count({ where: { course: { track } } });
  if (!totalModules) return false;

  const completedOnTrack = await prisma.moduleProgress.count({
    where: { userId, completedAt: { not: null }, module: { course: { track } } },
  });

  return completedOnTrack >= totalModules;
}

async function claimWeeklyQuestReward(userId: string, questId: string, questKey: string) {
  const rewardPoints = WEEKLY_QUEST_REWARD_POINTS[questKey];
  if (!rewardPoints) return;

  const claimed = await prisma.userQuest.updateMany({
    where: { id: questId, rewardClaimed: false },
    data: { rewardClaimed: true },
  });
  if (!claimed.count) return;

  const progress = await prisma.userProgress.upsert({
    where: { userId },
    create: { userId, points: rewardPoints, level: computeLevel(rewardPoints) },
    update: { points: { increment: rewardPoints } },
  });

  await prisma.userProgress.update({
    where: { userId },
    data: { level: computeLevel(progress.points) },
  });
}

function maskEmail(email: string | null) {
  if (!email) return null;
  const [name, domain] = email.split('@');
  if (!domain) return '***';
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${name.length > 2 ? '***' : '*'}@${domain}`;
}

function publicName(displayName: string | null, email: string | null) {
  return displayName?.trim() || maskEmail(email) || 'Apprenant';
}

function gradeQuiz(answers: Record<string, string>, questions: { id: string; correctOption: string }[]) {
  if (!questions.length) return 0;
  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctOption) correct++;
  }
  return Math.round((correct / questions.length) * 100);
}

function gradeGame(userOrder: number[], solution: { correctOrder: number[] }) {
  const expected = solution.correctOrder ?? [];
  if (!expected.length) return 50;
  let matches = 0;
  for (let i = 0; i < expected.length; i++) {
    if (userOrder[i] === expected[i]) matches++;
  }
  return Math.round((matches / expected.length) * 100);
}

export function isPracticeExamPassingScore(scorePercent: number) {
  return scorePercent >= PRACTICE_EXAM_PASS_PERCENT;
}

export async function recordPracticeExamResult(
  userId: string,
  courseSlug: string,
  scorePercent: number
) {
  const courseProgress = await getCourseProgress(userId, courseSlug);
  if (courseProgress.progress.progressPercent < 100) {
    throw new Error('COURSE_NOT_COMPLETE');
  }

  const passed = isPracticeExamPassingScore(scorePercent);
  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  const badges = [...new Set(progress?.badges ?? [])];
  let badgeEarned: string | undefined;
  let questCompleted = false;

  if (passed) {
    if (!badges.includes(PRACTICE_EXAM_PASS_BADGE)) {
      badges.push(PRACTICE_EXAM_PASS_BADGE);
      await prisma.userProgress.upsert({
        where: { userId },
        create: {
          userId,
          badges,
          points: progress?.points ?? 0,
          level: progress?.level ?? UserLevel.NOVICE,
        },
        update: { badges },
      });
      badgeEarned = PRACTICE_EXAM_PASS_BADGE;
    }

    await ensureWeeklyQuests(userId);
    const weekStart = startOfWeek(new Date());
    const quest = await prisma.userQuest.findFirst({
      where: { userId, questKey: WEEKLY_PRACTICE_EXAM_QUEST_KEY, weekStart },
    });
    if (quest && !quest.completed) {
      await incrementWeeklyQuest(userId, WEEKLY_PRACTICE_EXAM_QUEST_KEY);
      const updatedQuest = await prisma.userQuest.findFirst({
        where: { id: quest.id },
      });
      questCompleted = Boolean(updatedQuest?.completed);
    }
  }

  const latestProgress = await prisma.userProgress.findUnique({ where: { userId } });

  return {
    scorePercent,
    passed,
    badgeEarned,
    questCompleted,
    badges: latestProgress?.badges ?? badges,
  };
}

export async function checkQuestionAnswer(
  _userId: string,
  moduleId: string,
  questionId: string,
  selectedOption: string
) {
  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) throw new Error('MODULE_NOT_FOUND');

  const question = await prisma.question.findFirst({
    where: { id: questionId, moduleId },
  });
  if (!question) throw new Error('QUESTION_NOT_FOUND');

  const correct = question.correctOption === selectedOption;
  return {
    correct,
    explanation: question.explanation,
  };
}

async function buildCompleteModuleResponse(
  userId: string,
  module: {
    courseId: string;
    course: { slug: string; title: string; track: CourseTrack };
  },
  quizScore: number,
  gameScore: number,
  pointsEarned: number,
  badges: string[],
  newLevel: UserLevel,
  alreadyCompleted = false
) {
  const preparationScore = await computePreparationByTrack(userId, CourseTrack.APPLE);

  const courseProgressRows = await prisma.moduleProgress.findMany({
    where: { userId, module: { courseId: module.courseId }, completedAt: { not: null } },
    select: { quizScore: true, gameScore: true },
  });
  const coursePointsEarned = sumCoursePointsFromProgress(courseProgressRows);
  const { courseCompleted, courseCompletion } = buildCourseCompletionResult(
    {
      slug: module.course.slug,
      title: module.course.title,
      track: module.course.track,
    },
    courseProgressRows.length,
    await prisma.module.count({ where: { courseId: module.courseId } }),
    badges,
    coursePointsEarned
  );

  return {
    quizScore,
    gameScore,
    pointsEarned,
    level: newLevel,
    badges,
    preparationScore,
    courseCompleted,
    alreadyCompleted,
    ...(courseCompletion ? { courseCompletion } : {}),
  };
}

export async function completeModule(
  userId: string,
  moduleId: string,
  payload: { quizAnswers?: Record<string, string>; gameOrder?: number[]; reviewMode?: boolean }
) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { questions: true, game: true, course: true },
  });
  if (!module) throw new Error('MODULE_NOT_FOUND');

  const quizQuestions = moduleQuizQuestions(module.questions);

  const existingProgress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (existingProgress?.completedAt) {
    const progress = await prisma.userProgress.findUnique({ where: { userId } });

    if (payload.reviewMode) {
      const quizScore = gradeQuiz(
        payload.quizAnswers ?? {},
        quizQuestions.map((q) => ({ id: q.id, correctOption: q.correctOption }))
      );
      const solution = (module.game?.solution as { correctOrder?: number[] }) ?? { correctOrder: [] };
      const gameScore = gradeGame(payload.gameOrder ?? [], { correctOrder: solution.correctOrder ?? [] });
      const response = await buildCompleteModuleResponse(
        userId,
        module,
        quizScore,
        gameScore,
        0,
        progress?.badges ?? [],
        progress?.level ?? UserLevel.NOVICE,
        true
      );
      return { ...response, reviewMode: true, pointsEarned: 0 };
    }

    const quizScore = existingProgress.quizScore ?? 0;
    const gameScore = existingProgress.gameScore ?? 0;
    return buildCompleteModuleResponse(
      userId,
      module,
      quizScore,
      gameScore,
      modulePointsFromScores(quizScore, gameScore),
      progress?.badges ?? [],
      progress?.level ?? UserLevel.NOVICE,
      true
    );
  }

  const quizScore = gradeQuiz(
    payload.quizAnswers ?? {},
    quizQuestions.map((q) => ({ id: q.id, correctOption: q.correctOption }))
  );

  const solution = (module.game?.solution as { correctOrder?: number[] }) ?? { correctOrder: [] };
  const gameScore = gradeGame(payload.gameOrder ?? [], { correctOrder: solution.correctOrder ?? [] });

  const pointsEarned = Math.round(quizScore * 0.1 + gameScore * 0.2);

  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId, quizScore, gameScore, completedAt: new Date() },
    update: { quizScore, gameScore, completedAt: new Date() },
  });

  const progress = await prisma.userProgress.upsert({
    where: { userId },
    create: { userId, points: pointsEarned, level: computeLevel(pointsEarned) },
    update: { points: { increment: pointsEarned } },
  });

  const newLevel = computeLevel(progress.points);
  const badges = [...new Set(progress.badges)];

  const trackBadge = TRACK_BADGES[module.course.track];
  if (trackBadge && !badges.includes(trackBadge)) {
    const trackComplete = await isTrackFullyCompleted(userId, module.course.track);
    if (trackComplete) {
      badges.push(trackBadge);
    }
  }

  await prisma.userProgress.update({
    where: { userId },
    data: { level: newLevel, badges },
  });

  if (module.course.track === 'APPLE') {
    await incrementWeeklyQuest(userId, 'weekly-apple-2');
  }
  if (module.course.track === 'JAMF') {
    await incrementWeeklyQuest(userId, 'weekly-jamf-2');
  }
  if (module.course.track === 'INTUNE') {
    await incrementWeeklyQuest(userId, 'weekly-intune-2');
  }
  await incrementWeeklyQuest(userId, 'weekly-mdm-4');
  await refreshCertificationSprintProgress(userId, module.course.track);

  return buildCompleteModuleResponse(
    userId,
    module,
    quizScore,
    gameScore,
    pointsEarned,
    badges,
    newLevel,
    false
  );
}

async function incrementWeeklyQuest(userId: string, questKey: string) {
  await ensureWeeklyQuests(userId);
  const weekStart = startOfWeek(new Date());
  const quest = await prisma.userQuest.findFirst({ where: { userId, questKey, weekStart } });
  if (!quest || quest.completed) return;

  const progress = quest.progress + 1;
  const completed = progress >= quest.target;

  await prisma.userQuest.update({
    where: { id: quest.id },
    data: { progress, completed },
  });

  if (completed) {
    await claimWeeklyQuestReward(userId, quest.id, questKey);
  }
}

async function computePreparationByTrack(userId: string, track: CourseTrack) {
  const rows = await prisma.moduleProgress.findMany({
    where: { userId, module: { course: { track } } },
  });
  if (!rows.length) return 0;
  const avg =
    rows.reduce((s, r) => s + ((r.quizScore ?? 0) + (r.gameScore ?? 0)) / 2, 0) / rows.length;
  return Math.round(avg);
}

async function countCompletedModulesForSprint(userId: string, track: CourseTrack, startedAt: Date) {
  return prisma.moduleProgress.count({
    where: {
      userId,
      completedAt: { gte: startedAt },
      module: { course: { track } },
    },
  });
}

async function refreshCertificationSprintProgress(userId: string, track: CourseTrack) {
  const quests = await prisma.userQuest.findMany({
    where: {
      userId,
      completed: false,
      questKey: { startsWith: `${CERTIFICATION_SPRINT_PREFIX}${track}:` },
      weekStart: { gte: addDays(startOfDay(new Date()), -14) },
    },
    orderBy: { weekStart: 'desc' },
  });

  await Promise.all(
    quests.filter((quest) => isCurrentSprintQuest(quest)).map(async (quest) => {
      const parsed = parseCertificationSprintQuestKey(quest.questKey);
      if (!parsed) return;

      const progress = await countCompletedModulesForSprint(userId, parsed.track, parsed.startDate);
      await prisma.userQuest.update({
        where: { id: quest.id },
        data: { progress, completed: progress >= quest.target },
      });
    })
  );
}

export async function startCertificationSprint(
  userId: string,
  payload: { track: CourseTrack; days?: number }
) {
  const track = payload.track;
  if (!Object.values(CourseTrack).includes(track)) {
    throw new Error('INVALID_SPRINT_TRACK');
  }

  const days = normalizeCertificationSprintDays(payload.days);
  const startedAt = startOfDay(new Date());
  const questKey = buildCertificationSprintQuestKey(track, startedAt, days);
  const totalModules = await prisma.module.count({ where: { course: { track } } });
  const target = Math.max(totalModules, 1);
  const progress = await countCompletedModulesForSprint(userId, track, startedAt);

  const quest = await prisma.userQuest.upsert({
    where: { userId_questKey_weekStart: { userId, questKey, weekStart: startedAt } },
    create: {
      userId,
      questKey,
      weekStart: startedAt,
      label: `Certification Sprint ${TRACK_LABELS[track]} - ${days} jours`,
      target,
      progress,
      completed: progress >= target,
    },
    update: {
      label: `Certification Sprint ${TRACK_LABELS[track]} - ${days} jours`,
      target,
      progress,
      completed: progress >= target,
    },
  });

  return sprintSummary(quest);
}

export async function getCurrentCertificationSprint(userId: string) {
  const now = new Date();
  const quests = await prisma.userQuest.findMany({
    where: {
      userId,
      completed: false,
      questKey: { startsWith: CERTIFICATION_SPRINT_PREFIX },
      weekStart: { gte: addDays(startOfDay(now), -14) },
    },
    orderBy: [{ weekStart: 'desc' }, { questKey: 'asc' }],
  });

  const currentQuest = quests.find((quest) => isCurrentSprintQuest(quest, now));
  return currentQuest ? sprintSummary(currentQuest, now) : null;
}

type CourseRowForProgress = {
  id: string;
  slug: string;
  title: string;
  track: CourseTrack;
  modules: {
    id: string;
    slug: string;
    title: string;
    progresses: { completedAt: Date | null }[];
  }[];
};

function mapCoursesWithProgress(courses: CourseRowForProgress[]) {
  return courses.map((course) => {
    const total = course.modules.length;
    const done = course.modules.filter((module) =>
      module.progresses.some((progress) => progress.completedAt)
    ).length;
    const nextModule = course.modules.find(
      (module) => !module.progresses.some((progress) => progress.completedAt)
    );

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      track: course.track,
      totalModules: total,
      completedModules: done,
      progressPercent: total ? Math.round((done / total) * 100) : 0,
      nextModule: nextModule
        ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title }
        : null,
    };
  });
}

function computeModuleAggregateStats(
  moduleProgress: { completedAt: Date | null; quizScore: number | null }[]
) {
  const completed = moduleProgress.filter((progress) => progress.completedAt).length;
  const averageQuizScore =
    moduleProgress.length > 0
      ? Math.round(
          moduleProgress.reduce((sum, progress) => sum + (progress.quizScore ?? 0), 0) /
            moduleProgress.length
        )
      : 0;

  return {
    modulesCompleted: completed,
    averageQuizScore,
    timeSpentMinutes: completed * 12,
  };
}

export async function getCourseProgress(userId: string, slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: { progresses: { where: { userId } } },
      },
    },
  });
  if (!course) throw new Error('COURSE_NOT_FOUND');

  const modules = course.modules.map((module) => {
    const progress = module.progresses[0] ?? null;
    const completed = Boolean(progress?.completedAt);
    const score =
      progress?.quizScore !== null && progress?.quizScore !== undefined
        ? Math.round(((progress.quizScore ?? 0) + (progress.gameScore ?? 0)) / 2)
        : null;

    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      sortOrder: module.sortOrder,
      completed,
      completedAt: progress?.completedAt ?? null,
      quizScore: progress?.quizScore ?? null,
      gameScore: progress?.gameScore ?? null,
      score,
    };
  });

  const totalModules = modules.length;
  const completedModules = modules.filter((module) => module.completed).length;
  const scoredModules = modules.filter((module) => module.score !== null);
  const nextModule = modules.find((module) => !module.completed) ?? null;

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      track: course.track,
    },
    progress: {
      totalModules,
      completedModules,
      progressPercent: totalModules ? Math.round((completedModules / totalModules) * 100) : 0,
      averageScore: scoredModules.length
        ? Math.round(scoredModules.reduce((sum, module) => sum + (module.score ?? 0), 0) / scoredModules.length)
        : 0,
      nextModule: nextModule
        ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title }
        : null,
    },
    modules,
  };
}

export async function getUserProgress(userId: string) {
  const weekStart = startOfWeek(new Date());
  await ensureWeeklyQuests(userId);

  const [user, courses, recentProgress] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        quests: { where: { weekStart }, orderBy: { questKey: 'asc' } },
      },
    }),
    prisma.course.findMany({
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: { progresses: { where: { userId } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    fetchRecentCompletedModules(userId),
  ]);
  if (!user) throw new Error('USER_NOT_FOUND');

  const totalModules = courses.reduce((sum, course) => sum + course.modules.length, 0);
  const completedModules = courses.reduce(
    (sum, course) => sum + course.modules.filter((module) => module.progresses.some((p) => p.completedAt)).length,
    0
  );
  const scoredModules = courses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.progresses.map((progress) => ({
        quizScore: progress.quizScore,
        gameScore: progress.gameScore,
      }))
    )
  );
  const coursesWithProgress = mapCoursesWithProgress(courses);

  const tracks = Object.values(CourseTrack).map((track) => {
    const trackCourses = courses.filter((course) => course.track === track);
    const trackModules = trackCourses.flatMap((course) => course.modules);
    const trackCompletedModules = trackModules.filter((module) =>
      module.progresses.some((progress) => progress.completedAt)
    );
    const trackScoredModules = trackModules.flatMap((module) =>
      module.progresses.map((progress) => ({
        quizScore: progress.quizScore,
        gameScore: progress.gameScore,
      }))
    );
    const nextModule = trackModules.find((module) => !module.progresses.some((progress) => progress.completedAt));

    return {
      track,
      totalModules: trackModules.length,
      completedModules: trackCompletedModules.length,
      progressPercent: trackModules.length
        ? Math.round((trackCompletedModules.length / trackModules.length) * 100)
        : 0,
      averageScore: averageProgressScore(trackScoredModules),
      nextModule: nextModule
        ? {
            id: nextModule.id,
            slug: nextModule.slug,
            title: nextModule.title,
            courseSlug: trackCourses.find((course) => course.id === nextModule.courseId)?.slug ?? null,
          }
        : null,
    };
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    progress: {
      totalModules,
      completedModules,
      progressPercent: totalModules ? Math.round((completedModules / totalModules) * 100) : 0,
      averageScore: averageProgressScore(scoredModules),
      points: user.progress?.points ?? 0,
      level: user.progress?.level ?? UserLevel.NOVICE,
    },
    badges: user.progress?.badges ?? [],
    quests: user.quests,
    courses: coursesWithProgress,
    tracks,
    recentActivity: mapRecentActivity(recentProgress),
  };
}

function averageProgressScore(rows: { quizScore: number | null; gameScore: number | null }[]) {
  const scores = rows
    .map((row) => {
      const quizScore = row.quizScore ?? null;
      const gameScore = row.gameScore ?? null;
      if (quizScore === null && gameScore === null) return null;
      if (quizScore === null) return gameScore;
      if (gameScore === null) return quizScore;
      return Math.round((quizScore + gameScore) / 2);
    })
    .filter((score): score is number => score !== null);

  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function ensureWeeklyQuests(userId: string) {
  const weekStart = startOfWeek(new Date());

  await Promise.all(
    WEEKLY_QUESTS.map((quest) =>
      prisma.userQuest.upsert({
        where: { userId_questKey_weekStart: { userId, questKey: quest.questKey, weekStart } },
        create: { userId, weekStart, ...quest },
        update: {
          label: quest.label,
          target: quest.target,
        },
      })
    )
  );

  return prisma.userQuest.findMany({
    where: { userId, weekStart },
    orderBy: { questKey: 'asc' },
  });
}

export async function getDashboard(userId: string) {
  const weekStart = startOfWeek(new Date());
  await ensureWeeklyQuests(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      progress: true,
      moduleProgress: true,
      quests: { where: { weekStart }, orderBy: { questKey: 'asc' } },
      subscription: true,
    },
  });
  if (!user) throw new Error('USER_NOT_FOUND');

  const [courses, recentProgress] = await Promise.all([
    prisma.course.findMany({
      include: { modules: { include: { progresses: { where: { userId } } } } },
      orderBy: { sortOrder: 'asc' },
    }),
    fetchRecentCompletedModules(userId),
  ]);

  const coursesWithProgress = mapCoursesWithProgress(courses);

  const preparationByTrack = Object.values(CourseTrack).map((track) => {
    const trackCourses = coursesWithProgress.filter((course) => course.track === track);
    return {
      track,
      score: trackCourses.length
        ? Math.round(
            trackCourses.reduce((sum, course) => sum + course.progressPercent, 0) / trackCourses.length
          )
        : 0,
    };
  });

  const moduleStats = computeModuleAggregateStats(user.moduleProgress);

  const learningStreak = await computeLearningStreak(userId);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    stats: {
      points: user.progress?.points ?? 0,
      level: user.progress?.level ?? 'NOVICE',
      modulesCompleted: moduleStats.modulesCompleted,
      timeSpentMinutes: moduleStats.timeSpentMinutes,
      averageQuizScore: moduleStats.averageQuizScore,
      preparationScore: await computePreparationByTrack(userId, CourseTrack.APPLE),
      preparationByTrack,
    },
    learningStreak,
    badges: user.progress?.badges ?? [],
    isSupporter: isSupporterFromBadges(user.progress?.badges),
    quests: user.quests,
    certificationSprint: await getCurrentCertificationSprint(userId),
    courses: coursesWithProgress,
    completedCourses: buildCompletedCourses(courses),
    recentActivity: mapRecentActivity(recentProgress),
    subscription: user.subscription,
  };
}

export async function getWeeklyQuestsResponse(userId: string) {
  const weekStart = startOfWeek(new Date());
  const quests = await ensureWeeklyQuests(userId);

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: endOfWeek(weekStart).toISOString(),
    quests: quests.map((quest) => ({
      id: quest.id,
      questKey: quest.questKey,
      label: quest.label,
      target: quest.target,
      progress: quest.progress,
      completed: quest.completed,
      rewardClaimed: quest.rewardClaimed,
      weekStart: quest.weekStart.toISOString(),
      rewardPoints: WEEKLY_QUEST_REWARD_POINTS[quest.questKey] ?? null,
      track: weeklyQuestTrack(quest.questKey),
    })),
  };
}

export async function getLeaderboard(userId: string) {
  const leaders = await prisma.userProgress.findMany({
    orderBy: [{ points: 'desc' }, { userId: 'asc' }],
    take: 10,
    include: { user: true },
  });

  const currentUserProgress = await prisma.userProgress.findUnique({
    where: { userId },
    include: { user: true },
  });

  const currentUserRank = currentUserProgress
    ? 1 + (await prisma.userProgress.count({ where: { points: { gt: currentUserProgress.points } } }))
    : null;

  return {
    leaderboard: leaders.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId === userId ? entry.userId : undefined,
      displayName: publicName(entry.user.displayName, entry.user.email),
      email: entry.userId === userId ? entry.user.email : maskEmail(entry.user.email),
      points: entry.points,
      level: entry.level,
      badges: entry.badges,
      isCurrentUser: entry.userId === userId,
    })),
    currentUserRank,
  };
}
