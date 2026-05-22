import { prisma } from '../lib/prisma.js';

export const SUPPORTER_BADGE = 'supporter';

export async function awardSupporterBadge(userId: string) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    select: { badges: true },
  });

  if (!progress) {
    await prisma.userProgress.create({
      data: { userId, badges: [SUPPORTER_BADGE] },
    });
    return;
  }

  if (progress.badges.includes(SUPPORTER_BADGE)) return;

  await prisma.userProgress.update({
    where: { userId },
    data: { badges: [...progress.badges, SUPPORTER_BADGE] },
  });
}

export function isSupporterFromBadges(badges: string[] | undefined | null) {
  return Boolean(badges?.includes(SUPPORTER_BADGE));
}
