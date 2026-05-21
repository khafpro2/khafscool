export const COOKIE_CONSENT_KEY = 'ama:cookie-consent';
export const COOKIE_CONSENT_VERSION = 1;

export type CookieConsentRecord = {
  version: number;
  acceptedAt: string;
};

export function buildCookieConsentRecord(now = new Date()): CookieConsentRecord {
  return {
    version: COOKIE_CONSENT_VERSION,
    acceptedAt: now.toISOString(),
  };
}

export function parseCookieConsent(raw: string | null): CookieConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (parsed.version !== COOKIE_CONSENT_VERSION || typeof parsed.acceptedAt !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function hasCookieConsent(raw: string | null): boolean {
  return parseCookieConsent(raw) != null;
}

export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === 'undefined') return null;
  return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY));
}

export function writeCookieConsent(record: CookieConsentRecord = buildCookieConsentRecord()) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
}
