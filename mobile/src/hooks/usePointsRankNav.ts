import { useEffect, useSyncExternalStore } from 'react';
import {
  buildPointsRankNavSnapshot,
  clearPointsRankNavCache,
  readPointsRankNavCache,
  subscribePointsRankNavCache,
  writePointsRankNavCache,
} from '../lib/points-rank-nav-badge';
import { fetchLeaderboard } from '../services/gamification';
import { fetchLearnerDashboard } from '../services/progress';

function getSnapshot() {
  return readPointsRankNavCache();
}

function subscribe(onStoreChange: () => void) {
  return subscribePointsRankNavCache(onStoreChange);
}

export function usePointsRankNav() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = readPointsRankNavCache();
      if (cached) return;

      try {
        const [dashboard, leaderboard] = await Promise.all([
          fetchLearnerDashboard(),
          fetchLeaderboard(),
        ]);
        if (cancelled) return;
        if (dashboard.source === 'demo' && !dashboard.data.user.id) {
          clearPointsRankNavCache();
          return;
        }
        const next = buildPointsRankNavSnapshot(
          dashboard.data.progress.points,
          leaderboard.data.currentUserRank
        );
        writePointsRankNavCache(next);
      } catch {
        if (!cancelled) clearPointsRankNavCache();
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
}
