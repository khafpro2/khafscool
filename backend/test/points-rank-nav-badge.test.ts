import { describe, expect, it } from 'vitest';

type RankStep = { name: string; minPoints: number };

const RANK_LADDER: RankStep[] = [
  { name: 'Débutant', minPoints: 0 },
  { name: 'Apprenti', minPoints: 100 },
  { name: 'Technicien', minPoints: 250 },
  { name: 'Ingénieur', minPoints: 500 },
  { name: 'Expert', minPoints: 900 },
  { name: 'Champion', minPoints: 1500 },
];

function getRankName(points: number) {
  const safe = Math.max(0, Math.floor(points || 0));
  let currentIndex = 0;
  for (let i = 0; i < RANK_LADDER.length; i += 1) {
    if (safe >= RANK_LADDER[i].minPoints) currentIndex = i;
  }
  return RANK_LADDER[currentIndex].name;
}

function buildPointsRankNavSnapshot(points: number, leaderboardRank: number | null) {
  const safePoints = Math.max(0, Math.floor(points || 0));
  return {
    points: safePoints,
    leaderboardRank: leaderboardRank != null && leaderboardRank > 0 ? leaderboardRank : null,
    rankName: getRankName(safePoints),
  };
}

function formatLeaderboardRankLabel(rank: number | null) {
  if (rank == null || rank <= 0) return 'Non classé';
  return `#${rank}`;
}

describe('points rank nav badge (logique partagée web/mobile)', () => {
  it('combine points dashboard et rang leaderboard', () => {
    expect(buildPointsRankNavSnapshot(120, 4)).toEqual({
      points: 120,
      leaderboardRank: 4,
      rankName: 'Apprenti',
    });
  });

  it('normalise un rang leaderboard invalide', () => {
    expect(buildPointsRankNavSnapshot(80, 0).leaderboardRank).toBeNull();
    expect(buildPointsRankNavSnapshot(80, -2).leaderboardRank).toBeNull();
  });

  it('formate le libellé classement', () => {
    expect(formatLeaderboardRankLabel(3)).toBe('#3');
    expect(formatLeaderboardRankLabel(null)).toBe('Non classé');
  });
});
