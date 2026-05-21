import { useEffect, useSyncExternalStore } from 'react';
import {
  clearQuestNavCache,
  readQuestNavCache,
  subscribeQuestNavCache,
  writeQuestNavCache,
  hasPendingWeeklyQuest,
} from '../lib/quest-nav-badge';
import { getAccessToken } from '../services/auth';
import { fetchLearnerDashboard } from '../services/progress';

function getSnapshot() {
  return readQuestNavCache()?.hasPending ?? false;
}

function subscribe(onStoreChange: () => void) {
  return subscribeQuestNavCache(onStoreChange);
}

export function useQuestNavPending() {
  const showBadge = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = await getAccessToken();
      if (!token) {
        clearQuestNavCache();
        return;
      }

      const cached = readQuestNavCache();
      if (cached) return;

      try {
        const dashboard = await fetchLearnerDashboard();
        if (cancelled) return;
        const pending = hasPendingWeeklyQuest(
          dashboard.data.quests.map((quest) => ({
            ...quest,
            questKey: quest.id,
            completed: quest.target > 0 && quest.progress >= quest.target,
          }))
        );
        writeQuestNavCache(pending);
      } catch {
        if (!cancelled) clearQuestNavCache();
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return showBadge;
}
