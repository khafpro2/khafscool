import { useEffect, useSyncExternalStore } from 'react';
import {
  clearStreakNavCache,
  readStreakNavCache,
  subscribeStreakNavCache,
  writeStreakNavCache,
} from '../lib/streak-nav-badge';
import { fetchLearnerDashboard } from '../services/progress';

function getSnapshot() {
  return readStreakNavCache()?.currentDays ?? 0;
}

function subscribe(onStoreChange: () => void) {
  return subscribeStreakNavCache(onStoreChange);
}

export function useStreakNavDays() {
  const currentDays = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = readStreakNavCache();
      if (cached) return;

      try {
        const dashboard = await fetchLearnerDashboard();
        if (cancelled) return;
        writeStreakNavCache(dashboard.data.learningStreak);
      } catch {
        if (!cancelled) clearStreakNavCache();
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return currentDays;
}
