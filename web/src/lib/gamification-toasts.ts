import { getBadgeVisual } from '@/lib/design';
import { showToast } from '@/lib/toast-store';
import type { WeeklyQuest } from '@/lib/api';

export function toastModuleCompleted(
  moduleTitle: string,
  pointsEarned: number,
  quizScore?: number,
  gameScore?: number
) {
  const scores =
    typeof quizScore === 'number' && typeof gameScore === 'number'
      ? `Quiz ${quizScore}% · scénario ${gameScore}%`
      : undefined;

  showToast({
    kind: 'points',
    title: `+${pointsEarned} points`,
    body: scores
      ? `« ${moduleTitle} » terminée · ${scores}`
      : `Bravo ! « ${moduleTitle} » est complétée.`,
  });
}

export function toastBadgeUnlocked(badgeSlug: string) {
  const visual = getBadgeVisual(badgeSlug);
  showToast({
    kind: 'badge',
    title: 'Super-badge débloqué',
    body: visual?.label ?? badgeSlug,
    durationMs: 6400,
  });
}

export function toastQuestCompleted(quest: Pick<WeeklyQuest, 'label' | 'rewardPoints'>) {
  const points = typeof quest.rewardPoints === 'number' ? quest.rewardPoints : 0;
  showToast({
    kind: 'quest',
    title: 'Quête accomplie',
    body:
      points > 0
        ? `« ${quest.label} » · +${points} points`
        : `« ${quest.label} » — continue sur cette lancée !`,
    durationMs: 6000,
  });
}

export function toastQuestsCompleted(quests: WeeklyQuest[]) {
  for (const quest of quests) {
    toastQuestCompleted(quest);
  }
}

export function toastAlmostComplete(courseTitle: string) {
  showToast({
    kind: 'success',
    title: 'Plus qu\'une unité pour le badge !',
    body: `« ${courseTitle} » — termine la dernière unité pour débloquer ton super-badge.`,
    durationMs: 7000,
  });
}
