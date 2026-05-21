import type { LearningStreak } from '@/lib/api';

const CACHE_KEY = 'ama:streak-nav:days';
const CACHE_TTL_MS = 5 * 60 * 1000;

type StreakNavCache = {
  currentDays: number;
  fetchedAt: number;
};

export function shouldShowStreakNav(currentDays: number | undefined | null): boolean {
  return (currentDays ?? 0) > 0;
}

export function readStreakNavCache(): StreakNavCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StreakNavCache;
    if (typeof parsed.currentDays !== 'number' || typeof parsed.fetchedAt !== 'number') return null;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStreakNavCache(streak: LearningStreak | null | undefined) {
  if (typeof window === 'undefined') return;
  const currentDays = streak?.currentDays ?? 0;
  const payload: StreakNavCache = { currentDays, fetchedAt: Date.now() };
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function clearStreakNavCache() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CACHE_KEY);
}
