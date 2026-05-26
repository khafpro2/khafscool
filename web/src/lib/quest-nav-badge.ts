import type { WeeklyQuest } from '@/lib/api';
import { isQuestCompleted } from '@/lib/quest-feedback';

const CACHE_KEY = 'ama:quest-nav:pending';
const CACHE_TTL_MS = 5 * 60 * 1000;

type QuestNavCache = {
  hasPending: boolean;
  fetchedAt: number;
};

export function hasPendingWeeklyQuest(quests: WeeklyQuest[]) {
  if (quests.length === 0) return false;
  return quests.some((quest) => !isQuestCompleted(quest));
}

export function readQuestNavCache(): QuestNavCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuestNavCache;
    if (typeof parsed.hasPending !== 'boolean' || typeof parsed.fetchedAt !== 'number') return null;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeQuestNavCache(hasPending: boolean) {
  if (typeof window === 'undefined') return;
  const payload: QuestNavCache = { hasPending, fetchedAt: Date.now() };
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function clearQuestNavCache() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CACHE_KEY);
}
