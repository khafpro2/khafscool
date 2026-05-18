import { CourseTrack, UserLevel } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const LEVEL_THRESHOLDS: { level: UserLevel; min: number }[] = [
  { level: UserLevel.APPLE_READY, min: 3000 },
  { level: UserLevel.MDM_ADMIN, min: 1500 },
  { level: UserLevel.TECHNICIAN, min: 500 },
  { level: UserLevel.NOVICE, min: 0 },
];

const TRACK_BADGES: Partial<Record<CourseTrack, string>> = {
  [CourseTrack.APPLE]: 'apple-mdm-foundation',
  [CourseTrack.INTUNE]: 'intune-professional',
  [CourseTrack.SERVICENOW]: 'servicenow-ninja',
};

const WEEKLY_QUESTS = [
  {
    questKey: 'weekly-apple-3',
    label: 'Termine 3 modules Apple cette semaine',
    target: 3,
  },
  {
    questKey: 'weekly-mdm-4',
    label: 'Termine 4 modules MDM cette semaine',
    target: 4,
  },
];

function computeLevel(points: number): UserLevel {
  for (const t of LEVEL_THRESHOLDS) {
    if (points >= t.min) return t.level;
  }
  return UserLevel.NOVICE;
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

export async function completeModule(
  userId: string,
  moduleId: string,
  payload: { quizAnswers?: Record<string, string>; gameOrder?: number[] }
) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { questions: true, game: true, course: true },
  });
  if (!module) throw new Error('MODULE_NOT_FOUND');

  const quizScore = gradeQuiz(
    payload.quizAnswers ?? {},
    module.questions.map((q) => ({ id: q.id, correctOption: q.correctOption }))
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
  if (trackBadge) {
    const completedOnTrack = await prisma.moduleProgress.count({
      where: { userId, completedAt: { not: null }, module: { course: { track: module.course.track } } },
    });
    if (completedOnTrack >= 1 && !badges.includes(trackBadge)) {
      badges.push(trackBadge);
    }
  }

  await prisma.userProgress.update({
    where: { userId },
    data: { level: newLevel, badges },
  });

  if (module.course.track === 'APPLE') {
    await incrementWeeklyQuest(userId, 'weekly-apple-3');
  }
  await incrementWeeklyQuest(userId, 'weekly-mdm-4');

  const preparationScore = await computePreparationByTrack(userId, CourseTrack.APPLE);

  return { quizScore, gameScore, pointsEarned, level: newLevel, badges, preparationScore };
}

async function incrementWeeklyQuest(userId: string, questKey: string) {
  await ensureWeeklyQuests(userId);
  const weekStart = startOfWeek(new Date());
  const quest = await prisma.userQuest.findFirst({ where: { userId, questKey, weekStart } });
  if (!quest) return;

  const progress = quest.progress + 1;
  await prisma.userQuest.update({
    where: { id: quest.id },
    data: { progress, completed: progress >= quest.target },
  });
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
    prisma.moduleProgress.findMany({
      where: { userId, completedAt: { not: null } },
      include: { module: { include: { course: true } } },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
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
  const coursesWithProgress = courses.map((course) => {
    const total = course.modules.length;
    const done = course.modules.filter((module) => module.progresses.some((progress) => progress.completedAt)).length;
    const nextModule = course.modules.find((module) => !module.progresses.some((progress) => progress.completedAt));

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
    recentCompletedModules: recentProgress.map((progress) => ({
      id: progress.module.id,
      slug: progress.module.slug,
      title: progress.module.title,
      courseSlug: progress.module.course.slug,
      courseTitle: progress.module.course.title,
      track: progress.module.course.track,
      completedAt: progress.completedAt,
      quizScore: progress.quizScore,
      gameScore: progress.gameScore,
    })),
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

  const courses = await prisma.course.findMany({
    include: { modules: { include: { progresses: { where: { userId } } } } },
    orderBy: { sortOrder: 'asc' },
  });

  const coursesWithProgress = courses.map((c) => {
    const total = c.modules.length;
    const done = c.modules.filter((m) => m.progresses.some((p) => p.completedAt)).length;
    const nextModule = c.modules.find((m) => !m.progresses.some((p) => p.completedAt));
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      track: c.track,
      totalModules: total,
      completedModules: done,
      progressPercent: total ? Math.round((done / total) * 100) : 0,
      nextModule: nextModule
        ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title }
        : null,
    };
  });

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

  const completed = user.moduleProgress.filter((p) => p.completedAt).length;
  const avgQuiz =
    user.moduleProgress.length > 0
      ? Math.round(
          user.moduleProgress.reduce((s, p) => s + (p.quizScore ?? 0), 0) / user.moduleProgress.length
        )
      : 0;

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    stats: {
      points: user.progress?.points ?? 0,
      level: user.progress?.level ?? 'NOVICE',
      modulesCompleted: completed,
      timeSpentMinutes: completed * 12,
      averageQuizScore: avgQuiz,
      preparationScore: await computePreparationByTrack(userId, CourseTrack.APPLE),
      preparationByTrack,
    },
    badges: user.progress?.badges ?? [],
    quests: user.quests,
    courses: coursesWithProgress,
    subscription: user.subscription,
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
