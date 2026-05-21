import { getRankInfo } from '@/lib/design';

const CACHE_KEY = 'ama:points-rank-nav';
const CACHE_TTL_MS = 5 * 60 * 1000;

export type PointsRankNavSnapshot = {
  points: number;
  leaderboardRank: number | null;
  rankName: string;
  fetchedAt: number;
};

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
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PointsRankNavSnapshot;
    if (
      typeof parsed.points !== 'number' ||
      (parsed.leaderboardRank != null && typeof parsed.leaderboardRank !== 'number') ||
      typeof parsed.rankName !== 'string' ||
      typeof parsed.fetchedAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePointsRankNavCache(snapshot: Omit<PointsRankNavSnapshot, 'fetchedAt'>) {
  if (typeof window === 'undefined') return;
  const payload: PointsRankNavSnapshot = { ...snapshot, fetchedAt: Date.now() };
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function clearPointsRankNavCache() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CACHE_KEY);
}
