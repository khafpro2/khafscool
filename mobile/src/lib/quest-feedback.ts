type QuestLike = {
  questKey?: string;
  id?: string;
  label: string;
  progress: number;
  target: number;
  completed?: boolean;
  rewardPoints?: number | null;
};

const completedQuestKeys = new Set<string>();

function questKey(quest: QuestLike) {
  return quest.questKey ?? quest.id ?? quest.label;
}

export function isQuestCompleted(quest: QuestLike) {
  const target = Math.max(0, quest.target ?? 0);
  const progress = Math.max(0, quest.progress ?? 0);
  return quest.completed || (target > 0 && progress >= target);
}

export function detectNewlyCompletedQuests(quests: QuestLike[]) {
  const completedNow = quests.filter(isQuestCompleted);
  const newlyCompleted = completedNow.filter((quest) => !completedQuestKeys.has(questKey(quest)));

  for (const quest of completedNow) {
    completedQuestKeys.add(questKey(quest));
  }

  return newlyCompleted;
}

export function countCompletedQuests(quests: QuestLike[]) {
  return quests.filter(isQuestCompleted).length;
}
