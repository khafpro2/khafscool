'use client';

import { useEffect, useState } from 'react';
import { fetchDashboard } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import {
  clearQuestNavCache,
  hasPendingWeeklyQuest,
  readQuestNavCache,
  writeQuestNavCache,
} from '@/lib/quest-nav-badge';

export function useQuestNavPending() {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      clearQuestNavCache();
      setShowBadge(false);
      return;
    }

    const cached = readQuestNavCache();
    if (cached) {
      setShowBadge(cached.hasPending);
      return;
    }

    let cancelled = false;

    fetchDashboard(token)
      .then((data) => {
        if (cancelled) return;
        const quests = data.quests.map((quest) => ({
          ...quest,
          questKey: quest.questKey ?? quest.id,
          completed: quest.completed ?? (quest.target > 0 && quest.progress >= quest.target),
        }));
        const pending = hasPendingWeeklyQuest(quests);
        writeQuestNavCache(pending);
        setShowBadge(pending);
      })
      .catch(() => {
        if (!cancelled) setShowBadge(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return showBadge;
}

export function QuestNavDot() {
  const showBadge = useQuestNavPending();
  if (!showBadge) return null;
  return <span className="nav-quest-dot" aria-hidden />;
}
