import { describe, expect, it } from 'vitest';

type QuestLike = {
  id?: string;
  progress: number;
  target: number;
  completed?: boolean;
};

function isQuestCompleted(quest: QuestLike) {
  const target = Math.max(0, quest.target ?? 0);
  const progress = Math.max(0, quest.progress ?? 0);
  return quest.completed || (target > 0 && progress >= target);
}

function hasPendingWeeklyQuest(quests: QuestLike[]) {
  if (quests.length === 0) return false;
  return quests.some((quest) => !isQuestCompleted(quest));
}

describe('quest nav badge (logique partagée web/mobile)', () => {
  it('signale une quête hebdo incomplète', () => {
    expect(
      hasPendingWeeklyQuest([
        { id: 'q1', progress: 2, target: 3 },
        { id: 'q2', progress: 1, target: 1, completed: true },
      ])
    ).toBe(true);
  });

  it('masque la pastille quand toutes les quêtes sont terminées', () => {
    expect(
      hasPendingWeeklyQuest([
        { id: 'q1', progress: 3, target: 3 },
        { id: 'q2', progress: 1, target: 1, completed: true },
      ])
    ).toBe(false);
  });

  it('ignore une liste vide', () => {
    expect(hasPendingWeeklyQuest([])).toBe(false);
  });
});
