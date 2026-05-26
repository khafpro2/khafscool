import { getRankInfo } from './design';

const CACHE_TTL_MS = 5 * 60 * 1000;

export type PointsRankNavSnapshot = {
  points: number;
  leaderboardRank: number | null;
  rankName: string;
  fetchedAt: number;
};

let cache: PointsRankNavSnapshot | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function buildPointsRankNavSnapshot(
  points: number,
  leaderboardRank: number | null
): Omit<PointsRankNavSnapshot, 'fetchedAt'> {
  const safePoints = Math.max(0, Math.floor(points || 0));
  return {
    points: safePoints,
    leaderboardRank: leaderboardRank != null && leaderboardRank > 0 ? leaderboardRank : null,
    rankName: getRankInfo(safePoints).name,
  };
}

export function formatLeaderboardRankLabel(rank: number | null): string {
  if (rank == null || rank <= 0) return 'Non classé';
  return `#${rank}`;
}

export function readPointsRankNavCache(): PointsRankNavSnapshot | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function writePointsRankNavCache(snapshot: Omit<PointsRankNavSnapshot, 'fetchedAt'>) {
  cache = { ...snapshot, fetchedAt: Date.now() };
  notifyListeners();
}

export function clearPointsRankNavCache() {
  cache = null;
  notifyListeners();
}

export function subscribePointsRankNavCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
