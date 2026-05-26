export const ANALYTICS_OPT_IN_KEY = 'analytics-opt-in';

export type AnalyticsOptInValue = 'accepted' | 'declined';

export function parseAnalyticsOptIn(raw: string | null): AnalyticsOptInValue | null {
  if (raw === 'accepted' || raw === 'declined') return raw;
  return null;
}

export function hasAnalyticsOptInChoice(raw: string | null): boolean {
  return parseAnalyticsOptIn(raw) != null;
}

export function readAnalyticsOptIn(): AnalyticsOptInValue | null {
  if (typeof window === 'undefined') return null;
  return parseAnalyticsOptIn(window.localStorage.getItem(ANALYTICS_OPT_IN_KEY));
}

export function writeAnalyticsOptIn(value: AnalyticsOptInValue) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ANALYTICS_OPT_IN_KEY, value);
}
