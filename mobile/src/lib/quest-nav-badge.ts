import { isQuestCompleted } from './quest-feedback';

const CACHE_TTL_MS = 5 * 60 * 1000;

type QuestLike = {
  id?: string;
  questKey?: string;
  label: string;
  progress: number;
  target: number;
  completed?: boolean;
};

type QuestNavCache = {
  hasPending: boolean;
  fetchedAt: number;
};

let cache: QuestNavCache | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function hasPendingWeeklyQuest(quests: QuestLike[]) {
  if (quests.length === 0) return false;
  return quests.some((quest) => !isQuestCompleted(quest));
}

export function readQuestNavCache(): QuestNavCache | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function writeQuestNavCache(hasPending: boolean) {
  cache = { hasPending, fetchedAt: Date.now() };
  notifyListeners();
}

export function clearQuestNavCache() {
  cache = null;
  notifyListeners();
}

export function subscribeQuestNavCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
