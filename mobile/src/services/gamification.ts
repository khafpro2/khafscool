import { getAccessToken } from './auth';
import { apiFetch } from './api';

export interface WeeklyQuest {
  id: string;
  questKey: string;
  label: string;
  description?: string | null;
  target: number;
  progress: number;
  completed: boolean;
  weekStart?: string | null;
  rewardPoints?: number | null;
  track?: string | null;
}

export interface WeeklyQuestsResponse {
  quests: WeeklyQuest[];
  weekStart?: string | null;
  weekEnd?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  displayName: string;
  points: number;
  level: string;
  badges: string[];
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
}

export interface GamificationResult<T> {
  data: T;
  source: 'api' | 'demo';
}

export async function fetchWeeklyQuests(): Promise<GamificationResult<WeeklyQuestsResponse>> {
  const token = await getAccessToken();
  if (!token) return { data: mockWeeklyQuests(), source: 'demo' };

  try {
    const data = await apiFetch<WeeklyQuestsResponse>('/quests/weekly');
    return { data: normalizeWeeklyQuests(data), source: 'api' };
  } catch {
    return { data: mockWeeklyQuests(), source: 'demo' };
  }
}

export async function fetchLeaderboard(): Promise<GamificationResult<LeaderboardResponse>> {
  const token = await getAccessToken();
  if (!token) return { data: mockLeaderboard(), source: 'demo' };

  try {
    const data = await apiFetch<LeaderboardResponse>('/leaderboard');
    return { data, source: 'api' };
  } catch {
    return { data: mockLeaderboard(), source: 'demo' };
  }
}

function startOfIsoWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy;
}

function endOfIsoWeek(date: Date): Date {
  const start = startOfIsoWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}

function normalizeWeeklyQuests(data: WeeklyQuestsResponse): WeeklyQuestsResponse {
  const quests = Array.isArray(data?.quests) ? data.quests : [];
  const firstWeekStart = data?.weekStart ?? quests.find((quest) => quest.weekStart)?.weekStart ?? null;
  const computedStart = firstWeekStart ? new Date(firstWeekStart) : startOfIsoWeek(new Date());
  const computedEnd = data?.weekEnd ? new Date(data.weekEnd) : endOfIsoWeek(computedStart);

  return {
    quests: quests.map((quest) => ({
      ...quest,
      progress: Math.max(0, quest.progress ?? 0),
      target: Math.max(0, quest.target ?? 0),
      completed: quest.completed ?? (quest.target > 0 && quest.progress >= quest.target),
      weekStart: quest.weekStart ?? computedStart.toISOString(),
    })),
    weekStart: computedStart.toISOString(),
    weekEnd: computedEnd.toISOString(),
  };
}

function mockWeeklyQuests(): WeeklyQuestsResponse {
  const weekStart = startOfIsoWeek(new Date()).toISOString();
  const weekEnd = endOfIsoWeek(new Date()).toISOString();

  return {
    weekStart,
    weekEnd,
    quests: [
      {
        id: 'demo-weekly-apple-2',
        questKey: 'weekly-apple-2',
        label: 'Valide 2 unités Apple',
        description: 'Renforce ton socle Device Support et MDM Apple en validant 2 unités complètes.',
        target: 2,
        progress: 1,
        completed: false,
        rewardPoints: 40,
        track: 'APPLE',
        weekStart,
      },
      {
        id: 'demo-weekly-jamf-2',
        questKey: 'weekly-jamf-2',
        label: 'Valide 2 unités Jamf Pro',
        description: 'Smart groups, politiques et inventaire : confirme tes acquis Jamf.',
        target: 2,
        progress: 2,
        completed: true,
        rewardPoints: 40,
        track: 'JAMF',
        weekStart,
      },
      {
        id: 'demo-weekly-intune-2',
        questKey: 'weekly-intune-2',
        label: 'Termine 2 unités Microsoft Intune',
        description: 'Enrôlement iOS, profils de configuration et conformité côté Microsoft.',
        target: 2,
        progress: 0,
        completed: false,
        rewardPoints: 40,
        track: 'INTUNE',
        weekStart,
      },
      {
        id: 'demo-weekly-mdm-4',
        questKey: 'weekly-mdm-4',
        label: 'Termine 4 unités MDM (toutes pistes)',
        description: 'Avance sur Apple, Jamf ou Intune pour décrocher le bonus hebdo.',
        target: 4,
        progress: 2,
        completed: false,
        rewardPoints: 80,
        track: null,
        weekStart,
      },
    ],
  };
}

function mockLeaderboard(): LeaderboardResponse {
  return {
    leaderboard: [
      {
        rank: 1,
        displayName: 'Camille — Apple Pro',
        points: 980,
        level: 'EXPERT',
        badges: ['apple-mdm-foundation', 'jamf-engineer'],
        isCurrentUser: false,
      },
      {
        rank: 2,
        displayName: 'Yanis — Jamf Lead',
        points: 845,
        level: 'EXPERT',
        badges: ['jamf-engineer'],
        isCurrentUser: false,
      },
      {
        rank: 3,
        displayName: 'Léa — Intune Specialist',
        points: 760,
        level: 'TECHNICIAN',
        badges: ['intune-professional'],
        isCurrentUser: false,
      },
      {
        rank: 4,
        displayName: 'Technicien démo (toi)',
        points: 420,
        level: 'TECHNICIAN',
        badges: ['apple-mdm-foundation'],
        isCurrentUser: true,
      },
    ],
    currentUserRank: 4,
  };
}

export function formatWeekRange(weekStart?: string | null, weekEnd?: string | null) {
  if (!weekStart) return 'Semaine en cours';
  const start = new Date(weekStart);
  const end = weekEnd ? new Date(weekEnd) : endOfIsoWeek(start);
  if (Number.isNaN(start.getTime())) return 'Semaine en cours';

  const startLabel = start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const endLabel = end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  return `${startLabel} → ${endLabel}`;
}

export function formatResetLabel(weekEnd?: string | null) {
  if (!weekEnd) return 'Renouvellement lundi prochain';
  const end = new Date(weekEnd);
  if (Number.isNaN(end.getTime())) return 'Renouvellement lundi prochain';
  return `Renouvellement le ${end.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`;
}
