import type { WeeklyQuest } from '@/lib/api';

const COMPLETED_QUEST_KEYS_STORAGE = 'ama:weekly-quests:completed-keys';

function readCompletedQuestKeys(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(COMPLETED_QUEST_KEYS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeCompletedQuestKeys(keys: string[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(COMPLETED_QUEST_KEYS_STORAGE, JSON.stringify(keys));
}

export function isQuestCompleted(quest: WeeklyQuest) {
  const target = Math.max(0, quest.target ?? 0);
  const progress = Math.max(0, quest.progress ?? 0);
  return quest.completed || (target > 0 && progress >= target);
}

export function detectNewlyCompletedQuests(quests: WeeklyQuest[]) {
  const previouslyCompleted = new Set(readCompletedQuestKeys());
  const completedNow = quests.filter(isQuestCompleted);
  const newlyCompleted = completedNow.filter((quest) => !previouslyCompleted.has(quest.questKey));

  writeCompletedQuestKeys(completedNow.map((quest) => quest.questKey));

  return newlyCompleted;
}

export function countCompletedQuests(quests: WeeklyQuest[]) {
  return quests.filter(isQuestCompleted).length;
}
