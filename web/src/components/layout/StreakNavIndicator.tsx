'use client';

import { useEffect, useState } from 'react';
import { fetchDashboard } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import {
  clearStreakNavCache,
  readStreakNavCache,
  shouldShowStreakNav,
  writeStreakNavCache,
} from '@/lib/streak-nav-badge';

export function useStreakNavDays() {
  const [currentDays, setCurrentDays] = useState(0);

  useEffect(() => {
    const cached = readStreakNavCache();
    if (cached) {
      setCurrentDays(cached.currentDays);
      return;
    }

    let cancelled = false;
    const token = getAccessToken();

    fetchDashboard(token ?? undefined)
      .then((data) => {
        if (cancelled) return;
        const days = data.learningStreak?.currentDays ?? 0;
        writeStreakNavCache(data.learningStreak);
        setCurrentDays(days);
      })
      .catch(() => {
        if (!cancelled) {
          clearStreakNavCache();
          setCurrentDays(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return currentDays;
}

export function StreakNavBadge() {
  const currentDays = useStreakNavDays();
  if (!shouldShowStreakNav(currentDays)) return null;

  return (
    <span
      className="nav-streak-badge"
      role="status"
      aria-label={`Série d'apprentissage : ${currentDays} jour${currentDays > 1 ? 's' : ''}`}
      title={`Série : ${currentDays} jour${currentDays > 1 ? 's' : ''} consécutif${currentDays > 1 ? 's' : ''}`}
    >
      <span aria-hidden>{'\u{1F525}'}</span>
      <span className="nav-streak-days">{currentDays}</span>
    </span>
  );
}
