import type { LearningStreak } from '../services/progress';

const CACHE_TTL_MS = 5 * 60 * 1000;

type StreakNavCache = {
  currentDays: number;
  fetchedAt: number;
};

let cache: StreakNavCache | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function shouldShowStreakNav(currentDays: number | undefined | null): boolean {
  return (currentDays ?? 0) > 0;
}

export function readStreakNavCache(): StreakNavCache | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function writeStreakNavCache(streak: LearningStreak | null | undefined) {
  cache = { currentDays: streak?.currentDays ?? 0, fetchedAt: Date.now() };
  notifyListeners();
}

export function clearStreakNavCache() {
  cache = null;
  notifyListeners();
}

export function subscribeStreakNavCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
