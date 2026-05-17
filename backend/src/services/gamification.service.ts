import { UserLevel } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const LEVEL_THRESHOLDS: { level: UserLevel; min: number }[] = [
  { level: UserLevel.APPLE_READY, min: 3000 },
  { level: UserLevel.MDM_ADMIN, min: 1500 },
  { level: UserLevel.TECHNICIAN, min: 500 },
  { level: UserLevel.NOVICE, min: 0 },
];

function computeLevel(points: number): UserLevel {
  for (const t of LEVEL_THRESHOLDS) {
    if (points >= t.min) return t.level;
  }
  return UserLevel.NOVICE;
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

  if (module.course.track === 'APPLE') {
    const appleCompleted = await prisma.moduleProgress.count({
      where: { userId, completedAt: { not: null }, module: { course: { track: 'APPLE' } } },
    });
    if (appleCompleted >= 1 && !badges.includes('apple-mdm-foundation')) {
      badges.push('apple-mdm-foundation');
    }
  }

  if (module.course.track === 'JAMF') {
    const jamfCompleted = await prisma.moduleProgress.count({
      where: { userId, completedAt: { not: null }, module: { course: { track: 'JAMF' } } },
    });
    if (jamfCompleted >= 2 && !badges.includes('jamf-engineer')) {
      badges.push('jamf-engineer');
    }
  }

  await prisma.userProgress.update({
    where: { userId },
    data: { level: newLevel, badges },
  });

  if (module.course.track === 'APPLE') {
    await incrementWeeklyQuest(userId, 'weekly-apple-3');
  }

  const preparationScore = await computeApplePreparation(userId);

  return { quizScore, gameScore, pointsEarned, level: newLevel, badges, preparationScore };
}

async function incrementWeeklyQuest(userId: string, questKey: string) {
  const weekStart = startOfWeek(new Date());
  const quest = await prisma.userQuest.findFirst({ where: { userId, questKey, weekStart } });
  if (!quest) return;

  const progress = quest.progress + 1;
  await prisma.userQuest.update({
    where: { id: quest.id },
    data: { progress, completed: progress >= quest.target },
  });
}

async function computeApplePreparation(userId: string) {
  const rows = await prisma.moduleProgress.findMany({
    where: { userId, module: { course: { track: 'APPLE' } } },
  });
  if (!rows.length) return 0;
  const avg =
    rows.reduce((s, r) => s + ((r.quizScore ?? 0) + (r.gameScore ?? 0)) / 2, 0) / rows.length;
  return Math.round(avg);
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { progress: true, moduleProgress: true, quests: true, subscription: true },
  });
  if (!user) throw new Error('USER_NOT_FOUND');

  const courses = await prisma.course.findMany({
    include: { modules: { include: { progresses: { where: { userId } } } } },
    orderBy: { sortOrder: 'asc' },
  });

  const coursesWithProgress = courses.map((c) => {
    const total = c.modules.length;
    const done = c.modules.filter((m) => m.progresses.some((p) => p.completedAt)).length;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      track: c.track,
      progressPercent: total ? Math.round((done / total) * 100) : 0,
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
      preparationScore: await computeApplePreparation(userId),
    },
    badges: user.progress?.badges ?? [],
    quests: user.quests,
    courses: coursesWithProgress,
    subscription: user.subscription,
  };
}
