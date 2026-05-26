import { describe, expect, it } from 'vitest';

type QuestLike = {
  track?: string | null;
};

function getQuestTrack(quest: QuestLike): string | null {
  const track = quest.track?.trim().toUpperCase();
  if (!track) return null;
  if (track === 'APPLE' || track === 'JAMF' || track === 'INTUNE') return track;
  return null;
}

function filterQuestsByTrack<T extends QuestLike>(
  quests: T[],
  track: 'TOUS' | 'APPLE' | 'JAMF' | 'INTUNE'
): T[] {
  if (track === 'TOUS') return quests;
  return quests.filter((quest) => getQuestTrack(quest) === track);
}

describe('quest track filter (logique partagée web)', () => {
  const quests = [
    { id: '1', track: 'APPLE' },
    { id: '2', track: 'JAMF' },
    { id: '3', track: 'INTUNE' },
    { id: '4', track: null },
  ];

  it('conserve toutes les quêtes pour TOUS', () => {
    expect(filterQuestsByTrack(quests, 'TOUS')).toHaveLength(4);
  });

  it('filtre par piste Apple', () => {
    expect(filterQuestsByTrack(quests, 'APPLE').map((q) => q.id)).toEqual(['1']);
  });

  it('ignore les quêtes multi-pistes sans track explicite', () => {
    expect(filterQuestsByTrack(quests, 'JAMF').some((q) => q.id === '4')).toBe(false);
  });
});

describe('streak nav badge (logique partagée web/mobile)', () => {
  function shouldShowStreakNav(currentDays: number | undefined | null) {
    return (currentDays ?? 0) > 0;
  }

  it('affiche la série uniquement si streak > 0', () => {
    expect(shouldShowStreakNav(3)).toBe(true);
    expect(shouldShowStreakNav(1)).toBe(true);
  });

  it('masque la série à zéro ou absente', () => {
    expect(shouldShowStreakNav(0)).toBe(false);
    expect(shouldShowStreakNav(null)).toBe(false);
    expect(shouldShowStreakNav(undefined)).toBe(false);
  });
});
