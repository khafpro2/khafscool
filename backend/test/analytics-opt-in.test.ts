import { describe, expect, it } from 'vitest';

const ANALYTICS_OPT_IN_KEY = 'analytics-opt-in';

type AnalyticsOptInValue = 'accepted' | 'declined';

function parseAnalyticsOptIn(raw: string | null): AnalyticsOptInValue | null {
  if (raw === 'accepted' || raw === 'declined') return raw;
  return null;
}

function hasAnalyticsOptInChoice(raw: string | null): boolean {
  return parseAnalyticsOptIn(raw) != null;
}

describe('analytics opt-in (logique partagée web)', () => {
  it('accepte les valeurs accepted et declined', () => {
    expect(parseAnalyticsOptIn('accepted')).toBe('accepted');
    expect(parseAnalyticsOptIn('declined')).toBe('declined');
  });

  it('rejette les valeurs absentes ou invalides', () => {
    expect(parseAnalyticsOptIn(null)).toBeNull();
    expect(parseAnalyticsOptIn('')).toBeNull();
    expect(parseAnalyticsOptIn('true')).toBeNull();
    expect(hasAnalyticsOptInChoice(null)).toBe(false);
    expect(hasAnalyticsOptInChoice('accepted')).toBe(true);
  });

  it('utilise la clé localStorage analytics-opt-in', () => {
    expect(ANALYTICS_OPT_IN_KEY).toBe('analytics-opt-in');
  });
});
