'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchDashboard, fetchLeaderboard } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import {
  buildPointsRankNavSnapshot,
  clearPointsRankNavCache,
  formatLeaderboardRankLabel,
  readPointsRankNavCache,
  writePointsRankNavCache,
  type PointsRankNavSnapshot,
} from '@/lib/points-rank-nav-badge';

export function usePointsRankNav() {
  const [snapshot, setSnapshot] = useState<PointsRankNavSnapshot | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      clearPointsRankNavCache();
      setIsAuthenticated(false);
      setSnapshot(null);
      return;
    }

    setIsAuthenticated(true);

    const cached = readPointsRankNavCache();
    if (cached) {
      setSnapshot(cached);
      return;
    }

    let cancelled = false;

    Promise.all([fetchDashboard(token), fetchLeaderboard(token)])
      .then(([dashboard, leaderboard]) => {
        if (cancelled) return;
        const next = buildPointsRankNavSnapshot(dashboard.stats.points, leaderboard.currentUserRank);
        writePointsRankNavCache(next);
        setSnapshot({ ...next, fetchedAt: Date.now() });
      })
      .catch(() => {
        if (!cancelled) {
          clearPointsRankNavCache();
          setSnapshot(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, isAuthenticated };
}

export function PointsRankNavIndicator() {
  const { snapshot, isAuthenticated } = usePointsRankNav();

  if (!isAuthenticated || !snapshot) return null;

  const rankLabel = formatLeaderboardRankLabel(snapshot.leaderboardRank);

  return (
    <div className="nav-points-rank" role="group" aria-label="Progression gamifiée">
      <Link
        href="/profile"
        className="nav-points-rank-link"
        title={`${snapshot.points} points · rang ${snapshot.rankName}`}
      >
        <span className="nav-points-rank-value">{snapshot.points} pts</span>
        <span className="nav-points-rank-sep" aria-hidden>
          ·
        </span>
        <span className="nav-points-rank-name">{snapshot.rankName}</span>
      </Link>
      <Link
        href="/leaderboard"
        className="nav-points-rank-rank"
        title={`Classement : ${rankLabel}`}
        aria-label={`Classement : ${rankLabel}`}
      >
        {rankLabel}
      </Link>
    </div>
  );
}
